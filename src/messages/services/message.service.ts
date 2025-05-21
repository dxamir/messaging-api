// src/messages/services/message.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from '../schemas/message.schema';
import { MessageProducer } from '../producers/message.producer';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name) private readonly msgModel: Model<Message>,
    private readonly messageProducer: MessageProducer,
  ) {}

  async create(msgData: Partial<Message>) {
    const id = uuidv4(); // generate UUID
    const message = await this.msgModel.create({ ...msgData, id });
    await this.messageProducer.publish(message.toObject());
    return message;
  }

  async findByConversation(conversationId: string, page = 1, limit = 20) {
    return this.msgModel
      .find({ conversationId })
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
  }
}
