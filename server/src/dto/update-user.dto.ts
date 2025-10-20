import {
  IsOptional,
  IsString,
  IsEmail,
  IsPhoneNumber,
  IsArray,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsPhoneNumber('UA')
  phone?: string;

  @IsOptional()
  @IsString()
  fullname?: string;

  @IsArray()
  @IsString({ each: true })
  preferenceOrder: string[];
}
