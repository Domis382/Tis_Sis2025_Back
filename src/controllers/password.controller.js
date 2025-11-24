// src/controllers/password.controller.js
import prisma from "../config/prisma.js";
import nodemailer from "nodemailer";

// genera un código de 6 dígitos
function generarCodigo() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// crea transporter de nodemailer usando tu .env
function crearTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

/**
 * 1) /api/password/forgot
 *    - recibe { correo }
 *    - genera código, guarda en password_reset, envía email
 */
export async function enviarCodigoReset(req, res) {
  try {
    const { correo } = req.body;
    console.log("📩 enviarCodigoReset -> correo:", correo);

    if (!correo) {
      return res
        .status(400)
        .json({ ok: false, error: "Correo requerido" });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { correo },
    });

    if (!usuario) {
      return res
        .status(404)
        .json({ ok: false, error: "Correo no registrado" });
    }

    const code = generarCodigo();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

    await prisma.password_reset.create({
      data: {
        userId: usuario.id_usuario,
        code,
        expiresAt,
      },
    });

    console.log("✅ Código generado:", code);

    const transporter = crearTransporter();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: correo,
      subject: "Código para recuperar contraseña",
      html: `
        <h2>Recuperación de contraseña</h2>
        <p>Tu código es:</p>
        <h1>${code}</h1>
        <p>Vence en 10 minutos.</p>
      `,
    });

    console.log("📨 Email enviado correctamente");

    return res.json({ ok: true, message: "Código enviado" });
  } catch (err) {
    console.error("❌ Error en enviarCodigoReset:", err);
    return res.status(500).json({
      ok: false,
      error: "Error interno al enviar código",
    });
  }
}

/**
 * 2) /api/password/verify
 *    - recibe { correo, code }
 *    - verifica que exista un password_reset válido
 */
export async function verificarCodigoReset(req, res) {
  try {
    const { correo, code } = req.body;
    console.log("🔎 verificarCodigoReset:", { correo, code });

    if (!correo || !code) {
      return res
        .status(400)
        .json({ ok: false, error: "Correo y código son requeridos" });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { correo },
    });

    if (!usuario) {
      return res
        .status(404)
        .json({ ok: false, error: "Usuario no encontrado" });
    }

    const registro = await prisma.password_reset.findFirst({
      where: {
        userId: usuario.id_usuario,
        code,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { id_reset: "desc" },
    });

    if (!registro) {
      return res
        .status(400)
        .json({ ok: false, error: "Código inválido o expirado" });
    }

    console.log("✅ Código válido");

    return res.json({ ok: true });
  } catch (err) {
    console.error("❌ Error en verificarCodigoReset:", err);
    return res
      .status(500)
      .json({ ok: false, error: "Error interno verificando código" });
  }
}

/**
 * 3) /api/password/reset
 *    - recibe { correo, password }
 *    - verifica el último código válido y marca used=true
 *    - actualiza la contraseña del usuario
 */
export async function resetearPassword(req, res) {
  try {
    const { correo, password } = req.body;
    console.log("🛠 resetearPassword:", { correo });

    if (!correo || !password) {
      return res
        .status(400)
        .json({ ok: false, error: "Correo y nueva contraseña son requeridos" });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { correo },
    });

    if (!usuario) {
      return res
        .status(404)
        .json({ ok: false, error: "Usuario no encontrado" });
    }

    const ultimoCodigo = await prisma.password_reset.findFirst({
      where: {
        userId: usuario.id_usuario,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { id_reset: "desc" },
    });

    if (!ultimoCodigo) {
      return res.status(400).json({
        ok: false,
        error: "No hay un código válido para este usuario",
      });
    }

    // ⚠️ POR AHORA guardamos en texto plano para ser consistentes
    await prisma.$transaction([
      prisma.usuario.update({
        where: { id_usuario: usuario.id_usuario },
        data: { passwordHash: password },
      }),
      prisma.password_reset.update({
        where: { id_reset: ultimoCodigo.id_reset },
        data: { used: true },
      }),
    ]);

    console.log("✅ Contraseña actualizada para", correo);

    return res.json({ ok: true, message: "Contraseña actualizada" });
  } catch (err) {
    console.error("❌ Error en resetearPassword:", err);
    return res
      .status(500)
      .json({ ok: false, error: "Error interno al cambiar contraseña" });
  }
}
