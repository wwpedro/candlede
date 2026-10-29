import { createContext, useContext, useState } from 'react'

const CheckoutContext = createContext(null)

export function CheckoutProvider({ children }) {
  const [address, setAddress] = useState(null)
  const [payment, setPayment] = useState(null)  // { method: 'pix'|'credit'|'debit', card?: {...} }

  const reset = () => {
    setAddress(null)
    setPayment(null)
  }

  return (
    <CheckoutContext.Provider value={{ address, setAddress, payment, setPayment, reset }}>
      {children}
    </CheckoutContext.Provider>
  )
}

export function useCheckout() {
  const ctx = useContext(CheckoutContext)
  if (!ctx) throw new Error('useCheckout precisa estar dentro de <CheckoutProvider>')
  return ctx
}