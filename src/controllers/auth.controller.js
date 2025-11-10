//  CONTROLADOR DE AUTENTICACIÓN: Maneja el proceso de login del sistema

/*
// FUNCIÓN COMENTADA: Conversión de BigInt a String (para futuras necesidades)
function convertBigIntToString(obj) {
  if (typeof obj === 'bigint') {
    return obj.toString();
  }
  if (Array.isArray(obj)) {
    return obj.map(convertBigIntToString);
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, convertBigIntToString(value)])
    );
  }
  return obj;
}
*/

//  IMPORTACIONES: Librerías necesarias para autenticación
import jwt from 'jsonwebtoken'; //  Para generar tokens JWT
import bcrypt from 'bcryptjs'; //  Para hashing de contraseñas (no usado temporalmente)
import { findAuthByRole } from '../repositories/user.repository.js'; //  Repositorio de usuarios

//  FUNCIÓN PARA GENERAR TOKEN JWT
const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' }); //  Token expira en 2 horas

//  CONTROLADOR PRINCIPAL DE LOGIN
export async function login(req, res, next) {
  try {
    // 🔹 OBTENER DATOS DEL BODY: Credenciales del usuario
    const { username, password, role } = req.body;
    console.log('📨 Datos recibidos:', { username, password, role });

    //  VALIDACIÓN DE CAMPOS OBLIGATORIOS
    if (!username || !password || !role) {
      return res.status(400).json({ 
        ok: false, 
        error: 'username, password y role son requeridos' 
      });
    }

    // mock prot
    if (process.env.AUTH_MOCK === '1') {
      console.log('🔧 Usando MODO MOCK - Sin validación real');
      const user = {
        id: 999, // ID temporal
        username,
        role,
        id_area: 0, //  Área temporal
      };
      const token = signToken(user);
      return res.json({ 
        ok: true, 
        token, 
        user 
      });
    }

    // FLUJO REAL CON BASE DE DATOS 
    console.log(' Buscando usuario en BD...');
    const user = await findAuthByRole({ role, username });
    console.log(' Usuario encontrado:', user);

    //  VALIDAR SI EL USUARIO EXISTE
    if (!user) {
      console.log('Usuario no encontrado');
      return res.status(404).json({ 
        ok: false, 
        error: 'Usuario no encontrado para ese rol' 
      });
    }

    console.log(' Validando credenciales...');
    let isValid = false; //  Bandera de validación
    let userData = {}; //  Objeto para datos del usuario

    //  SWITCH POR ROL: Diferente lógica para cada tipo de usuario
    switch (role) {
      case 'Responsable de Area':
        //  VALIDACIÓN TEMPORAL: Contraseña en texto plano (CAMBIAR POR BCRYPT)
        isValid = (password === user.pass_responsable);
        userData = {
          id: Number(user.id_responsable), //  Convertir a número
          username: user.usuario_responsable,
          nombre: user.nombres_evaluador, // NOTA: Posible error en nombre de campo
          apellidos: user.apellidos,
          email: user.correo_electronico,
          id_area: Number(user.id_area), //  Convertir a número
        };
        break;

      case 'Administrador':
        //  VALIDACIÓN TEMPORAL: Usar email como contraseña (PROVISORIO)
        isValid = (password === user.correo_admin);
        userData = {
          id: Number(user.id_administrador),
          username: user.correo_admin,
          nombre: user.nombre_admin,
          apellidos: user.apellido_admin,
          email: user.correo_admin,
          id_area: user.id_area ? Number(user.id_area) : null, //  Área opcional
        };
        break;

      case 'Coordinador Area':
        //  VALIDACIÓN TEMPORAL: Contraseña fija (PROVISORIO)
        isValid = (password === 'coordinador123');
        userData = {
          id: Number(user.id_coordinador),
          username: user.id_coordinador.toString(), //  Usar ID como username
          nombre: user.nombre_coordinador,
          apellidos: user.apellidos_coordinador,
          id_area: Number(user.id_area),
        };
        break;

      case 'Evaluador':
        //  VALIDACIÓN TEMPORAL: Contraseña fija (PROVISORIO)
        isValid = (password === 'evaluador123');
        userData = {
          id: Number(user.id_evaluador),
          username: user.id_evaluador.toString(), //  Usar ID como username
          nombre: user.nombre_evaluado, //  NOTA: Posible error en nombre de campo
          apellidos: user.apellidos_evaluador,
          id_area: Number(user.id_area),
        };
        break;

      default:
        //  MANEJO DE ROL NO VÁLIDO
        return res.status(400).json({ 
          ok: false, 
          error: 'Rol no válido' 
        });
    }

    console.log(' Resultado validación:', isValid);

    //  VALIDAR CREDENCIALES
    if (!isValid) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Credenciales inválidas' 
      });
    }

    //  GENERAR TOKEN JWT
    const tokenPayload = {
      ...userData, // Incluir todos los datos del usuario
      role: role, // Agregar el rol al payload
    };

    const token = signToken(tokenPayload);

    //  RESPUESTA EXITOSA
    return res.json({
      ok: true,
      token,
      user: userData,
    });

  } catch (e) {
    //  MANEJO DE ERRORES GLOBAL
    console.error(' Error en login:', e);
    next(e); // 🔹 Pasar el error al middleware de manejo de errores
  }
}