export enum OutreachStatus {
  ACTIVE = 'ACTIVE',
  // Sequence is running, waiting for next step

  COMPLETED = 'COMPLETED',
  // Sequence finished without reply

  RESPONDED = 'RESPONDED',
  // Customer replied, human/AI follow-up required

  BOUNCED = 'BOUNCED',
  // Email delivery failed permanently

  UNSUBSCRIBED = 'UNSUBSCRIBED',
  // Customer opted out / complained

  FAILED = 'FAILED',
  // Internal failure (provider issue, system error)

  PAUSED = 'PAUSED',
  // Temporarily stopped manually/system

  CANCELLED = 'CANCELLED',
  // User/admin cancelled sequence
}
