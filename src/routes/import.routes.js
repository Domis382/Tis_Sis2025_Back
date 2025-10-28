import express from 'express';
import multer from 'multer';
import * as controller from '../controllers/import.controller.js';
import { requireRole } from '../middlewares/auth.js';

const router = express.Router();
const upload = multer(); // ⚠️ importante, crea el manejador de archivos

// Vista previa del archivo
router.post('/preview', upload.single('file'), requireRole('COORDINADOR'), controller.previewFile);

// Ejecutar importación real
router.post('/', upload.single('file'), requireRole('COORDINADOR'), controller.runImport);

// Descargar errores
router.get('/:id/reporte', requireRole('COORDINADOR'), controller.downloadErrorReport);

export default router;
