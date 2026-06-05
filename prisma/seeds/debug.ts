import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Debug des comptes de test...\n');

  const users = await prisma.user.findMany({
    where: {
      email: { in: ['user@example.com', 'admin@example.com', 'provider@example.com'] }
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      password: true,
      emailVerified: true
    }
  });

  console.log('Users in database:');
  if (users.length === 0) {
    console.log('❌ NO USERS FOUND!');
  } else {
    users.forEach(u => {
      console.log(`\n📧 ${u.email}`);
      console.log(`  - Nom: ${u.name}`);
      console.log(`  - Rôle: ${u.role}`);
      console.log(`  - Password: ${u.password ? '✅ SET' : '❌ NOT SET'}`);
      console.log(`  - Email verified: ${u.emailVerified}`);
      console.log(`  - ID: ${u.id}`);
    });
  }

  // Vérifie aussi les comptes (Account) pour better-auth
  console.log('\n\n🔐 Checking better-auth accounts:');
  const accounts = await prisma.account.findMany({
    where: {
      userId: { in: users.map(u => u.id) }
    },
    select: {
      id: true,
      userId: true,
      providerId: true,
      accountId: true,
      password: true
    }
  });

  if (accounts.length === 0) {
    console.log('❌ NO ACCOUNTS FOUND IN ACCOUNT TABLE');
  } else {
    accounts.forEach(a => {
      console.log(`\n📱 Account ID: ${a.accountId}`);
      console.log(`  - User ID: ${a.userId}`);
      console.log(`  - Provider: ${a.providerId}`);
      console.log(`  - Password: ${a.password ? '✅ SET' : '❌ NOT SET'}`);
    });
  }
}

main()
  .catch(e => console.error('Error:', e))
  .finally(async () => {
    await prisma.$disconnect();
  });
