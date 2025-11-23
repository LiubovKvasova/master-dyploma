import { IsNumber, IsString } from 'class-validator';

export class UpdateReviewDto {
  @IsNumber()
  rating: number;

  @IsString()
  comment: string;
}
