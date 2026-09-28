import mongoose from 'mongoose';
import { OutreachStatus } from '../outreach/model/outreach.status';
import { OutreachRepository } from '../outreach/outreach.repository';
import { PaginationParams } from '@/shared/types/pagination.interface';
import { OutreachMessageRepository } from '../outreach-message/outreachMessage.repository';
import {
  mapConversationDetail,
  mapConversationListItem,
} from './mapper/conversation.mapper';
import { ConversationDetailDto } from './dto/conversationDetail.dto';
import { OutreachMessageModel } from '../outreach-message/model/outreachMessage.model';
import { LeadModel } from '@/modules/lead/model/lead.model';

export class ConversationService {
  static async getConversationList(
    options: PaginationParams & {
      status?: OutreachStatus;
    } = {},
  ) {
    const result = await OutreachRepository.getConversationList(options);

    const pages =
      result.total === 0 ? 0 : Math.ceil(result.total / result.limit);

    return {
      items: result.items.map(mapConversationListItem),

      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        pages,
      },
    };
  }

  static async loadConversation(id: string): Promise<ConversationDetailDto> {
    const conversation =
      await OutreachRepository.findConversationByOutreachId(id);

    if (!conversation) {
      throw new Error('Outreach conversation not found');
    }

    console.log('conversation: ', conversation);

    return mapConversationDetail(conversation.outreach, conversation.messages);
  }
}
