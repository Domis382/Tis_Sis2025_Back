// src/routes/coordinador.routes.js

import { Router } from "express";
import * as ctrl from "../controllers/coordinador.controller.js";

const router = Router();

// GET /api/coordinador
router.get("/", ctrl.getAll);

router.get("/:id", getOne);

// POST /api/coordinador
router.post("/", ctrl.create);

// PUT /api/coordinador/:id
router.put("/:id", ctrl.update);

// DELETE /api/coordinador/:id
router.delete("/:id", ctrl.remove);

// Debug route
router.get("/_ping", (req, res) => res.json({ ok: true }));

export default router;
