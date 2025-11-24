import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

export async function login(req, res) {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({ ok: false, error: "correo y password requeridos" });
    }

    const user = await prisma.usuario.findUnique({
      where: { correo },
      include: {
        administrador: true,
        coordinador_area: true,
        responsable_area: true,
        evaluador: true,
      },
    });

    if (!user) {
      return res.status(404).json({ ok: false, error: "Credenciales inválidas" });
    }

    const valid = password === user.passwordHash;


    if (!valid) {
      return res.status(400).json({ ok: false, error: "Credenciales inválidas" });
    }

    // ... genera token y responde { ok: true, token, usuario: { ... } }

    // 3️⃣ Preparar datos por rol
    let rolData = null;

    switch (user.rol) {
      case "ADMIN":
        rolData = user.administrador;
        break;

      case "COORDINADOR":
        rolData = user.coordinador_area;
        break;

      case "RESPONSABLE":
        rolData = user.responsable_area;
        break;

      case "EVALUADOR":
        rolData = user.evaluador;
        break;
    }

    // 4️⃣ Crear token
    const tokenPayload = {
      id_usuario: user.id_usuario,
      rol: user.rol,
      id_area: rolData?.id_area || null
    };

    const token = signToken(tokenPayload);

    return res.json({
      ok: true,
      token,
      usuario: {
        id_usuario: user.id_usuario,
        nombre: user.nombre,
        apellido: user.apellido,
        correo: user.correo,
        rol: user.rol,
        rolInfo: rolData
      }
    });

  } catch (err) {
    console.error("Error LOGIN =>", err);
    return res.status(500).json({ ok: false, error: "Error interno" });
  }
}
export async function register(req, res) {
  try {
    const {
      nombre,      // Recibir nombre por separado
      apellido,    // Recibir apellido por separado
      correo,
      password,
      telefono,
      fechaNacimiento, // formato: "YYYY-MM-DD"
    } = req.body;

    if (!nombre || !apellido || !correo || !password) {
      return res
        .status(400)
        .json({ ok: false, error: 'Nombre, apellido, correo y password son requeridos' });
    }

    // ¿ya existe ese correo?
    const exists = await prisma.usuario.findUnique({ where: { correo } });
    if (exists) {
      return res.status(400).json({ ok: false, error: 'El correo ya está registrado' });
    }

    // Crear usuario con nombre y apellido separados
    const nuevo = await prisma.usuario.create({
      data: {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        correo: correo.trim(),
        passwordHash: password,
        telefono: telefono || null,
        fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null,
        rol: 'COMPETIDOR',
        estado: 'ACTIVO',
      },
    });

    return res.status(201).json({ ok: true, usuario: nuevo });
  } catch (err) {
    console.error('Error en register:', err);
    return res.status(500).json({ ok: false, error: 'Error interno al registrar' });
  }
}