//Captura errores globales.

export function errorHandler(err, req, res, next) {
  console.error('❌ Error:', err.message);
  res.status(500).json({
    ok: false,
    error: err.message || 'Error interno del servidor',
  });
}
