import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PassportLocalModel } from 'mongoose';

import { CreateUserDto } from './dto/create-user.dto';
import { UserDocument } from './user.types';

@Injectable()
export class UsersService {
  constructor(@InjectModel('User') private userModel: PassportLocalModel<UserDocument>) {}

  async register(createUserDto: CreateUserDto) {
    const { email, username, password } = createUserDto;
    const user = new this.userModel({ email, username });
    return this.userModel.register(user, password);
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }
}
