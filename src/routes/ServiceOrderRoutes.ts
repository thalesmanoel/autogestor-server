import { Router } from 'express'

import ServiceOrderController from '../controllers/auth/ServiceOrderController'
import Role from '../enums/Role'
import AllowedRoles from '../middlewares/AllowedLevelMiddleware'

const router = Router()
const serviceOrderController = new ServiceOrderController()

router.post('/', serviceOrderController.create)
router.get('/', serviceOrderController.getAll)
router.get('/:id', serviceOrderController.getById)
router.put('/:id', serviceOrderController.update)
router.delete('/:id', serviceOrderController.delete)

router.put('/change-status/:id', serviceOrderController.changeStatus)
router.put('/update-paid/:id', serviceOrderController.updatePaidStatus)
router.post('/calculate-totals', serviceOrderController.calculateTotalServiceOrderValue)

router.get('/export-pdf/:id', serviceOrderController.exportServiceOrderAsPDF)

router.patch('/schedule-deadline-check', AllowedRoles(Role.ADMIN, Role.MANAGER), serviceOrderController.scheduleTimeReportEmailSender)
router.patch('/stop-deadline-check', AllowedRoles(Role.ADMIN, Role.MANAGER), serviceOrderController.stopTimeReportEmailSender)

export default router
