import { Schema, model } from 'mongoose';
import LocationSchema from './location.schema';

const JobSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  category: {
    type: 'String',
    required: true,
  },
  location: {
    type: LocationSchema,
    index: '2dsphere',
  },
  duration: {
    required: true,
    representation: {
      type: String,
      required: true,
    },
    value: {
      // in seconds
      type: Number,
      required: true,
    },
  },
  hourRate: {
    type: Number,
    required: true,
  },
});

export const Job = model('Job', JobSchema);
