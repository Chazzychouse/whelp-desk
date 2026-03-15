import 'dotenv/config';
import { PrismaClient, Role, QueueKind, TicketStatus, Priority, TicketSource } from '../src/generated/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Deterministic IDs so the hardcoded dev user ID stays stable across re-seeds
const SEED_IDS = {
    itTeam: '00000000-0000-0000-0000-000000000001',
    csTeam: '00000000-0000-0000-0000-000000000002',
    admin: '00000000-0000-0000-0000-000000000010',
    agent1: '00000000-0000-0000-0000-000000000011',
    agent2: '00000000-0000-0000-0000-000000000012',
    user1: '00000000-0000-0000-0000-000000000020',
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