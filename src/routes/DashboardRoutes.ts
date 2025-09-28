import { Router } from 'express'

import DashboardController from '../controllers/auth/DashboardController'

const router = Router()
const dashboardController = new DashboardController()

router.get('/billing-datas', dashboardController.getBillingDatas)
router.get('/cost-request-buys', dashboardController.getCostRequestBuys)
router.put('/:id', dashboardController.update)

export default router
