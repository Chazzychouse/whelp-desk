import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { PrismaService } from '../../prisma/prisma.service';

const FAKE_UUID = '550e8400-e29b-41d4-a716-446655440000';
const FAKE_USER_ID = '550e8400-e29b-41d4-a716-446655440001';

const mockTicket = {
    id: FAKE_UUID,
    title: 'Test ticket',
    body: 'Test body',
    status: 'OPEN',
    priority: 'MEDIUM',
    source: 'WEB',
    creatorId: FAKE_USER_ID,
    teamId: FAKE_UUID,
    agentId: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    team: null,
    creator: { id: FAKE_USER_ID, name: 'Test User', email: 'test@test.com' },
    agent: null,
};

const mockPrisma = {
    ticket: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
    },
    comment: {
        create: jest.fn(),
    },
};

describe('TicketsController', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            controllers: [TicketsController],
            providers: [
                TicketsService,
                { provide: PrismaService, useValue: mockPrisma },
            ],
        }).compile();

        app = module.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /tickets', () => {
        it('should create a ticket with valid input', async () => {
            mockPrisma.ticket.create.mockResolvedValue(mockTicket);

            const res = await request(app.getHttpServer())
                .post('/tickets')
                .send({ title: 'Test ticket', body: 'Test body', teamId: FAKE_UUID });

            expect(res.status).toBe(201);
            expect(res.body).toEqual(mockTicket);
            expect(mockPrisma.ticket.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        title: 'Test ticket',
                        body: 'Test body',
                        teamId: FAKE_UUID,
                    }),
                }),
            );
        });

        it('should return 400 when required fields are missing', async () => {
            const res = await request(app.getHttpServer())
                .post('/tickets')
                .send({});

            expect(res.status).toBe(400);
        });

        it('should return 400 when teamId is not a valid UUID', async () => {
            const res = await request(app.getHttpServer())
                .post('/tickets')
                .send({ title: 'Test', body: 'Test', teamId: 'not-a-uuid' });

            expect(res.status).toBe(400);
        });
    });

    describe('GET /tickets', () => {
        it('should return all tickets with no filters', async () => {
            mockPrisma.ticket.findMany.mockResolvedValue([mockTicket]);

            const res = await request(app.getHttpServer()).get('/tickets');

            expect(res.status).toBe(200);
            expect(res.body).toEqual([mockTicket]);
        });

        it('should pass filter params to the query', async () => {
            mockPrisma.ticket.findMany.mockResolvedValue([mockTicket]);

            const res = await request(app.getHttpServer())
                .get('/tickets?status=OPEN&priority=HIGH');

            expect(res.status).toBe(200);
            expect(mockPrisma.ticket.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ status: 'OPEN', priority: 'HIGH' }),
                }),
            );
        });

        it('should return empty array when no matches', async () => {
            mockPrisma.ticket.findMany.mockResolvedValue([]);

            const res = await request(app.getHttpServer()).get('/tickets');

            expect(res.status).toBe(200);
            expect(res.body).toEqual([]);
        });

        it('should return 400 for invalid filter enum value', async () => {
            const res = await request(app.getHttpServer())
                .get('/tickets?status=BOGUS');

            expect(res.status).toBe(400);
        });
    });

    describe('GET /tickets/:id', () => {
        it('should return a ticket when it exists', async () => {
            const ticketWithComments = { ...mockTicket, comments: [] };
            mockPrisma.ticket.findUnique.mockResolvedValue(ticketWithComments);

            const res = await request(app.getHttpServer())
                .get(`/tickets/${FAKE_UUID}`);

            expect(res.status).toBe(200);
            expect(res.body).toEqual(ticketWithComments);
        });

        it('should return 404 when ticket does not exist', async () => {
            mockPrisma.ticket.findUnique.mockResolvedValue(null);

            const res = await request(app.getHttpServer())
                .get(`/tickets/${FAKE_UUID}`);

            expect(res.status).toBe(404);
        });
    });

    describe('PATCH /tickets/:id', () => {
        it('should update a ticket with valid input', async () => {
            const updatedTicket = { ...mockTicket, status: 'RESOLVED' };
            mockPrisma.ticket.findUnique.mockResolvedValue(mockTicket);
            mockPrisma.ticket.update.mockResolvedValue(updatedTicket);

            const res = await request(app.getHttpServer())
                .patch(`/tickets/${FAKE_UUID}`)
                .send({ status: 'RESOLVED' });

            expect(res.status).toBe(200);
            expect(res.body).toEqual(updatedTicket);
        });

        it('should return 404 when ticket does not exist', async () => {
            mockPrisma.ticket.findUnique.mockResolvedValue(null);

            const res = await request(app.getHttpServer())
                .patch(`/tickets/${FAKE_UUID}`)
                .send({ status: 'RESOLVED' });

            expect(res.status).toBe(404);
        });

        // Validates that the DTO @IsEnum rejects invalid values before the handler runs
        it('should return 400 for invalid enum value', async () => {
            const res = await request(app.getHttpServer())
                .patch(`/tickets/${FAKE_UUID}`)
                .send({ status: 'INVALID' });

            expect(res.status).toBe(400);
        });
    });

    describe('POST /tickets/:id/comments', () => {
        const mockComment = {
            id: FAKE_UUID,
            body: 'Test comment',
            internal: false,
            ticketId: FAKE_UUID,
            authorId: FAKE_USER_ID,
            createdAt: '2026-01-01T00:00:00.000Z',
            author: { id: FAKE_USER_ID, name: 'Test User', email: 'test@test.com' },
        };

        it('should create a comment with valid input', async () => {
            mockPrisma.ticket.findUnique.mockResolvedValue(mockTicket);
            mockPrisma.comment.create.mockResolvedValue(mockComment);

            const res = await request(app.getHttpServer())
                .post(`/tickets/${FAKE_UUID}/comments`)
                .send({ body: 'Test comment' });

            expect(res.status).toBe(201);
            expect(res.body).toEqual(mockComment);
        });

        it('should create an internal comment', async () => {
            const internalComment = { ...mockComment, internal: true };
            mockPrisma.ticket.findUnique.mockResolvedValue(mockTicket);
            mockPrisma.comment.create.mockResolvedValue(internalComment);

            const res = await request(app.getHttpServer())
                .post(`/tickets/${FAKE_UUID}/comments`)
                .send({ body: 'Test comment', internal: true });

            expect(res.status).toBe(201);
            expect(res.body.internal).toBe(true);
        });

        it('should return 404 when ticket does not exist', async () => {
            mockPrisma.ticket.findUnique.mockResolvedValue(null);

            const res = await request(app.getHttpServer())
                .post(`/tickets/${FAKE_UUID}/comments`)
                .send({ body: 'Test comment' });

            expect(res.status).toBe(404);
        });

        it('should return 400 when body is missing', async () => {
            const res = await request(app.getHttpServer())
                .post(`/tickets/${FAKE_UUID}/comments`)
                .send({});

            expect(res.status).toBe(400);
        });

        it('should return 400 when internal is not a boolean', async () => {
            const res = await request(app.getHttpServer())
                .post(`/tickets/${FAKE_UUID}/comments`)
                .send({ body: 'Test comment', internal: [] });

            expect(res.status).toBe(400);
        });
    });
});
