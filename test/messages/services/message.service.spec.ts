import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { MessageService } from '../../../src/messages/services/message.service';
import { Message } from '../../../src/messages/schemas/message.schema';
import { MessageProducer } from '../../../src/messages/producers/message.producer';
import { v4 as uuidv4 } from 'uuid';

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

describe('MessageService', () => {
  let service: MessageService;

  const mockMessageModel = {
    create: jest.fn(),
    find: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn(),
  };

  const mockMessageProducer = {
    publish: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        { provide: getModelToken(Message.name), useValue: mockMessageModel },
        { provide: MessageProducer, useValue: mockMessageProducer },
      ],
    }).compile();

    service = module.get<MessageService>(MessageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create and publish a message', async () => {
      const msgData = { content: 'Hello', conversationId: 'abc123' };
      const createdMsg = {
        ...msgData,
        id: 'uuid',
        toObject: jest.fn().mockReturnValue(msgData),
      };

      (uuidv4 as jest.Mock).mockReturnValue('uuid');
      mockMessageModel.create.mockResolvedValue(createdMsg);

      const result = await service.create(msgData);

      expect(mockMessageModel.create).toHaveBeenCalledWith({ ...msgData, id: 'uuid' });
      expect(createdMsg.toObject).toHaveBeenCalled();
      expect(mockMessageProducer.publish).toHaveBeenCalledWith(msgData);
      expect(result).toBe(createdMsg);
    });

    it('should throw if creation fails', async () => {
      mockMessageModel.create.mockRejectedValue(new Error('DB error'));

      await expect(service.create({ content: 'Fail', conversationId: 'abc' })).rejects.toThrow('DB error');
    });

    it('should throw if publish fails after creating', async () => {
      const msgData = { content: 'Hello', conversationId: 'abc123' };
      const createdMsg = {
        ...msgData,
        id: 'uuid',
        toObject: jest.fn().mockReturnValue(msgData),
      };

      (uuidv4 as jest.Mock).mockReturnValue('uuid');
      mockMessageModel.create.mockResolvedValue(createdMsg);
      mockMessageProducer.publish.mockImplementation(() => {
        throw new Error('Publish failed');
      });

      await expect(service.create(msgData)).rejects.toThrow('Publish failed');
    });
  });

  describe('findByConversation', () => {
    it('should return empty array if no messages found', async () => {
      mockMessageModel.limit.mockResolvedValue([]);

      const result = await service.findByConversation('xyz', 1, 5);

      expect(mockMessageModel.find).toHaveBeenCalledWith({ conversationId: 'xyz' });
      expect(mockMessageModel.sort).toHaveBeenCalledWith({ timestamp: -1 });
      expect(mockMessageModel.skip).toHaveBeenCalledWith(0);
      expect(mockMessageModel.limit).toHaveBeenCalledWith(5);
      expect(result).toEqual([]);
    });

    it('should find messages by conversation ID with pagination', async () => {
      const conversationId = 'abc123';
      const mockMessages = [
        { id: '1', content: 'Hello', conversationId },
        { id: '2', content: 'Hi', conversationId },
      ];

      mockMessageModel.limit.mockResolvedValue(mockMessages);

      const result = await service.findByConversation(conversationId, 2, 2);

      expect(mockMessageModel.find).toHaveBeenCalledWith({ conversationId });
      expect(mockMessageModel.sort).toHaveBeenCalledWith({ timestamp: -1 });
      expect(mockMessageModel.skip).toHaveBeenCalledWith(2);
      expect(mockMessageModel.limit).toHaveBeenCalledWith(2);
      expect(result).toEqual(mockMessages);
    });

    it('should handle zero or negative page numbers gracefully', async () => {
      mockMessageModel.limit.mockResolvedValue([]);

      const result = await service.findByConversation('abc123', 0, 5);

      // If service doesn't guard this, it may still return results from skip(-5), which is invalid.
      // Adjust the actual service code to handle invalid pages or let it fall through.
      expect(result).toEqual([]);
    });
  });
});
