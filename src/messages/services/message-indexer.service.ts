// src/messages/services/message-indexer.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Message } from '../schemas/message.schema';
import * as sanitizeHtml from 'sanitize-html';


@Injectable()
export class MessageIndexerService {
  private readonly logger = new Logger(MessageIndexerService.name);

  constructor(private readonly esService: ElasticsearchService) {}

  async indexMessage(message: Message): Promise<void> {
    if (!message.id || !message.content || !message.conversationId || !message.timestamp) {
      this.logger.warn('Message payload is missing required fields', message);
      return;
    }

    const sanitizedContent = sanitizeHtml(message.content);

    try {
     const response =  await this.esService.index({
        index: 'messages',
        document: {
          id: message.id,
          conversationId: message.conversationId,
          content: sanitizedContent,
          timestamp: message.timestamp,
          senderId: message.senderId, // optional
        },
      });

      this.logger.log(`Successfully indexed message ID: ${message.id}`);
    } catch (error) {
      this.logger.error(`Failed to index message ID: ${message.id}`, error.stack);
    }
  }
}
