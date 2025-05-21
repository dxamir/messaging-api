import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { MessageRepository } from '../../../src/messages/repositories/message.repository';
import { Message } from '../../../src/messages/schemas/message.schema';

describe('MessageRepository', () => {
  let repository: MessageRepository;
  let messageModel: any;

  const mockMessage = {
    _id: 'mock-id',
    conversationId: 'conv1',
    senderId: 'user1',
    content: 'Hello world',
    timestamp: new Date(),
  };

  const saveMock = jest.fn().mockResolvedValue(mockMessage);

  // Constructor mock
  const messageModelConstructorMock = jest.fn().mockImplementation((data) => ({
    ...data,
    save: saveMock,
  }));

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageRepository,
        {
          provide: getModelToken(Message.name),
          useValue: Object.assign(messageModelConstructorMock, {
            find: jest.fn(),
          }),
        },
      ],
    }).compile();

    repository = module.get<MessageRepository>(MessageRepository);
    messageModel = module.get(getModelToken(Message.name));
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('should save and return the new message', async () => {
      const input = {
        conversationId: 'conv1',
        senderId: 'user1',
        content: 'Hello world',
      };

      const result = await repository.create(input);

      expect(messageModelConstructorMock).toHaveBeenCalledWith(input);
      expect(saveMock).toHaveBeenCalled();
      expect(result).toEqual(mockMessage);
    });
  });

  describe('findByConversation', () => {
    it('should find messages by conversation ID', async () => {
      const mockMessages = [
        { id: '1', content: 'Message 1' },
        { id: '2', content: 'Message 2' },
      ];

      const sortMock = jest.fn().mockResolvedValue(mockMessages);
      messageModel.find.mockReturnValue({ sort: sortMock });

      const result = await repository.findByConversation('conv1');

      expect(messageModel.find).toHaveBeenCalledWith({ conversationId: 'conv1' });
      expect(result).toEqual(mockMessages);
    });
  });
});
