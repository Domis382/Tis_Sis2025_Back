//  src/middlewares/authMiddleware.js

// Importamos la librería jsonwebtoken para verificar tokens JWT
import jwt from 'jsonwebtoken';

// Exportamos el middleware como función con roles opcionales
//  Se usa así: app.use('/ruta', authMiddleware(['Administrador', 'Coordinador Area']))
export const authMiddleware = (roles = []) => (req, res, next) => {
  
  // Obtenemos el header Authorization que debería venir como: "Bearer <token>"
  const raw = req.headers.authorization || '';
  
  // Si el header empieza con "Bearer ", quitamos esa parte y nos quedamos con el token
  const token = raw.startsWith('Bearer ') ? raw.slice(7) : null;

  // Si no hay token, devolvemos un error 401 (no autorizado)
  if (!token) {
    return res.status(401).json({ ok: false, error: 'Token requerido' });
  }

  try {
    // Verificamos que el token sea válido usando la clave secreta del backend
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Si se especificaron roles permitidos, comprobamos que el rol del usuario esté incluido
    if (roles.length && !roles.includes(decoded.role)) {
      return res.status(403).json({ ok: false, error: 'Acceso denegado por rol' });
    }

    // Guardamos los datos del usuario decodificado en la request (para usarlos en controladores)
    req.user = decoded;

    // Si todo está bien, continuamos con el siguiente middleware o controlador
    next();

  } catch {
    // Si ocurre un error al verificar (token inválido o expirado), devolvemos 401
    return res.status(401).json({ ok: false, error: 'Token inválido o expirado' });
  }
};
