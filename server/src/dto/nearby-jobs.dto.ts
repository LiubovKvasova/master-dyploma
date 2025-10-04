import { IsArray, IsNumber, IsOptional, IsString, IsIn } from 'class-validator';
import { Type, Transform } from 'class-transformer';

type JobDuration = 'day' | 'week' | 'weeks';

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

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) {
      return undefined;
    }

    return Array.isArray(value) ? value : [value];
  })
  @IsArray()
  @IsString({ each: true })
  category?: string[];

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) {
      return undefined;
    }

    return Array.isArray(value) ? value : [value];
  })
  @IsArray()
  @IsIn(['day', 'week', 'weeks'], { each: true })
  duration?: JobDuration[];
}
