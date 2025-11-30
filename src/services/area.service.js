import * as areaRepository from '../repositories/area.repository.js';

/**
 * Obtener todas las áreas
 */
export function getAllAreas() {
  return areaRepository.findAll();
}

/**
 * Buscar un área por ID (maneja BigInt)
 */
export function getAreaById(id) {
  return areaRepository.findById(BigInt(id));
}

/**
 * Crear una nueva área
 */
export async function createArea(data) {
  const { nombre_area } = data;

  if (!nombre_area || nombre_area.trim() === '') {
    const error = new Error('El nombre del área es obligatorio');
    error.statusCode = 400;
    throw error;
  }

  try {
    const areaCreada = await areaRepository.create({
      nombre_area: nombre_area.trim(),
    });

    console.log('✅ [AREAS] Área creada correctamente:');
    console.log({
      id_area: areaCreada.id_area,
      nombre_area: areaCreada.nombre_area,
    });

    return areaCreada;
  } catch (err) {
    if (err.code === 'P2002') {
      console.log('⚠️ [AREAS] Intento de crear área duplicada:', nombre_area);
      const error = new Error('Ya existe un área con ese nombre');
      error.statusCode = 400;
      throw error;
    }

    console.error('❌ [AREAS] Error al crear área:', err);
    throw err;
  }
}


/**
 * Actualizar un área existente
 */
export async function updateArea(id, data) {
  const { nombre_area } = data;

  if (!nombre_area || nombre_area.trim() === '') {
    const error = new Error('El nombre del área es obligatorio');
    error.statusCode = 400;
    throw error;
  }

  try {
    const actualizada = await areaRepository.update(BigInt(id), {
      nombre_area: nombre_area.trim(),
    });

    console.log('📝 [AREAS] Área actualizada:');
    console.log({
      id_area: actualizada.id_area,
      nombre_area: actualizada.nombre_area,
    });

    return actualizada;
  } catch (err) {
    if (err.code === 'P2002') {
      console.log('⚠️ [AREAS] Intento de renombrar a nombre duplicado:', nombre_area);
      const error = new Error('Ya existe un área con ese nombre');
      error.statusCode = 400;
      throw error;
    }
    if (err.code === 'P2025') {
      console.log('⚠️ [AREAS] Intento de actualizar área inexistente, id =', id);
      const error = new Error('Área no encontrada');
      error.statusCode = 404;
      throw error;
    }
    console.error('❌ [AREAS] Error al actualizar área:', err);
    throw err;
  }
}


/**
 * Eliminar un área
 */
export async function deleteArea(id) {
  try {
    await areaRepository.remove(BigInt(id));
    console.log('🗑️ [AREAS] Área eliminada con éxito. id_area =', id);
  } catch (err) {
    if (err.code === 'P2025') {
      console.log('⚠️ [AREAS] Intento de eliminar área inexistente. id_area =', id);
      const error = new Error('Área no encontrada');
      error.statusCode = 404;
      throw error;
    }
    console.error('❌ [AREAS] Error al eliminar área:', err);
    throw err;
  }
}


