import { IsString, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { Priority } from '../../generated/client.js';

export class TicketCreateDto {
    @IsString()
    title: string;

    @IsString()
    body: string;

    @IsOptional()
    @IsEnum(Priority)
    priority?: Priority;

    @IsUUID()
    teamId: string;
}