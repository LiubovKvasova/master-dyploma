import { Schema, type InferSchemaType } from 'mongoose';

export const MessageSchema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now(),
  },
});

export const ApplicationSchema = new Schema({
  jobId: {
    type: Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
    index: true,
  },
  workerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  employerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  workerAgreed: {
    type: Boolean,
    default: false,
  },
  employerAgreed: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['active', 'in_progress', 'closed'],
    default: 'active',
    required: true,
    index: true,
  },
  messages: {
    type: [MessageSchema],
  },
}, {
  timestamps: true
});

export type ApplicationDocument = InferSchemaType<typeof ApplicationSchema>;
