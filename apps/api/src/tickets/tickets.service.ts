import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TicketCreateDto } from './dto/ticket-create.dto';
import { TicketUpdateDto } from './dto/ticket-update.dto';
import { CommentCreateDto } from './dto/comment-create.dto';
import { TicketSource } from '../generated/client';
import { TicketFilterDto } from './dto/ticket-filter.dto';
import { toWhere } from '../common/utils/prisma-where';

@Injectable()
export class TicketsService {
    constructor(private readonly prisma: PrismaService) { }

    create(dto: TicketCreateDto, creatorId: string) {
        return this.prisma.ticket.create({
            data: {
                title: dto.title,
                body: dto.body,
                priority: dto.priority,
                source: TicketSource.WEB,
                teamId: dto.teamId,
                creatorId,
            },
            include: { team: true, creator: true, agent: true },
        });
    }

    search(filter?: TicketFilterDto) {
        return this.prisma.ticket.findMany({
            where: toWhere(filter),
            include: { team: true, creator: true, agent: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    async find(id: string) {
        const ticket = await this.prisma.ticket.findUnique({
            where: { id },
            include: {
                team: true,
                creator: true,
                agent: true,
                comments: {
                    include: { author: true },
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
        if (!ticket) throw new NotFoundException(`Ticket ${id} not found`);
        return ticket;
    }

    async update(id: string, dto: TicketUpdateDto) {
        await this.find(id);
        return this.prisma.ticket.update({
            where: { id },
            data: dto,
            include: { team: true, creator: true, agent: true },
        });
    }

    async addComment(ticketId: string, dto: CommentCreateDto, authorId: string) {
        await this.find(ticketId);
        return this.prisma.comment.create({
            data: {
                body: dto.body,
                internal: dto.internal ?? false,
                ticketId,
                authorId,
            },
            include: { author: true },
        });
    }
}
