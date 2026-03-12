import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Express } from 'express';

let cachedApp: Express;

async function bootstrap(): Promise<Express> {
  if (cachedApp) return cachedApp;

  const expressApp = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  await app.init();
  cachedApp = expressApp;
  return cachedApp;
}

export default async function handler(req: any, res: any) {
  const app = await bootstrap();
  app(req, res);
}
