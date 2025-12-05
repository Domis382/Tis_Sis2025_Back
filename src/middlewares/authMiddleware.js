// src/middlewares/authMiddleware.js
import jwt from "jsonwebtoken";

/**
 * Middleware de autenticación con JWT.
 * 
 * Uso:
 *   router.use('/ruta', authMiddleware(['ADMIN', 'COORDINADOR']), handler);
 *   router.use('/ruta', authMiddleware(), handler); // solo requiere token válido
 *
 * - Verifica el token JWT del header Authorization: Bearer <token>
 * - Normaliza el rol del token a MAYÚSCULAS
 * - Compara contra la lista de roles permitidos (también en MAYÚSCULAS)
 * - Si todo va bien, deja req.user con el payload decodificado + role normalizado
 */
export const authMiddleware = (roles = []) => (req, res, next) => {
  const raw = req.headers.authorization || "";
  const token = raw.startsWith("Bearer ") ? raw.slice(7) : null;

  if (!token) {
    return res.status(401).json({ ok: false, error: "Token requerido" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Normalizamos el rol del usuario a mayúsculas
    const userRole = (decoded.role || "").toUpperCase();

    // Si se pasaron roles permitidos, comparamos en mayúsculas
    if (roles.length) {
      const allowed = roles.map((r) => r.toUpperCase());
      if (!allowed.includes(userRole)) {
        return res
          .status(403)
          .json({ ok: false, error: "Acceso denegado por rol" });
      }
    }

    // Guardamos datos del usuario en la request
    req.user = { ...decoded, role: userRole };
    next();
  } catch (err) {
    console.error("Error verificando token:", err.message);
    return res
      .status(401)
      .json({ ok: false, error: "Token inválido o expirado" });
  }
};
