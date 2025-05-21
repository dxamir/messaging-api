import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { Kafka, Consumer } from 'kafkajs';
import { ConfigService } from '@nestjs/config';
import { MessageIndexerService } from '../services/message-indexer.service';

@Injectable()
export class MessageConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MessageConsumer.name);
  private consumer: Consumer;

  constructor(
    private readonly configService: ConfigService,
    private readonly indexerService: MessageIndexerService,
  ) {}

  async onModuleInit(): Promise<void> {
    const broker = this.configService.get<string>('KAFKA_BROKER') || 'localhost:9092';
    const groupId = this.configService.get<string>('KAFKA_CONSUMER_GROUP') || 'message-indexer';
    const topic = this.configService.get<string>('KAFKA_TOPIC') || 'message.created';

    const kafka = new Kafka({
      brokers: [broker],
      clientId: 'search-service',
    });

    this.consumer = kafka.consumer({ groupId });

    try {
      await this.consumer.connect();
      await this.consumer.subscribe({ topic });


      await this.consumer.run({
        eachMessage: async ({ message }) => {
          if (!message.value) {
            this.logger.warn('Received message with empty value');
            return;
          }

          try {
            const msg = JSON.parse(message.value.toString());

            // Validate and index
            await this.indexerService.indexMessage(msg);
          } catch (error) {
            this.logger.error('Error processing Kafka message', error.stack);
          }
        },
      });

      this.logger.log(`Kafka consumer connected to broker: ${broker}, topic: ${topic}`);
    } catch (error) {
      this.logger.error('Failed to initialize Kafka consumer', error.stack);
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.consumer) {
      try {
        await this.consumer.disconnect();
        this.logger.log('Kafka consumer disconnected');
      } catch (error) {
        this.logger.error('Error during Kafka consumer disconnect', error.stack);
      }
    }
  }
}
