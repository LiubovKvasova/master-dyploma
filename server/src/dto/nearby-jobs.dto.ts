import { IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class NearbyJobsDto {
  @Type(() => Number)
  @IsNumber()
  lng: number;

  @Type(() => Number)
  @IsNumber()
  lat: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  maxDistance?: number = 2000;
}
