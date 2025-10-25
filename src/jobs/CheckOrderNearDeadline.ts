import ServiceOrderService from '../services/ServiceOrderService'
import { sendMail } from '../utils/mailer'

const serviceOrderService = new ServiceOrderService()

export async function checkOrdersNearDeadline (userEmail: string) {
  console.log('Iniciando verificação de ordens próximas do prazo...')

  const ordersDueTomorrow = await serviceOrderService.checkServiceOrdersNearDeadline()

  const subject = '⚠️ Ordens de serviço próximas do prazo de entrega'
  const text = `As seguintes ordens estão a 1 dia do prazo:\n\n${ordersDueTomorrow
    .map(o => `Código: ${o.code} | Prazo: ${o.deadline?.toLocaleDateString('pt-BR')}`)
    .join('\n')}`

  await sendMail([userEmail], subject, text)
}
