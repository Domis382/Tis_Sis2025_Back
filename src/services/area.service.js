//Lógica de negocio (usa el repositorio para acceder a datos)

import * as areaRepository from '../repositories/area.repository.js';

export function getAllAreas() {
  return areaRepository.findAll();
}

export function getAreaById(id) {
  return areaRepository.findById(id);
}

export function createArea(data) {
  return areaRepository.create(data);
}

export function updateArea(id, data) {
  return areaRepository.update(id, data);
}

export function deleteArea(id) {
  return areaRepository.remove(id);
}
