//Respuestas estándar para el backend.

export function successResponse(res, data, status = 200) {
  return res.status(status).json({ ok: true, data });
}

export function errorResponse(res, message, status = 400) {
  return res.status(status).json({ ok: false, message });
}
