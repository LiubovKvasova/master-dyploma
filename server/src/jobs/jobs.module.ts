import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { JobSchema } from 'src/schemas/job.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Job', schema: JobSchema }])],
  providers: [JobsService],
  controllers: [JobsController],
})
export class JobsModule {}
