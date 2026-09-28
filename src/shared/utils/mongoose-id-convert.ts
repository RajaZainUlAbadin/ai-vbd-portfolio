import mongoose from 'mongoose';

export const toIdString = (
  id: mongoose.Types.ObjectId | string | null | undefined,
): string | null => (id ? id.toString() : null);

export const toObjectId = (
  id: string | null | undefined,
): mongoose.Types.ObjectId | undefined =>
  id ? new mongoose.Types.ObjectId(id) : undefined;
