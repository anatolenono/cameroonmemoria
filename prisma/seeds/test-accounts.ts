import { PrismaClient } from '@prisma/client';
import { createAccountCredentials } from './utils';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Création des comptes de test...\n');

  // 1. UTILISATEUR CLIENT
  const userEmail = 'user@example.com';
  const userPassword = 'password123';
  const userName = 'Jean Dupont';

  const existingUser = await prisma.user.findUnique({ where: { email: userEmail } });
  if (!existingUser) {
    try {
      await createAccountCredentials({
        email: userEmail,
        password: userPassword,
        name: userName,
      });

      // Juste met à jour le rôle et le profil (ne pas toucher au mot de passe!)
      const user = await prisma.user.findUnique({ where: { email: userEmail } });
      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            role: 'USER',
            profile: {
              create: {
                phoneNumber: '+237670000001',
                address: '123 Rue de la Paix',
                country: 'Cameroun',
                city: 'Yaoundé',
              },
            },
            wallet: {
              create: {
                balance: 0,
                currency: 'XAF',
              },
            },
          },
        });
      }
      console.log('✅ Utilisateur CLIENT créé');
      console.log('   📧 Email: user@example.com');
      console.log('   🔑 Password: password123\n');
    } catch (err) {
      console.error('❌ Erreur création CLIENT:', err);
    }
  } else {
    console.log('✅ Utilisateur CLIENT existe déjà\n');
  }

  // 2. ADMINISTRATEUR
  const adminEmail = 'admin@example.com';
  const adminPassword = 'admin123';
  const adminName = 'Admin Cameroon Memoria';

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    try {
      await createAccountCredentials({
        email: adminEmail,
        password: adminPassword,
        name: adminName,
      });

      const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
      if (admin) {
        await prisma.user.update({
          where: { id: admin.id },
          data: {
            role: 'ADMIN',
            profile: {
              create: {
                phoneNumber: '+237670000002',
                address: '456 Avenue de la République',
                country: 'Cameroun',
                city: 'Douala',
              },
            },
            wallet: {
              create: {
                balance: 0,
                currency: 'XAF',
              },
            },
          },
        });
      }
      console.log('✅ Utilisateur ADMIN créé');
      console.log('   📧 Email: admin@example.com');
      console.log('   🔑 Password: admin123\n');
    } catch (err) {
      console.error('❌ Erreur création ADMIN:', err);
    }
  } else {
    console.log('✅ Utilisateur ADMIN existe déjà\n');
  }

  // 3. FOURNISSEUR (Provider)
  const providerEmail = 'provider@example.com';
  const providerPassword = 'provider123';
  const providerName = 'Marc Fouché';

  const existingProvider = await prisma.user.findUnique({ where: { email: providerEmail } });
  if (!existingProvider) {
    try {
      await createAccountCredentials({
        email: providerEmail,
        password: providerPassword,
        name: providerName,
      });

      const providerUser = await prisma.user.findUnique({ where: { email: providerEmail } });
      if (providerUser) {
        // Mets à jour le rôle et le profil (pas le mot de passe!)
        await prisma.user.update({
          where: { id: providerUser.id },
          data: {
            role: 'USER',
            profile: {
              create: {
                phoneNumber: '+237670000003',
                address: '789 Rue des Fleurs',
                country: 'Cameroun',
                city: 'Yaoundé',
              },
            },
            wallet: {
              create: {
                balance: 0,
                currency: 'XAF',
              },
            },
          },
        });

        // Récupère une catégorie (créée si elle n'existe pas)
        let category = await prisma.marketplaceCategory.findFirst();
        if (!category) {
          category = await prisma.marketplaceCategory.create({
            data: {
              name: 'Arrangement floral',
              slug: 'arrangement-floral',
              isActive: true,
            },
          });
        }

        // Crée le dossier Provider ACTIVE (on le valide directement)
        const existingProviderRecord = await prisma.provider.findUnique({
          where: { userId: providerUser.id },
        });

        if (!existingProviderRecord) {
          await prisma.provider.create({
            data: {
              userId: providerUser.id,
              categoryId: category.id,
              status: 'ACTIVE',
              companyName: 'Fleurs & Services Funéraires',
              companyCity: 'Yaoundé',
              companyPhone: '+237670000003',
              companyEmail: 'contact@fleurs-services.cm',
              companyDescription: 'Services complets pour arrangements floraux et cérémonies funéraires',
              repName: 'Marc Fouché',
              repPhone: '+237670000003',
              repEmail: 'marc@fleurs-services.cm',
              commissionRate: 10,
            },
          });

          // Mets à jour le rôle de l'utilisateur à PROVIDER
          await prisma.user.update({
            where: { id: providerUser.id },
            data: { role: 'PROVIDER' },
          });

          // Crée une ProviderActivation
          const provider = await prisma.provider.findUnique({
            where: { userId: providerUser.id },
          });

          if (provider) {
            await prisma.providerActivation.create({
              data: {
                providerId: provider.id,
                baseAmount: 50000,
                discountPct: 0,
                finalAmount: 50000,
                status: 'PAID',
                paidAt: new Date(),
              },
            });
          }

          console.log('✅ Utilisateur PROVIDER créé et ACTIVÉ');
          console.log('   📧 Email: provider@example.com');
          console.log('   🔑 Password: provider123\n');
        }
      }
    } catch (err) {
      console.error('❌ Erreur création PROVIDER:', err);
    }
  } else {
    console.log('✅ Utilisateur PROVIDER existe déjà\n');
  }

  console.log('🎉 Comptes de test créés avec succès!\n');
  console.log('═════════════════════════════════════════════');
  console.log('📋 RÉSUMÉ DES COMPTES:');
  console.log('═════════════════════════════════════════════\n');
  console.log('1️⃣  CLIENT');
  console.log('   Email: user@example.com');
  console.log('   Pass:  password123');
  console.log('   Rôle:  USER\n');
  console.log('2️⃣  ADMIN');
  console.log('   Email: admin@example.com');
  console.log('   Pass:  admin123');
  console.log('   Rôle:  ADMIN\n');
  console.log('3️⃣  FOURNISSEUR');
  console.log('   Email: provider@example.com');
  console.log('   Pass:  provider123');
  console.log('   Rôle:  PROVIDER (ACTIF)');
  console.log('   Entreprise: Fleurs & Services Funéraires\n');
  console.log('═════════════════════════════════════════════');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors de la création des comptes:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
