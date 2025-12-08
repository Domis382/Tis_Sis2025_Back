import { Router } from "express";
import { uploadFile } from "../middlewares/upload.js";
import * as c from "../controllers/import.controller.js";
import { requireRole } from "../middlewares/auth.js";
import * as inscritosCtrl from "../controllers/inscritos.controller.js";

const r = Router();

// Importante: primero uploadFile, luego requireRole
r.post(
  "/import/preview",
  uploadFile.single("file"),
  requireRole("COORDINADOR",'Responsable de Area'),
  c.previewFile
);
r.post(
  "/import",
  uploadFile.single("file"),
  requireRole("COORDINADOR",'Responsable de Area'),
  c.runImport
);
r.get("/import/:id/reporte", requireRole("COORDINADOR",'Responsable de Area'), c.downloadErrorReport);

// ==================== GESTIÓN DE INSCRITOS ====================

// Listar inscritos con filtros (para la tabla de “Gestionar inscritos”)
r.get("/", requireRole("COORDINADOR",'Responsable de Area'), inscritosCtrl.listarInscritos);

// Asignar un lote de inscritos a un evaluador
r.post(
  "/asignar-evaluador",
  requireRole("COORDINADOR",'Responsable de Area'),
  inscritosCtrl.asignarInscritosAEvaluador
);

export default r;
