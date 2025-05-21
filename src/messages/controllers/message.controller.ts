// src/messages/controllers/messages.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { MessageService } from '../services/message.service';
import { SearchService } from '../services/search.service';
import { CreateMessageDto } from '../dto/create-message.dto';
import { Message } from '../schemas/message.schema';

@ApiTags('Messages')
@Controller('api/messages')
export class MessageController {
  constructor(
    private readonly messagesService: MessageService,
    private readonly searchService: SearchService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new message' })
  @ApiBody({ type: CreateMessageDto })
  @ApiResponse({
    status: 201,
    description: 'Message created successfully',
    type: Message,
  })
  create(@Body() body: CreateMessageDto) {
    return this.messagesService.create(body);
  }

  @Get('/conversations/:conversationId')
  @ApiOperation({ summary: 'Get messages for a conversation' })
  @ApiParam({ name: 'conversationId', description: 'ID of the conversation' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Messages per page', example: 20 })
  @ApiResponse({
    status: 200,
    description: 'Messages retrieved successfully',
    type: [Message],
  })
  findAll(
    @Param('conversationId') id: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.messagesService.findByConversation(id, +page, +limit);
  }

  @Get('/conversations/:conversationId/search')
  @ApiOperation({ summary: 'Search messages in a conversation' })
  @ApiParam({ name: 'conversationId', description: 'ID of the conversation' })
  @ApiQuery({ name: 'q', required: true, description: 'Search term' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Messages per page', example: 20 })
  @ApiResponse({
    status: 200,
    description: 'Search results',
    type: [Message],
  })
  search(
    @Param('conversationId') id: string,
    @Query('q') query: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.searchService.searchMessages(id, query, +page, +limit);
  }
}
