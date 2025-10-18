import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';

import { ReviewsService } from './reviews.service';
import { AuthenticatedGuard } from 'src/auth/auth.guard';
import { CreateReviewDto } from 'src/dto/create-review.dto';

@Controller('reviews')
@UseGuards(AuthenticatedGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post(':applicationId/:targetId')
  async createReview(@Body() dto: CreateReviewDto, @Req() req: any) {
    return this.reviewsService.createReview(req.user.id, dto);
  }

  @Get('people-to-review')
  async getPeopleToReview(@Req() req: any) {
    return this.reviewsService.getPeopleToReview(req.user.id);
  }

  @Get('received')
  async getReceived(@Req() req: any) {
    return this.reviewsService.getReceivedReviews(req.user.id);
  }

  @Get('given')
  async getGiven(@Req() req: any) {
    return this.reviewsService.getGivenReviews(req.user.id);
  }
}
