import axios from 'axios'

export class ViaCepAPI {
  private apiUrl = 'https://viacep.com.br/ws/'

  public async getAddressByCep (cep: string): Promise<any> {
    try {
      const response = await axios.get(`${this.apiUrl}${cep}/json/`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar endereço pelo CEP', error)
      throw error
    }
  }
}
