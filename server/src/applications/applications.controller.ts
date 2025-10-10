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

  @Get(':applicationId/init-chat')
  initChat(@Param('applicationId') id: string, @Req() req) {
    return this.service.initChat(id, req.user.id);
  }

  @Post(':applicationId/messages')
  addMessage(
    @Param('applicationId') id: string,
    @Req() req,
    @Body('content') content: string,
  ) {
    return this.service.addMessage(id, req.user.id, content);
  }

  @Get(':applicationId/messages')
  getMessages(@Param('applicationId') id: string, @Req() req) {
    return this.service.getMessages(id, req.user.id);
  }

  @Patch(':applicationId/agree')
  agree(@Param('applicationId') id: string, @Req() req) {
    return this.service.agree(id, req.user.id);
  }

  @Patch(':applicationId/close')
  close(@Param('applicationId') id: string, @Req() req) {
    return this.service.closeApplication(id, req.user.id);
  }

  @Patch(':applicationId/reopen')
  reopen(@Param('applicationId') id: string, @Req() req) {
    return this.service.reopenApplication(id, req.user.id);
  }
}
