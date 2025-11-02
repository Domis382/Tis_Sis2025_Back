import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function run() {
  // 1️⃣ Crear área por si no existe
  const area = await prisma.area.upsert({
    where: { nombre_area: 'Sistemas' },
    update: {},
    create: { nombre_area: 'Sistemas' },
    select: { id_area: true },
  });

  // 2️⃣ Crear responsable de área
  const hash = await bcrypt.hash('123456', 10);
  await prisma.responsable_area.upsert({
    where: { usuario_responsable: 'resp1' }, // este campo es @unique
    update: { pass_responsable: hash, id_area: area.id_area },
    create: {
      nombres_evaluador: 'Juan',
      apellidos: 'Perez',
      correo_electronico: 'resp1@demo.com',
      usuario_responsable: 'resp1',
      pass_responsable: hash,
      id_area: area.id_area,
    },
  });

  console.log('✅ Seed Responsable de Área OK -> usuario: resp1 / pass: 123456');
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
