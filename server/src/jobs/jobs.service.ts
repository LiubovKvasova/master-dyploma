import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model, PassportLocalModel } from 'mongoose';

import { JobDocument } from './job.types';
// import { UserDocument } from 'src/users/user.types';
import { CreateJobDto } from 'src/dto/create-job.dto';
import { NearbyJobsDto } from 'src/dto/nearby-jobs.dto';

@Injectable()
export class JobsService {
  constructor(
    @InjectModel('Job') private jobModel: Model<JobDocument>,
    // @InjectModel('User') private userModel: PassportLocalModel<UserDocument>,
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
    return this.jobModel.find({ owner: userId }).exec();
  }

  async findNearby(query: NearbyJobsDto) {
    const { lng, lat, maxDistance } = query;

    return this.jobModel.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: maxDistance,
        },
      },
    });
  }
}
