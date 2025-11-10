// src/middlewares/upload.js
import multer from 'multer';

const storage = multer.memoryStorage();

const allowed = [
  'text/csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'application/octet-stream' // <- algunos clientes mandan esto; lo toleramos
];

export const uploadFile = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const okByMime = allowed.includes(file.mimetype);
    const okByExt = file.originalname?.toLowerCase().endsWith('.csv') || file.originalname?.toLowerCase().endsWith('.xlsx');
    if (okByMime || okByExt) return cb(null, true);
    cb(new Error('Formato inválido: sube un .csv o .xlsx'));
  },
  limits: { fileSize: 15 * 1024 * 1024 }
});
