import { promisify } from 'node:util';

import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PassportLocalModel } from 'mongoose';

import { UserDocument } from 'src/users/user.types';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectModel('User') private userModel: PassportLocalModel<UserDocument>,
  ) {
    super({ usernameField: 'username' });
  }

  async validate(login: string, password: string) {
    const authenticate = promisify(this.userModel.authenticate());
    const user = await authenticate(login, password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }
}
