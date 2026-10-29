export function calcularFrete(cep, subtotal) {
  if (!cep) return null
  if (subtotal >= 250) return 0 // Frete grátis acima de R$ 250

  const prefixo = parseInt(cep.replace(/\D/g, '').substring(0, 2))
  
  if (prefixo >= 40 && prefixo <= 65) return 15 // Nordeste
  if ((prefixo >= 1 && prefixo <= 39) || (prefixo >= 70 && prefixo <= 79)) return 25 // Sudeste/CO
  if (prefixo >= 80 && prefixo <= 99) return 30 // Sul
  if (prefixo >= 66 && prefixo <= 69) return 35 // Norte
  
  return 25 // Padrão
}