// 📂 src/controllers/auth.controller.js

// Importaciones de librerías y funciones necesarias
import jwt from 'jsonwebtoken';                 // Para generar y verificar tokens JWT
import bcrypt from 'bcryptjs';                  // Para cifrar y comparar contraseñas (aunque aquí algunas son temporales)
import { findAuthByRole } from '../repositories/user.repository.js'; // Función que busca el usuario según su rol


// Función para generar un token JWT con un payload determinado

const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' }); 
// El token expira en 2 horas y se firma con la clave secreta del .env


// Controlador principal para el inicio de sesión (login)

export async function login(req, res, next) {
  try {
    // Extraemos los datos enviados desde el frontend
    const { username, password, role } = req.body;
    console.log('📨 Datos recibidos:', { username, password, role });

    // Validación básica: si faltan datos requeridos
    if (!username || !password || !role) {
      return res.status(400).json({ ok: false, error: 'username, password y role son requeridos' });
    }

 
    //  MODO MOCK (modo de prueba sin conexión a BD)
    if (process.env.AUTH_MOCK === '1') {
      console.log('🔧 Usando MODO MOCK');
      const user = {
        id: 999,
        username,
        role,
        id_area: 0,
      };
      const token = signToken(user);
      return res.json({ ok: true, token, user });
    }


    //  Flujo real con la base de datos
 
    console.log(' Buscando usuario en BD...');
    const user = await findAuthByRole({ role, username }); // Busca usuario según el rol
    console.log(' Usuario encontrado:', user);

    // Si no se encontró usuario
    if (!user) {
      console.log(' Usuario no encontrado');
      return res.status(404).json({ ok: false, error: 'Usuario no encontrado para ese rol' });
    }

    
    //  Validar credenciales según el tipo de rol
    
    console.log(' Validando credenciales...');
    let isValid = false; // bandera de validación
    let userData = {};   // datos que se incluirán en el token y respuesta

    // Dependiendo del rol, se arma la estructura del usuario y cómo validar la contraseña
    switch (role) {

  
      // Rol: RESPONSABLE DE ÁREA
     
      case 'Responsable de Area':
        // Comparar contraseña (aquí temporalmente sin hash)
        isValid = (password === user.pass_responsable);
        userData = {
          id: Number(user.id_responsable),
          username: user.usuario_responsable,
          nombre: user.nombres_evaluador,
          apellidos: user.apellidos,
          email: user.correo_electronico,
          id_area: Number(user.id_area),
        };
        break;

      // Rol: ADMINISTRADOR
      case 'Administrador':
        // Contraseña temporal igual al correo (mientras no se implemente hashing)
        isValid = (password === user.correo_admin);
        userData = {
          id: Number(user.id_administrador),
          username: user.correo_admin,
          nombre: user.nombre_admin,
          apellidos: user.apellido_admin,
          email: user.correo_admin,
          id_area: user.id_area ? Number(user.id_area) : null,
        };
        break;

      // Rol: COORDINADOR DE ÁREA
   
      case 'Coordinador Area':
        // Contraseña temporal fija
        isValid = (password === 'coordinador123');
        userData = {
          id: Number(user.id_coordinador),
          username: user.id_coordinador.toString(), // Se usa el ID como nombre de usuario
          nombre: user.nombre_coordinador,
          apellidos: user.apellidos_coordinador,
          id_area: Number(user.id_area),
        };
        break;

      
      // Rol: EVALUADOR
     
      case 'Evaluador':
        // Contraseña temporal fija
        isValid = (password === 'evaluador123');
        userData = {
          id: Number(user.id_evaluador),
          username: user.id_evaluador.toString(),
          nombre: user.nombre_evaluado,
          apellidos: user.apellidos_evaluador,
          id_area: Number(user.id_area),
        };
        break;

     
      // Rol no reconocido
     
      default:
        return res.status(400).json({ ok: false, error: 'Rol no válido' });
    }

    console.log(' Resultado validación:', isValid);

    // Si la contraseña no coincide
    if (!isValid) {
      return res.status(400).json({ ok: false, error: 'Credenciales inválidas' });
    }

    
    // 🔑 Generar token JWT y devolver respuesta
    
    const tokenPayload = {
      ...userData, // datos del usuario
      role: role,  // se incluye también el rol
    };

    const token = signToken(tokenPayload);

    // Devolvemos token + datos del usuario al frontend
    return res.json({
      ok: true,
      token,
      user: userData,
    });

  } catch (e) {
    // Si ocurre cualquier error no controlado
    console.error(' Error en login:', e);
    next(e); // lo envía al middleware global de errores
  }
}
