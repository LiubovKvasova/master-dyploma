import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
  Patch,
} from '@nestjs/common';

import { ReviewsService } from './reviews.service';
import { AuthenticatedGuard } from 'src/auth/auth.guard';
import { CreateReviewDto } from 'src/dto/create-review.dto';
import { UpdateReviewDto } from 'src/dto/update-review.dto';

@Controller('reviews')
@UseGuards(AuthenticatedGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  async createReview(@Body() dto: CreateReviewDto, @Req() req: any) {
    return this.reviewsService.createReview(req.user.id, dto);
  }

  @Get('people-to-review')
  async getPeopleToReview(@Req() req: any) {
    return this.reviewsService.getPeopleToReview(req.user.id);
  }

  @Patch('/:reviewId')
  async updateReview(
    @Param('reviewId') reviewId: string,
    @Body() dto: UpdateReviewDto,
    @Req() req: any,
  ) {
    return this.reviewsService.updateReview(req.user.id, reviewId, dto);
  }
}
