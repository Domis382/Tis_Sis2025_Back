// 📂 src/controllers/auth.controller.js

import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';

// Si luego quieres usar bcrypt, lo reactivamos
// import bcrypt from 'bcryptjs';

const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' });

// Mapa de enum rol_t -> rol string que usas en el front / middleware
const ROL_MAP = {
  ADMIN: 'Administrador',
  COORDINADOR: 'Coordinador Area',
  RESPONSABLE: 'Responsable de Area',
  EVALUADOR: 'Evaluador',
};

/**
 * LOGIN usando la tabla USUARIO
 * - username = correo
 * - password = passwordHash (por ahora texto plano)
 */
export async function login(req, res, next) {
  try {
    const { username, password, role } = req.body;
    console.log('📨 Datos recibidos:', { username, password, role });

    if (!username || !password) {
      return res
        .status(400)
        .json({ ok: false, error: 'username y password son requeridos' });
    }

    // 🔧 MODO MOCK (opcional)
    if (process.env.AUTH_MOCK === '1') {
      console.log('🔧 Usando MODO MOCK');
      const user = {
        id: 999,
        username,
        role: role || 'Administrador',
        id_area: 0,
      };
      const token = signToken(user);
      return res.json({ ok: true, token, user });
    }

    console.log('🔍 Buscando usuario en tabla usuario por correo (username)...');

    // username lo tomamos como CORREO
    const usuario = await prisma.usuario.findUnique({
      where: { correo: username },
      include: {
        administrador: true,
        coordinador_area: true,
        responsable_area: true,
        evaluador: true,
      },
    });

    console.log('👤 Usuario encontrado:', usuario);

    if (!usuario) {
      return res
        .status(404)
        .json({ ok: false, error: 'Usuario no encontrado' });
    }

    if (usuario.estado !== 'ACTIVO') {
      return res
        .status(403)
        .json({ ok: false, error: 'Usuario inactivo' });
    }

    // 🧾 Validación de contraseña
    // Por ahora: comparación en plano contra passwordHash
    // Luego podemos cambiar a bcrypt.compare(password, usuario.passwordHash)
    const isValid = usuario.passwordHash === password;

    // Si quieres ver el valor:
    console.log('🔐 passwordHash almacenado:', usuario.passwordHash);
    console.log('🔐 password recibido:', password);
    console.log('✅ Coinciden?', isValid);

    if (!isValid) {
      return res
        .status(400)
        .json({ ok: false, error: 'Credenciales inválidas' });
    }

    // 🧠 Determinar el rol "string" que usarán middleware y front
    const mappedRole = ROL_MAP[usuario.rol] || usuario.rol;

    // 🧬 Armar userData según el rol real del usuario
    let userData = {
      id: Number(usuario.id_usuario),
      username: usuario.correo,
      nombre: usuario.nombre,
      apellidos: usuario.apellido,
      email: usuario.correo,
      id_area: null,
    };

    switch (usuario.rol) {
      case 'ADMIN': {
        const admin = usuario.administrador;
        if (admin) {
          userData = {
            id: Number(admin.id_administrador),
            username: admin.correo_admin,
            nombre: admin.nombre_admin,
            apellidos: admin.apellido_admin,
            email: admin.correo_admin,
            id_area: admin.id_area ? Number(admin.id_area) : null,
          };
        }
        break;
      }

      case 'COORDINADOR': {
        const coord = usuario.coordinador_area;
        if (coord) {
          userData = {
            id: Number(coord.id_coordinador),
            // aquí podrías usar coord.usuario_coordinador si quieres mantenerlo
            username: usuario.correo,
            nombre: coord.nombre_coordinador,
            apellidos: coord.apellidos_coordinador,
            id_area: Number(coord.id_area),
            email: usuario.correo,
          };
        }
        break;
      }

      case 'RESPONSABLE': {
        const resp = usuario.responsable_area;
        if (resp) {
          userData = {
            id: Number(resp.id_responsable),
            username: usuario.correo,
            nombre: resp.nombres_evaluador,
            apellidos: resp.apellidos,
            id_area: Number(resp.id_area),
            email: resp.correo_electronico,
          };
        }
        break;
      }

      case 'EVALUADOR': {
        const evalua = usuario.evaluador;
        if (evalua) {
          userData = {
            id: Number(evalua.id_evaluador),
            username: usuario.correo,
            nombre: evalua.nombre_evaluado,
            apellidos: evalua.apellidos_evaluador,
            id_area: Number(evalua.id_area),
            email: usuario.correo,
          };
        }
        break;
      }

      default:
        // COMPETIDOR u otros
        userData = {
          id: Number(usuario.id_usuario),
          username: usuario.correo,
          nombre: usuario.nombre,
          apellidos: usuario.apellido,
          email: usuario.correo,
          id_area: null,
        };
        break;
    }

    console.log('✅ userData final:', userData);
    console.log('✅ rol (enum):', usuario.rol, '-> rol (string):', mappedRole);

    // 🔑 Generar token JWT
    const tokenPayload = {
      ...userData,
      role: mappedRole, // mantienes el formato que usa tu authMiddleware
    };

    const token = signToken(tokenPayload);

    return res.json({
      ok: true,
      token,
      user: userData,
    });
  } catch (e) {
    console.error('❌ Error en login:', e);
    next(e);
  }
}
