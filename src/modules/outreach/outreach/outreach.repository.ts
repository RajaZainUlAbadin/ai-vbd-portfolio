import { OutreachDocument, OutreachModel } from './model/outreach.model';
import { OutreachStatus } from './model/outreach.status';
import { CreateOutreachInput, IOutreach } from './model/outreach.interface';
import { mapOutreach } from './model/outreach.mapper';
import { OutreachMessageRepository } from '../outreach-message/outreachMessage.repository';
import { endOfDay, startOfDay } from 'date-fns';
import {
  PaginatedResult,
  PaginationParams,
} from '@/shared/types/pagination.interface';
import { IConversation } from '../conversation/types/conversation.type';
import mongoose from 'mongoose';
import { ConversationRepositoryResult } from '../conversation/types/conversationOutreach.types';
import { OutreachMessageStatus } from '../outreach-message/model/outreachMessage.status';
import { OutreachMessageModel } from '../outreach-message/model/outreachMessage.model';
import { OutreachListItem } from './dto/outreachlistItem.dto';
import { OutreachListQuery } from './dto/outreachListQuery.dto';

export class OutreachRepository {
  static async create(data: CreateOutreachInput): Promise<IOutreach> {
    const document = await OutreachModel.create(data);

    return mapOutreach(document);
  }

  static async findById(id: string): Promise<IOutreach | null> {
    const document = await OutreachModel.findById(id).lean<OutreachDocument>();

    return document ? mapOutreach(document) : null;
  }

  static async findLatestByLeadId(leadId: string): Promise<IOutreach | null> {
    const document = await OutreachModel.findOne({
      leadId,
    })
      .sort({
        createdAt: -1,
      })
      .lean();

    return document ? mapOutreach(document) : null;
  }

  static async update(
    id: string,
    data: Partial<CreateOutreachInput>,
  ): Promise<IOutreach | null> {
    if (!id) {
      throw new Error('Outreach id is required');
    }

    const document = await OutreachModel.findByIdAndUpdate(id, data, {
      returnDocument: 'after',
    });

    return document ? mapOutreach(document) : null;
  }

  static async findActiveOutreachIdbyLeadId(
    leadId: string,
  ): Promise<{ id: string } | null> {
    const outreach = await OutreachModel.findOne({
      leadId,
      status: OutreachStatus.ACTIVE,
    })
      .select('_id')
      .lean();

    if (!outreach) {
      return null;
    }

    return {
      id: outreach._id.toString(),
    };
  }

  // Dashboard APIs

