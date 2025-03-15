import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  const filePath = path.join(__dirname, '../apps-db.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  // Inserta los datos en la BD
  for (const app of data) {
    await prisma.application.upsert({
      where: { id: app.id },
      update: {}, // Si el ID ya existe, no actualiza nada
      create: {
        id: app.id,
        name: app.name,
        domains: app.domains,
      },
    });
  }
  console.log('Datos importados correctamente');
}

main()
  .catch(e => {
    console.error('Error al ejecutar el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });