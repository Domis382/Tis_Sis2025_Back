// src/middlewares/errorHandler.js
export default function errorHandler(err, _req, res, _next) {
  // Prisma
  if (err.code && String(err.code).startsWith('P')) {
    return res.status(400).json({ ok: false, message: err.message });
  }
  // Genérico
  const status = err.status || 500;
  res.status(status).json({
    ok: false,
    message: err.message || 'Error inesperado',
  });
}
