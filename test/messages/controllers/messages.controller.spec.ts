import { Test, TestingModule } from '@nestjs/testing';
import { MessageController } from '../../../src/messages/controllers/message.controller';
import { MessageService } from '../../../src/messages/services/message.service';
import { SearchService } from '../../../src/messages/services/search.service';
import { CreateMessageDto } from '../../../src/messages/dto/create-message.dto';

describe('MessageController', () => {
  let controller: MessageController;
  let messageService: MessageService;
  let searchService: SearchService;

  const mockMessageService = {
    create: jest.fn(),
    findByConversation: jest.fn(),
  };

  const mockSearchService = {
    searchMessages: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessageController],
      providers: [
        { provide: MessageService, useValue: mockMessageService },
        { provide: SearchService, useValue: mockSearchService },
      ],
    }).compile();

    controller = module.get<MessageController>(MessageController);
    messageService = module.get<MessageService>(MessageService);
    searchService = module.get<SearchService>(SearchService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('should call messageService.create with correct DTO', async () => {
      const dto: CreateMessageDto = {
        conversationId: 'c1',
        senderId: 'u1',
        content: 'Hello',
        timestamp: new Date().toISOString(),
      };

      const result = { ...dto, id: 'm1' };
      mockMessageService.create.mockResolvedValue(result);

      const response = await controller.create(dto);

      expect(mockMessageService.create).toHaveBeenCalledWith(dto);
      expect(response).toEqual(result);
    });
  });

  describe('findAll', () => {
    it('should call messageService.findByConversation with correct params', async () => {
      const result = [{ id: 'm1', content: 'Hi' }];
      mockMessageService.findByConversation.mockResolvedValue(result);

      const response = await controller.findAll('c1', 2, 10);

      expect(mockMessageService.findByConversation).toHaveBeenCalledWith('c1', 2, 10);
      expect(response).toEqual(result);
    });

    it('should use default values if query params are missing', async () => {
      const result = [{ id: 'm2', content: 'Default' }];
      mockMessageService.findByConversation.mockResolvedValue(result);

      const response = await controller.findAll('c2', undefined, undefined);

      expect(mockMessageService.findByConversation).toHaveBeenCalledWith('c2', 1, 20);
      expect(response).toEqual(result);
    });
  });

  describe('search', () => {
    it('should call searchService.searchMessages with correct params', async () => {
      const result = [{ id: 'm3', content: 'Search result' }];
      mockSearchService.searchMessages.mockResolvedValue(result);

      const response = await controller.search('c3', 'hello', 3, 15);

      expect(mockSearchService.searchMessages).toHaveBeenCalledWith('c3', 'hello', 3, 15);
      expect(response).toEqual(result);
    });

    it('should use default pagination if not provided', async () => {
      const result = [{ id: 'm4', content: 'Search default' }];
      mockSearchService.searchMessages.mockResolvedValue(result);

      const response = await controller.search('c4', 'hi', undefined, undefined);

      expect(mockSearchService.searchMessages).toHaveBeenCalledWith('c4', 'hi', 1, 20);
      expect(response).toEqual(result);
    });
  });
});
