import { Router } from 'express'

import ProductController from '../controllers/auth/ProductController'

const router = Router()
const productController = new ProductController()

router.post('/', productController.create)
router.get('/', productController.getAll)
router.get('/:id', productController.getById)
router.put('/:id', productController.update)
router.delete('/:id', productController.delete)

export default router
