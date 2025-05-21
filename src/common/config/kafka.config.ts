import { ClientProviderOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

export const createKafkaClientConfig = (
  configService: ConfigService,
): ClientProviderOptions => ({
  name: 'KAFKA_SERVICE',
  transport: Transport.KAFKA,
  options: {
    client: {
      brokers: [configService.get<string>('KAFKA_BROKER') || 'localhost:9092'],
    },
    consumer: {
      groupId: configService.get<string>('KAFKA_CONSUMER_GROUP') || 'message-consumer-group',
    },
  },
});
