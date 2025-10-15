import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsIn,
  MinLength,
  IsPhoneNumber,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  username: string;

  @MinLength(8)
  password: string;

  @IsPhoneNumber('UA')
  phone: string;

  @IsNotEmpty()
  fullname: string;

  @IsOptional()
  @IsIn(['worker', 'employer'])
  role?: 'worker' | 'employer';
}
