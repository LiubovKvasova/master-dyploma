import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ApplicationDocument } from 'src/schemas/application.schema';
import { JobDocument } from 'src/schemas/job.schema';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectModel('Application')
    private applicationModel: Model<ApplicationDocument>,
    @InjectModel('Job') private jobModel: Model<JobDocument>,
  ) {}

  async create(workerId: string, jobId: string) {
    const job = await this.jobModel.findById(jobId);

    if (!job) {
      throw new NotFoundException('Job was not found');
    }

    if (job.status !== 'active') {
      throw new BadRequestException('You cannot apply for this job anymore');
    }

    const existing = await this.applicationModel.findOne({ jobId, workerId });

    if (existing) {
      throw new BadRequestException('You have already applied for this job');
    }

    const application = new this.applicationModel({
      jobId,
      workerId,
      employerId: job.owner,
    });

    return application.save();
  }

  async initChat(applicationId: string, employerId: string) {
    const application = await this.applicationModel
      .findById(applicationId)
      .populate('workerId', 'username email')
      .populate('employerId', 'username email');

    if (!application) {
      throw new NotFoundException('The application was not found');
    }

    if (String(application.employerId._id) !== employerId) {
      throw new ForbiddenException('You have no rights to initialize the chat');
    }

    return application;
  }

  async addMessage(applicationId: string, senderId: string, content: string) {
    const application = await this.applicationModel.findById(applicationId);
    if (!application) {
      throw new NotFoundException('The application was not found');
    }

    const isParticipant =
      String(application.workerId) === senderId ||
      String(application.employerId) === senderId;

    if (!isParticipant) {
      throw new ForbiddenException('You are not a member of the chat');
    }

    application.messages.push({ sender: senderId, content });
    await application.save();

    return application.messages.at(-1);
  }

  async getMessages(applicationId: string, userId: string) {
    const application = await this.applicationModel
      .findById(applicationId)
      .populate('messages.sender', 'username email');

    if (!application) {
      throw new NotFoundException('The application was not found');
    }

    const isParticipant =
      String(application.workerId) === userId ||
      String(application.employerId) === userId;

    if (!isParticipant) {
      throw new ForbiddenException('You have to access to the chat');
    }

    return application.messages;
  }

  async agree(applicationId: string, userId: string) {
    const application = await this.applicationModel.findById(applicationId);
    if (!application)
      throw new NotFoundException('The application was not found');

    let changed = false;

    if (String(application.workerId) === userId) {
      application.workerAgreed = true;
      changed = true;
    }

    if (String(application.employerId) === userId) {
      application.employerAgreed = true;
      changed = true;
    }

    if (!changed)
      throw new ForbiddenException(
        'You have no rights to agree for this job',
      );

    if (application.workerAgreed && application.employerAgreed) {
      application.status = 'in_progress';
      await this.jobModel.findByIdAndUpdate(application.jobId, {
        status: 'in_progress',
        selectedWorker: application.workerId,
      });
    }

    await application.save();
    return application;
  }

  async closeApplication(applicationId: string, employerId: string) {
    const application = await this.applicationModel.findById(applicationId);
    if (!application) {
      throw new NotFoundException('The application was not found');
    }

    if (String(application.employerId) !== employerId) {
      throw new ForbiddenException('You cannot close this application');
    }

    application.status = 'closed';
    await application.save();

    await this.jobModel.findByIdAndUpdate(application.jobId, {
      status: 'closed',
    });

    return application;
  }

  async reopenApplication(applicationId: string, employerId: string) {
    const application = await this.applicationModel.findById(applicationId);
    if (!application) {
      throw new NotFoundException('The application was not found');
    }

    if (String(application.employerId) !== employerId) {
      throw new ForbiddenException('Ви не можете перевідкрити цю заявку');
    }

    application.status = 'active';
    application.workerAgreed = false;
    application.employerAgreed = false;
    await application.save();

    await this.jobModel.findByIdAndUpdate(application.jobId, {
      status: 'active',
      selectedWorker: null,
    });

    return application;
  }
}
