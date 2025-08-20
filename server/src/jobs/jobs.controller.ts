import {
  Controller,
  UseGuards,
  Get,
  Post,
  Body,
  Request,
  Query,
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

  @Get('nearby')
  async nearby(@Query() query: NearbyJobsDto) {
    return this.jobsService.findNearby(query);
  }
}
