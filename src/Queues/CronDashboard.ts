import cron from 'node-cron'

import DashboardService from '../services/DashboardService'

const dashboardService = new DashboardService()

// Todo dia 1º do mês, à meia-noite, atualiza o dashboard do mês anterior
cron.schedule('0 0 1 * *', async () => {
  try {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    console.log(`[CRON] Atualizando dashboard mensal: ${year}-${month + 1}`)

    await dashboardService.updateMonthlyDashboard(year, month)
    console.log('[CRON] Dashboard atualizado com sucesso!')
  } catch (error) {
    console.error('[CRON] Erro ao atualizar dashboard:', error)
  }
})