  // Outreach
  static async getOutreachList(
    options: OutreachListQuery = {},
  ): Promise<OutreachListItem[]> {
    const page = Math.max(1, options.page ?? 1);
    const limit = Math.min(100, Math.max(1, options.limit ?? 20));
    const skip = (page - 1) * limit;

    const pipeline: mongoose.PipelineStage[] = [];

    /*
     * ------------------------------------------------------------
     * 1. Filter Outreach sequence status
     * ------------------------------------------------------------
     */

    if (options.sequenceStatus && options.sequenceStatus.length > 0) {
      pipeline.push({
        $match: {
          status: {
            $in: options.sequenceStatus,
          },
        },
      });
    }

    /*
     * ------------------------------------------------------------
     * 2. Load only the required Lead fields
     * ------------------------------------------------------------
     */

    pipeline.push({
      $lookup: {
        from: 'leads',
        let: {
          leadId: '$leadId',
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$_id', '$$leadId'],
              },
            },
          },
          {
            $project: {
              _id: 1,
              businessName: 1,
              provider: 1,
              score: 1,
              nextFollowupAt: 1,
            },
          },
        ],
        as: 'lead',
      },
    });

    pipeline.push({
      $unwind: {
        path: '$lead',
        preserveNullAndEmptyArrays: true,
      },
    });

    /*
     * ------------------------------------------------------------
     * 3. Load ONLY the latest OutreachMessage
     * ------------------------------------------------------------
     */

    pipeline.push({
      $lookup: {
        from: 'outreachmessages',
        let: {
          outreachId: '$_id',
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$outreachId', '$$outreachId'],
              },
            },
          },
          {
            $sort: {
              createdAt: -1,
            },
          },
          {
            $limit: 1,
          },
          {
            $project: {
              _id: 1,
              status: 1,
              to: 1,
              sentAt: 1,
              deliveredAt: 1,
              openedAt: 1,
              repliedAt: 1,
              errorMessage: 1,
              createdAt: 1,
            },
          },
        ],
        as: 'lastMessage',
      },
    });

    pipeline.push({
      $unwind: {
        path: '$lastMessage',
        preserveNullAndEmptyArrays: true,
      },
    });

    /*
     * ------------------------------------------------------------
     * 4. Message status filter
     * ------------------------------------------------------------
     */

    if (options.status && options.status.length > 0) {
      pipeline.push({
        $match: {
          'lastMessage.status': {
            $in: options.status,
          },
        },
      });
    }

    /*
     * ------------------------------------------------------------
     * 5. Provider filter
     * ------------------------------------------------------------
     */

    if (options.provider) {
      pipeline.push({
        $match: {
          provider: options.provider,
        },
      });
    }

    /*
     * ------------------------------------------------------------
     * 6. Search
     *
     * Search only fields relevant to the list.
     * ------------------------------------------------------------
     */

    if (options.search?.trim()) {
      const search = options.search.trim();

      const regex = {
        $regex: search,
        $options: 'i',
      };

      pipeline.push({
        $match: {
          $or: [
            {
              'lead.businessName': regex,
            },
            {
              recipient: regex,
            },
            {
              'lastMessage.to': regex,
            },
          ],
        },
      });
    }

    /*
     * ------------------------------------------------------------
     * 7. Convert database fields into list fields
     * ------------------------------------------------------------
     */

    pipeline.push({
      $project: {
        _id: 0,

        id: {
          $toString: '$_id',
        },

        lead: {
          id: {
            $toString: '$lead._id',
          },
          businessName: '$lead.businessName',
          provider: '$lead.provider',
          score: {
            $ifNull: ['$lead.score', 0],
          },
        },

        recipient: {
          $ifNull: ['$recipient', '$lastMessage.to'],
        },

        provider: 1,

        sequenceStep: {
          $ifNull: ['$sequenceStep', 1],
        },

        status: '$lastMessage.status',

        sequenceStatus: '$status',

        createdAt: 1,

        sentAt: '$lastMessage.sentAt',

        nextFollowupAt: '$lead.nextFollowupAt',

        replied: {
          $ne: [
            {
              $ifNull: ['$lastMessage.repliedAt', null],
            },
            null,
          ],
        },

        failure: {
          $cond: [
            {
              $and: [
                {
                  $eq: ['$lastMessage.status', OutreachMessageStatus.FAILED],
                },
                {
                  $ne: [
                    {
                      $ifNull: ['$lastMessage.errorMessage', ''],
                    },
                    '',
                  ],
                },
              ],
            },
            {
              reason: '$lastMessage.errorMessage',
            },
            null,
          ],
        },
      },
    });

    /*
     * ------------------------------------------------------------
     * 8. Sorting
     *
     * Never pass arbitrary user input directly into $sort.
     * ------------------------------------------------------------
     */

    const sortFields: Record<string, string> = {
      createdAt: 'createdAt',
      sentAt: 'sentAt',
      nextFollowupAt: 'nextFollowupAt',
      businessName: 'lead.businessName',
      recipient: 'recipient',
      sequenceStep: 'sequenceStep',
      status: 'status',
    };

    const sortField = sortFields[options.sortBy ?? ''] ?? 'createdAt';

    const sortDirection = options.sortOrder === 'asc' ? 1 : -1;

    pipeline.push({
      $sort: {
        [sortField]: sortDirection,
      },
    });

    // Pagination
    pipeline.push({
      $skip: skip,
    });

    pipeline.push({
      $limit: limit,
    });

    return OutreachModel.aggregate<OutreachListItem>(pipeline);
  }

  static async getStats(): Promise<OutreachStats> {
    const now = new Date();

    /*
     * Start of "today" according to the backend's local timezone.
     *
     * If the application later standardizes all business-day
     * calculations to a configured timezone, this can be replaced
     * with a timezone-aware helper.
     */
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const [result] = await OutreachMessageModel.aggregate([
      {
        $group: {
          _id: null,

          /*
           * Messages actually sent today.
           *
           * Do NOT use status === SENT here because a message
           * sent today may now be DELIVERED / OPENED / RESPONDED.
           */
          sentToday: {
            $sum: {
              $cond: [
                {
                  $gte: ['$sentAt', startOfToday],
                },
                1,
                0,
              ],
            },
          },

          /*
           * Currently waiting to be processed/sent.
           *
           * In your current model PENDING is the equivalent of
           * the "Scheduled" state for this screen.
           */
          scheduled: {
            $sum: {
              $cond: [
                {
                  $eq: ['$status', OutreachMessageStatus.PENDING],
                },
                1,
                0,
              ],
            },
          },

          delivered: {
            $sum: {
              $cond: [
                {
                  $ne: [
                    {
                      $ifNull: ['$deliveredAt', null],
                    },
                    null,
                  ],
                },
                1,
                0,
              ],
            },
          },

          opened: {
            $sum: {
              $cond: [
                {
                  $ne: [
                    {
                      $ifNull: ['$openedAt', null],
                    },
                    null,
                  ],
                },
                1,
                0,
              ],
            },
          },

          replied: {
            $sum: {
              $cond: [
                {
                  $ne: [
                    {
                      $ifNull: ['$repliedAt', null],
                    },
                    null,
                  ],
                },
                1,
                0,
              ],
            },
          },

          failed: {
            $sum: {
              $cond: [
                {
                  $eq: ['$status', OutreachMessageStatus.FAILED],
                },
                1,
                0,
              ],
            },
          },
        },
      },

      {
        $project: {
          _id: 0,
          sentToday: 1,
          scheduled: 1,
          delivered: 1,
          opened: 1,
          replied: 1,
          failed: 1,
        },
      },
    ]);

    return {
      sentToday: result?.sentToday ?? 0,
      scheduled: result?.scheduled ?? 0,
      delivered: result?.delivered ?? 0,
      opened: result?.opened ?? 0,
      replied: result?.replied ?? 0,
      failed: result?.failed ?? 0,
    };
  }
  
  // Conversations
  static async getConversationList(
    options: PaginationParams & {
      status?: OutreachStatus;
    },
  ): Promise<PaginatedResult<IConversation>> {
    const page = Math.max(1, options.page ?? 1);
    const limit = Math.min(100, Math.max(1, options.limit ?? 20));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    if (options.status) {
      filter.status = options.status;
    }

    const [items, total] = await Promise.all([
      OutreachModel.aggregate([
        {
          $match: filter,
        },

        // Load lead
        {
          $lookup: {
            from: 'leads',
            localField: 'leadId',
            foreignField: '_id',
            as: 'lead',
          },
        },

        {
          $unwind: {
            path: '$lead',
            preserveNullAndEmptyArrays: true,
          },
        },

        // Load all messages so we can determine the latest message
        {
          $lookup: {
            from: 'outreachmessages',
            localField: '_id',
            foreignField: 'outreachId',
            as: 'messages',
          },
        },

        // Resolve latest message
        {
          $addFields: {
            messageCount: {
              $size: '$messages',
            },

            lastMessage: {
              $arrayElemAt: [
                {
                  $sortArray: {
                    input: '$messages',
                    sortBy: {
                      createdAt: -1,
                    },
                  },
                },
                0,
              ],
            },
          },
        },

        // Resolve fields required by the mapper
        {
          $addFields: {
            lastMessageStatus: '$lastMessage.status',
            lastMessageAt: '$lastMessage.createdAt',
            leadScore: '$lead.score',
            businessName: '$lead.businessName',
          },
        },

        // We don't need the complete messages collection anymore.
        // The mapper only needs the latest message.
        {
          $project: {
            messages: 0,
            'lead.dedupeHash': 0,
          },
        },

        // Most recently active conversation first
        {
          $sort: {
            lastMessageAt: -1,
            createdAt: -1,
          },
        },

        {
          $skip: skip,
        },

        {
          $limit: limit,
        },
      ]),

      OutreachModel.countDocuments(filter),
    ]);

    return {
      items,
      total,
      page,
      limit,
    };
  }

  // static async findConversations(
  //   options: PaginationParams & {
  //     status?: OutreachStatus;
  //   },
  // ): Promise<PaginatedResult<IOutreach>> {
  //   const page = options.page ?? 1;
  //   const limit = options.limit ?? 20;
  //   const skip = (page - 1) * limit;

  //   const filter: Record<string, unknown> = {};

  //   if (options.status) {
  //     filter.status = options.status;
  //   }

  //   const [items, total] = await Promise.all([
  //     OutreachModel.aggregate([
  //       {
  //         $match: filter,
  //       },

  //       {
  //         $lookup: {
  //           from: 'leads',
  //           localField: 'leadId',
  //           foreignField: '_id',
  //           as: 'lead',
  //         },
  //       },

  //       {
  //         $unwind: {
  //           path: '$lead',
  //           preserveNullAndEmptyArrays: true,
  //         },
  //       },

  //       {
  //         $lookup: {
  //           from: 'outreachmessages',
  //           localField: '_id',
  //           foreignField: 'outreachId',
  //           as: 'messages',
  //         },
  //       },

  //       {
  //         $addFields: {
  //           messageCount: {
  //             $size: '$messages',
  //           },

  //           lastMessage: {
  //             $arrayElemAt: [
  //               {
  //                 $sortArray: {
  //                   input: '$messages',
  //                   sortBy: {
  //                     createdAt: -1,
  //                   },
  //                 },
  //               },
  //               0,
  //             ],
  //           },
  //         },
  //       },
  //       {
  //         $addFields: {
  //           lastMessageStatus: '$lastMessage.status',
  //         },
  //       },

  //       {
  //         $project: {
  //           messages: 0,

  //           'lead.dedupeHash': 0,
  //         },
  //       },

  //       {
  //         $sort: {
  //           lastMessageAt: -1,
  //           createdAt: -1,
  //         },
  //       },

  //       {
  //         $skip: skip,
  //       },

  //       {
  //         $limit: limit,
  //       },
  //     ]),

  //     OutreachModel.countDocuments(filter),
  //   ]);

  //   return {
  //     items,
  //     total,
  //     page,
  //     limit,
  //   };
  // }

  static async findConversationByOutreachId(
    id: string,
  ): Promise<ConversationRepositoryResult | null> {
    const [document] = await OutreachModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
        },
      },

      // Load related Lead details
      {
        $lookup: {
          from: 'leads',
          localField: 'leadId',
          foreignField: '_id',
          as: 'lead',
        },
      },

      //Load all messages of this Outreach
      {
        $lookup: {
          from: 'outreachmessages',
          localField: '_id',
          foreignField: 'outreachId',
          as: 'messages',
        },
      },

      {
        $sort: {
          'messages.createdAt': 1,
        },
      },
    ]);

    if (!document) {
      return null;
    }

    return {
      outreach: { ...document, lead: document.lead?.[0] },
      messages: document.messages ?? [],
    };
  }

  static async findConversationById(id: string) {
    const document = await OutreachModel.findById(id)
      .populate({
        path: 'leadId',
        select: [
          'businessName',
          'website',
          'address',
          'contacts',
          'provider',
          'status',
          'score',
        ].join(' '),
      })
      .populate({
        path: 'aiAnalysisId',
      })
      .lean();

    return document ? mapOutreach(document) : null;
  }

  static async findAllByLeadId(leadId: string): Promise<IOutreach[] | null> {
    const documents = await OutreachModel.find({
      leadId,
    })
      .sort({
        createdAt: -1,
      })
      .lean();

    return documents.map(mapOutreach);
  }

  // Conversation
  static async getConversation(leadId: string) {
    const outreach = await OutreachModel.findOne({
      leadId: leadId,
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!outreach)
      return {
        conversation: null,
        messages: [],
      };

    const messages = await OutreachMessageRepository.findMessagesByOutreachId(
      String(outreach._id),
    );

    return {
      outreach: mapOutreach(outreach),
      messages,
    };
  }

  // Status operations
  static async touch(id: string): Promise<IOutreach | null> {
    return this.update(id, {
      lastMessageAt: new Date(),
    });
  }

  static async markResponded(id: string): Promise<IOutreach | null> {
    return this.update(id, {
      status: OutreachStatus.RESPONDED,
      respondedAt: new Date(),
      lastMessageAt: new Date(),
    });
  }

  static async markBounced(id: string): Promise<IOutreach | null> {
    return this.update(id, {
      status: OutreachStatus.BOUNCED,
      completedAt: new Date(),
    });
  }

  static async markFailed(
    id: string,
    errorMessage?: string,
  ): Promise<IOutreach | null> {
    return this.update(id, {
      status: OutreachStatus.FAILED,
      completedAt: new Date(),
      errorMessage,
    });
  }

  static async markUnsubscribed(id: string): Promise<IOutreach | null> {
    return this.update(id, {
      status: OutreachStatus.UNSUBSCRIBED,
      completedAt: new Date(),
    });
  }

  static async cancel(id: string, reason: string): Promise<IOutreach | null> {
    return this.update(id, {
      status: OutreachStatus.CANCELLED,
      cancelledAt: new Date(),
      cancelReason: reason,
    });
  }

  // Follow-ups
  // static async getPendingFollowups() {
  //   return OutreachModel.find({
  //     status: {
  //       $in: [OutreachMessageStatus.SENT, OutreachMessageStatus.OPENED],
  //     },
  //   });
  // }
}
