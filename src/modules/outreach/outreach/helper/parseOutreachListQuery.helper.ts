import type { Request } from 'express';
import { OutreachListQuery } from '../dto/outreachListQuery.dto';
import { OutreachMessageStatus } from '../../outreach-message/model/outreachMessage.status';
import { OutreachStatus } from '../model/outreach.status';

const parseEnumArray = <T extends string>(
  value: unknown,
  enumValues: readonly T[],
): T[] | undefined => {
  if (typeof value !== 'string' || !value.trim()) {
    return undefined;
  }

  const values = value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const validValues = values.filter((item): item is T =>
    enumValues.includes(item as T),
  );

  return validValues.length > 0 ? validValues : undefined;
};

const parsePositiveInt = (
  value: unknown,
  fallback?: number,
): number | undefined => {
  if (typeof value !== 'string') {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
};

export const parseOutreachListQuery = (
  query: Request['query'],
): OutreachListQuery => {
  const status = parseEnumArray(
    query.status,
    Object.values(OutreachMessageStatus),
  );

  const sequenceStatus = parseEnumArray(
    query.sequenceStatus,
    Object.values(OutreachStatus),
  );

  const sortOrder =
    query.sortOrder === 'asc' || query.sortOrder === 'desc'
      ? query.sortOrder
      : undefined;

  return {
    status,
    sequenceStatus,

    search:
      typeof query.search === 'string' && query.search.trim()
        ? query.search.trim()
        : undefined,

    provider:
      typeof query.provider === 'string' && query.provider.trim()
        ? query.provider.trim()
        : undefined,

    page: parsePositiveInt(query.page),
    limit: parsePositiveInt(query.limit),

    sortBy:
      typeof query.sortBy === 'string' && query.sortBy.trim()
        ? query.sortBy.trim()
        : undefined,

    sortOrder,
  };
};
