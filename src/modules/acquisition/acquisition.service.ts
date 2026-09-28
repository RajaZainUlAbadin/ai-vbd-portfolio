import { ILead } from '../lead/model/lead.interface';
import { LeadsService } from '../lead/leads.service';

import { DomainEvent } from '@/shared/events/domainEvents';
import { ProviderManager } from '@/providers/lead-sources/ProviderManager';

import { AcquirePayload } from './types/acquirePayload.type';
import { generateSearchHash } from './utils/generateSearchHash';
import { AcquisitionResult } from './types/acquisitionResult';
import { AcquisitionSearchRepository } from './acquisition-search/acquisitionSearch.repository';
import { AcquisitionBatchRepository } from './acquisition-batch/acquisitionBatch.repository';
import { AcquisitionIdentityRepository } from './acquisition-identity/acquisitionIdentity.repository';

import { logger } from '@/shared/logger/logger';

import fs from 'fs/promises';
import XLSX from 'xlsx';
import { mapLeadImportRowToLead } from './import/leadImport.mapper';
import { LeadImportRow, LeadImportResult } from './import/leadImport.types';
import { LeadProvider } from '@/shared/constants';
import { LeadsRepository } from '../lead/leads.repository';
import { generateLeadDedupeHash } from '../lead/utils/generateLeadHash';
import { AcquisitionExecutionRepository } from './acquisition-execution/acquisitionExecution.repository';
import {
  AcquisitionExecutionSource,
  AcquisitionExecutionStatus,
} from './acquisition-execution/acquisitionExecution.interface';
import { normalizeImportFileName } from './import/normalizeImportFileName.util';
import { AcquisitionProviderRepository } from './acquisition-provider/acquisition-provider.repository';
import { ProviderUnavailableError } from './acquisition-provider/errors/provider-unavailable.error';

export class AcquisitionService {
  static async processResults(input: {
    results: ILead[];
    batchId: string;
    provider: string;
  }) {
    const newLeads: ILead[] = [];

    for (const result of input.results) {
      const existingIdentity =
        await AcquisitionIdentityRepository.findByProviderIdentity(
          input.provider,
          result.externalId,
        );

      if (existingIdentity) {
        await AcquisitionIdentityRepository.updateSeen(existingIdentity.id);
        continue;
      }

      const phone = result.contacts.find(
        (contact) => contact.type === 'PHONE',
      )?.value;

      const dedupeHash = generateLeadDedupeHash({
        businessName: result.businessName,
        website: result.website,
        phone,
        address: result.address,
      });

      const existingLead = await LeadsRepository.findByDedupeHash(dedupeHash);

      if (existingLead) {
        continue;
      }

      const leadResult = await LeadsService.createLead({
        ...result,
        dedupeHash,
        batchId: input.batchId,
      });

      if (!leadResult.created) {
        continue;
      }
      await AcquisitionIdentityRepository.create({
        provider: input.provider,
        externalId: result.externalId,
        businessName: result.businessName,
        website: result.website,
        phone: phone ?? '',
        leadId: leadResult.lead.id,
      });

      newLeads.push(leadResult.lead);
    }

    return newLeads;
  }

