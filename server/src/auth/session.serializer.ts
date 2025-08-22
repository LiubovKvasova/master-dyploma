import { PassportSerializer } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PassportLocalModel } from 'mongoose';

import { UserDocument } from 'src/schemas/user.schema';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(
    @InjectModel('User') private userModel: PassportLocalModel<UserDocument>,
  ) {
    super();
  }

  serializeUser(user: any, done: Function) {
    done(null, user._id);
  }

  async deserializeUser(payload: string, done: Function) {
    const user = await this.userModel.findById(payload);
    done(null, user);
  }
}
