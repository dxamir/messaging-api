import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

export async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS 
  app.enableCors();

  // Use global validation pipe for DTO validation

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));


  // Setup Swagger
  const config = new DocumentBuilder()
    .setTitle('Messaging API')
    .setDescription('API for creating and retrieving messages')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
// Only run if executed directly (not when imported in test)
if (require.main === module) {
  bootstrap();
}