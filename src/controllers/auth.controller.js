// 📂 src/controllers/auth.controller.js
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import prisma from "../config/prisma.js";

const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "2h" });

const ROL_MAP = {
  ADMIN: "ADMIN",
  COORDINADOR: "COORDINADOR",
  RESPONSABLE: "RESPONSABLE",
  EVALUADOR: "EVALUADOR",
};

//  Transporter de nodemailer (usa tu EMAIL_USER / EMAIL_PASS del .env)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465, // SSL
  secure: true, // true para 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    //  SOLO PARA DESARROLLO: ignora certificados self-signed
    rejectUnauthorized: false,
  },
});

// Login
export async function login(req, res, next) {
  try {
    const { username, password, role } = req.body;
    console.log(" Datos recibidos:", { username, password, role });

    if (!username || !password) {
      return res
        .status(400)
        .json({ ok: false, error: "username y password son requeridos" });
    }

    if (process.env.AUTH_MOCK === "1") {
      console.log(" Usando MODO MOCK");
      const user = {
        id: 999,
        username,
        role: role || "Administrador",
        id_area: 0,
      };

      const token = signToken({
        id_usuario: user.id,
        role: user.role,
        id_area: user.id_area,
        id_coordinador: null,
        id_responsable: null,
        id_evaluador: null,
      });

      return res.json({ ok: true, token, usuario: user });
    }

    console.log(
      " Buscando usuario en tabla usuario por correo (username)..."
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

    console.log(" Usuario encontrado:", usuario);

    if (!usuario) {
      return res
        .status(404)
        .json({ ok: false, error: "Usuario no encontrado" });
    }

    if (usuario.estado !== "ACTIVO") {
      return res.status(403).json({ ok: false, error: "Usuario inactivo" });
    }

    const isValid = usuario.passwordHash === password;

    console.log(" passwordHash almacenado:", usuario.passwordHash);
    console.log(" password recibido:", password);
    console.log(" Coinciden?", isValid);

    if (!isValid) {
      return res
        .status(400)
        .json({ ok: false, error: "Credenciales inválidas" });
    }

    const mappedRole = ROL_MAP[usuario.rol] || usuario.rol;

    // Datos base del usuario (se sobreescriben según rol)
    let userData = {
      id: Number(usuario.id_usuario),
      id_usuario: Number(usuario.id_usuario),
      username: usuario.correo,
      nombre: usuario.nombre,
      apellidos: usuario.apellido,
      email: usuario.correo,
      id_area: null,
    };

    // Estos se usarán para el payload del token
    let id_area_token = null;
    let id_responsable_token = null;
    let id_coordinador_token = null;
    let id_evaluador_token = null;

    switch (usuario.rol) {
      case "ADMIN": {
        const admin = usuario.administrador;
        if (admin) {
          userData = {
            id: Number(admin.id_administrador),
            id_usuario: Number(usuario.id_usuario),
            username: admin.correo_admin,
            nombre: admin.nombre_admin,
            apellidos: admin.apellido_admin,
            email: admin.correo_admin,
            id_area: admin.id_area ? Number(admin.id_area) : null,
          };
          id_area_token = admin.id_area ? Number(admin.id_area) : null;
        }
        break;
      }

      case "COORDINADOR": {
        const coord = usuario.coordinador_area;

        userData = {
          id: Number(usuario.id_usuario),
          id_usuario: Number(usuario.id_usuario),

          id_coordinador: coord ? Number(coord.id_coordinador) : null,
          id_area: coord ? Number(coord.id_area) : null,

          username: usuario.correo,
          nombre: usuario.nombre,
          apellidos: usuario.apellido,
          email: usuario.correo,
        };

        if (coord) {
          id_coordinador_token = Number(coord.id_coordinador);
          id_area_token = Number(coord.id_area);
        }
        break;
      }

      case "RESPONSABLE": {
        const resp = usuario.responsable_area;
        if (resp) {
          userData = {
            id: Number(resp.id_usuario),
            id_usuario: Number(usuario.id_usuario),
            username: usuario.correo,
            nombre: resp.nombres_evaluador,
            apellidos: resp.apellidos,
            id_area: Number(resp.id_area),
            email: resp.correo_electronico,
          };
          id_area_token = Number(resp.id_area);
          // Modelo tiene ese formato
          // id_responsable_token = Number(resp.id_responsable);
        }
        break;
      }

      case "EVALUADOR": {
        const evalua = usuario.evaluador;
        if (evalua) {
          userData = {
            id: Number(evalua.id_evaluador),     // id interno de evaluador
            id_usuario: Number(usuario.id_usuario),
            username: usuario.correo,
            nombre: evalua.nombre_evaluado,
            apellidos: evalua.apellidos_evaluador,
            id_area: Number(evalua.id_area),
            email: usuario.correo,
          };

          id_evaluador_token = Number(evalua.id_evaluador); 
          id_area_token = Number(evalua.id_area);
        }
        break;
      }

      default: {
        userData = {
          id: Number(usuario.id_usuario),
          id_usuario: Number(usuario.id_usuario),
          username: usuario.correo,
          nombre: usuario.nombre,
          apellidos: usuario.apellido,
          email: usuario.correo,
          id_area: null,
        };
        break;
      }
    }

    console.log(" userData final:", userData);
    console.log(" rol (enum):", usuario.rol, "-> rol (string):", mappedRole);

    const tokenPayload = {
        id_usuario: Number(usuario.id_usuario),   // para getMe
        role: mappedRole,
        id_area: userData.id_area ?? null,

        // si fuera responsable:
        id_responsable: usuario.responsable_area
          ? Number(usuario.responsable_area.id_responsable)
          : null,

        // si fuera coordinador:
        id_coordinador: usuario.coordinador_area
          ? Number(usuario.coordinador_area.id_coordinador)
          : null,

        //  ESTE es el importante para mostrar evaluaciones filtradas
        id_evaluador: usuario.evaluador
          ? Number(usuario.evaluador.id_evaluador)
          : null,
      };

    const token = signToken(tokenPayload);

    return res.json({
      ok: true,
      token,
      usuario: {
        ...userData,
        rol: mappedRole,
      },
    });
  } catch (e) {
    console.error(" Error en login:", e);
    next(e);
  }
}

// forgot password - enviar código de recuperación
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
    console.error(" Error en sendResetCode:", e);
    return res.status(500).json({ ok: false, error: "Error enviando código" });
  }
}

