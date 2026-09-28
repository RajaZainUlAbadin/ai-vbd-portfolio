import { LeadModel } from '../lead/model/lead.model';
import { LeadStatus } from '../lead/model/lead.status';
import { OutreachMessageModel } from '../outreach/outreach-message/model/outreachMessage.model';
import { OutreachModel } from '../outreach/outreach/model/outreach.model';
import { LeadDashboardMetrics, ProviderPerformance } from './dashboard.types';

export class DashboardRepository {
  static async getRecentActivity(limit = 20) {
    return LeadModel.aggregate([
      /**
       * LEADS
       */
      {
        $sort: {
          createdAt: -1,
        },
      },

      {
        $limit: limit,
      },

      {
        $project: {
          _id: 0,

          type: {
            $literal: 'LEAD_CREATED',
          },

          title: {
            $literal: 'New lead acquired',
          },

          description: {
            $concat: ['$businessName', ' via ', '$provider'],
          },

          timestamp: '$createdAt',

          metadata: {
            leadId: {
              $toString: '$_id',
            },
          },
        },
      },

      /**
       * OUTREACHES
       */
      {
        $unionWith: {
          coll: OutreachModel.collection.name,

          pipeline: [
            {
              $sort: {
                createdAt: -1,
              },
            },

            {
              $limit: limit,
            },

            {
              $project: {
                _id: 0,

                type: {
                  $literal: 'OUTREACH_CREATED',
                },

                title: {
                  $literal: 'Outreach conversation started',
                },

                description: {
                  $concat: [
                    'Outreach started for ',
                    {
                      $ifNull: ['$recipient', 'lead'],
                    },
                  ],
                },

                timestamp: '$createdAt',

                metadata: {
                  outreachId: {
                    $toString: '$_id',
                  },

                  leadId: {
                    $toString: '$leadId',
                  },
                },
              },
            },
          ],
        },
      },

      /**
       * OUTREACH MESSAGES
       */
      {
        $unionWith: {
          coll: OutreachMessageModel.collection.name,

          pipeline: [
            {
              $sort: {
                createdAt: -1,
              },
            },

            {
              $limit: limit,
            },

            {
              $project: {
                _id: 0,

                type: {
                  $cond: [
                    {
                      $eq: ['$direction', 'inbound'],
                    },
                    'MESSAGE_RECEIVED',
                    'MESSAGE_SENT',
                  ],
                },

                title: {
                  $cond: [
                    {
                      $eq: ['$direction', 'inbound'],
                    },
                    'Client replied',
                    'Message sent',
                  ],
                },

                description: {
                  $ifNull: [
                    '$subject',
                    {
                      $substrCP: ['$message', 0, 100],
                    },
                  ],
                },

                timestamp: {
                  $ifNull: ['$sentAt', '$createdAt'],
                },

                metadata: {
                  outreachId: {
                    $toString: '$outreachId',
                  },

                  messageId: {
                    $toString: '$_id',
                  },

                  channel: '$channel',
                },
              },
            },
          ],
        },
      },

      /**
       * FINAL GLOBAL SORT
       */
      {
        $sort: {
          timestamp: -1,
        },
      },

      /**
       * FINAL LIMIT
       */
      {
        $limit: limit,
      },
    ]);
  }

  static async getDashboardMetrics(): Promise<LeadDashboardMetrics> {
    const now = new Date();

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const result = await LeadModel.aggregate([
      {
        $facet: {
          total: [
            {
              $count: 'count',
            },
          ],

          newToday: [
            {
              $match: {
                createdAt: {
                  $gte: startOfToday,
                },
              },
            },
            {
              $count: 'count',
            },
          ],

          qualified: [
            {
              $match: {
                status: LeadStatus.QUALIFIED,
              },
            },
            {
              $count: 'count',
            },
          ],

          readyForOutreach: [
            {
              $match: {
                status: {
                  $in: [LeadStatus.OUTREACH_PENDING, LeadStatus.ANALYZED],
                },
              },
            },
            {
              $count: 'count',
            },
          ],

          outreachSentToday: [
            {
              $match: {
                lastOutreachAt: {
                  $gte: startOfToday,
                },
              },
            },
            {
              $count: 'count',
            },
          ],

          replies: [
            {
              $match: {
                repliedAt: {
                  $ne: null,
                },
              },
            },
            {
              $count: 'count',
            },
          ],

          followupsPending: [
            {
              $match: {
                nextFollowupAt: {
                  $gte: now,
                },
              },
            },
            {
              $count: 'count',
            },
          ],

          pipeline: [
            {
              $group: {
                _id: '$status',
                count: {
                  $sum: 1,
                },
              },
            },
          ],
        },
      },
    ]);

    const data = result[0];

    const getCount = (key: string): number => {
      return data[key]?.[0]?.count ?? 0;
    };

    const pipelineCounts: Record<string, number> = {};

    for (const item of data.pipeline ?? []) {
      pipelineCounts[item._id] = item.count;
    }

    return {
      metrics: {
        totalLeads: getCount('total'),
        newToday: getCount('newToday'),
        qualified: getCount('qualified'),
        readyForOutreach: getCount('readyForOutreach'),
        outreachSentToday: getCount('outreachSentToday'),
        replies: getCount('replies'),
        followupsPending: getCount('followupsPending'),
      },

      pipeline: {
        acquired: getCount('total'),

        qualified: pipelineCounts[LeadStatus.QUALIFIED] ?? 0,

        analyzed: pipelineCounts[LeadStatus.ANALYZED] ?? 0,

        readyForOutreach: pipelineCounts[LeadStatus.OUTREACH_PENDING] ?? 0,

        contacted:
          (pipelineCounts[LeadStatus.CONTACTED] ?? 0) +
          (pipelineCounts[LeadStatus.OUTREACHED] ?? 0),

        replied:
          (pipelineCounts[LeadStatus.RESPONDED] ?? 0) +
          (pipelineCounts[LeadStatus.ENGAGED] ?? 0),
      },
    };
  }

  static async getProviderPerformance(): Promise<ProviderPerformance[]> {
    const result = await LeadModel.aggregate([
      {
        $group: {
          _id: '$provider',

          leads: {
            $sum: 1,
          },

          qualified: {
            $sum: {
              $cond: [
                {
                  $eq: ['$status', LeadStatus.QUALIFIED],
                },
                1,
                0,
              ],
            },
          },

          rejected: {
            $sum: {
              $cond: [
                {
                  $eq: ['$status', LeadStatus.REJECTED],
                },
                1,
                0,
              ],
            },
          },

          analyzed: {
            $sum: {
              $cond: [
                {
                  $eq: ['$status', LeadStatus.ANALYZED],
                },
                1,
                0,
              ],
            },
          },

          contacted: {
            $sum: {
              $cond: [
                {
                  $gt: ['$outreachCount', 0],
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
                  $ne: ['$repliedAt', null],
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

          provider: '$_id',

          leads: 1,
          qualified: 1,
          rejected: 1,
          analyzed: 1,
          contacted: 1,
          replied: 1,

          qualificationRate: {
            $cond: [
              { $gt: ['$leads', 0] },
              {
                $multiply: [{ $divide: ['$qualified', '$leads'] }, 100],
              },
              0,
            ],
          },

          replyRate: {
            $cond: [
              { $gt: ['$contacted', 0] },
              {
                $multiply: [{ $divide: ['$replied', '$contacted'] }, 100],
              },
              0,
            ],
          },
        },
      },

      {
        $sort: {
          qualificationRate: -1,
        },
      },
    ]);

    return result;
  }
}
