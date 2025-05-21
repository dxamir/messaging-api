import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MessagesModule } from '../src/messages/messages.module';
import { getModelToken } from '@nestjs/mongoose';
import { Message } from '../src/messages/schemas/message.schema';

describe('AppModule', () => {
  let appModule: TestingModule;

  beforeAll(async () => {
    appModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ConfigService)
      .useValue({
        get: jest.fn((key: string) => {
          if (key === 'MONGO_URI') return 'mongodb://localhost:27017/test-db';
          return null;
        }),
      })
      .overrideProvider(getModelToken(Message.name))
      .useValue({
        find: jest.fn(),
        create: jest.fn(),
      })
      .compile();
  });

  it('should compile the AppModule', () => {
    expect(appModule).toBeDefined();
  });

  it('should resolve ConfigService', () => {
    const config = appModule.get<ConfigService>(ConfigService);
    expect(config).toBeDefined();
  });
});
