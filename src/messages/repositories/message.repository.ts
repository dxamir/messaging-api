// src/messages/repositories/message.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from '../schemas/message.schema';

@Injectable()
export class MessageRepository {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) {}

  async create(message: Partial<Message>): Promise<Message> {
    
    return new this.messageModel(message).save();
  }

  async findByConversation(conversationId: string): Promise<Message[]> {
    return this.messageModel.find({ conversationId }).sort({ createdAt: -1 });
  }
}
