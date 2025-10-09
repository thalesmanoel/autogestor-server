import cron from 'node-cron'

import { checkOrdersNearDeadline } from '../jobs/CheckOrderNearDeadline'

// Agendamento todos os dias às 07:00 da manhã
cron.schedule('16 22 * * *', async () => {
  console.log('Executando job de verificação de ordens próximas do prazo...')
  try {
    await checkOrdersNearDeadline()
  } catch (err) {
    console.error('Erro ao executar job de ordens próximas do prazo:', err)
  }
}, {
  timezone: 'America/Sao_Paulo'
})
