import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string) {
    const { user, error } = await new Promise<{ error?: any; user?: any }>(
      (resolve) => {
        User.authenticate()(email, password, (err, user) => {
          if (err) {
            resolve({ error: err });
          } else {
            resolve({ user });
          }
        });
      },
    );

    if (!user || error) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }
}
