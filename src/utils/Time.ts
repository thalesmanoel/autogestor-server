import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)
dayjs.extend(timezone)

export default class Time {
  static convertDatesToYearAndMonth (date?: string) {
    if (!date) {
      return { startDate: undefined, endDate: undefined }
    }

    const [year, month] = date.split('-').map(Number)

    if (isNaN(year) || isNaN(month)) {
      throw new Error(`Formato inválido: "${date}". Esperado "YYYY-MM".`)
    }

    const baseDate = new Date(year, month - 1, 1)
    const startDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1)
    const endDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0, 23, 59, 59)

    return { startDate, endDate }
  }

  static formatDateToBR (date?: Date): string {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('pt-BR')
  }

  static getStartOfDay (date: Date): Date {
    const start = new Date(date)
    start.setUTCDate(start.getUTCDate() - 1)
    start.setUTCHours(21, 0, 0, 0)
    return start
  }

  static getEndOfDay (date: Date): Date {
    const end = new Date(date)
    end.setUTCHours(20, 59, 59, 999)
    return end
  }

  static getStartOfMonth (date: Date): Date {
    const first = new Date(Date.UTC(date.getFullYear(), date.getMonth(), 1, 21, 0, 0, 0))
    return first
  }

  static getEndOfMonth (date: Date): Date {
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0)
    const end = new Date(Date.UTC(lastDay.getFullYear(), lastDay.getMonth(), lastDay.getDate(), 20, 59, 59, 999))
    return end
  }
}
