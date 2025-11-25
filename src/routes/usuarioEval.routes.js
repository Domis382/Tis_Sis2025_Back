// routes/usuarioEval.routes.js
import { Router } from "express";
import * as usuarioEvalController from "../controllers/usuarioEval.controller.js";

const router = Router();

// GET /api/usuarios
router.get("/", usuarioEvalController.getAll);

// POST /api/usuarios
router.post("/", usuarioEvalController.create);

// PUT /api/usuarios/:id
router.put("/:id", usuarioEvalController.update);

// DELETE /api/usuarios/:id
router.delete("/:id", usuarioEvalController.remove);

export default router;
