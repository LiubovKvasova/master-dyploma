import { Injectable } from '@nestjs/common';
import { filterOutKeys } from 'src/utils';

@Injectable()
export class AuthService {
  login(req: any): any {
    const unwantedKeys = ['_id', '__v', 'hash', 'salt'];
    const user = filterOutKeys(req?.user?._doc, unwantedKeys);
    const expires = req.session.cookie.expires;

    return { user, expires };
  }

  async logout(req: any): Promise<{ message: string }> {
    return new Promise((resolve, reject) => {
      req.logout((err: any) => {
        if (err) {
          return reject(err);
        }

        req.session.destroy((err: any) => {
          if (err) {
            return reject(err);
          }

          resolve({ message: 'Logged out successfully' });
        });
      });
    });
  }
}
