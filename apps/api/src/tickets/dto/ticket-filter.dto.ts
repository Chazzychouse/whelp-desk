import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { Priority, TicketStatus } from '../../generated/client.js';

export class TicketFilterDto {
    @IsOptional()
    @IsEnum(TicketStatus)
    status?: TicketStatus;

    @IsOptional()
    @IsEnum(Priority)
    priority?: Priority;

    @IsOptional()
    @IsUUID()
    teamId?: string;

    @IsOptional()
    @IsUUID()
    agentId?: string;
}