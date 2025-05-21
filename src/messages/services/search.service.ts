import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Message } from '../schemas/message.schema';

@Injectable()
export class SearchService {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async searchMessages(
    conversationId: string,
    query: string,
    page = 1,
    limit = 20,
  ): Promise<Message[]> {
    try {
      const result = await this.elasticsearchService.search({
        index: 'messages',
        from: (page - 1) * limit,
        size: limit,
        sort: [{ timestamp: { order: 'desc' } }],
        query: {
          bool: {
            must: [
              { term: { 'conversationId.keyword': conversationId } }, // Use .keyword for exact match
              { match: { content: query } },                          // Full-text search
            ],
          },
        },
      });
     
      return result.hits.hits.map((hit: any) => hit._source as Message);
    } catch (error) {
      console.error('Elasticsearch query failed:', error.meta?.body?.error || error);
      return [];
    }
  }
}
