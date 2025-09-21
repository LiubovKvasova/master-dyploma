import { IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class NearbyJobsDto {
  @Type(() => Number)
  @IsNumber()
  lng: string;

  @Type(() => Number)
  @IsNumber()
  lat: string;

  @Type(() => Number)
  @IsNumber()
  maxDistance: string;
}
