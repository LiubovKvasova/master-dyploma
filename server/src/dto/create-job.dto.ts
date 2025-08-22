import {
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  IsOptional,
  IsNumber,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import { AddressDto } from './address.dto';

export class CreateJobDto {
  @IsString()
  title: string;

  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  coordinates: number[];

  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @IsObject()
  duration: {
    representation: string; // "3 години"
    value: number; // у секундах
  };

  @IsNumber()
  hourRate: number;
}
