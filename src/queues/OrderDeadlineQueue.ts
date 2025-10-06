import cron from 'node-cron'

import { checkOrdersNearDeadline } from '../jobs/CheckOrderNearDeadline'

// Agendamento todos os dias às 07:00 da manhã
cron.schedule('0 7 * * *', async () => {
  console.log('Executando job de verificação de ordens próximas do prazo...')
  await checkOrdersNearDeadline()
})
