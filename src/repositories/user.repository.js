// src/repositories/user.repository.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function findAuthByRole({ role, username }) {
  switch (role) {
    case 'Responsable de Area':
      return prisma.responsable_area.findUnique({
        where: { usuario_responsable: username },
        select: {
          id_responsable: true,
          usuario_responsable: true,
          pass_responsable: true,
          id_area: true,
          nombres_evaluador: true,
          apellidos: true,
          correo_electronico: true,
        },
      });

    case 'Administrador':
      return prisma.administrador.findUnique({
        where: { correo_admin: username }, // Email como usuario
        select: {
          id_administrador: true,
          correo_admin: true,           // Este será el "username"
          nombre_admin: true,           // Para mostrar nombre
          apellido_admin: true,         // Para mostrar apellido
          id_area: true,
          estado: true,
        },
      });

    case 'Coordinador Area':
      return prisma.coordinador_area.findUnique({
        where: { 
          // Usaremos nombre + apellido como identificador único temporal
          // O necesitarás agregar un campo email/username después
          id_coordinador: BigInt(username) // TEMPORAL: usar ID como username
        },
        select: {
          id_coordinador: true,
          nombre_coordinador: true,
          apellidos_coordinador: true,
          id_area: true,
        },
      });

    case 'Evaluador':
      return prisma.evaluador.findUnique({
        where: { 
          // Mismo enfoque temporal - usar ID como username
          id_evaluador: BigInt(username) 
        },
        select: {
          id_evaluador: true,
          nombre_evaluado: true,
          apellidos_evaluador: true,
          id_area: true,
        },
      });

    default:
      return null;
  }
}