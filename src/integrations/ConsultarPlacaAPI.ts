import axios from 'axios'

export class ConsultarPlacaAPI {
  private apiUrl = 'https://api.consultarplaca.com.br/v2/consultarPlaca'
  private email = process.env.CONSULTAR_PLACA_API_USERNAME || ''
  private token = process.env.CONSULTAR_PLACA_API_TOKEN || ''

  async getVehicleDatasByPlate (plate: string) {
    try {
      const response = await axios.get(this.apiUrl, {
        params: { placa: plate },
        auth: {
          username: this.email,
          password: this.token
        },
        headers: {
          'Content-Type': 'application/json'
        }
      })

      return response.data
    } catch (err: any) {
      throw new Error(
        `Erro ao consultar placa: ${err.response?.data?.mensagem || err.message}`
      )
    }
  }
}