// Verificar codigo de recuperación

//  VERIFICAR CÓDIGO DE RECUPERACIÓN
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
    console.error(" Error verificando código:", err);
    return res.status(500).json({ ok: false, error: "Error de servidor" });
  }
}

//  RESET PASSWORD
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

    //  GUARDAR SIN HASH (como usas ahora)
    await prisma.usuario.update({
      where: { id_usuario: usuario.id_usuario },
      data: {
        passwordHash: password,
      },
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error(" Error al resetear contraseña:", err);
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
  // Get pero de usuario actual
export async function getMe(req, res) {
  try {
    const userId = req.user?.id_usuario;

    if (!userId) {
      return res.status(401).json({
        ok: false,
        error: 'No autenticado'
      });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario: BigInt(userId) },
      include: {
        administrador: true,
        coordinador_area: true,
        responsable_area: true,
        evaluador: true,
      },
    });

    if (!usuario) {
      return res.status(404).json({ ok: false, error: 'Usuario no encontrado' });
    }

    if (usuario.estado !== 'ACTIVO') {
      return res.status(403).json({ ok: false, error: 'Usuario inactivo' });
    }

    const mappedRole = ROL_MAP[usuario.rol] || usuario.rol;

    let userData = {
      id: Number(usuario.id_usuario),
      username: usuario.correo,
      nombre: usuario.nombre,
      apellidos: usuario.apellido,
      apellido: usuario.apellido,
      email: usuario.correo,
      id_area: null,
      rol: mappedRole
    };

    switch (usuario.rol) {
      case 'ADMIN': {
        const admin = usuario.administrador;
        if (admin) {
          userData = {
            ...userData,
            id: Number(admin.id_administrador),
            username: admin.correo_admin,
            nombre: admin.nombre_admin,
            apellidos: admin.apellido_admin,
            apellido: admin.apellido_admin,
            email: admin.correo_admin,
            id_area: admin.id_area ? Number(admin.id_area) : null,
          };
        }
        break;
      }

      case "COORDINADOR": {
          const coord = usuario.coordinador_area;
          userData = {
            id: Number(usuario.id_usuario),
            id_usuario: Number(usuario.id_usuario),
            id_coordinador: coord ? Number(coord.id_coordinador) : null,
            id_area: coord ? Number(coord.id_area) : null,   
            username: usuario.correo,
            nombre: usuario.nombre,
            apellidos: usuario.apellido,
            email: usuario.correo,
          };
          break;
        }

      case 'RESPONSABLE': {
        const resp = usuario.responsable_area;
        if (resp) {
          userData = {
            ...userData,
            id: Number(resp.id_usuario),
            nombre: resp.nombres_evaluador,
            apellidos: resp.apellidos,
            apellido: resp.apellidos,
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
            ...userData,
            id: Number(evalua.id_evaluador),
            nombre: evalua.nombre_evaluado,
            apellidos: evalua.apellidos_evaluador,
            apellido: evalua.apellidos_evaluador,
            id_area: Number(evalua.id_area),
          };
        }
        break;
      }
    }

    return res.json({ ok: true, usuario: userData });

  } catch (error) {
    console.error(' Error en getMe:', error);
    return res.status(500).json({
      ok: false,
      error: 'Error al obtener datos del usuario'
    });
  }
}
