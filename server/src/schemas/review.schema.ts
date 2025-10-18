import { Schema, type InferSchemaType } from 'mongoose';

export const ReviewSchema = new Schema(
  {
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

// Prevent the same user for making the same review again
ReviewSchema.index({ authorId: 1, targetId: 1 }, { unique: true });

export type ReviewDocument = InferSchemaType<typeof ReviewSchema>;
