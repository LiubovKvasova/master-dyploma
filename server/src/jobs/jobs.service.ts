import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types, type Model } from 'mongoose';

import { JobDocument } from 'src/schemas/job.schema';
import { CreateJobDto } from 'src/dto/create-job.dto';
import { NearbyJobsDto } from 'src/dto/nearby-jobs.dto';
import { UserDocument } from 'src/schemas/user.schema';

@Injectable()
export class JobsService {
  constructor(
    @InjectModel('Job') private jobModel: Model<JobDocument>,
    @InjectModel('User') private userModel: Model<UserDocument>,
  ) {}

  async create(dto: CreateJobDto, userId: string) {
    const { coordinates, ...restOfDto } = dto;

    const job = new this.jobModel({
      ...restOfDto,
      location: { type: 'Point', coordinates },
      owner: userId,
    });

    return job.save();
  }

  async findMyJobs(userId: string) {
    const results = await this.jobModel.find({ owner: userId }).exec();
    return results.map((doc) => doc.toObject());
  }

  async findById(id: string, userId?: string) {
    if (!userId) {
      return this.jobModel.findById(id).exec();
    }

    return this.jobModel
      .find({
        _id: id,
        owner: userId,
      })
      .exec();
  }

  async deleteJob(id: string) {
    return this.jobModel.findByIdAndDelete(id).exec();
  }

  async findNearby(query: NearbyJobsDto, userId: string) {
    const { lng, lat, maxDistance } = query;
    const EARTH_RADIUS = 63781.37;

    const intDistance = Number.parseInt(maxDistance.toString());
    const radians = intDistance / EARTH_RADIUS;

    type SearchQuery = {
      status: string;
      owner: object;
      location: object;
      category?: object;
      $or?: object[];
    };

    const searchQuery: SearchQuery = {
      status: 'active',
      owner: {
        $ne: new Types.ObjectId(userId),
      },
      location: {
        $geoWithin: {
          $centerSphere: [
            [lat, lng].map((value) => parseFloat(value)),
            radians,
          ],
        },
      },
    };

    if (query.category) {
      const category = Array.isArray(query.category)
        ? query.category
        : [query.category];

      searchQuery.category = {
        $in: category,
      };
    }

    if (query.duration && query.duration.length > 0) {
      const duration = Array.isArray(query.duration)
        ? query.duration
        : [query.duration];
      const orConditions: object[] = [];

      if (duration.includes('day')) {
        orConditions.push({
          'duration.weeks': 1,
          'duration.daysPerWeek': 1,
        });
      }

      if (duration.includes('week')) {
        orConditions.push({
          'duration.weeks': 1,
          'duration.daysPerWeek': { $gt: 1 },
        });
      }

      if (duration.includes('weeks')) {
        orConditions.push({
          'duration.weeks': { $gt: 1 },
        });
      }

      if (orConditions.length > 0) {
        searchQuery.$or = orConditions;
      }
    }

    const results = await this.jobModel.aggregate([
      { $match: searchQuery },
      {
        $lookup: {
          from: 'users',
          localField: 'owner',
          foreignField: '_id',
          as: 'owner',
        },
      },
      { $unwind: '$owner' },
      {
        $lookup: {
          from: 'applications',
          let: { jobId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$jobId', '$$jobId'] },
                    { $eq: ['$workerId', new Types.ObjectId(userId)] },
                  ],
                },
              },
            },
          ],
          as: 'userApplication',
        },
      },
      {
        $addFields: {
          hasApplied: {
            $gt: [{ $size: '$userApplication' }, 0],
          },
          coordinates: '$location.coordinates',
        },
      },
      {
        $project: {
          userApplication: 0,
          'owner.hash': 0,
          'owner.salt': 0,
        },
      },
    ]);

    return results;
  }

  async getRecommendedJobsForUser(userId: string) {
    const user = await this.userModel.findById(userId).lean();
    if (!user || !user.location) return [];

    // 1️⃣ Отримуємо ваги динамічно з preferenceOrder
    const order = user.preferenceOrder ?? [
      'distance',
      'salary',
      'categories',
      'reputation',
    ];
    const total = order.length;

    const weights = order.reduce(
      (acc, key, i) => {
        acc[key] = (2 * (total - i)) / (total * (total + 1));
        return acc;
      },
      {} as Record<string, number>,
    );

    const maxSalaryDoc = await this.jobModel
      .findOne({ status: 'active' })
      .sort({ hourRate: -1 })
      .select('hourRate')
      .lean();

    const maxSalary = maxSalaryDoc?.hourRate ?? 1;

    // 2️⃣ Пайплайн
    const jobs = await this.jobModel.aggregate([
      {
        $geoNear: {
          near: user.location.coordinates as [number, number],
          distanceField: 'distance',
          distanceMultiplier: 200,
          spherical: true,
          query: { status: 'active' },
        },
      },

      {
        $lookup: {
          from: 'users',
          localField: 'owner',
          foreignField: '_id',
          as: 'owner',
        },
      },
      { $unwind: '$owner' },

      {
        $set: {
          salaryScore: {
            $divide: ['$hourRate', maxSalary],
          },
          distanceScore: {
            $max: [{ $subtract: [1, '$distance'] }, 0],
          },
          categoryScore: {
            $cond: [
              { $in: ['$category', user.interestedCategories ?? []] },
              1,
              0,
            ],
          },
          reputationScore: {
            $divide: [{ $ifNull: ['$owner.rating', 0] }, 5],
          },
        },
      },
      {
        $set: {
          score: {
            $add: [
              { $multiply: ['$distanceScore', weights.distance ?? 0] },
              { $multiply: ['$salaryScore', weights.salary ?? 0] },
              { $multiply: ['$categoryScore', weights.categories ?? 0] },
              { $multiply: ['$reputationScore', weights.reputation ?? 0] },
            ],
          },
        },
      },
      { $sort: { score: -1 } },
      { $limit: 30 },
      {
        $lookup: {
          from: 'applications',
          let: { jobId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$jobId', '$$jobId'] },
                    { $eq: ['$workerId', new Types.ObjectId(userId)] },
                  ],
                },
              },
            },
          ],
          as: 'userApplication',
        },
      },
      {
        $set: {
          hasApplied: {
            $gt: [{ $size: '$userApplication' }, 0],
          },
          coordinates: '$location.coordinates',
        },
      },
      {
        $project: {
          title: 1,
          category: 1,
          hourRate: 1,
          duration: 1,
          address: 1,

          // Показати всі очки зваженої згортки
          score: 1,
          distanceScore: 1,
          salaryScore: 1,
          categoryScore: 1,
          reputationScore: 1,

          distance: 1,
          coordinates: 1,
          owner: { _id: 1, fullname: 1, rating: 1 },
          hasApplied: 1,
          images: 1,
        },
      },
    ]);

    return jobs;
  }
}
