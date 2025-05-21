// src/messages/dto/create-message.dto.ts
import { IsString, IsOptional, IsObject, IsISO8601 } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
  // @IsString()
  // @ApiProperty({
  //   example: 'msg-123',
  //   description: 'Unique identifier of the message (can be generated client-side or server-side)',
  // })
  // id: string;

  @IsString()
  @ApiProperty({
    example: 'conv-456',
    description: 'ID of the conversation this message belongs to',
  })
  conversationId: string;

  @IsString()
  @ApiProperty({
    example: 'user-789',
    description: 'ID of the user who sent the message',
  })
  senderId: string;

  @IsString()
  @ApiProperty({
    example: 'Hello, how are you?',
    description: 'The text content of the message',
  })
  content: string;

  @IsISO8601()
  @ApiProperty({
    example: '2024-05-18T14:35:00.000Z',
    description: 'ISO8601-formatted timestamp of when the message was sent',
  })
  timestamp: string;

  @IsOptional()
  @IsObject()
  @ApiProperty({
    example: { delivered: true, readAt: '2024-05-18T14:40:00.000Z' },
    description: 'Optional metadata (e.g., read receipts, delivery status)',
    required: false,
  })
  metadata?: Record<string, any>;
}
