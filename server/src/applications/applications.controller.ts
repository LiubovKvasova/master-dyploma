import {
  Controller,
  Post,
  Patch,
  Get,
  Param,
  Body,
  Req,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';

@Controller('applications')
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

  @Patch('close/:applicationId')
  close(@Param('applicationId') id: string, @Req() req) {
    return this.service.closeApplication(id, req.user.id);
  }

  @Patch('reopen/:applicationId')
  reopen(@Param('applicationId') id: string, @Req() req) {
    return this.service.reopenApplication(id, req.user.id);
  }
}
