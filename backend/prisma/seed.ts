import { PrismaClient, Role, Stage } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  await prisma.field.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('password123', 12);

  //adding admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@smartseason.com',
      password: hashedPassword,
      name: 'Admin User',
      role: Role.ADMIN,
    },
  });

  //adding agents
  const agent1 = await prisma.user.create({
    data: {
      email: 'agent1@smartseason.com',
      password: hashedPassword,
      name: 'Jane Wanjiku',
      role: Role.AGENT,
    },
  });

  const agent2 = await prisma.user.create({
    data: {
      email: 'agent2@smartseason.com',
      password: hashedPassword,
      name: 'Brian Omondi',
      role: Role.AGENT,
    },
  });

  const now = new Date();
  const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);

  await prisma.field.createMany({
    data: [
      //active fields
      {
        name: 'North Paddock',
        cropType: 'Maize',
        plantingDate: daysAgo(15),
        currentStage: Stage.PLANTED,
        notes: 'Good germination rate',
        location: 'Nakuru County',
        agentId: agent1.id,
      },
      {
        name: 'Valley Plot',
        cropType: 'Tomatoes',
        plantingDate: daysAgo(45),
        currentStage: Stage.GROWING,
        notes: 'Irrigation on schedule',
        location: 'Kiambu County',
        agentId: agent1.id,
      },
      {
        name: 'Hilltop Farm',
        cropType: 'Wheat',
        plantingDate: daysAgo(80),
        currentStage: Stage.READY,
        notes: 'Ready for harvest within the week',
        location: 'Uasin Gishu County',
        agentId: agent2.id,
      },
      {
        name: 'Riverside Block',
        cropType: 'Beans',
        plantingDate: daysAgo(35),
        currentStage: Stage.PLANTED,
        notes: 'Stalled — possible soil issue',
        location: 'Meru County',
        agentId: agent1.id,
      },
      {
        name: 'Eastern Quarter',
        cropType: 'Sorghum',
        plantingDate: daysAgo(100),
        currentStage: Stage.GROWING,
        notes: 'Growth stalled after heavy rains',
        location: 'Machakos County',
        agentId: agent2.id,
      },
      {
        name: 'South Field',
        cropType: 'Sunflower',
        plantingDate: daysAgo(120),
        currentStage: Stage.HARVESTED,
        notes: 'Excellent yield — 4.2 tons/acre',
        location: 'Laikipia County',
        agentId: agent2.id,
      },
    ],
  });

  console.log('✅ Seed complete!');
  console.log('\n📋 Login Credentials:');
  console.log('  Admin:  admin@smartseason.com / password123');
  console.log('  Agent1: agent1@smartseason.com / password123');
  console.log('  Agent2: agent2@smartseason.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
