import * as svc from "../services/import.service.js";
import { successResponse, errorResponse } from "../utils/response.js";

export async function previewFile(req, res) {
  try {
    if (!req.file)
      return errorResponse(res, "Archivo requerido (.csv o .xlsx)", 400);
    const result = await svc.previewFile(req.file);
    return successResponse(res, result);
  } catch (e) {
    return errorResponse(res, e.message, 400);
  }
}

export async function runImport(req, res) {
  try {
    if (!req.file)
      return errorResponse(res, "Archivo requerido (.csv o .xlsx)", 400);
    const { onlyValid = true, duplicatePolicy = "omit" } = req.body; // 'omit' | 'update' | 'duplicate'
    const result = await svc.runImport({
      file: req.file,
      fileName: req.file.originalname,
      coordinatorId: req.user?.id_coordinador,
      onlyValid: String(onlyValid) === "true",
      duplicatePolicy,
    });
    return successResponse(res, result, 201);
  } catch (e) {
    return errorResponse(res, e.message, 400);
  }
}

export async function downloadErrorReport(req, res) {
  try {
    const file = await svc.getErrorReportFile(+req.params.id);
    if (!file) return errorResponse(res, "No hay reporte", 404);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="errores_import_${req.params.id}.csv"`
    );
    return res.send(file);
  } catch (e) {
    return errorResponse(res, e.message, 400);
  }
}
