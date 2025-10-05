import { NextFunction, Request, Response } from 'express'

import FindCepService from '../../services/FindCepService'

export default class FindCepController {
  private findCepService: FindCepService

  constructor () {
    this.findCepService = new FindCepService()
  }

  getAddressByCep = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { cep } = req.params
      const address = await this.findCepService.getAddressByCep(cep)
      res.json(address)
    } catch (error) {
      next(error)
    }
  }
}
