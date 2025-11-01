import {
  Controller,
  Get,
  Post,
  Put,
  Request,
  Body,
  BadRequestException,
  UseGuards,
  Param,
  NotFoundException,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { CreateUserDto } from 'src/dto/create-user.dto';
import { OnboardingDto } from 'src/dto/onboarding.dto';
import { UpdateLocationDto } from 'src/dto/update-location.dto';
import { UpdatePasswordDto } from 'src/dto/update-password.dto';
import { UpdateRoleDto } from 'src/dto/update-role.dto';
import { UpdateUserDto } from 'src/dto/update-user.dto';
import { AuthenticatedGuard } from 'src/auth/auth.guard';
import { UpdateAboutMeDto } from 'src/dto/update-about-me.dto';

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
  @Put('update/about-me')
  updateAboutMe(@Request() req, @Body() dto: UpdateAboutMeDto) {
    return this.usersService.updateAboutMe(req.user._id, dto);
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

  @UseGuards(AuthenticatedGuard)
  @Get(':userId')
  async showUserInfo(@Request() req, @Param('userId') userId: string) {
    const viewerId = req.user._id;
    const user = await this.usersService.showInfo(viewerId, userId);

    if (!user) {
      throw new NotFoundException('User was not found');
    }

    return user;
  }

  @UseGuards(AuthenticatedGuard)
  @Put('onboarding')
  async onboardUser(@Request() req, @Body() dto: OnboardingDto) {
    return this.usersService.onboardUser(req.user._id, dto);
  }
}
