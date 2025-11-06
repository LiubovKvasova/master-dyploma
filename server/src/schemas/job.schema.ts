import { Schema, type InferSchemaType } from 'mongoose';
import AddressSchema from './address.schema';
import LocationSchema from './location.schema';

export const DurationSchema = new Schema({
  hoursPerDay: {
    type: Number,
    required: true,
  },
  daysPerWeek: {
    type: Number,
    required: true,
  },
  weeks: {
    type: Number,
    required: true,
  },
});

export const JobSchema = new Schema(
  {
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
      type: LocationSchema,
      index: '2dsphere',
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
    status: {
      type: String,
      enum: ['active', 'in_progress', 'closed'],
      default: 'active',
      required: true,
      index: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    selectedWorker: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    images: {
      type: [String],
    },
  },
  {
    timestamps: true,
  },
);

JobSchema.set('toObject', {
  virtuals: true,
  transform: (_doc, ret) => {
    const coordinates = ret.location?.coordinates?.slice();

    if (coordinates) {
      ret.coordinates = coordinates;
    }
  },
});

export type JobDocument = InferSchemaType<typeof JobSchema>;
