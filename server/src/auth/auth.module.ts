import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './local.strategy';
import { SessionSerializer } from './session.serializer';
import { UserSchema } from 'src/schemas/user.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'User', schema: UserSchema }])],
  providers: [AuthService, LocalStrategy, SessionSerializer],
  controllers: [AuthController],
})
export class AuthModule {}
