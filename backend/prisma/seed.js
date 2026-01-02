const { PrismaClient } = require('@prisma/client');
const bcryptjs = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Running seed script...');

  // Super Admin
  const superAdminPassword = 'Admin@123';
  const superAdminHash = await bcryptjs.hash(superAdminPassword, 10);

  const existingSuper = await prisma.user.findFirst({ where: { email: 'superadmin@system.com', tenantId: null } });
  if (!existingSuper) {
    await prisma.user.create({
      data: {
        email: 'superadmin@system.com',
        passwordHash: superAdminHash,
        fullName: 'Super Admin',
        role: 'super_admin',
        tenantId: null,
      }
    });
  }

  // Demo Tenant
  const demoTenant = await prisma.tenant.upsert({
    where: { subdomain: 'demo' },
    update: {},
    create: {
      name: 'Demo Company',
      subdomain: 'demo',
      status: 'active',
      subscriptionPlan: 'pro',
      maxUsers: 25,
      maxProjects: 15,
    }
  });

  // Tenant Admin
  const adminHash = await bcryptjs.hash('Demo@123', 10);
  let tenantAdmin = await prisma.user.findFirst({ where: { email: 'admin@demo.com', tenantId: demoTenant.id } });
  if (!tenantAdmin) {
    tenantAdmin = await prisma.user.create({
      data: {
        email: 'admin@demo.com',
        passwordHash: adminHash,
        fullName: 'Demo Admin',
        role: 'tenant_admin',
        tenantId: demoTenant.id,
      }
    });
  }

  // Regular users
  const userHash = await bcryptjs.hash('User@123', 10);
  let user1 = await prisma.user.findFirst({ where: { email: 'user1@demo.com', tenantId: demoTenant.id } });
  if (!user1) {
    user1 = await prisma.user.create({
      data: {
        email: 'user1@demo.com',
        passwordHash: userHash,
        fullName: 'Demo User 1',
        role: 'user',
        tenantId: demoTenant.id,
      }
    });
  }

  let user2 = await prisma.user.findFirst({ where: { email: 'user2@demo.com', tenantId: demoTenant.id } });
  if (!user2) {
    user2 = await prisma.user.create({
      data: {
        email: 'user2@demo.com',
        passwordHash: userHash,
        fullName: 'Demo User 2',
        role: 'user',
        tenantId: demoTenant.id,
      }
    });
  }

  // Projects
  const projectA = await prisma.project.upsert({
    where: { id: 'project-alpha' },
    update: {},
    create: {
      id: 'project-alpha',
      tenantId: demoTenant.id,
      name: 'Project Alpha',
      description: 'First demo project',
      createdBy: tenantAdmin.id,
    }
  });

  const projectB = await prisma.project.upsert({
    where: { id: 'project-beta' },
    update: {},
    create: {
      id: 'project-beta',
      tenantId: demoTenant.id,
      name: 'Project Beta',
      description: 'Second demo project',
      createdBy: tenantAdmin.id,
    }
  });

  // Tasks
  await prisma.task.upsert({
    where: { id: 'task-1' },
    update: {},
    create: {
      id: 'task-1',
      projectId: projectA.id,
      tenantId: demoTenant.id,
      title: 'Set up project repo',
      description: 'Initialize repository and CI',
      status: 'todo',
      priority: 'high',
      assignedTo: user1.id,
    }
  });

  await prisma.task.upsert({
    where: { id: 'task-2' },
    update: {},
    create: {
      id: 'task-2',
      projectId: projectA.id,
      tenantId: demoTenant.id,
      title: 'Design homepage',
      description: 'Create initial mockups',
      status: 'in_progress',
      priority: 'medium',
      assignedTo: user2.id,
    }
  });

  await prisma.task.upsert({
    where: { id: 'task-3' },
    update: {},
    create: {
      id: 'task-3',
      projectId: projectB.id,
      tenantId: demoTenant.id,
      title: 'Create project plan',
      description: 'Milestones and deliverables',
      status: 'todo',
      priority: 'low',
      assignedTo: user1.id,
    }
  });

  console.log('Seed completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
