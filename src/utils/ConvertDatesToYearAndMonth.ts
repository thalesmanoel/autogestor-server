export async function convertDatesToYearAndMonth (date?: string): Promise<{ startDate?: Date; endDate?: Date }> {
  if (!date) {
    return { startDate: undefined, endDate: undefined }
  }

  if (typeof date === 'string') {
    const [year, month] = date.split('-').map(Number)

    const dateVerified = new Date(year, month - 1, 1)

    const startDate = new Date(dateVerified.getFullYear(), dateVerified.getMonth(), 1)
    const endDate = new Date(dateVerified.getFullYear(), dateVerified.getMonth() + 1, 0, 23, 59, 59)

    return { startDate, endDate }
  }

  return { startDate: undefined, endDate: undefined }
}
