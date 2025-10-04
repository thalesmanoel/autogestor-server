import { Router } from 'express'

import BuyController from '../controllers/auth/BuyController'
import Role from '../enums/Role'
import AllowedAccess from '../middlewares/AllowedLevelMiddleware'

const router = Router()
const buyController = new BuyController()

router.post('/', buyController.create)
router.get('/', buyController.getAll)
router.get('/:id', buyController.getById)
router.put('/:id', buyController.update)
router.delete('/:id', buyController.delete)

router.put('/:id/authorize', AllowedAccess([Role.ADMIN], true), buyController.authorize)

router.get('/history/:productId', buyController.getProductHistory)

export default router
