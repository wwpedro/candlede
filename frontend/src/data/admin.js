import { products as catalogProducts } from './catalog.js'
import { mockOrders } from './orders.js'

// Enriquecendo os produtos com dados de admin
export const adminProducts = catalogProducts.map((p, i) => ({
  ...p,
  active: true,
  minimumStock: 5,
  categoryName:
    { velas: 'Velas', perfumes: 'Perfumes', cremes: 'Cremes', aromatizadores: 'Aromatizadores' }[p.category] || '—',
}))

// Pedidos enriquecidos com cliente
export const adminOrders = mockOrders.map((o, i) => ({
  ...o,
  customer: {
    id: 100 + i,
    name: i === 0 ? 'Maria Silva' : 'João Santos',
    email: i === 0 ? 'maria@email.com' : 'joao@email.com',
    phone: '(82) 99999-9999',
  },
}))

// KPIs do dashboard
export const dashboardStats = {
  orders: adminOrders.length,
  sales: adminOrders.reduce((s, o) => s + o.total, 0),
  products: adminProducts.length,
  lowStock: adminProducts.filter((p) => p.stock > 0 && p.stock <= p.minimumStock).length,
  outOfStock: adminProducts.filter((p) => p.stock === 0).length,
}

export const ordersByStatus = {
  received:  adminOrders.filter((o) => o.status === 'received').length,
  paid:      adminOrders.filter((o) => o.status === 'paid').length,
  preparing: adminOrders.filter((o) => o.status === 'preparing').length,
  shipped:   adminOrders.filter((o) => o.status === 'shipped').length,
  delivered: adminOrders.filter((o) => o.status === 'delivered').length,
  canceled:  adminOrders.filter((o) => o.status === 'canceled').length,
}

// Histórico de estoque (mock)
export const stockHistory = {
  1: [
    { date: '2026-09-25T14:32:00', type: 'ENTRY',      qty: +20, before: 3,  after: 23, reason: 'Reposição de fornecedor' },
    { date: '2026-09-24T09:10:00', type: 'SALE',       qty: -2,  before: 5,  after: 3,  reason: 'Pedido #1024' },
    { date: '2026-09-22T16:00:00', type: 'ADJUSTMENT', qty: +3,  before: 2,  after: 5,  reason: 'Contagem física' },
  ],
  3: [
    { date: '2026-09-20T10:00:00', type: 'SALE',       qty: -1,  before: 1,  after: 0,  reason: 'Pedido #1017' },
    { date: '2026-09-18T15:00:00', type: 'ENTRY',      qty: +10, before: -9, after: 1,  reason: 'Reposição inicial' },
  ],
}

export const MOVEMENT_LABEL = {
  ENTRY: 'Entrada',
  SALE: 'Venda',
  ADJUSTMENT: 'Ajuste',
  RETURN: 'Devolução',
}