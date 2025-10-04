import { NextFunction, Request, Response } from 'express'

import Role from '../enums/Role'

const AllowedAccess = (roles: Role[], allowManagers?: boolean) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user

    if (!user) return res.status(401).json({ message: 'Usuário não autenticado' })

    if (!allowManagers) allowManagers = false
    if (roles.length === 0) return next()

    const isEmployerManager = user.role === Role.EMPLOYER && user.manager === true

    const isAllowed =
      roles.includes(user.role) ||
      (allowManagers && isEmployerManager)

    if (!isAllowed) {
      return res.status(403).json({ message: 'Usuário não autorizado' })
    }

    next()
  }
}

export default AllowedAccess
