import { Test, TestingModule } from '@nestjs/testing';
import { MessagesModule } from '../../src/messages/messages.module';
import { MessageService } from '../../src/messages/services/message.service';
import { SearchService } from '../../src/messages/services/search.service';
import { MessageRepository } from '../../src/messages/repositories/message.repository';
import { MessageProducer } from '../../src/messages/producers/message.producer';
import { MessageConsumer } from '../../src/messages/consumers/message.consumer';
import { MessageIndexerService } from '../../src/messages/services/message-indexer.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ClientKafka } from '@nestjs/microservices';
import { Message } from '../../src/messages/schemas/message.schema';

describe('MessagesModule (with mocks)', () => {
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MessagesModule,
      ],
    })
      .overrideProvider(ConfigService)
      .useValue({
        get: jest.fn((key: string) => {
          if (key === 'ELASTICSEARCH_NODE') return 'http://localhost:9200';
          return 'mock-value';
        }),
      })
      .overrideProvider(getModelToken(Message.name))
      .useValue({
        create: jest.fn(),
        find: jest.fn(),
        findOne: jest.fn(),
        save: jest.fn(),
        updateOne: jest.fn(),
      })
      .overrideProvider(ClientKafka)
      .useValue({
        emit: jest.fn(),
        connect: jest.fn(),
        send: jest.fn(),
        subscribeToResponseOf: jest.fn(),
      })
      .overrideProvider(ElasticsearchService)
      .useValue({
        index: jest.fn(),
        search: jest.fn(),
        delete: jest.fn(),
      })
      .compile();
  });

  it('should compile the module', () => {
    expect(module).toBeDefined();
  });

  it('should resolve MessageService', () => {
    const service = module.get<MessageService>(MessageService);
    expect(service).toBeDefined();
  });

  it('should resolve SearchService', () => {
    const service = module.get<SearchService>(SearchService);
    expect(service).toBeDefined();
  });

  it('should resolve MessageProducer', () => {
    const producer = module.get<MessageProducer>(MessageProducer);
    expect(producer).toBeDefined();
  });

  it('should resolve MessageRepository', () => {
    const repo = module.get<MessageRepository>(MessageRepository);
    expect(repo).toBeDefined();
  });

  it('should resolve MessageConsumer', () => {
    const consumer = module.get<MessageConsumer>(MessageConsumer);
    expect(consumer).toBeDefined();
  });

  it('should resolve MessageIndexerService', () => {
    const indexer = module.get<MessageIndexerService>(MessageIndexerService);
    expect(indexer).toBeDefined();
  });
});
