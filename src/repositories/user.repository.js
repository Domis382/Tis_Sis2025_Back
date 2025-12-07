// src/repositories/user.repository.js

// Importamos el cliente de Prisma (ORM para interactuar con la base de datos)
import { PrismaClient } from '@prisma/client';

// Creamos una instancia única del cliente para realizar consultas
const prisma = new PrismaClient();


//  Función principal: findAuthByRole()
// Busca un usuario en la base de datos según su rol y nombre de usuario

export async function findAuthByRole({ role, username }) {
  switch (role) {

   
    //  CASO 1: RESPONSABLE DE ÁREA
 
    case 'Responsable de Area':
      // Busca en la tabla "responsable_area" usando el campo usuario_responsable
      return prisma.responsable_area.findUnique({
        where: { usuario_responsable: username }, // username viene del formulario
        select: {
          id_responsable: true,
          usuario_responsable: true,
          pass_responsable: true,        // Contraseña temporal o cifrada
          id_area: true,
          nombres_evaluador: true,       // Nombre del responsable
          apellidos: true,
          correo_electronico: true,      // Para contacto
        },
      });

    
    // 🧩 CASO 2: ADMINISTRADOR
  
    case 'Administrador':
      // Busca en la tabla "administrador" usando el correo como username
      return prisma.administrador.findUnique({
        where: { correo_admin: username }, // El campo es único
        select: {
          id_administrador: true,
          correo_admin: true,           // Servirá como username/login
          nombre_admin: true,           // Nombre completo del admin
          apellido_admin: true,
          id_area: true,
          estado: true,                 // Estado (activo/inactivo)
        },
      });


    //  CASO 3: COORDINADOR DE ÁREA
   
    case 'COORDINADOR':
      // En este caso se usa el id_coordinador como username temporal
      // (puedes cambiar esto por un campo email o username en tu esquema)
      return prisma.coordinador_area.findUnique({
        where: { 
          id_coordinador: BigInt(username) // convierte el texto a BigInt
        },
        select: {
          id_coordinador: true,
          nombre_coordinador: true,
          apellidos_coordinador: true,
          id_area: true,
        },
      });

   
    // 🧩 CASO 4: EVALUADOR
    case 'Evaluador':
      // Similar al caso anterior, se usa el ID como identificador temporal
      return prisma.evaluador.findUnique({
        where: { 
          id_evaluador: BigInt(username) // se convierte a BigInt porque en Prisma el ID es tipo BigInt
        },
        select: {
          id_evaluador: true,
          nombre_evaluado: true,
          apellidos_evaluador: true,
          id_area: true,
        },
      });

   //  CASO 5: ROL NO DEFINIDO

    default:
      // Si el rol no coincide con ninguno de los anteriores, devuelve null
      return null;
  }
}
