import * as evaluacionRepository from "../repositories/evaluacion.repository.js";

export function getResultadosClasificatoria() {
  return evaluacionRepository.findResultadosClasificatoria();
}
