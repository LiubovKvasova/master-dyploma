import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PassportLocalModel } from 'mongoose';

import { CreateUserDto } from 'src/dto/create-user.dto';
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
  ) {}

  async register(createUserDto: CreateUserDto) {
    const { email, username, password, role } = createUserDto;
    const user = new this.userModel({ email, username });
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

  async updatePassword(userId: string, dto: UpdatePasswordDto) {
    const user: any | null = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
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

  async showInfo(userId: string) {
    return this.userModel
      .findById(userId)
      .select('username email rating role')
      .exec();
  }
}
