import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types, type Model } from 'mongoose';

import { JobDocument } from 'src/schemas/job.schema';
import { CreateJobDto } from 'src/dto/create-job.dto';
import { NearbyJobsDto } from 'src/dto/nearby-jobs.dto';

@Injectable()
export class JobsService {
  constructor(@InjectModel('Job') private jobModel: Model<JobDocument>) {}

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
      searchQuery.category = {
        $in: query.category,
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
}
