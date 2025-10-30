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
}
