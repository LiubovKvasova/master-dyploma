import { IsArray, ArrayMinSize, ArrayMaxSize, IsNumber } from 'class-validator';

export class UpdateLocationDto {
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsNumber({}, { each: true })
  coordinates: number[]; // [longitude, latitude]
}
