import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { JobSchema } from 'src/schemas/job.schema';
import { UserSchema } from 'src/schemas/user.schema';
import { ApplicationSchema } from 'src/schemas/application.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Job', schema: JobSchema },
      { name: 'User', schema: UserSchema },
      { name: 'Application', schema: ApplicationSchema },
    ]),
  ],
  providers: [JobsService],
  controllers: [JobsController],
})
export class JobsModule {}
