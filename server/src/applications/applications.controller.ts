import {
  Controller,
  Post,
  Patch,
  Get,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';

import { ApplicationsService } from './applications.service';
import { AuthenticatedGuard } from 'src/auth/auth.guard';

@Controller('applications')
@UseGuards(AuthenticatedGuard)
export class ApplicationsController {
  constructor(private readonly service: ApplicationsService) {}

  @Post()
  create(@Body() body: { jobId: string }, @Req() req) {
    return this.service.create(req.user.id, body.jobId);
  }

  @Get()
  getApplications(@Req() req) {
    const userId = req.user.id;
    const role = req.user.role;

    if (role === 'employer') {
      return this.service.getEmployerApplications(userId);
    }

    return this.service.getApplications(userId);
  }

  @Post('messages/:applicationId')
  addMessage(
    @Param('applicationId') id: string,
    @Req() req,
    @Body('content') content: string,
  ) {
    return this.service.addMessage(id, req.user.id, content);
  }

  @Get('messages/:applicationId')
  getMessages(@Param('applicationId') id: string, @Req() req) {
    return this.service.getMessages(id, req.user.id);
  }

  @Patch('agree/:applicationId')
  agree(@Param('applicationId') id: string, @Req() req) {
    return this.service.agree(id, req.user.id);
  }
}
