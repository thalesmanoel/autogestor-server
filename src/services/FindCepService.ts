import { ViaCepAPI } from '../integrations/ViaCepAPI'

export default class FindCepService {
  private viaCepAPI: ViaCepAPI

  constructor () {
    this.viaCepAPI = new ViaCepAPI()
  }

  async getAddressByCep (cep: string) {
    const cleanCep = cep.replace(/\D/g, '')

    if (!/^\d{8}$/.test(cleanCep)) {
      throw new Error('CEP inválido. Deve conter 8 dígitos numéricos.')
    }

    return await this.viaCepAPI.getAddressByCep(cleanCep)
  }
}
