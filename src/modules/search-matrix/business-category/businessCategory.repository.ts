import {
  BusinessCategoryModel,
  IBusinessCategory,
} from './businessCategory.model';

export class BusinessCategoryRepository {
  static async create(
    data: Partial<IBusinessCategory>,
  ): Promise<IBusinessCategory> {
    const document = await BusinessCategoryModel.create(data);

    return document.toObject();
  }

  static findAll(): Promise<IBusinessCategory[]> {
    return BusinessCategoryModel.find()
      .sort({
        priority: -1,
        name: 1,
      })
      .lean();
  }

  static findEnabled(): Promise<IBusinessCategory[]> {
    return BusinessCategoryModel.find({
      enabled: true,
    })
      .sort({
        priority: -1,
        name: 1,
      })
      .lean();
  }

  static findById(id: string): Promise<IBusinessCategory | null> {
    return BusinessCategoryModel.findById(id).lean();
  }

  static findByName(name: string): Promise<IBusinessCategory | null> {
    return BusinessCategoryModel.findOne({
      name,
    }).lean();
  }

  static async updateById(
    id: string,
    update: Partial<IBusinessCategory>,
  ): Promise<IBusinessCategory | null> {
    return BusinessCategoryModel.findByIdAndUpdate(id, update, {
      returnDocument: 'after',
    }).lean();
  }

  static async deleteById(id: string): Promise<IBusinessCategory | null> {
    return BusinessCategoryModel.findByIdAndDelete(id).lean();
  }

  static count(): Promise<number> {
    return BusinessCategoryModel.countDocuments();
  }
}
