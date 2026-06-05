import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Suppression des anciens comptes de test...\n');

  const testEmails = ['user@example.com', 'admin@example.com', 'provider@example.com'];

  for (const email of testEmails) {
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        // Supprime d'abord les dépendances
        await prisma.provider.deleteMany({ where: { userId: user.id } });
        await prisma.wallet.deleteMany({ where: { userId: user.id } });
        await prisma.profile.deleteMany({ where: { userId: user.id } });

        // Puis l'utilisateur
        await prisma.user.delete({ where: { id: user.id } });
        console.log(`✅ Supprimé: ${email}`);
      }
    } catch (err) {
      console.error(`❌ Erreur suppression ${email}:`, err);
    }
  }

  console.log('\n✅ Suppression terminée!');
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
