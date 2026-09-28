export interface IAcquisitionIdentity {
  id: string;

  provider: string;

  externalId: string;

  businessName?: string;

  website?: string;

  phone?: string;

  leadId?: string;

  firstSeenAt: Date;

  lastSeenAt: Date;

  lastProcessedAt?: Date;

  timesSeen: number;

  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAcquisitionIdentityInput {
  provider: string;

  externalId: string;

  businessName?: string;

  website?: string;

  phone?: string;

  leadId?: string;
}
