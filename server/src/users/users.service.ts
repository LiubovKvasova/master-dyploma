import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PassportLocalModel, Types } from 'mongoose';
import * as sanitizeHtml from 'sanitize-html';

import { CreateUserDto } from 'src/dto/create-user.dto';
import { OnboardingDto } from 'src/dto/onboarding.dto';
import { UpdateAboutMeDto } from 'src/dto/update-about-me.dto';
import { UpdateLocationDto } from 'src/dto/update-location.dto';
import { UpdatePasswordDto } from 'src/dto/update-password.dto';
import { UpdateRoleDto } from 'src/dto/update-role.dto';
import { UpdateUserDto } from 'src/dto/update-user.dto';
import { UserDocument } from 'src/schemas/user.schema';
import { filterOutKeys } from 'src/utils';

const unwantedKeys = ['_id', '__v', 'hash', 'salt'];

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User') private userModel: PassportLocalModel<UserDocument>,
  ) { }

  async register(createUserDto: CreateUserDto) {
    const { email, username, password, phone, fullname, role } = createUserDto;
    const user = new this.userModel({ email, username, phone, fullname });
    await this.userModel.register(user, password);

    if (role) {
      await user.updateOne({ role }, { new: true });
    }

    return user;
  }

  async updateProfile(userId: string, dto: UpdateUserDto) {
    const user = await this.userModel.findByIdAndUpdate(userId, dto, {
      new: true,
    });

    if (user) {
      const object = user.toObject();
      return filterOutKeys(object, unwantedKeys);
    }

    return user;
  }

  async updateAboutMe(userId: string, dto: UpdateAboutMeDto) {
    const sanitizedInfo = sanitizeHtml(dto.aboutMe, {
      allowedTags: [
        'p', 'h1', 'h2', 'ul', 'ol', 'li', 'strong', 'em', 'u', 's',
        'blockquote', 'code', 'pre', 'br', 'span',
      ],
      allowedAttributes: {
        li: ['class', 'data-list'],
        span: ['class', 'contenteditable'],
      },
      allowedSchemes: ['http', 'https', 'mailto', 'data'],
    });

    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { aboutMe: sanitizedInfo },
      { new: true },
    );

    if (user) {
      const object = user.toObject();
      return filterOutKeys(object, unwantedKeys);
    }

    return user;
  }

  async updatePassword(userId: string, dto: UpdatePasswordDto) {
    const user: any | null = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('The user was not found');
    }

    return new Promise((resolve, reject) => {
      user.changePassword(dto.oldPassword, dto.newPassword, async (err) => {
        if (err) {
          return reject(new BadRequestException(err.message));
        }

        await user.save();
        resolve({ message: 'Password updated successfully' });
      });
    });
  }

  async updateRole(userId: string, dto: UpdateRoleDto) {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { role: dto.role },
      { new: true },
    );

    if (user) {
      const object = user.toObject();
      return filterOutKeys(object, unwantedKeys);
    }

    return user;
  }

  async updateLocation(userId: string, dto: UpdateLocationDto) {
    const { coordinates, address } = dto;
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { location: { type: 'Point', coordinates }, address },
      { new: true },
    );

    if (user) {
      const object = user.toObject();
      return filterOutKeys(object, unwantedKeys);
    }

    return user;
  }

  async showInfo(viewerId: string, targetUserId: string) {
    const [userData] = await this.userModel.aggregate([
      {
        $match: { _id: new Types.ObjectId(targetUserId) },
      },
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'targetId',
          as: 'reviews',
          pipeline: [
            { $match: { comment: { $exists: true, $ne: '' } } },
            {
              $lookup: {
                from: 'users',
                localField: 'authorId',
                foreignField: '_id',
                as: 'author',
                pipeline: [
                  { $project: { username: 1, fullname: 1, rating: 1 } },
                ],
              },
            },
            {
              $unwind: {
                path: '$author',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                _id: 1,
                rating: 1,
                comment: 1,
                createdAt: 1,
                author: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: 'jobs',
          let: { userId: '$_id', role: '$role' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$$role', 'employer'] },
                    { $eq: ['$owner', '$$userId'] },
                    { $eq: ['$status', 'active'] },
                  ],
                },
              },
            },
            {
              // Пошук заявок, які залишав viewerId (робітник)
              $lookup: {
                from: 'applications',
                let: { jobId: '$_id' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ['$jobId', '$$jobId'] },
                          { $eq: ['$workerId', new Types.ObjectId(viewerId)] },
                          { $eq: ['$employerId', new Types.ObjectId(targetUserId)] },
                        ],
                      },
                    },
                  },
                ],
                as: 'viewerApplications',
              },
            },
            {
              $addFields: {
                hasApplied: { $gt: [{ $size: '$viewerApplications' }, 0] },
              },
            },
            {
              $project: {
                _id: 1,
                title: 1,
                description: 1,
                category: 1,
                hourRate: 1,
                status: 1,
                address: 1,
                createdAt: 1,
                hasApplied: 1,
              },
            },
          ],
          as: 'activeJobs',
        },
      },
      {
        $project: {
          username: 1,
          email: 1,
          phone: 1,
          fullname: 1,
          role: 1,
          rating: 1,
          ratingCount: 1,
          reviews: 1,
          activeJobs: 1,
          aboutMe: 1,
        },
      },
    ]);

    return userData;
  }

  async onboardUser(userId: string, dto: OnboardingDto) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('The user was not found');
    }

    if (dto.interestedCategories) {
      user.interestedCategories = dto.interestedCategories;
    }

    if (dto.coordinates) {
      user.location = {
        type: 'Point',
        coordinates: dto.coordinates,
      };
    }

    if (dto.address) {
      user.address = dto.address;
    }

    if (dto.preferenceOrder) {
      user.preferenceOrder = dto.preferenceOrder;
    }

    if (dto.introduced !== undefined) {
      user.introduced = dto.introduced;
    }

    await user.save();
    const object = user.toObject();
    return filterOutKeys(object, unwantedKeys);
  }
}
