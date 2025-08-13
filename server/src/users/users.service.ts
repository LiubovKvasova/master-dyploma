import { Injectable } from '@nestjs/common';
import { User } from 'src/schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  async register(createUserDto: CreateUserDto) {
    const { email, username, password } = createUserDto;
    const user = new User({ email, username });
    return User.register(user, password);
  }

  async findByEmail(email: string) {
    return User.findOne({ email });
  }
}
