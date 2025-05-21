import { Test, TestingModule } from '@nestjs/testing';
import { MessageProducer } from '../../../src/messages/producers/message.producer';
import { ClientKafka } from '@nestjs/microservices';
import { Message } from '../../../src/messages/schemas/message.schema';

describe('MessageProducer', () => {
  let producer: MessageProducer;
  let kafkaMock: Partial<ClientKafka>;

  beforeEach(async () => {
    kafkaMock = {
      connect: jest.fn().mockResolvedValue(undefined),
      emit: jest.fn().mockReturnValue({
        toPromise: () => Promise.resolve(),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageProducer,
        { provide: 'KAFKA_SERVICE', useValue: kafkaMock },
      ],
    }).compile();

    producer = module.get<MessageProducer>(MessageProducer);
  });

  it('should call kafka.connect on module init', async () => {
    await producer.onModuleInit();
    expect(kafkaMock.connect).toHaveBeenCalled();
  });

  it('should emit message to Kafka', async () => {
    const mockMessage: Message = {
      id: 'msg-1',
      conversationId: 'conv-1',
      senderId: 'user-1',
      content: 'Hello Kafka!',
      timestamp: new Date().toISOString(),
      metadata: { test: true },
    };

    await producer.publish(mockMessage);

    expect(kafkaMock.emit).toHaveBeenCalledWith('message.created', {
      id: mockMessage.id,
      conversationId: mockMessage.conversationId,
      senderId: mockMessage.senderId,
      content: mockMessage.content,
      timestamp: mockMessage.timestamp,
      metadata: mockMessage.metadata,
    });
  });

  it('should default metadata to empty object if undefined', async () => {
    const mockMessage = {
      id: 'msg-2',
      conversationId: 'conv-2',
      senderId: 'user-2',
      content: 'Hello',
      timestamp: new Date().toISOString(),
      metadata: undefined,
    } as Message;

    await producer.publish(mockMessage);

    expect(kafkaMock.emit).toHaveBeenCalledWith('message.created', expect.objectContaining({
      metadata: {},
    }));
  });
});
