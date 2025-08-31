import { Router } from 'express'

import { authMiddleware } from './middlewares/AuthMiddleware'
import authRoutes from './routes/AuthRoutes'
import unauthRoutes from './routes/UnauthRoutes'

const router = Router()

router.use('/unauth', unauthRoutes)
router.use('/auth', authMiddleware, authRoutes)

export default router
