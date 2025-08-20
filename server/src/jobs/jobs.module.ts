import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
// import { UserSchema } from 'src/schemas/user.schema';
import { JobSchema } from 'src/schemas/job.schema';

@Module({
  imports: [
    // MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    MongooseModule.forFeature([{ name: 'Job', schema: JobSchema }]),
  ],
  providers: [JobsService],
  controllers: [JobsController],
})
export class JobsModule {}
