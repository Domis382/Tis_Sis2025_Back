// Conexión única al cliente Prisma.

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default prisma;
