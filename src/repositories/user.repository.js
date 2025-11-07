// src/repositories/user.repository.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


 //* Retorna el usuario que coincide con el rol indicado.
// * Por ahora solo “Responsable de Area” tiene credenciales en el esquema.
 
export async function findAuthByRole({ role, username }) {
  switch (role) {
    case 'Responsable de Area':
      // usuario_responsable es único → perfecto para login
      return prisma.responsable_area.findUnique({
        where: { usuario_responsable: username },
        select: {
          id_responsable: true,
          usuario_responsable: true,
          pass_responsable: true,
          id_area: true,
        },
      });

    // aquí podrías agregar más roles en el futuro:
    // case 'Administrador':
    //   return prisma.administrador.findUnique({...});
    // case 'Coordinador':
    //   return prisma.coordinador_area.findUnique({...});
    // case 'Evaluador':
    //   return prisma.evaluador.findUnique({...});

    default:
      return null;
  }
}
