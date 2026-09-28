import { ISearchMatrix } from './searchMatrix.interface';
import { SearchMatrixDocument } from './searchMatrix.model';

export function mapSearchMatrix(
  doc: SearchMatrixDocument | null,
): ISearchMatrix | null {
  if (!doc) {
    return null;
  }

  const documentWithId = doc as SearchMatrixDocument & {
    _id?: { toString: () => string } | string | null;
  };

  return {
    id: documentWithId._id?.toString() ?? '',

    name: doc.name,

    businessCategory: doc.businessCategory,
    location: doc.location,
    query: doc.query,

    priority: doc.priority,
    enabled: doc.enabled,

    lastExecutedAt: doc.lastExecutedAt ?? null,

    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}
