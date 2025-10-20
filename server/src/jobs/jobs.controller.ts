import {
  Controller,
  UseGuards,
  Get,
  Post,
  Body,
  Request,
  Query,
  Delete,
  Param,
  NotFoundException,
} from '@nestjs/common';

import { JobsService } from './jobs.service';
import { AuthenticatedGuard } from 'src/auth/auth.guard';
import { CreateJobDto } from 'src/dto/create-job.dto';
import { NearbyJobsDto } from 'src/dto/nearby-jobs.dto';

@Controller('jobs')
@UseGuards(AuthenticatedGuard)
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post('create')
  async create(@Body() dto: CreateJobDto, @Request() req) {
    return this.jobsService.create(dto, req.user._id);
  }

  @Get('my')
  async myJobs(@Request() req) {
    return this.jobsService.findMyJobs(req.user._id);
  }

  @Delete(':id')
  async deleteJob(@Param('id') id: string, @Request() req) {
    const userId = req.user._id;
    const job = await this.jobsService.findById(id, userId);

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return this.jobsService.deleteJob(id);
  }

  @Get('nearby')
  async nearby(@Query() query: NearbyJobsDto, @Request() req) {
    const userId = req.user._id;
    return this.jobsService.findNearby(query, userId);
  }

  @Get('recommendations')
  async getRecommendedJobs(@Request() req) {
    const userId = req.user._id;
    return this.jobsService.getRecommendedJobsForUser(userId);
  }
}
