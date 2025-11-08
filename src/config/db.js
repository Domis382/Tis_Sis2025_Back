//base de dtos temporal para las tablas de responsable y evaluadores 
// src/config/db.js
// =====================================================
// Configuración de base de datos simulada con LowDB
// =====================================================

import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

// Permite obtener la ruta absoluta actual del proyecto
const __dirname = dirname(fileURLToPath(import.meta.url));

// 📁 Archivo JSON donde se guardarán los datos simulados
const file = join(__dirname, '../../mockData.json');

// 💾 Adaptador JSON (LowDB usa este archivo como base de datos)
const adapter = new JSONFile(file);
export const db = new Low(adapter, { responsables: [], evaluadores: [] });

// Función de inicialización
export async function initDB() {
  await db.read();

  // Si el archivo está vacío, inicializamos con estructura base
  db.data ||= { responsables: [], evaluadores: [] };

  // Guardamos si no existía
  await db.write();

  console.log('📦 Base de datos LowDB inicializada en mockData.json');
}
