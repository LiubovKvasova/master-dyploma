import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  targetId: string;

  @IsNumber()
  rating: number;

  @IsString()
  @IsOptional()
  comment?: string;
}
