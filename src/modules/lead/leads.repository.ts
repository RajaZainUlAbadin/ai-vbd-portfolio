import { AnyBulkWriteOperation } from 'mongoose';
import { LeadDocument, LeadModel, LeadRecord } from './model/lead.model';
import { LeadStatus } from './model/lead.status';
import { LeadContact } from './lead-contact/lead-contact.schema';
import { ContactStatus, ContactType } from './lead-contact/lead-contact.types';
import { ILead } from './model/lead.interface';
import { mapToILead } from './mappers/mapToILead';
import { mapToLeadRecord } from './mappers/mapToLeadRecord';
import { mapToLeadContact } from './lead-contact/lead-contact-maps';
import { OutreachStatus } from '../outreach/outreach/model/outreach.status';
import { PendingFollowup } from '../followup/types/pending-followup';
import { endOfDay, startOfDay } from 'date-fns';
import { LeadProvider } from '@/shared/constants';
import {
  PaginatedResult,
  PaginationParams,
} from '@/shared/types/pagination.interface';
import { GetLeadsParams } from './types/getLeadsParams.types';

export class LeadsRepository {
  static async bulkWrite(operations: AnyBulkWriteOperation<LeadRecord>[]) {
    return LeadModel.bulkWrite(operations, {
      ordered: false,
    });
  }

  static async findByDedupeHash(hash: string): Promise<ILead | null> {
    const record = await LeadModel.findOne({
      dedupeHash: hash,
    }).lean<LeadDocument>();

    return record ? mapToILead(record) : null;
  }

  static async create(lead: ILead): Promise<ILead> {
    const record = await LeadModel.create(mapToLeadRecord(lead));
    return mapToILead(record);
  }

  static async upsert(lead: ILead): Promise<ILead> {
    const record = await LeadModel.findOneAndUpdate(
      {
        provider: lead.provider,
        externalId: lead.externalId,
        // dedupeHash: lead.dedupeHash,
      },
      {
        $set: mapToLeadRecord(lead),
      },
      {
        upsert: true,
        returnDocument: 'after',
        setDefaultsOnInsert: true,
        runValidators: true,
      },
    );

    return mapToILead(record);
  }

  static async getAll(): Promise<ILead[]> {
    const records = await LeadModel.find().lean();
    return records.map(mapToILead);
  }

  // Fetching
  static async find(
    filter: any = {},
    options?: { limit?: number; skip?: number },
  ): Promise<ILead[]> {
    const query = LeadModel.find(filter);

    if (options?.limit) {
      query.limit(options.limit);
    }

    if (options?.skip) {
      query.skip(options.skip);
    }

    const records = await query.exec();

    return records.map(mapToILead);
  }

  static async findOne(filter: any = {}): Promise<ILead | null> {
    const record = await LeadModel.findOne(filter);
    return record ? mapToILead(record) : null;
  }

  static async findById(id: string): Promise<ILead | null> {
    const record = await LeadModel.findById(id).lean<LeadDocument>();
    return record ? mapToILead(record) : null;
  }

  static async findByStatus(status: LeadStatus, limit = 10): Promise<ILead[]> {
    const records = await LeadModel.find({ status }).limit(limit).exec();

    return records.map(mapToILead);
  }

  static async claimNewLeadsByProvider(
    provider: LeadProvider,
    limit: number,
  ): Promise<ILead[]> {
    const claimedLeads: ILead[] = [];

    for (let i = 0; i < limit; i++) {
      const lead = await LeadModel.findOneAndUpdate(
        {
          provider,
          status: {
            $in: [LeadStatus.NEW, LeadStatus.SCRAPING_PENDING],
          },
        },
        {
          $set: {
            status: LeadStatus.PROCESSING,
          },
        },
        {
          returnDocument: 'after',
          sort: {
            createdAt: 1,
          },
        },
      );

      if (!lead) {
        break;
      }

      claimedLeads.push(mapToILead(lead));
    }

    return claimedLeads;
  }

  // Update helpers
  static async update(
    id: string,
    update: Partial<ILead>,
  ): Promise<ILead | null> {
    const record = await LeadModel.findByIdAndUpdate(
      id,
      mapToLeadRecord(update),
      {
        returnDocument: 'after',
      },
    );

    return record ? mapToILead(record) : null;
  }

  static async updateStatus(
    leadId: string,
    status: LeadStatus,
  ): Promise<ILead> {
    const lead = await LeadModel.findByIdAndUpdate(
      leadId,
      {
        status,
      },
      {
        returnDocument: 'after',
      },
    );

    if (!lead) {
      throw new Error('Lead not found');
    }

    return mapToILead(lead);
  }

  // Bulk update (useful for batch pipeline changes)
  static async updateMany(filter: any, update: any) {
    return LeadModel.updateMany(filter, update);
  }

  static async mergeContacts(leadId: string, contacts: LeadContact[]) {
    const lead = await LeadModel.findById(leadId);

    if (!lead) {
      throw new Error('Lead not found');
    }

    for (const contact of contacts) {
      const exists = lead.contacts.some(
        (existing) =>
          existing.type === contact.type &&
          existing.value.toLowerCase() === contact.value.toLowerCase(),
      );

      if (!exists) {
        lead.contacts.push(contact);
      }
    }

    await lead.save();

    return lead;
  }

  // Delete helper (for cleanup/testing)
  static async deleteById(id: string) {
    return LeadModel.findByIdAndDelete(id);
  }

  static async claimForProcessing(id: string, stage: LeadStatus) {
    return LeadModel.findOneAndUpdate(
      {
        _id: id,
        status: LeadStatus.SCRAPING_PENDING,
      },
      {
        status: stage,
      },
      { returnDocument: 'after' },
    );
  }

