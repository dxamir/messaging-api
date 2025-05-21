import { Test, TestingModule } from '@nestjs/testing';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { MessageIndexerService } from '../../../src/messages/services/message-indexer.service';
import { Message } from '../../../src/messages/schemas/message.schema';

describe('MessageIndexerService', () => {
  let service: MessageIndexerService;
  let mockESService: { index: jest.Mock };

  beforeEach(async () => {
    mockESService = {
      index: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageIndexerService,
        { provide: ElasticsearchService, useValue: mockESService },
      ],
    }).compile();

    service = module.get<MessageIndexerService>(MessageIndexerService);
  });

  it('should index a valid message', async () => {
    const mockMessage: Message = {
      id: 'msg-1',
      conversationId: 'conv-1',
      content: 'Hello World!',
      timestamp: new Date().toISOString(),
      senderId: 'user-123',
    };

    mockESService.index.mockResolvedValue({ result: 'created' });

    await service.indexMessage(mockMessage);

    expect(mockESService.index).toHaveBeenCalledWith({
      index: 'messages',
      document: {
        id: 'msg-1',
        conversationId: 'conv-1',
        content: 'Hello World!',
        timestamp: mockMessage.timestamp,
        senderId: 'user-123',
      },
    });
  });

  it('should skip indexing if required fields are missing', async () => {
    const incompleteMessage: Partial<Message> = {
      id: 'msg-2',
      content: 'Missing fields',
    };

    const loggerSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    await service.indexMessage(incompleteMessage as Message);

    expect(mockESService.index).not.toHaveBeenCalled();
    loggerSpy.mockRestore();
  });

  it('should handle Elasticsearch errors gracefully', async () => {
    const message: Message = {
      id: 'msg-3',
      conversationId: 'conv-3',
      content: 'This will fail',
      timestamp: new Date().toISOString(),
      senderId: 'user-789',
    };

    mockESService.index.mockRejectedValue(new Error('ES error'));

    const loggerSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await service.indexMessage(message);

    expect(mockESService.index).toHaveBeenCalled();
    loggerSpy.mockRestore();
  });
});
