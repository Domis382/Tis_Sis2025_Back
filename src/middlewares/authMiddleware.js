//  MIDDLEWARE DE AUTORIZACIÓN: Control de acceso por roles
// src/middlewares/auth.js

//  MIDDLEWARE PARA REQUERIR ROL ESPECÍFICO
export function requireRole(roleNeeded) {
  return (req, res, next) => {
    //  MODO DESARROLLO/STUB: Usar variables de entorno para simular usuario
    const role = process.env.STUB_ROLE || 'COORDINADOR'; // Rol simulado por defecto
    const coordId = Number(process.env.STUB_COORDINADOR_ID || '1'); //  ID simulado por defecto

    //  SIMULAR USUARIO AUTENTICADO (PARA PRUEBAS)
    req.user = { 
      rol: role, 
      id_coordinador: coordId 
    };

    //  VALIDACIÓN DE AUTORIZACIÓN
    if (!req.user || req.user.rol !== roleNeeded) {
      return res.status(403).json({ 
        ok: false, 
        message: 'No autorizado' 
      });
    }
    
    // CONTINUAR AL SIGUIENTE MIDDLEWARE/CONTROLADOR
    next();
  };
}