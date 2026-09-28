import type { PaginatedResponseDto } from '@/shared/dto/pagination.dto';
import type { LeadDto } from './lead.dto';

export type LeadListDto = PaginatedResponseDto<LeadDto>;