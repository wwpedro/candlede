export const mockOrders = [
  {
    id: 1024,
    date: '2026-09-10',
    status: 'preparing', // received | paid | preparing | shipped | delivered | canceled
    items: [
      { id: 1, name: 'Aura de Romance', line: 'Linha care', price: 70.0, qty: 2, image: '/images/produto-1.jpg' },
    ],
    subtotal: 140.0,
    shipping: 0,
    total: 140.0,
    payment: { method: 'pix', status: 'approved' },
    address: {
      name: 'Maria Silva',
      street: 'Rua Exemplo',
      number: '100',
      complement: '',
      district: 'Centro',
      city: 'Maceió',
      state: 'AL',
      zip: '57000-000',
    },
  },
  {
    id: 1017,
    date: '2026-09-05',
    status: 'delivered',
    items: [
      { id: 3, name: 'Creme Rouge', line: 'Linha care', price: 59.9, qty: 1, image: '/images/produto-3.jpg' },
    ],
    subtotal: 59.9,
    shipping: 0,
    total: 59.9,
    payment: { method: 'pix', status: 'approved' },
    address: {
      name: 'Maria Silva',
      street: 'Rua Exemplo',
      number: '100',
      complement: '',
      district: 'Centro',
      city: 'Maceió',
      state: 'AL',
      zip: '57000-000',
    },
  },
]

export const ORDER_STATUS_LABEL = {
  received:  'Pedido recebido',
  paid:      'Pagamento confirmado',
  preparing: 'Preparando',
  shipped:   'Enviado',
  delivered: 'Entregue',
  canceled:  'Cancelado',
}

export const ORDER_STATUS_FLOW = ['received', 'paid', 'preparing', 'shipped', 'delivered']