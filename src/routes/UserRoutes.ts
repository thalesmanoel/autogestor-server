import { Router } from 'express'

import UserController from '../controllers/auth/UserController'
import Role from '../enums/Role'
import AllowedRoles from '../middlewares/AllowedLevelMiddleware'

const router = Router()
const userController = new UserController()

router.post('/', userController.create)
router.get('/', AllowedRoles(Role.ADMIN), userController.getAll)
router.get('/:id', userController.getById)
router.put('/:id', userController.update)
router.delete('/:id', userController.delete)

router.patch('/change-password/:id', userController.changePassword)

export default router
