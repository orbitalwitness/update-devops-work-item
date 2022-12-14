import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: console,
  });

  const config = new DocumentBuilder()
    .setTitle('Azure DevOps API Test Harness')
    .setDescription('Connects to the Azure DevOps API.')
    .setVersion('1.0')
    .addTag('devops')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}

bootstrap();
