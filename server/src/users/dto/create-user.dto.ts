import { IsEmail, IsNotEmpty, IsOptional, IsIn, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  username: string;

  @MinLength(8)
  password: string;

  @IsOptional()
  @IsIn(['worker', 'employer'])
  role?: 'worker' | 'employer';
}
