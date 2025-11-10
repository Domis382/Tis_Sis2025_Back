// 🔹 REPOSITORIO DE USUARIOS: Acceso a datos de autenticación
// src/repositories/user.repository.js

import { PrismaClient } from '@prisma/client';

//  CLIENTE PRISMA: Conexión a la base de datos
const prisma = new PrismaClient();

//  FUNCIÓN PRINCIPAL: Buscar usuario por rol y credenciales
export async function findAuthByRole({ role, username }) {
  switch (role) {
    
    case 'Responsable de Area':
      // 🔹 BUSCAR RESPONSABLE DE ÁREA por nombre de usuario
      return prisma.responsable_area.findUnique({
        where: { 
          usuario_responsable: username //  Campo único: usuario_responsable
        },
        select: {
          id_responsable: true,        // ID único del responsable
          usuario_responsable: true,   //  Nombre de usuario para login
          pass_responsable: true,      //  Contraseña (texto plano temporal)
          id_area: true,               //  Área asignada
          nombres_evaluador: true,     //  Nombres (NOTA: posible error de nombre)
          apellidos: true,             //  Apellidos
          correo_electronico: true,    //  Email de contacto
        },
      });

    case 'Administrador':
      // 🔹 BUSCAR ADMINISTRADOR por email
      return prisma.administrador.findUnique({
        where: { 
          correo_admin: username //  Usar email como identificador
        },
        select: {
          id_administrador: true,      //  ID único del administrador
          correo_admin: true,          //  Email (funciona como username)
          nombre_admin: true,          //  Nombre del administrador
          apellido_admin: true,        //  Apellido del administrador
          id_area: true,               //  Área asignada (puede ser null)
          estado: true,                //  Estado activo/inactivo
        },
      });

    case 'Coordinador Area':
      //  BUSCAR COORDINADOR por ID (TEMPORAL)
      return prisma.coordinador_area.findUnique({
        where: { 
          //  ENFOQUE TEMPORAL: Usar ID como username
          //  PROBLEMA: Requiere que el usuario sepa su ID numérico
          id_coordinador: BigInt(username) //  Convertir string a BigInt
        },
        select: {
          id_coordinador: true,        //  ID único del coordinador
          nombre_coordinador: true,    //  Nombre del coordinador
          apellidos_coordinador: true, //  Apellidos del coordinador
          id_area: true,               //  Área asignada
        },
      });

    case 'Evaluador':
      //  BUSCAR EVALUADOR por ID (TEMPORAL)
      return prisma.evaluador.findUnique({
        where: { 
          //  ENFOQUE TEMPORAL: Usar ID como username
          //  PROBLEMA: Requiere que el usuario sepa su ID numérico
          id_evaluador: BigInt(username) // Convertir string a BigInt
        },
        select: {
          id_evaluador: true,          // ID único del evaluador
          nombre_evaluado: true,       // Nombre (NOTA: posible error "evaluado" vs "evaluador")
          apellidos_evaluador: true,   // Apellidos del evaluador
          id_area: true,               //  Área asignada
        },
      });

    default:
      //  ROL NO RECONOCIDO
      return null;
  }
}