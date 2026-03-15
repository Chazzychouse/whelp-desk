import 'dotenv/config';
import { PrismaClient, Role, QueueKind, TicketStatus, Priority, TicketSource } from '../src/generated/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Deterministic IDs so the hardcoded dev user ID stays stable across re-seeds
const SEED_IDS = {
    itTeam: 'e4d6729a-59a6-4128-a1dd-d51f9f059cd6',
    csTeam: 'e7e293f1-c6dd-4633-b716-ab50bf64b17b',
    admin: '35fa6d1e-f882-428b-93c0-085585e07a6e',
    agent1: '74a1af77-f9bb-486e-aa8c-bf13a82a0ec9',
    agent2: '114dfec0-290e-4e8a-aded-b328a95bfb33',
    user1: '6261cc9d-159f-4708-9fc1-da78793a16c8',
};

async function main() {
    // Clear existing seed data (safe for dev only)
    await prisma.comment.deleteMany();
    await prisma.ticket.deleteMany();
    await prisma.user.deleteMany();
    await prisma.team.deleteMany();

    // Teams
    const itTeam = await prisma.team.create({
        data: { id: SEED_IDS.itTeam, name: 'IT Support', kind: QueueKind.INTERNAL },
    });
    const csTeam = await prisma.team.create({
        data: { id: SEED_IDS.csTeam, name: 'Customer Support', kind: QueueKind.EXTERNAL },
    });

    // Users
    const admin = await prisma.user.create({
        data: { id: SEED_IDS.admin, email: 'admin@helpdesk.local', name: 'Admin User', role: Role.ADMIN },
    });
    const agent1 = await prisma.user.create({
        data: { id: SEED_IDS.agent1, email: 'agent1@helpdesk.local', name: 'Agent One', role: Role.AGENT, teamId: itTeam.id },
    });
    const agent2 = await prisma.user.create({
        data: { id: SEED_IDS.agent2, email: 'agent2@helpdesk.local', name: 'Agent Two', role: Role.AGENT, teamId: csTeam.id },
    });
    const user1 = await prisma.user.create({
        data: { id: SEED_IDS.user1, email: 'user1@example.com', name: 'Regular User', role: Role.USER },
    });

    // Sample tickets
    await prisma.ticket.create({
        data: {
            title: 'VPN not connecting',
            body: 'I cannot connect to the corporate VPN from home.',
            status: TicketStatus.OPEN,
            priority: Priority.HIGH,
            source: TicketSource.WEB,
            teamId: itTeam.id,
            creatorId: user1.id,
        },
    });
    await prisma.ticket.create({
        data: {
            title: 'Billing question',
            body: 'I was charged twice for my subscription.',
            status: TicketStatus.IN_PROGRESS,
            priority: Priority.MEDIUM,
            source: TicketSource.WEB,
            teamId: csTeam.id,
            creatorId: user1.id,
            agentId: agent2.id,
        },
    });
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());