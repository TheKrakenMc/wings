const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const flavors = [
    "Natural",
    "Salsas negras",
    "Picante negro",
    "Salsa Perrona",
    "BBQ",
    "Valentina",
    "Al gusto"
  ];

  console.log("Seeding flavors...");
  
  for (const flavorName of flavors) {
    await prisma.flavor.upsert({
      where: { name: flavorName },
      update: {},
      create: {
        name: flavorName,
      },
    });
  }

  // Insertar producto por defecto
  await prisma.product.create({
    data: {
      name: "Orden de Alitas - 5 pz",
      basePrice: 85.00
    }
  });

  console.log("Seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
