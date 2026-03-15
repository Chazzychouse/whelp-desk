import { IsOptional, IsEnum, IsUUID } from 'class-validator';
import { TicketStatus, Priority } from '../../generated/client.js';

export class TicketUpdateDto {
    @IsOptional()
    @IsEnum(TicketStatus)
    status?: TicketStatus;

    @IsOptional()
    @IsEnum(Priority)
    priority?: Priority;

    @IsOptional()
    @IsUUID()
    agentId?: string;

    @IsOptional()
    @IsUUID()
    teamId?: string;
}