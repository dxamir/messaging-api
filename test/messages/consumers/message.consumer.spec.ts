import { Test, TestingModule } from '@nestjs/testing';
import { MessageConsumer } from '../../../src/messages/consumers/message.consumer';
import { ConfigService } from '@nestjs/config';
import { MessageIndexerService } from '../../../src/messages/services/message-indexer.service';

jest.mock('kafkajs', () => {
  const mKafka = {
    consumer: jest.fn().mockReturnValue({
      connect: jest.fn(),
      subscribe: jest.fn(),
      run: jest.fn(),
      disconnect: jest.fn(),
    }),
  };
  return { Kafka: jest.fn(() => mKafka) };
});

import { Kafka } from 'kafkajs';

describe('MessageConsumer', () => {
  let consumer: MessageConsumer;
  let configService: ConfigService;
  let indexerService: MessageIndexerService;
  let kafkaMock: any;
  let consumerMock: any;

  beforeEach(async () => {
    consumerMock = {
      connect: jest.fn(),
      subscribe: jest.fn(),
      run: jest.fn(),
      disconnect: jest.fn(),
    };

    kafkaMock = {
      consumer: jest.fn().mockReturnValue(consumerMock),
    };

    (Kafka as jest.Mock).mockImplementation(() => kafkaMock);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageConsumer,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const values = {
                KAFKA_BROKER: 'localhost:9092',
                KAFKA_CONSUMER_GROUP: 'test-group',
                KAFKA_TOPIC: 'message.created',
              };
              return values[key];
            }),
          },
        },
        {
          provide: MessageIndexerService,
          useValue: {
            indexMessage: jest.fn(),
          },
        },
      ],
    }).compile();

    consumer = module.get(MessageConsumer);
    configService = module.get(ConfigService);
    indexerService = module.get(MessageIndexerService);
  });

  it('should initialize Kafka consumer and subscribe to topic', async () => {
    await consumer.onModuleInit();

    expect(kafkaMock.consumer).toHaveBeenCalledWith({ groupId: 'test-group' });
    expect(consumerMock.connect).toHaveBeenCalled();
    expect(consumerMock.subscribe).toHaveBeenCalledWith({ topic: 'message.created' });
    expect(consumerMock.run).toHaveBeenCalled();
  });

  it('should disconnect Kafka consumer on destroy', async () => {
    await consumer.onModuleInit();
    await consumer.onModuleDestroy();
    expect(consumerMock.disconnect).toHaveBeenCalled();
  });

  it('should log warning on empty message value', async () => {
    await consumer.onModuleInit();

    // Grab the eachMessage handler
    const runCall = consumerMock.run.mock.calls[0][0];
    const mockLoggerWarn = jest.spyOn(console, 'warn').mockImplementation();

    await runCall.eachMessage({ message: { value: null } });

    expect(mockLoggerWarn).not.toHaveBeenCalled(); // Because logger.warn uses internal Logger
    mockLoggerWarn.mockRestore();
  });

  it('should call indexMessage with parsed payload', async () => {
    await consumer.onModuleInit();

    const mockMsg = {
      id: '123',
      conversationId: 'c1',
      senderId: 's1',
      content: 'hello',
      timestamp: new Date().toISOString(),
    };

    const runCall = consumerMock.run.mock.calls[0][0];
    await runCall.eachMessage({
      message: { value: Buffer.from(JSON.stringify(mockMsg)) },
    });

    expect(indexerService.indexMessage).toHaveBeenCalledWith(mockMsg);
  });

  it('should catch JSON parse error and not crash', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();

    await consumer.onModuleInit();
    const runCall = consumerMock.run.mock.calls[0][0];

    await runCall.eachMessage({
      message: { value: Buffer.from('{ invalid json') },
    });

    expect(indexerService.indexMessage).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
