import { Module } from '@nestjs/common';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'src/schemas/user.schema';
import { ApplicationSchema } from 'src/schemas/application.schema';
import { ReviewSchema } from 'src/schemas/review.schema';

@Module({
  controllers: [ReviewsController],
  providers: [ReviewsService],
  imports: [
    MongooseModule.forFeature([
      { name: 'Application', schema: ApplicationSchema },
      { name: 'Review', schema: ReviewSchema },
      { name: 'User', schema: UserSchema },
    ]),
  ],
})
export class ReviewsModule {}
