import { Router } from 'express'

import DashboardController from '../controllers/auth/DashboardController'

const router = Router()
const dashboardController = new DashboardController()

router.get('/', dashboardController.getDashboard)
router.put('/:id', dashboardController.update)

export default router
