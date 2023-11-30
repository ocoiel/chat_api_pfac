import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
// import {
//   FastifyAdapter,
//   NestFastifyApplication,
// } from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  // Esta acontecendo um erro no middleware do Fastify. Quando o habilito, as requisicoes nao sao processadas. Quando volto pro express, da tudo certo, verificar isso...
  // const app = await NestFactory.create<NestFastifyApplication>(
  //   AppModule,
  //   new FastifyAdapter(),
  // );

  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('API Chat - PFAC')
    .setDescription('Desafio Play For A Cause - NestJS')
    .setVersion('1.0')
    .addTag('chat')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(3333);
}
bootstrap();
