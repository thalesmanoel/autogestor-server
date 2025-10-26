import cron, { ScheduledTask } from 'node-cron'

import { checkOrdersNearDeadline } from '../jobs/CheckOrderNearDeadline'

let currentTask: ScheduledTask | null = null

export function scheduleOrderDeadlineJob (hour: number, minute: number, userEmails: string[]) {
  const cronExpression = `${minute} ${hour} * * *`

  if (currentTask) {
    currentTask.stop()
    currentTask = null
  }

  currentTask = cron.schedule(
    cronExpression,
    async () => {
      console.log('Executando job de verificação de ordens próximas do prazo...')
      try {
        await checkOrdersNearDeadline(userEmails)
      } catch (err) {
        console.error('Erro ao executar job de ordens próximas do prazo:', err)
      }
    },
    { timezone: 'America/Sao_Paulo' }
  )

  console.log(`Job configurado com sucesso para rodar às ${hour}:${minute}`)
}

export function stopOrderDeadlineJob () {
  if (currentTask) {
    currentTask.stop()
    console.log('Job de verificação parado.')
    currentTask = null
  }
}
