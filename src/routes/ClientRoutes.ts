import { Router } from 'express'

import ClientController from '../controllers/auth/ClientController'

const router = Router()
const clientController = new ClientController()

router.post('/', clientController.create)
router.get('/', clientController.getAll)
router.get('/:id', clientController.getById)
router.put('/:id', clientController.update)
router.delete('/:id', clientController.delete)

export default router
