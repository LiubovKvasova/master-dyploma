import { Controller, Post, UseGuards, Request, Get } from '@nestjs/common';

import { AuthService } from './auth.service';
import { AuthenticatedGuard, LocalAuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Request() req) {
    return req.user;
  }

  @UseGuards(AuthenticatedGuard)
  @Get('logout')
  logout(@Request() req) {
    return this.authService.logout(req);
  }

  @UseGuards(AuthenticatedGuard)
  @Get('user/info')
  getUserInfo(@Request() req) {
    return { user: req.user };
  }
}
