import { Schema, type HydratedDocument } from 'mongoose';
import AddressSchema from './address.schema';

export const DurationSchema = new Schema({
  representation: {
    type: String,
    required: true,
  },
  value: {
    // in seconds
    type: Number,
    required: true,
  },
});

export const JobSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  category: {
    type: String,
    required: true,
  },
  location: {
    type: [Number],
    index: '2d',
  },
  coordinates: {
    type: [Number],
  },
  address: {
    type: AddressSchema,
  },
  duration: {
    type: DurationSchema,
    required: true,
  },
  hourRate: {
    type: Number,
    required: true,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
});

JobSchema.set('toObject', {
  virtuals: true,
  transform: (_doc, ret) => {
    const coordinates = ret.location?.slice();

    if (coordinates) {
      ret.coordinates = coordinates;
    }
  },
});

export type JobDocument = HydratedDocument<typeof JobSchema>;
