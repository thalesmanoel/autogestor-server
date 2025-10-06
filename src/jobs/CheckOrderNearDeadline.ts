import OrderServiceStatus from '../enums/OrderServiceStatus'
import ServiceOrder from '../models/ServiceOrder'
import { sendMail } from '../utils/mailer'

export async function checkOrdersNearDeadline () {
  console.log('Iniciando verificação de ordens próximas do prazo...')

  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(now.getDate() + 1)

  const startOfTomorrow = new Date(tomorrow.setHours(0, 0, 0, 0))
  const endOfTomorrow = new Date(tomorrow.setHours(23, 59, 59, 999))

  const ordersDueTomorrow = await ServiceOrder.find({
    deadline: { $gte: startOfTomorrow, $lte: endOfTomorrow },
    status: { $nin: [OrderServiceStatus.COMPLETED] }
  })

  if (ordersDueTomorrow.length === 0) {
    console.log('Nenhuma ordem próxima do prazo encontrada.')
    return
  }

  const subject = '⚠️ Ordens de serviço próximas do prazo de entrega'
  const text = `As seguintes ordens estão a 1 dia do prazo:\n\n${ordersDueTomorrow
    .map(o => `Código: ${o.code} | Prazo: ${o.deadline?.toLocaleDateString()}`)
    .join('\n')}`

  const recipients = ['admin@empresa.com', 'manager@empresa.com']
  await sendMail(recipients, subject, text)
}
