// 📂 src/controllers/auth.controller.js
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import prisma from "../config/prisma.js";

const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "2h" });

const ROL_MAP = {
  ADMIN: "Administrador",
  COORDINADOR: "Coordinador Area",
  RESPONSABLE: "Responsable de Area",
  EVALUADOR: "Evaluador",
};

// 🔹 Transporter de nodemailer (usa tu EMAIL_USER / EMAIL_PASS del .env)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465, // SSL
  secure: true, // true para 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    // ⚠ SOLO PARA DESARROLLO: ignora certificados self-signed
    rejectUnauthorized: false,
  },
});

// ================== LOGIN ==================
export async function login(req, res, next) {
  try {
    const { username, password, role } = req.body;
    console.log("📨 Datos recibidos:", { username, password, role });

    if (!username || !password) {
      return res
        .status(400)
        .json({ ok: false, error: "username y password son requeridos" });
    }

    if (process.env.AUTH_MOCK === "1") {
      console.log("🔧 Usando MODO MOCK");
      const user = {
        id: 999,
        username,
        role: role || "Administrador",
        id_area: 0,
      };
      const token = signToken(user);
      return res.json({ ok: true, token, user });
    }

    console.log(
      "🔍 Buscando usuario en tabla usuario por correo (username)..."
    );

    const usuario = await prisma.usuario.findUnique({
      where: { correo: username },
      include: {
        administrador: true,
        coordinador_area: true,
        responsable_area: true,
        evaluador: true,
      },
    });

    console.log("👤 Usuario encontrado:", usuario);

    if (!usuario) {
      return res
        .status(404)
        .json({ ok: false, error: "Usuario no encontrado" });
    }

    if (usuario.estado !== "ACTIVO") {
      return res.status(403).json({ ok: false, error: "Usuario inactivo" });
    }

    const isValid = usuario.passwordHash === password;

    console.log("🔐 passwordHash almacenado:", usuario.passwordHash);
    console.log("🔐 password recibido:", password);
    console.log("✅ Coinciden?", isValid);

    if (!isValid) {
      return res
        .status(400)
        .json({ ok: false, error: "Credenciales inválidas" });
    }

    const mappedRole = ROL_MAP[usuario.rol] || usuario.rol;

    let userData = {
      id: Number(usuario.id_usuario),
      username: usuario.correo,
      nombre: usuario.nombre,
      apellidos: usuario.apellido,
      email: usuario.correo,
      id_area: null,
    };

    switch (usuario.rol) {
      case "ADMIN": {
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

      case "COORDINADOR": {
        const coord = usuario.coordinador_area;

        // Para cualquier rol, `id` será SIEMPRE el id_usuario
        userData = {
          id: Number(usuario.id_usuario), // 👈 clave para req.user.id
          id_usuario: Number(usuario.id_usuario), // opcional pero útil

          // info extra del rol
          id_coordinador: coord ? Number(coord.id_coordinador) : null,
          id_area: coord ? Number(coord.id_area) : null,

          username: usuario.correo,
          nombre: usuario.nombre,
          apellidos: usuario.apellido,
          email: usuario.correo,
        };
        break;
      }

      case "RESPONSABLE": {
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

      case "EVALUADOR": {
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

    console.log("✅ userData final:", userData);
    console.log("✅ rol (enum):", usuario.rol, "-> rol (string):", mappedRole);

    const tokenPayload = {
      ...userData,
      role: mappedRole,
    };

    const token = signToken(tokenPayload);

    {
      /*return res.json({
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
    */
    }
    return res.json({
      ok: true,
      token,
      usuario: {
        ...userData,
        rol: mappedRole,
      },
    });
  } catch (e) {
    console.error("❌ Error en login:", e);
    next(e);
  }
}

// ================== FORGOT PASSWORD ==================
export async function sendResetCode(req, res) {
  try {
    const { correo } = req.body;
    if (!correo) {
      return res
        .status(400)
        .json({ ok: false, error: "El correo es obligatorio" });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { correo },
    });

    if (!usuario) {
      return res
        .status(404)
        .json({ ok: false, error: "No existe un usuario con ese correo" });
    }

    // Código de 6 dígitos
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.password_reset.create({
      data: {
        userId: usuario.id_usuario,
        code: resetCode,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: correo,
      subject: "Código de recuperación de contraseña",
      text: `Tu código de recuperación es: ${resetCode}`,
    };

    await transporter.sendMail(mailOptions);

    return res.json({ ok: true, message: "Código enviado correctamente" });
  } catch (e) {
    console.error("❌ Error en sendResetCode:", e);
    return res.status(500).json({ ok: false, error: "Error enviando código" });
  }
}

// ================== VERIFY CODE ==================

// 📌 VERIFICAR CÓDIGO DE RECUPERACIÓN
export async function verifyResetCode(req, res) {
  try {
    const { correo, code } = req.body;

    if (!correo || !code) {
      return res.status(400).json({ ok: false, error: "Datos incompletos" });
    }

    // Buscar usuario
    const usuario = await prisma.usuario.findUnique({
      where: { correo },
    });

    if (!usuario) {
      return res
        .status(404)
        .json({ ok: false, error: "Usuario no encontrado" });
    }

    // Buscar código válido
    const registro = await prisma.password_reset.findFirst({
      where: {
        userId: usuario.id_usuario,
        code,
        used: false,
        expiresAt: { gte: new Date() }, // no expirado
      },
    });

    if (!registro) {
      return res
        .status(400)
        .json({ ok: false, error: "Código inválido o expirado" });
    }

    // Marcar como usado
    await prisma.password_reset.update({
      where: { id_reset: registro.id_reset },
      data: { used: true },
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error("❌ Error verificando código:", err);
    return res.status(500).json({ ok: false, error: "Error de servidor" });
  }
}

// 📌 RESET PASSWORD
export async function resetPassword(req, res) {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({ ok: false, error: "Datos incompletos" });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { correo },
    });

    if (!usuario) {
      return res
        .status(404)
        .json({ ok: false, error: "Usuario no encontrado" });
    }

    // 🔥 GUARDAR SIN HASH (como usas ahora)
    await prisma.usuario.update({
      where: { id_usuario: usuario.id_usuario },
      data: {
        passwordHash: password,
      },
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error("❌ Error al resetear contraseña:", err);
    return res.status(500).json({ ok: false, error: "Error de servidor" });
  }
}
export async function register(req, res) {
  try {
    const {
      nombre, // Recibir nombre por separado
      apellido, // Recibir apellido por separado
      correo,
      password,
      telefono,
      fechaNacimiento, // formato: "YYYY-MM-DD"
    } = req.body;

    if (!nombre || !apellido || !correo || !password) {
      return res
        .status(400)
        .json({
          ok: false,
          error: "Nombre, apellido, correo y password son requeridos",
        });
    }

    // ¿ya existe ese correo?
    const exists = await prisma.usuario.findUnique({ where: { correo } });
    if (exists) {
      return res
        .status(400)
        .json({ ok: false, error: "El correo ya está registrado" });
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
        rol: "COMPETIDOR",
        estado: "ACTIVO",
      },
    });

    return res.status(201).json({ ok: true, usuario: nuevo });
  } catch (err) {
    console.error("Error en register:", err);
    return res
      .status(500)
      .json({ ok: false, error: "Error interno al registrar" });
  }
}
