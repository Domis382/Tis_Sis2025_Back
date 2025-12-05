// src/services/fases.service.js
// Lógica de negocio para parámetros de fases (nota mínima, fase final)

import * as fasesRepository from '../repositories/fases.repository.js';

// Nombre fijo de la fase clasificatoria
const NOMBRE_FASE_CLASIFICATORIA = 'CLASIFICATORIA';

// Obtener parámetros de la fase clasificatoria
export function getParametrosClasificacion() {
  return fasesRepository.findByNombre(NOMBRE_FASE_CLASIFICATORIA);
}

// Setear / actualizar nota mínima de clasificación
export async function setNotaMinimaClasificacion(nota) {
  const valor = Number(nota);

  if (!Number.isFinite(valor) || valor < 0) {
    throw new Error('La nota mínima debe ser un número mayor o igual a 0.');
  }

  // Podrías limitar a 100 si tus notas son sobre 100
  if (valor > 100) {
    throw new Error('La nota mínima no puede ser mayor a 100.');
  }

  return fasesRepository.updateNotaMinima(
    NOMBRE_FASE_CLASIFICATORIA,
    valor
  );
}

// (para más adelante) activar / desactivar fase final, unque creo que para eso est el atruburto que reamos lo de fase final como booleano
export function setFaseFinalActiva(activa) {
  return fasesRepository.updateFaseFinal(
    NOMBRE_FASE_CLASIFICATORIA,
    Boolean(activa)
  );
}
