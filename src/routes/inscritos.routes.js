import { Router } from 'express';
import { uploadFile } from '../middlewares/upload.js';
import * as c from '../controllers/import.controller.js';
import { requireRole } from '../middlewares/auth.js';

const r = Router();

// Importante: primero uploadFile, luego requireRole
r.post('/import/preview', uploadFile.single('file'), requireRole('COORDINADOR'), c.previewFile);
r.post('/import',        uploadFile.single('file'), requireRole('COORDINADOR'), c.runImport);
r.get('/import/:id/reporte', requireRole('COORDINADOR'), c.downloadErrorReport);

export default r;
