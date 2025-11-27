export function normalize (buy: any) {
  if (!buy) return buy

  if (Array.isArray(buy.products)) {
    buy.products = buy.products.map((p: any) => ({
      ...p,
      observations: p.observations ?? ''
    }))
  }

  return buy
}

export function normalizeMany (list: any[]) {
  return list.map(i => normalize(i))
}
