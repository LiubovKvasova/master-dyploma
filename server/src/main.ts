import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as session from 'express-session';
import * as passport from 'passport';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const ONE_HOUR = 1000 * 60 * 60;

  app.enableCors({
    origin: [
      'http://127.0.0.1:5050/',
      'http://localhost:5050/',
      'http://127.0.0.1:5050',
      'http://localhost:5050',
    ],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    credentials: true,
  });

  app.use(
    session({
      secret: process.env.SESSION_SECRET ?? 'secret_key_example',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: ONE_HOUR * 3,
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
      },
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
