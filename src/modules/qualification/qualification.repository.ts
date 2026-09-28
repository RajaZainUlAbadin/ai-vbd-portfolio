import {
  CreateQualificationInput,
  IQualification,
} from './model/qualification.interface';
import { mapQualification } from './model/qualification.mapper';
import { QualificationModel } from './model/qualification.model';

export class QualificationRepository {
  static async createOrUpdate(
    data: CreateQualificationInput,
  ): Promise<IQualification> {
    const document = await QualificationModel.findOneAndUpdate(
      {
        leadId: data.leadId,
      },

      data,

      {
        returnDocument: 'after',
        upsert: true,
      },
    );

    if (!document) {
      throw new Error('Failed to create/update qualification');
    }

    return mapQualification(document);
  }

  static async findByLeadId(leadId: string): Promise<IQualification | null> {
    const document = await QualificationModel.findOne({
      leadId,
    });

    return document ? mapQualification(document) : null;
  }

  static async findById(id: string): Promise<IQualification | null> {
    const document = await QualificationModel.findById(id);

    return document ? mapQualification(document) : null;
  }
}
