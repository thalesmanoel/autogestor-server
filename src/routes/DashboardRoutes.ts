import { Router } from 'express'

import DashboardController from '../controllers/auth/DashboardController'

const router = Router()
const dashboardController = new DashboardController()

router.get('/monthly', dashboardController.getDashboardMonthly)
router.get('/annual-billing', dashboardController.getAnnualBilling)

export default router
