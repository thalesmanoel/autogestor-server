import { Router } from 'express'

import BuyRoutes from './BuyRoutes'
import ClientRoutes from './ClientRoutes'
import DashboardRoutes from './DashboardRoutes'
import MechanicRoutes from './MechanicRoutes'
import ProductRoutes from './ProductRoutes'
import ProviderRoutes from './ProviderRoutes'
import ServiceOrderRoutes from './ServiceOrderRoutes'
import ServiceRoutes from './ServiceRoutes'
import UserRoutes from './UserRoutes'
import VehicleRoutes from './VehicleRoutes'

const router = Router()

router.use('/users', UserRoutes)
router.use('/products', ProductRoutes)
router.use('/services', ServiceRoutes)
router.use('/vehicles', VehicleRoutes)
router.use('/clients', ClientRoutes)
router.use('/buys', BuyRoutes)
router.use('/mechanics', MechanicRoutes)
router.use('/service-orders', ServiceOrderRoutes)
router.use('/providers', ProviderRoutes)
router.use('/dashboards', DashboardRoutes)

export default router
