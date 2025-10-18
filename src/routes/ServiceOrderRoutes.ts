import { Router } from 'express'

import ServiceOrderController from '../controllers/auth/ServiceOrderController'

const router = Router()
const serviceOrderController = new ServiceOrderController()

router.post('/', serviceOrderController.create)
router.get('/', serviceOrderController.getAll)
router.get('/:id', serviceOrderController.getById)
router.put('/:id', serviceOrderController.update)
router.delete('/:id', serviceOrderController.delete)

router.put('/change-status/:id', serviceOrderController.changeStatus)
router.put('/update-paid/:id', serviceOrderController.updatePaidStatus)

router.get('/export-pdf/:id', serviceOrderController.exportServiceOrderAsPDF)

router.patch('/schedule-deadline-check', serviceOrderController.scheduleTimeReportEmailSender)
router.patch('/stop-deadline-check', serviceOrderController.stopTimeReportEmailSender)

export default router
