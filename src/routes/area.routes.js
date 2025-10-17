//Rutas CRUD para el modelo Area.

import { Router } from 'express';
import * as areaController from '../controllers/area.controller.js';

const router = Router();

router.get('/', areaController.getAllAreas);
router.get('/:id', areaController.getAreaById);
router.post('/', areaController.createArea);
router.put('/:id', areaController.updateArea);
router.delete('/:id', areaController.deleteArea);

export default router;
