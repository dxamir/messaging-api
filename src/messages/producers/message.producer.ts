// src/messages/producers/message.producer.ts
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { Message } from '../schemas/message.schema';

@Injectable()
export class MessageProducer implements OnModuleInit {
  constructor(@Inject('KAFKA_SERVICE') private readonly kafka: ClientKafka) {}

  async onModuleInit() {
    try {
  await this.kafka.connect();
} catch (error) {
  console.error('Kafka producer connection failed', error);
}
  }

  async publish(message: Message) {
    await this.kafka.emit('message.created', {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      content: message.content,
      timestamp: message.timestamp,
      metadata: message.metadata || {},
    });
  }
}
