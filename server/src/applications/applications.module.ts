import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { ApplicationSchema } from 'src/schemas/application.schema';
import { JobSchema } from 'src/schemas/job.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Application', schema: ApplicationSchema },
      { name: 'Job', schema: JobSchema },
    ]),
  ],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
})
export class ApplicationsModule {}