  static async addNextFollowup(leadId: string, date: Date) {
    return this.update(leadId, { nextFollowupAt: date });
  }

  static async findPendingFollowups(): Promise<PendingFollowup[]> {
    const results = await LeadModel.aggregate([
      {
        $match: {
          status: {
            $in: [LeadStatus.CONTACTED, LeadStatus.ENGAGED],
          },
          outreachSequenceStep: {
            $lt: 4,
          },
          nextFollowupAt: {
            $lte: new Date(),
          },
        },
      },
      {
        $lookup: {
          from: 'outreaches',
          localField: '_id',
          foreignField: 'leadId',
          as: 'outreach',
        },
      },
      {
        $unwind: {
          path: '$outreach',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          'outreach.status': OutreachStatus.ACTIVE,
        },
      },
      {
        $project: {
          _id: 0,
          leadId: {
            $toString: '$_id',
          },
          recipient: '$outreach.recipient',
        },
      },
    ]);

    return results;
  }

  static async findForMockTesting(limit = 1): Promise<ILead[]> {
    const records = await LeadModel.aggregate([
      {
        $match: {
          status: LeadStatus.SCRAPING_PENDING,
        },
      },
      {
        $sample: {
          size: limit,
        },
      },
    ]);

    return records.map(mapToILead);
  }

  // Contacts
  static async loadContactByEmail(
    recipient: string,
  ): Promise<LeadContact | null> {
    const lead = await LeadModel.findOne(
      {
        contacts: {
          $elemMatch: {
            type: ContactType.EMAIL,
            value: recipient,
          },
        },
      },
      {
        contacts: {
          $elemMatch: {
            type: ContactType.EMAIL,
            value: recipient,
          },
        },
      },
    ).lean();

    const contact = lead?.contacts?.[0];
    return contact ? mapToLeadContact(contact) : null;
  }

  static async updateContactStatus(
    leadId: string,
    recipient: string,
    status: ContactStatus,
  ): Promise<boolean> {
    const updated = await LeadModel.findOneAndUpdate(
      {
        _id: leadId,
        contacts: {
          $elemMatch: {
            type: ContactType.EMAIL,
            value: recipient,
          },
        },
      },
      {
        $set: {
          'contacts.$.status': status,
        },
      },
      {
        returnDocument: 'after',
      },
    );

    return !!updated;
  }

  static async getUnresolvedLeads(provider: LeadProvider) {
    return LeadModel.countDocuments({
      provider,
      status: LeadStatus.CONTACT_MISSING,
      $or: [
        { website: { $exists: false } },
        { website: null },
        { website: '' },
      ],
    });
  }

  static async countPipelineBacklog(): Promise<number> {
    return LeadModel.countDocuments({
      provider: { $ne: LeadProvider.CSV_IMPORT },
      status: {
        $in: [
          LeadStatus.NEW,
          LeadStatus.SCRAPING_PENDING,
          // LeadStatus.SCRAPED,
          // LeadStatus.QUALIFICATION_PENDING,
          // LeadStatus.QUALIFIED,
          // LeadStatus.ANALYSIS_PENDING,
          // LeadStatus.ANALYZED,
        ],
      },
    });
  }

  static async getPendingOutreachs(
    count?: number,
    excludedProviders: LeadProvider[] = [],
  ): Promise<ILead[]> {
    const query = LeadModel.find({
      status: LeadStatus.ANALYZED,

      ...(excludedProviders.length > 0 && {
        provider: {
          $nin: excludedProviders,
        },
      }),
    }).sort({
      priority: -1,
      score: -1,
      createdAt: 1,
    });

    if (count) {
      query.limit(count);
    }

    const leads = await query.exec();
    return leads.map(mapToILead);
  }

  static async countScheduledToday(): Promise<number> {
    return LeadModel.countDocuments({
      status: LeadStatus.OUTREACH_PENDING,
      outreachScheduledFor: {
        $gte: startOfDay(new Date()),
        $lt: endOfDay(new Date()),
      },
    });
  }

  // Admin functions
  static async getAcquisitionExecutionId(
    leadId: string,
  ): Promise<string | null> {
    const lead = await LeadModel.findById(leadId)
      .populate({
        path: 'batchId',
        select: 'acquisitionExecutionId',
      })
      .lean();

    return (
      (lead?.batchId as { acquisitionExecutionId?: string } | undefined)
        ?.acquisitionExecutionId ?? null
    );
  }

  // Dashbaord APIs
  static async getLeads(
    params: GetLeadsParams = {},
  ): Promise<PaginatedResult<ILead>> {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.max(1, params.limit ?? 20);

    const skip = (page - 1) * limit;

    // const filter = Array.isArray(params.status)
    //   ? { status: { $in: params.status } }
    //   : params.status
    //     ? { status: params.status }
    //     : {};
    const filter: Record<string, any> = {};

    if (params.status) {
      filter.status = Array.isArray(params.status)
        ? { $in: params.status }
        : params.status;
    }

    if (params.provider) {
      filter.provider = Array.isArray(params.provider)
        ? { $in: params.provider }
        : params.provider;
    }

    const [records, total] = await Promise.all([
      LeadModel.find(filter)
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      LeadModel.countDocuments(),
    ]);

    return {
      items: records.map(mapToILead),
      total,
      page,
      limit,
    };
  }

  // static cursor() {
  //   return LeadModel.find({}).cursor();
  // }

  // static async updateContacts(leadId: string, contacts: any[]) {
  //   return LeadModel.updateOne(
  //     { _id: leadId },
  //     {
  //       $set: {
  //         contacts,
  //       },
  //     },
  //   );
  // }
}