  static async acquire({
    context,
    provider,
    query,
    location,
  }: AcquirePayload): Promise<AcquisitionResult> {
    const searchHash = generateSearchHash({
      provider,
      query,
      location,
    });

    const isProviderAvailable = await AcquisitionProviderRepository.isAvailable(
      provider as LeadProvider,
    );

    if (!isProviderAvailable) {
      throw new ProviderUnavailableError(provider as LeadProvider);
    }

    let acquisitionSearch =
      await AcquisitionSearchRepository.findByHash(searchHash);

    if (!acquisitionSearch) {
      acquisitionSearch = await AcquisitionSearchRepository.create({
        acquisitionExecutionId: context.acquisitionExecutionId,
        searchMatrixId: context.searchMatrixId ?? '',
        provider,
        query,
        location,
        searchHash,
      });
    } else {
      const updatedSearch =
        await AcquisitionSearchRepository.incrementExecution(
          acquisitionSearch.id,
        );
      acquisitionSearch = updatedSearch;
    }

    const start = Date.now();

    const providerResults = await ProviderManager.fetchLeads(provider, {
      query,
      location,
    });

    const durationMs = Date.now() - start;

    const totalResults = providerResults?.normalizedResults?.length ?? 0;

    await AcquisitionSearchRepository.update(acquisitionSearch.id, {
      totalResults,
      durationMs,
      lastFetchedAt: new Date(),
      // rawResponse: providerResults.rawResponse,
    });

    logger.info({
      module: DomainEvent.LEAD_ACQUISITION,
      message: 'Leads acquired successfully',
      provider,
      totalLeads: providerResults?.normalizedResults.length,
      traceId: context.traceId,
    });

    if (!providerResults || totalResults === 0) {
      return {
        acquisitionExecutionId: context.acquisitionExecutionId,
        acquisitionSearchId: acquisitionSearch.id,
        totalResults: 0,
        newLeads: [],
      };
    }

    const acquisitionBatch = await AcquisitionBatchRepository.create({
      acquisitionExecutionId: context.acquisitionExecutionId,
      acquisitionSearchId: acquisitionSearch.id,
      provider,
      query,
      location: location,
      traceId: context.traceId,
      totalResults: providerResults.normalizedResults.length,
      rawResponse: providerResults.rawResponse,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
    });

    logger.info({
      module: 'acquisition-service',
      message: `Acquisition batch created: ${acquisitionBatch.id}`,
    });

    const newLeads = await this.processResults({
      results: providerResults.normalizedResults,
      batchId: acquisitionBatch.id,
      provider,
    });

    logger.info({
      module: DomainEvent.LEAD_ACQUISITION,
      message: 'New identified leads',
      totalNewLeads: newLeads.length,
      provider,
      traceId: context.traceId,
    });

    return {
      acquisitionSearchId: acquisitionSearch.id,
      acquisitionExecutionId: context.acquisitionExecutionId,
      totalResults: providerResults.normalizedResults.length,
      newLeads,
    } as AcquisitionResult;
  }

  static async importLeadsFromFile(
    filePath: string,
    fileName: string,
  ): Promise<LeadImportResult> {
    const result: LeadImportResult = {
      totalRows: 0,
      imported: 0,
      updated: 0,
      skipped: 0,
      failed: 0,
      errors: [],
    };

    try {
      const workbook = XLSX.readFile(filePath, {
        cellDates: true,
      });

      const sheetName = workbook.SheetNames[0];

      if (!sheetName) {
        throw new Error('Uploaded file contains no worksheet');
      }

      const worksheet = workbook.Sheets[sheetName];

      const rows = XLSX.utils.sheet_to_json<LeadImportRow>(worksheet, {
        defval: '',
        raw: false,
      });

      result.totalRows = rows.length;

      const acquisitionExecution = await AcquisitionExecutionRepository.create({
        status: AcquisitionExecutionStatus.RUNNING,
        source: AcquisitionExecutionSource.MANUAL,
        providers: [LeadProvider.CSV_IMPORT],
        startedAt: new Date(),
      });

      const acquisitionBatch = await AcquisitionBatchRepository.create({
        acquisitionExecutionId: acquisitionExecution.id,
        provider: LeadProvider.CSV_IMPORT,
        query: 'manual file upload',
        location: undefined,
        rawResponse: undefined,
        totalResults: rows.length,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
      });

      logger.info({
        module: 'acquisition-service',
        message: `Acquisition batch created: ${acquisitionBatch.id}`,
      });

      const normalized_fileName = normalizeImportFileName(fileName);
      const leads: any[] = [];

      for (let index = 0; index < rows.length; index++) {
        const row = rows[index];

        try {
          const lead = mapLeadImportRowToLead(row);
          lead.externalId = `csv:${normalized_fileName}:${index + 2}`;

          leads.push(lead);
        } catch (error) {
          result.failed++;

          result.errors.push({
            row: index + 2,
            message: error instanceof Error ? error.message : String(error),
          });
        }
      }

      const BATCH_SIZE = 500;

      for (let i = 0; i < leads.length; i += BATCH_SIZE) {
        const chunk = leads.slice(i, i + BATCH_SIZE);

        const newLeads = await this.processResults({
          results: chunk,
          batchId: acquisitionBatch.id,
          provider: LeadProvider.CSV_IMPORT,
        });

        result.imported += newLeads.length;
      }

      result.skipped = leads.length - result.imported - result.failed;
      return result;
    } finally {
      await fs.unlink(filePath).catch(() => undefined);
    }
  }
}
