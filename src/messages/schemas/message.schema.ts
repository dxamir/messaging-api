// src/messages/schemas/message.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema()
export class Message {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true, index: true }) // This creates an index on conversationId
  conversationId: string;

  @Prop({ required: true })
  senderId: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true, index: -1 }) // Descending index for sorting by latest messages
  timestamp: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

//  Custom compound and unique indexes
MessageSchema.index({ id: 1 }, { unique: true }); // Ensure unique message IDs
MessageSchema.index({ conversationId: 1, timestamp: -1 }); // For efficient retrieval of messages in a conversation
MessageSchema.index({ content: 'text' });
