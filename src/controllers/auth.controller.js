// src/controllers/auth.controller.js
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { findAuthByRole } from '../repositories/user.repository.js';

const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' });

export async function login(req, res, next) {
  try {
    const { username, password, role } = req.body;
    if (!username || !password || !role) {
      return res.status(400).json({ ok: false, error: 'username, password y role son requeridos' });
    }

    // >>>>>>>>> MODO MOCK (sin BD) <<<<<<<<<
    if (process.env.AUTH_MOCK === '1') {
      const user = {
        id: 999,                 // id ficticio
        username,                // lo que envíes en Postman
        role,                    // p.ej. "Responsable de Area"
        id_area: 0,
      };
      const token = signToken(user);
      return res.json({ ok: true, token, user });
    }
    // >>>>>>>>> FIN MODO MOCK <<<<<<<<<

    // --- flujo real con BD (queda igual) ---
    const user = await findAuthByRole({ role, username });
    if (!user) return res.status(404).json({ ok: false, error: 'Usuario no encontrado para ese rol' });

    if (role === 'Responsable de Area') {
      const ok = await bcrypt.compare(password, user.pass_responsable);
      if (!ok) return res.status(400).json({ ok: false, error: 'Credenciales inválidas' });

      const token = signToken({
        id: user.id_responsable,
        role,
        username: user.usuario_responsable,
        id_area: user.id_area,
      });

      return res.json({
        ok: true,
        token,
        user: {
          id: user.id_responsable,
          role,
          username: user.usuario_responsable,
          id_area: user.id_area,
        },
      });
    }

    return res.status(501).json({ ok: false, error: `Login no implementado para rol: ${role}` });
  } catch (e) {
    next(e);
  }
}
