import mongoose, { Schema } from 'mongoose';
import {
  ContactSource,
  ContactStatus,
  ContactType,
} from './lead-contact.types';

export const leadContactSchema = new Schema({
  type: {
    type: String,
    enum: Object.values(ContactType),
    required: true,
  },

  value: {
    type: String,
    required: true,
  },

  name: String,

  designation: String,

  source: {
    type: String,
    enum: Object.values(ContactSource),
    required: true,
  },

  status: {
    type: String,
    enum: Object.values(ContactStatus),
    required: true,
  },

  confidence: {
    type: Number,
    default: 100,
  },

  verified: {
    type: Boolean,
    default: false,
  },

  isPrimary: {
    type: Boolean,
    default: false,
  },
});

export type LeadContactRecord = mongoose.InferSchemaType<
  typeof leadContactSchema
>;

export interface LeadContact {
  id?: string;
  type: ContactType;

  value: string;

  name?: string | null;
  designation?: string | null;

  source: ContactSource;
  status: ContactStatus;

  confidence: number;
  verified: boolean;
  isPrimary: boolean;
}
