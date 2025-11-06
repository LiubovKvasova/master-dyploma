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
  UseInterceptors,
  BadRequestException,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'node:path';

import { JobsService } from './jobs.service';
import { AuthenticatedGuard } from 'src/auth/auth.guard';
import { CreateJobDto } from 'src/dto/create-job.dto';
import { NearbyJobsDto } from 'src/dto/nearby-jobs.dto';
import { ParseJsonPipe } from 'src/pipes';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';

@Controller('jobs')
@UseGuards(AuthenticatedGuard)
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post('create')
  @UseInterceptors(
    FilesInterceptor('images', 5, {
      storage: diskStorage({
        destination: './uploads/jobs',
        filename: (req, file, callback) => {
          const randomInt = Math.round(Math.random() * 1e6);
          const filePrefix = `${Date.now()}-${randomInt}`;
          const extension = extname(file.originalname);

          callback(null, `${filePrefix}${extension}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          const error = new BadRequestException(
            'These extensions are allowed: jpg, jpeg, png, webp',
          );
          return callback(error, false);
        }

        callback(null, true);
      },
    }),
  )
  async create(
    @UploadedFiles() images: Express.Multer.File[],
    @Body('data', ParseJsonPipe) data: any,
    @Request() req,
  ) {
    const dto = plainToInstance(CreateJobDto, data);
    await validateOrReject(dto);

    const imagePaths = images?.map((file) => `/uploads/jobs/${file.filename}`);

    if (imagePaths?.length > 0) {
      dto.images = imagePaths;
    }

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
