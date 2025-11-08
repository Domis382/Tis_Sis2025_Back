//agrege esto para admin
/*import { Router } from 'express';
import * as responsableController from '../controllers/responsable.controller.js';

const router = Router();

router.get('/', responsableController.getAll);
router.post('/', responsableController.create);
router.put('/:id', responsableController.update);
router.delete('/:id', responsableController.remove);

export default router;*/

import { Router } from 'express';
import * as ctrl from '../controllers/responsable.controller.js';

const router = Router();

// Ahora todo pasa por el controller (que a su vez usa el service y el repo Prisma)
router.get('/', ctrl.getAll);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);
router.get('/_ping', (req, res) => res.json({ ok: true }));

export default router;


