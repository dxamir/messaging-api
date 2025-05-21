import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsModule } from '@nestjs/microservices';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createKafkaClientConfig } from '../common/config/kafka.config';
import { MessageController } from './controllers/message.controller';
import { MessageService } from './services/message.service';
import { SearchService } from './services/search.service';
import { MessageRepository } from './repositories/message.repository';
import { MessageProducer } from './producers/message.producer';
import { Message, MessageSchema } from './schemas/message.schema';
import { MessageConsumer } from './consumers/message.consumer';
import { MessageIndexerService } from './services/message-indexer.service';


@Module({
  imports: [
    ConfigModule, // Ensure it's imported if not already globally provided
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => createKafkaClientConfig(configService),
      },
    ]),
    ElasticsearchModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        node: configService.get<string>('ELASTICSEARCH_NODE') || 'http://localhost:9200',
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [MessageController],
  providers: [
    MessageService,
    SearchService,
    MessageRepository,
    MessageProducer,
    MessageConsumer,
    MessageIndexerService,
  ],
})
export class MessagesModule {}
