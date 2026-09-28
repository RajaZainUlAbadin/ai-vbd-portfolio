import { PaginationParams } from '@/shared/types/pagination.interface';
import { LeadStatus } from '../model/lead.status';
import { LeadProvider } from '@/shared/constants';

export interface GetLeadsParams extends PaginationParams {
  status?: LeadStatus | LeadStatus[];
  provider?: LeadProvider | LeadProvider[];
}
