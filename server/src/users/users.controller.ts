import {
  Controller,
  Post,
  Put,
  Request,
  Body,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from 'src/dto/create-user.dto';
import { UpdateLocationDto } from 'src/dto/update-location.dto';
import { UpdatePasswordDto } from 'src/dto/update-password.dto';
import { UpdateRoleDto } from 'src/dto/update-role.dto';
import { UpdateUserDto } from 'src/dto/update-user.dto';
import { AuthenticatedGuard } from 'src/auth/auth.guard';

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

  @UseGuards(AuthenticatedGuard)
  @Put('update')
  updateProfile(@Request() req, @Body() dto: UpdateUserDto) {
    return this.usersService.updateProfile(req.user._id, dto);
  }

  @UseGuards(AuthenticatedGuard)
  @Put('update/password')
  updatePassword(@Request() req, @Body() dto: UpdatePasswordDto) {
    return this.usersService.updatePassword(req.user._id, dto);
  }

  @UseGuards(AuthenticatedGuard)
  @Put('update/role')
  updateRole(@Request() req, @Body() dto: UpdateRoleDto) {
    return this.usersService.updateRole(req.user._id, dto);
  }

  @UseGuards(AuthenticatedGuard)
  @Put('update/location')
  updateLocation(@Request() req, @Body() dto: UpdateLocationDto) {
    return this.usersService.updateLocation(req.user._id, dto);
  }
}
