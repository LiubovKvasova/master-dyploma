import {
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import { AddressDto } from './address.dto';

export class UpdateLocationDto {
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsNumber({}, { each: true })
  coordinates: number[]; // [longitude, latitude]

  @ValidateNested()
  @Type(() => AddressDto)
  address: object;
}
