import {
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  IsNumberString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AddressDto {
  @IsOptional()
  @IsString()
  amenity?: string;

  @IsOptional()
  @IsString()
  building?: string;

  @IsOptional()
  @IsString()
  house_number?: string;

  @IsOptional()
  @IsString()
  road?: string;

  @IsOptional()
  @IsString()
  neighbourhood?: string;

  @IsOptional()
  @IsString()
  suburb?: string;

  @IsOptional()
  @IsString()
  borough?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  municipality?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsNumberString()
  postcode?: string;
}

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
