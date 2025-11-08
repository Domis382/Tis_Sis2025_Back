
/*
// Función para convertir BigInt a Number
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
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { findAuthByRole } from '../repositories/user.repository.js';

const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' });

export async function login(req, res, next) {
  try {
    const { username, password, role } = req.body;
    console.log('📨 Datos recibidos:', { username, password, role });

    if (!username || !password || !role) {
      return res.status(400).json({ ok: false, error: 'username, password y role son requeridos' });
    }

    // >>>>>>>>> MODO MOCK <<<<<<<<<
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

    // --- flujo real con BD ---
    console.log('🔍 Buscando usuario en BD...');
    const user = await findAuthByRole({ role, username });
    console.log('👤 Usuario encontrado:', user);

    if (!user) {
      console.log('❌ Usuario no encontrado');
      return res.status(404).json({ ok: false, error: 'Usuario no encontrado para ese rol' });
    }

    console.log('🔐 Validando credenciales...');
    let isValid = false;
    let userData = {};

    switch (role) {
      case 'Responsable de Area':
        // Comparar contraseña (texto plano temporalmente)
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

      case 'Administrador':
        // Para admin, usar email como contraseña temporal
        isValid = (password === user.correo_admin); // Temporal
        userData = {
          id: Number(user.id_administrador),
          username: user.correo_admin,
          nombre: user.nombre_admin,
          apellidos: user.apellido_admin,
          email: user.correo_admin,
          id_area: user.id_area ? Number(user.id_area) : null,
        };
        break;

      case 'Coordinador Area':
        // Para coordinador, password temporal
        isValid = (password === 'coordinador123'); // Temporal
        userData = {
          id: Number(user.id_coordinador),
          username: user.id_coordinador.toString(), // Usar ID como username
          nombre: user.nombre_coordinador,
          apellidos: user.apellidos_coordinador,
          id_area: Number(user.id_area),
        };
        break;

      case 'Evaluador':
        // Para evaluador, password temporal  
        isValid = (password === 'evaluador123'); // Temporal
        userData = {
          id: Number(user.id_evaluador),
          username: user.id_evaluador.toString(), // Usar ID como username
          nombre: user.nombre_evaluado,
          apellidos: user.apellidos_evaluador,
          id_area: Number(user.id_area),
        };
        break;

      default:
        return res.status(400).json({ ok: false, error: 'Rol no válido' });
    }

    console.log('✅ Resultado validación:', isValid);

    if (!isValid) {
      return res.status(400).json({ ok: false, error: 'Credenciales inválidas' });
    }

    // Generar token
    const tokenPayload = {
      ...userData,
      role: role,
    };

    const token = signToken(tokenPayload);

    return res.json({
      ok: true,
      token,
      user: userData,
    });

  } catch (e) {
    console.error('💥 Error en login:', e);
    next(e);
  }
}