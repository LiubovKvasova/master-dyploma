import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { ReviewDocument } from 'src/schemas/review.schema';
import { ApplicationDocument } from 'src/schemas/application.schema';
import { UserDocument } from 'src/schemas/user.schema';
import { CreateReviewDto } from 'src/dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel('Application')
    private applicationModel: Model<ApplicationDocument>,
    @InjectModel('Review') private reviewModel: Model<ReviewDocument>,
    @InjectModel('User') private userModel: Model<UserDocument>,
  ) {}

  async createReview(authorId: string, dto: CreateReviewDto) {
    const { targetId, rating, comment } = dto;

    const interaction = await this.applicationModel.find({
      $and: [
        {
          $not: {
            status: 'active',
          },
        },
        {
          $or: [
            {
              employerId: new Types.ObjectId(authorId),
              workerId: new Types.ObjectId(targetId),
            },
            {
              employerId: new Types.ObjectId(targetId),
              workerId: new Types.ObjectId(authorId),
            },
          ],
        },
      ],
    });

    if (!interaction) {
      throw new NotFoundException('These users never interacted');
    }

    const existingReview = await this.reviewModel.findOne({
      authorId,
      targetId,
    });

    if (existingReview) {
      throw new ForbiddenException('The review already exists');
    }

    const review = await this.reviewModel.create({
      authorId,
      targetId,
      rating,
      comment,
    });
    await this.recalculateUserRating(targetId);

    return review.populate('targetId', 'username email rating');
  }

  async getPeopleToReview(authorId: string) {
    const authorObjectId = new Types.ObjectId(authorId);

    const users = await this.userModel.aggregate([
      {
        $lookup: {
          from: 'applications',
          let: { userId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $ne: ['$status', 'active'] },
                    {
                      $or: [
                        {
                          $and: [
                            { $eq: ['$employerId', authorObjectId] },
                            { $eq: ['$workerId', '$$userId'] },
                          ],
                        },
                        {
                          $and: [
                            { $eq: ['$employerId', '$$userId'] },
                            { $eq: ['$workerId', authorObjectId] },
                          ],
                        },
                      ],
                    },
                  ],
                },
              },
            },
          ],
          as: 'matchedApplications',
        },
      },
      {
        $match: {
          matchedApplications: { $ne: [] },
        },
      },
      {
        $project: {
          username: 1,
          email: 1,
          fullname: 1,
        },
      },
    ]);

    return users;
  }

  async getReceivedReviews(userId: string) {
    return this.reviewModel
      .find({ targetId: userId })
      .populate('authorId', 'username email rating')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getGivenReviews(userId: string) {
    return this.reviewModel
      .find({ authorId: userId })
      .populate('targetId', 'username email rating')
      .sort({ createdAt: -1 })
      .exec();
  }

  private async recalculateUserRating(userId: string) {
    const result = await this.reviewModel.aggregate([
      { $match: { targetId: new Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$targetId',
          avgRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 },
        },
      },
    ]);

    const data = result[0];
    const avg = data ? parseFloat(data.avgRating.toFixed(2)) : 0;
    const count = data ? data.reviewCount : 0;

    await this.userModel.updateOne(
      { _id: userId },
      { $set: { rating: avg, ratingCount: count } },
    );
  }
}
