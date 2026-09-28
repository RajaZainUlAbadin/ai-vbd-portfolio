import { Types } from 'mongoose';
import { IScrapeResult, ScrapeResultRecord } from '../model/scrapeResult.model';

type ScrapeResultLean = ScrapeResultRecord & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export function mapIScrapeResult(doc: ScrapeResultLean): IScrapeResult {
  const { _id, ...rest } = doc;

  return {
    id: _id.toString(),
    ...rest,
  };
}
