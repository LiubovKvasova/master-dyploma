import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

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
      location: coordinates,
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

  async findNearby(query: NearbyJobsDto) {
    const { lng, lat, maxDistance } = query;
    const EARTH_RADIUS = 63781.37;

    const intDistance = Number.parseInt(maxDistance.toString());
    const radians = intDistance / EARTH_RADIUS;

    const results = await this.jobModel
      .find({
        location: {
          $near: [lat, lng],
          $maxDistance: radians,
        },
      })
      .exec();

    return results.map((doc) => doc.toObject());
  }
}
