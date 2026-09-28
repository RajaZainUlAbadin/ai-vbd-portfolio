import { LocationModel, ILocation } from './location.model';

export class LocationRepository {
  static async create(data: Partial<ILocation>): Promise<ILocation> {
    const document = await LocationModel.create(data);

    return document.toObject();
  }

  static findAll(): Promise<ILocation[]> {
    return LocationModel.find()
      .sort({
        priority: -1,
        city: 1,
        area: 1,
      })
      .lean();
  }

  static findEnabled(): Promise<ILocation[]> {
    return LocationModel.find({
      enabled: true,
    })
      .sort({
        priority: -1,
        country: 1,
        city: 1,
        area: 1,
      })
      .lean();
  }

  static findById(id: string): Promise<ILocation | null> {
    return LocationModel.findById(id).lean();
  }

  static findByCity(city: string): Promise<ILocation[]> {
    return LocationModel.find({
      city,
    })
      .sort({
        area: 1,
      })
      .lean();
  }

  static async updateById(
    id: string,
    update: Partial<ILocation>,
  ): Promise<ILocation | null> {
    return LocationModel.findByIdAndUpdate(id, update, {
      returnDocument: 'after',
    }).lean();
  }

  static async deleteById(id: string): Promise<ILocation | null> {
    return LocationModel.findByIdAndDelete(id).lean();
  }

  static count(): Promise<number> {
    return LocationModel.countDocuments();
  }
}
