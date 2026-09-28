export enum OutreachMessageStatus {
  PENDING = 'PENDING',

  SENT = 'SENT',
  DELIVERED = 'DELIVERED',

  OPENED = 'OPENED',
  CLICKED = 'CLICKED',
  RESPONDED = 'RESPONDED',

  FAILED = 'FAILED',
  BOUNCED = 'BOUNCED',
  COMPLAINED = 'COMPLAINED',
}

// AWS SES Event types

// Sends
// The call was successful and Amazon SES will attempt to deliver the message to the recipient’s mail server.

// Rendering failures
// The message wasn’t sent because of a template rendering issue.

// Rejects
// Amazon SES accepted the message, but determined that it contained a virus and didn’t attempt to deliver it to the recipient’s mail server.

// Deliveries
// Amazon SES successfully delivered the message to the recipient’s mail server.

// Hard bounces
// The recipient's mail server permanently rejected the email. (Soft bounces will be included if Amazon SES is unable to deliver the email after multiple attempts.)

// Complaints
// The message was successfully delivered to the recipient’s mail server, but the recipient marked it as spam.

// Delivery delays
// The message couldn't be delivered to the recipient’s mail server because a temporary issue occurred.

// Subscriptions
// The email was successfully delivered to the recipient. The recipient updated the subscription preferences by clicking List-Unsubscribe header or via the Unsubscribe webpage linked to the email footer.
// Open and click tracking

// Opens
// Clicks