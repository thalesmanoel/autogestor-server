import { Router } from 'express'

import ServiceController from '../controllers/auth/ServiceController'

const router = Router()
const serviceController = new ServiceController()

router.post('/', serviceController.create)
router.get('/', serviceController.getAll)
router.get('/:id', serviceController.getById)
router.put('/:id', serviceController.update)
router.delete('/:id', serviceController.delete)

export default router
