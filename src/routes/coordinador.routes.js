// src/routes/coordinador.routes.js

import { Router } from "express";
import * as ctrl from "../controllers/coordinador.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

// Debug route
router.get("/_ping", (req, res) => res.json({ ok: true }));

// Perfil del coordinador logueado
router.get(
  "/perfil",
  authMiddleware(["Coordinador Area"]),
  ctrl.getPerfil
);
router.put(
  "/perfil",
  authMiddleware(["Coordinador Area"]),
  ctrl.updatePerfil
);

// GET /api/coordinador
router.get("/", ctrl.getAll);

// GET /api/coordinador/:id
router.get("/:id", ctrl.getOne);

// POST /api/coordinador
router.post("/", ctrl.create);

// PUT /api/coordinador/:id
router.put("/:id", ctrl.update);

// DELETE /api/coordinador/:id
router.delete("/:id", ctrl.remove);

export default router;
