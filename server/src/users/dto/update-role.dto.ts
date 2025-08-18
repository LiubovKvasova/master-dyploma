import { IsIn } from 'class-validator';

export class UpdateRoleDto {
  @IsIn(['worker', 'employer'])
  role: 'worker' | 'employer';
}
