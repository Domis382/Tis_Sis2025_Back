// src/middlewares/auth.js
import { authMiddleware } from "./authMiddleware.js";

// Antes: requireRole(roleNeeded) con STUB_ROLE
// Ahora: wrapper sobre el middleware real de JWT
export function requireRole(...roles) {
  return authMiddleware(roles);
}