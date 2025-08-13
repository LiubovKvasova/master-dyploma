import { Controller, Post, UseGuards, Request, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  login(@Request() req) {
    return this.authService.login(req);
  }

  @Get('auth/logout')
  logout(@Request() req) {
    return this.authService.logout(req);
  }

  @UseGuards(LocalAuthGuard)
  @Get('user/info')
  getUserInfo(@Request() req) {
    return { user: req.user };
  }
}
