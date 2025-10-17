//Consultas Prisma a la BD (modelo area).

import prisma from '../config/prisma.js';

export function findAll() {
  return prisma.area.findMany({
    orderBy: { id_area: 'asc' }
  });
}

export function findById(id) {
  return prisma.area.findUnique({
    where: { id_area: id }
  });
}

export function create(data) {
  return prisma.area.create({
    data: {
      nombre_area: data.nombre_area
    }
  });
}

export function update(id, data) {
  return prisma.area.update({
    where: { id_area: id },
    data: {
      nombre_area: data.nombre_area
    }
  });
}

export function remove(id) {
  return prisma.area.delete({
    where: { id_area: id }
  });
}
