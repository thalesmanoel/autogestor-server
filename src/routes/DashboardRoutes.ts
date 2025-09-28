import { Router } from 'express'

import DashboardController from '../controllers/auth/DashboardController'

const router = Router()
const dashboardController = new DashboardController()

router.get('/', dashboardController.getDashboard)

export default router
