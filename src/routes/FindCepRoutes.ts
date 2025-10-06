import { Router } from 'express'

import FindCepController from '../controllers/auth/FindCepController'

const router = Router()
const findCepController = new FindCepController()

router.get('/:cep', findCepController.getAddressByCep)

export default router
