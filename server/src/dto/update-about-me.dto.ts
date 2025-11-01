import { IsString, MaxLength } from 'class-validator';

export class UpdateAboutMeDto {
  @IsString()
  @MaxLength(10000, { message: 'This field cannot exceed 10000 characters' })
  aboutMe: string;
}
