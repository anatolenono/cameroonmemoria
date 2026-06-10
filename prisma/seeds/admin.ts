import { PrismaClient } from '@prisma/client';
import { createAccountCredentials } from './utils';
import { seedBanners } from './banners';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding de l\'administrateur...');

  const adminEmail = process.env.ADMIN_EMAIL!;
  const adminPassword = process.env.ADMIN_PASSWORD!;
  const adminName = process.env.ADMIN_NAME || 'Administrateur Cameroon Memoria';

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (existingAdmin) {
    console.log('✅ L\'utilisateur administrateur existe déjà');
  } else {
    // Register credentials in the auth system (creates the user)
    await createAccountCredentials({
      email: adminEmail,
      password: adminPassword,
      name: adminName,
    });

    // Fetch the user and update their role and profile
    const user = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          role: 'ADMIN',
          name: adminName,
          profile: {
            upsert: {
              update: {
                phoneNumber: '+237123456789',
                address: '123 Rue de la Paix',
                country: 'Cameroun',
                city: 'Yaoundé',
              },
              create: {
                phoneNumber: '+237123456789',
                address: '123 Rue de la Paix',
                country: 'Cameroun',
                city: 'Yaoundé',
              },
            },
          },
          wallet: {
            upsert: {
              update: {
                balance: 0,
                currency: 'XAF',
              },
              create: {
                balance: 0,
                currency: 'XAF',
              },
            },
          },
        },
      });
      console.log('✅ Utilisateur administrateur créé et mis à jour');
    } else {
      console.error('❌ Impossible de retrouver l\'utilisateur après création des credentials');
    }
  }

  console.log('🎉 Seeding de l\'administrateur terminé avec succès !');

  // Seed banner presets
  await seedBanners();
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding de l\'administrateur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 