import { OutreachStatus } from '../model/outreach.status';
import { OutreachMessageStatus } from '../../outreach-message/model/outreachMessage.status';

export interface OutreachListQuery {
  status?: OutreachMessageStatus[];
  sequenceStatus?: OutreachStatus[];
  search?: string;
  provider?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
