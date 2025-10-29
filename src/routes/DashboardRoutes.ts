import { Router } from 'express'

import DashboardController from '../controllers/auth/DashboardController'

const router = Router()
const dashboardController = new DashboardController()

router.get('/monthly', dashboardController.getDashboardMonthly)
router.get('/annual-billing', dashboardController.getAnnualBilling)

router.get('/service-orders-near-deadline', dashboardController.getServiceOrdersNearDeadline)
router.get('/service-orders-past-deadline', dashboardController.getServiceOrdersPastDeadline)

router.get('/export-report-pdf', dashboardController.exportReportToPDF)

export default router
