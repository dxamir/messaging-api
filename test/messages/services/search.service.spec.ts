import { Test, TestingModule } from '@nestjs/testing';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { SearchService } from '../../../src/messages/services/search.service';
import { Message } from '../../../src/messages/schemas/message.schema';

describe('SearchService', () => {
  let service: SearchService;
  let mockElasticService: { search: jest.Mock };

  beforeEach(async () => {
    mockElasticService = {
      search: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: ElasticsearchService, useValue: mockElasticService },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
  });

  it('should return an array of messages on successful search', async () => {
    const mockMessage: Message = {
      id: '1',
      conversationId: 'conv-123',
      content: 'Hello world',
      timestamp: new Date().toISOString(),
      senderId: 'user-1',
    };

    const esResponse = {
      hits: {
        hits: [
          { _source: mockMessage },
          { _source: { ...mockMessage, id: '2', content: 'Hi again' } },
        ],
      },
    };

    mockElasticService.search.mockResolvedValue(esResponse);

    const result = await service.searchMessages('conv-123', 'hello', 1, 2);

    expect(mockElasticService.search).toHaveBeenCalledWith({
      index: 'messages',
      from: 0,
      size: 2,
      sort: [{ timestamp: { order: 'desc' } }],
      query: {
        bool: {
          must: [
            { term: { 'conversationId.keyword': 'conv-123' } },
            { match: { content: 'hello' } },
          ],
        },
      },
    });

    expect(result.length).toBe(2);
    expect(result[0]).toHaveProperty('id', '1');
    expect(result[1]).toHaveProperty('id', '2');
  });

  it('should return an empty array if Elasticsearch throws an error', async () => {
    mockElasticService.search.mockRejectedValue(new Error('Search failed'));

    const result = await service.searchMessages('conv-123', 'fail');

    expect(result).toEqual([]);
    expect(mockElasticService.search).toHaveBeenCalled();
  });
});
