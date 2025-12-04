export class Validation {
  public cpfOrCnpj (value: string): boolean {
    const onlyNumbers = value.replace(/\D/g, '')

    if (onlyNumbers.length === 11) {
      return this.cpf(onlyNumbers)
    }

    if (onlyNumbers.length === 14) {
      return this.cnpj(onlyNumbers)
    }

    return false
  }

  public cpf (cpf: string): boolean {
    if (!cpf || cpf.length !== 11) return false

    if (/^(\d)\1{10}$/.test(cpf)) return false

    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i)
    }

    let digit1 = (sum * 10) % 11
    if (digit1 === 10) digit1 = 0
    if (digit1 !== parseInt(cpf.charAt(9))) return false

    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i)
    }

    let digit2 = (sum * 10) % 11
    if (digit2 === 10) digit2 = 0
    return digit2 === parseInt(cpf.charAt(10))
  }

  public cnpj (cnpj: string): boolean {
    if (!cnpj || cnpj.length !== 14) return false

    if (/^(\d)\1{13}$/.test(cnpj)) return false

    let length = 12
    let numbers = cnpj.substring(0, length)
    const digits = cnpj.substring(length)

    let sum = 0
    let pos = length - 7

    for (let i = length; i >= 1; i--) {
      sum += parseInt(numbers.charAt(length - i)) * pos--
      if (pos < 2) pos = 9
    }

    const digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11)
    if (digit1 !== parseInt(digits.charAt(0))) return false

    length = 13
    numbers = cnpj.substring(0, length)
    sum = 0
    pos = length - 7

    for (let i = length; i >= 1; i--) {
      sum += parseInt(numbers.charAt(length - i)) * pos--
      if (pos < 2) pos = 9
    }

    const digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11)
    return digit2 === parseInt(digits.charAt(1))
  }
}
