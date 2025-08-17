import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.usersService.register(createUserDto);
      return { message: 'User registered successfully', user };
    } catch (error) {
      const errorMessage: string =
        (error as Error).message ?? 'Registration failed';
      throw new BadRequestException(errorMessage);
    }
  }
}
