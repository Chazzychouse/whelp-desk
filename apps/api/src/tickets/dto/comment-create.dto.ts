import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CommentCreateDto {
    @IsString()
    body: string;

    @IsOptional()
    @IsBoolean()
    internal?: boolean;
}