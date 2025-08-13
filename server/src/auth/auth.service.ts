import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  login(req: any) {
    return { message: 'Logged in successfully', user: req.user };
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
