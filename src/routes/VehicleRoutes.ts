import { Router } from 'express'

import VehicleController from '../controllers/auth/VehicleController'

const router = Router()
const vehicleController = new VehicleController()

router.post('/', vehicleController.create)
router.get('/', vehicleController.getAll)
router.get('/:id', vehicleController.getById)
router.put('/:id', vehicleController.update)
router.delete('/:id', vehicleController.delete)

router.get('/get-datas/:plate', vehicleController.getDatasByPlate)

export default router
