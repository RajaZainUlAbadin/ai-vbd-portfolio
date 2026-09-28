import { endOfDay, startOfDay } from 'date-fns';
import {
  CreateOutboundMessageInput,
  CreateOutreachMessageInput,
  IOutreachMessage,
} from './model/outreachMessage.interface';
import { mapOutreachMessage } from './model/outreachMessage.mapper';
import { OutreachMessageModel } from './model/outreachMessage.model';
import { OutreachMessageStatus } from './model/outreachMessage.status';

export class OutreachMessageRepository {
  static async create(
    data: CreateOutreachMessageInput,
  ): Promise<IOutreachMessage> {
    const document = await OutreachMessageModel.create(data);

    return mapOutreachMessage(document);
  }

  static async createOutboundMessage(
    data: CreateOutboundMessageInput,
  ): Promise<IOutreachMessage> {
    return this.create({
      ...data,
      direction: 'outbound',
    });
  }

  // static async createInboundMessage(
  //   data: CreateInboundMessageInput,
  // ): Promise<IOutreachMessage> {
  //   return this.create({
  //     outreachId: data.outreachId,
  //     parentMessageId: data.replyToMessageId,
  //     direction: 'inbound',
  //     channel: data.channel,
  //     provider: data.provider,
  //     providerMessageId: data.providerMessageId,
  //     externalMessageId: data.externalMessageId,
  //     inReplyTo: data.inReplyTo,
  //     from: data.from,
  //     to: data.to,
  //     subject: data.subject,
  //     message: data.message,
  //     status: OutreachMessageStatus.RESPONDED,
  //     repliedAt: new Date(),
  //   });
  // }

  static async update(
    id: string,
    data: Partial<CreateOutreachMessageInput>,
  ): Promise<IOutreachMessage | null> {
    const document = await OutreachMessageModel.findByIdAndUpdate(id, data, {
      returnDocument: 'after',
    });

    return document ? mapOutreachMessage(document) : null;
  }

  static async findById(id: string): Promise<IOutreachMessage | null> {
    const document = await OutreachMessageModel.findById(id);

    return document ? mapOutreachMessage(document) : null;
  }

  static async findByProviderMessageId(
    providerMessageId: string,
  ): Promise<IOutreachMessage | null> {
    const document = await OutreachMessageModel.findOne({
      providerMessageId,
    });

    return document ? mapOutreachMessage(document) : null;
  }

  static async findByExternalMessageId(
    externalMessageId: string,
  ): Promise<IOutreachMessage | null> {
    const document = await OutreachMessageModel.findOne({
      externalMessageId,
    });

    return document ? mapOutreachMessage(document) : null;
  }

  static async findLatestByExternalMessageIds(
    externalMessageIds: string[],
  ): Promise<IOutreachMessage | null> {
    const document = await OutreachMessageModel.findOne({
      externalMessageId: { $in: externalMessageIds },
    }).sort({
      createdAt: -1,
    });

    return document ? mapOutreachMessage(document) : null;
  }

  static async findByOutreachIds(
    outreachIds: string[],
  ): Promise<IOutreachMessage[]> {
    const messages = await OutreachMessageModel.find({
      outreachId: {
        $in: outreachIds,
      },
    })
      .sort({
        createdAt: 1,
      })
      .lean();

    return messages.map(mapOutreachMessage);
  }

  static async countSentToday() {
    return OutreachMessageModel.countDocuments({
      status: OutreachMessageStatus.SENT,
      sentAt: {
        $gte: startOfDay(new Date()),
        $lt: endOfDay(new Date()),
      },
    });
  }

  // States
  static async markSent(
    id: string,
    provider: string,
    providerMessageId?: string,
  ): Promise<IOutreachMessage | null> {
    return this.update(id, {
      status: OutreachMessageStatus.SENT,
      sentAt: new Date(),
      provider,
      providerMessageId,
    });
  }

  static async markDelivered(id: string): Promise<IOutreachMessage | null> {
    return this.update(id, {
      status: OutreachMessageStatus.DELIVERED,
      deliveredAt: new Date(),
    });
  }

  static async markOpened(id: string): Promise<IOutreachMessage | null> {
    return this.update(id, {
      status: OutreachMessageStatus.OPENED,
      openedAt: new Date(),
    });
  }

  static async markClicked(id: string): Promise<IOutreachMessage | null> {
    return this.update(id, {
      status: OutreachMessageStatus.CLICKED,
    });
  }

  static async markBounced(id: string): Promise<IOutreachMessage | null> {
    return this.update(id, {
      status: OutreachMessageStatus.BOUNCED,
    });
  }

  static async markComplained(id: string): Promise<IOutreachMessage | null> {
    return this.update(id, {
      status: OutreachMessageStatus.COMPLAINED,
    });
  }

  static async markFailed(
    id: string,
    errorMessage: string,
  ): Promise<IOutreachMessage | null> {
    return this.update(id, {
      status: OutreachMessageStatus.FAILED,
      errorMessage,
    });
  }

  static async markResponded(
    id: string,
    // response: CreateInboundMessageInput,
  ): Promise<IOutreachMessage | null> {
    return this.update(id, {
      status: OutreachMessageStatus.RESPONDED,
      repliedAt: new Date(),
    });

    // return this.createInboundMessage(response);
  }

  // Conversation
  static async findMessagesByOutreachId(
    outreachId: string,
  ): Promise<IOutreachMessage[]> {
    const documents = await OutreachMessageModel.find({
      outreachId,
    })
      .sort({
        createdAt: 1,
      })
      .lean();

    return documents.map(mapOutreachMessage);
  }

  static async findLatestByOutreachId(
    outreachId: string,
  ): Promise<IOutreachMessage | null> {
    const document = await OutreachMessageModel.findOne({
      outreachId,
    }).sort({
      createdAt: -1,
    });

    return document ? mapOutreachMessage(document) : null;
  }

  static async getLatestInboundMessage(
    outreachId: string,
  ): Promise<IOutreachMessage | null> {
    const document = await OutreachMessageModel.findOne({
      outreachId,
      direction: 'inbound',
    }).sort({
      createdAt: -1,
    });

    return document ? mapOutreachMessage(document) : null;
  }

  static async getLatestOutboundMessage(
    outreachId: string,
  ): Promise<IOutreachMessage | null> {
    const document = await OutreachMessageModel.findOne({
      outreachId,
      direction: 'outbound',
    }).sort({
      createdAt: -1,
    });

    return document ? mapOutreachMessage(document) : null;
  }
}
