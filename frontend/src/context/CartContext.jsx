import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { useAuth } from './AuthContext.jsx'
import { cartApi } from '../services/api.js'
import { adaptCart } from '../services/adapters.js'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { user } = useAuth()
  const isCustomer = user?.role === 'customer'

  const [cart, setCart] = useState({ id: null, items: [], total: 0 })
  const [loading, setLoading] = useState(false)

  // =========================================================
  // CARREGAR — toda vez que o user muda
  // =========================================================
const refresh = useCallback(async () => {
  if (!isCustomer) {
    setCart({ id: null, items: [], total: 0 })
    return
  }
  setLoading(true)
  try {
    const data = await cartApi.get()
    const adapted = adaptCart(data)
    
    // =========================================================
    // Força reset do estado se vier vazio
    // =========================================================
    if (!adapted.items || adapted.items.length === 0) {
      setCart({ id: adapted.id, items: [], total: 0 })
    } else {
      setCart(adapted)
    }
  } catch (err) {
    console.error('Erro ao carregar carrinho:', err)
    setCart({ id: null, items: [], total: 0 })
  } finally {
    setLoading(false)
  }
}, [isCustomer])

  useEffect(() => { refresh() }, [refresh])

  // =========================================================
  // ADICIONAR
  // =========================================================
  const add = async (product, qty = 1) => {
    if (!isCustomer) {
      throw new Error('Faça login como cliente para adicionar ao carrinho.')
    }
    try {
      const data = await cartApi.addItem(product.id, qty)
      setCart(adaptCart(data))
      return data
    } catch (err) {
      console.error('Erro ao adicionar:', err)
      throw err
    }
  }

  // =========================================================
  // ALTERAR QUANTIDADE
  // =========================================================
  const setQty = async (cartItemId, qty) => {
    if (!isCustomer) return
    const data = await cartApi.updateItem(cartItemId, qty)
    setCart(adaptCart(data))
  }

  const increment = async (cartItemId) => {
    const item = cart.items.find((i) => i.cartItemId === cartItemId)
    if (!item) return
    await setQty(cartItemId, item.qty + 1)
  }

  const decrement = async (cartItemId) => {
    const item = cart.items.find((i) => i.cartItemId === cartItemId)
    if (!item) return
    if (item.qty <= 1) return remove(cartItemId)
    await setQty(cartItemId, item.qty - 1)
  }

  // =========================================================
  // REMOVER
  // =========================================================
  const remove = async (cartItemId) => {
    if (!isCustomer) return
    await cartApi.removeItem(cartItemId)
    await refresh()
  }

  // =========================================================
  // LIMPAR
  // =========================================================
  const clear = async () => {
    if (!isCustomer) return
    try { await cartApi.clear() } catch {}
    setCart({ id: null, items: [], total: 0 })
  }

  // =========================================================
  // DERIVADOS
  // =========================================================
  const count = useMemo(
    () => cart.items.reduce((s, i) => s + i.qty, 0),
    [cart.items]
  )

  const subtotal = cart.total

  const value = {
    items: cart.items,
    count,
    subtotal,
    loading,
    add,
    increment,
    decrement,
    setQty,
    remove,
    clear,
    refresh,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart precisa estar dentro de <CartProvider>')
  return ctx
}