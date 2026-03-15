import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketCreateDto } from './dto/ticket-create.dto';
import { TicketUpdateDto } from './dto/ticket-update.dto';
import { CommentCreateDto } from './dto/comment-create.dto';
import { TicketFilterDto } from './dto/ticket-filter.dto';

// TODO(Chase): Replace with Auth0 user extraction
const HARDCODED_USER_ID = '00000000-0000-0000-0000-000000000020'; // seed user1

@Controller('tickets')
export class TicketsController {
    constructor(private ticketsService: TicketsService) { }

    @Post()
    create(@Body() dto: TicketCreateDto) {
        return this.ticketsService.create(dto, HARDCODED_USER_ID);
    }

    @Get()
    search(@Query() filter: TicketFilterDto) {
        return this.ticketsService.search(filter);
    }

    @Get(':id')
    find(@Param('id') id: string) {
        return this.ticketsService.find(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: TicketUpdateDto) {
        return this.ticketsService.update(id, dto);
    }

    @Post(':id/comments')
    addComment(@Param('id') id: string, @Body() dto: CommentCreateDto) {
        return this.ticketsService.addComment(id, dto, HARDCODED_USER_ID);
    }
}