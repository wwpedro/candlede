import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8081/api',
})

// ============================================================
// REQUEST — adiciona o JWT em toda chamada
// ============================================================
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('candlede:token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ============================================================
// RESPONSE — se 401, limpa e manda pro login
// ============================================================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('candlede:token')
      localStorage.removeItem('candlede:user')

      const path = window.location.pathname
      const publicRoutes = ['/login', '/cadastro', '/']
      const isPublic = publicRoutes.includes(path) || path.startsWith('/redefinir')

      if (!isPublic) {
        window.dispatchEvent(new Event('candlede:session-expired'))
      }
    }
    return Promise.reject(error)
  }
)

// ============================================================
// PAGAMENTOS (só CUSTOMER)
// ============================================================
export const paymentApi = {
  process: (data) =>
    api.post('/payments/process', data).then((r) => r.data),

  get: (transactionId) =>
    api.get(`/payments/${transactionId}`).then((r) => r.data),

  // NOVO — só pra teste
  simulate: (transactionId) =>
    api.post(`/payments/simulate/${transactionId}`).then((r) => r.data),
}

// ============================================================
// AUTH
// ============================================================
export const authApi = {
  login: (data) =>
    api.post('/auth/login', data).then((r) => r.data),

  register: (data) =>
    api.post('/auth/register', data).then((r) => r.data),

  logout: () =>
    api.post('/auth/logout').then((r) => r.data),

  me: () =>
    api.get('/auth/me').then((r) => r.data),

  verify2fa: (pendingToken, code) =>
    api.post('/auth/verify-2fa', { pendingToken, code }).then((r) => r.data),

  forgotPassword: (email) =>
    api.post('/auth/forgot-password', { email }).then((r) => r.data),

  resetPassword: (token, newPassword) =>
    api.post('/auth/reset-password', { token, newPassword }).then((r) => r.data),
}

// ============================================================
// CATÁLOGO — produtos e categorias (público)
// ============================================================
export const catalogApi = {
  // produtos
  getProducts: () =>
    api.get('/products').then((r) => r.data),

  getProduct: (id) =>
    api.get(`/products/${id}`).then((r) => r.data),

  getProductsByCategory: (categoryId) =>
    api.get(`/products/category/${categoryId}`).then((r) => r.data),

  getProductsByCategorySlug: (slug) =>
    api.get(`/products/category/slug/${slug}`).then((r) => r.data),

  searchProducts: (name) =>
    api.get('/products/search', { params: { name } }).then((r) => r.data),

  // categorias
  getCategories: () =>
    api.get('/categories').then((r) => r.data),

  getCategory: (id) =>
    api.get(`/categories/${id}`).then((r) => r.data),

  getCategoryBySlug: (slug) =>
    api.get(`/categories/slug/${slug}`).then((r) => r.data),
}

// ============================================================
// CONTEÚDO INSTITUCIONAL
// ============================================================
export const contentApi = {
  getByKey: (key) =>
    api.get(`/content/${key}`).then((r) => r.data),
}

// ============================================================
// BANNERS
// ============================================================
export const bannerApi = {
  getActive: () =>
    api.get('/banners').then((r) => r.data),
}

// ============================================================
// CARRINHO (só CUSTOMER)
// ============================================================
export const cartApi = {
  get: () => api.get('/cart').then((r) => r.data),

  addItem: (productId, quantity) =>
    api.post('/cart/items', { productId, quantity }).then((r) => r.data),

  updateItem: (itemId, quantity) =>
    api.put(`/cart/items/${itemId}`, { quantity }).then((r) => r.data),

  removeItem: (itemId) =>
    api.delete(`/cart/items/${itemId}`).then((r) => r.data),

  clear: () =>
    api.delete('/cart').then((r) => r.data),
}

// ============================================================
// ENDEREÇOS (só CUSTOMER)
// ============================================================
export const addressApi = {
  list: () =>
    api.get('/users/me/addresses').then((r) => r.data),

  create: (data) =>
    api.post('/users/me/addresses', data).then((r) => r.data),

  update: (id, data) =>
    api.put(`/users/me/addresses/${id}`, data).then((r) => r.data),

  remove: (id) =>
    api.delete(`/users/me/addresses/${id}`).then((r) => r.data),
}

// ============================================================
// USUÁRIO (só CUSTOMER)
// ============================================================
export const userApi = {
  getMe: () =>
    api.get('/users/me').then((r) => r.data),

  update: (data) =>
    api.put('/users/me', data).then((r) => r.data),
}

// ============================================================
// PEDIDOS (só CUSTOMER)
// ============================================================
export const orderApi = {
  create: (data) =>
    api.post('/orders', data).then((r) => r.data),

  list: () =>
    api.get('/orders').then((r) => r.data),

  get: (id) =>
    api.get(`/orders/${id}`).then((r) => r.data),

  // ============================================================
  // NOVO: CONFIRMAR ENTREGA
  // ============================================================
  confirmDelivery: (id) =>
    api.patch(`/orders/${id}/confirm-delivery`).then((r) => r.data),

  // ============================================================
  // NOVO: NOTIFICAÇÕES (Sino)
  // ============================================================
  getPendingConfirmationCount: () =>
    api.get('/orders/pending-confirmation').then((r) => r.data),
}

// ============================================================
// AVALIAÇÕES (NOVO)
// ============================================================
export const reviewApi = {
  create: (data) =>
    api.post('/reviews', data).then((r) => r.data),
}

// ============================================================
// CONTATO (público)
// ============================================================
export const contactApi = {
  send: (data) =>
    api.post('/contact', data).then((r) => r.data),
}

// ============================================================
// ADMIN
// ============================================================
export const adminApi = {

  // ---------- dashboard ----------
  dashboard: () =>
    api.get('/admin/dashboard').then((r) => r.data),

  // ---------- produtos ----------
  products: () =>
    api.get('/admin/products').then((r) => r.data),

  createProduct: (data) =>
    api.post('/admin/products', data).then((r) => r.data),

  updateProduct: (id, data) =>
    api.put(`/admin/products/${id}`, data).then((r) => r.data),

  deactivateProduct: (id) =>
    api.patch(`/admin/products/${id}/deactivate`).then((r) => r.data),

  // ---------- categorias ----------
  categories: () =>
    api.get('/categories').then((r) => r.data),

  createCategory: (data) =>
    api.post('/admin/categories', data).then((r) => r.data),

  updateCategory: (id, data) =>
    api.put(`/admin/categories/${id}`, data).then((r) => r.data),

  deactivateCategory: (id) =>
    api.patch(`/admin/categories/${id}/deactivate`).then((r) => r.data),

  // ---------- estoque ----------
  inventory: () =>
    api.get('/admin/inventory').then((r) => r.data),

  inventoryLowStock: () =>
    api.get('/admin/inventory/low-stock').then((r) => r.data),

  inventoryByProduct: (productId) =>
    api.get(`/admin/inventory/${productId}`).then((r) => r.data),

  inventoryMovements: (productId) =>
    api.get(`/admin/inventory/${productId}/movements`).then((r) => r.data),

  inventoryEntry: (productId, quantity, reason) =>
    api.post(`/admin/inventory/${productId}/entry`, {
      quantity,
      movementType: 'ENTRY',
      reason,
    }).then((r) => r.data),

  inventoryAdjustment: (productId, quantity, reason) =>
    api.post(`/admin/inventory/${productId}/adjustment`, {
      quantity,
      movementType: 'ADJUSTMENT',
      reason,
    }).then((r) => r.data),

  // ---------- pedidos ----------
  orders: () =>
    api.get('/admin/orders').then((r) => r.data),

  order: (id) =>
    api.get(`/admin/orders/${id}`).then((r) => r.data),

  updateOrderStatus: (id, status) =>
    api.patch(`/admin/orders/${id}/status`, { status }).then((r) => r.data),

  // ---------- banners ----------
  banners: () =>
    api.get('/admin/banners').then((r) => r.data),

  createBanner: (data) =>
    api.post('/admin/banners', data).then((r) => r.data),

  updateBanner: (id, data) =>
    api.put(`/admin/banners/${id}`, data).then((r) => r.data),

  deactivateBanner: (id) =>
    api.patch(`/admin/banners/${id}/deactivate`).then((r) => r.data),

  deleteBanner: (id) =>
    api.delete(`/admin/banners/${id}`).then((r) => r.data),

  // ---------- conteúdo institucional ----------
  contents: () =>
    api.get('/admin/content').then((r) => r.data),

  updateContent: (key, data) =>
    api.put(`/admin/content/${key}`, data).then((r) => r.data),

  // ---------- clientes ----------
  customers: () =>
    api.get('/admin/customers').then((r) => r.data),

  customer: (id) =>
    api.get(`/admin/customers/${id}`).then((r) => r.data),

  // ---------- upload de arquivos ----------
  uploadImage: (file) => {
    const fd = new FormData()
    fd.append('file', file)
    return api.post('/admin/uploads/image', fd).then((r) => r.data)
  },

  uploadVideo: (file) => {
    const fd = new FormData()
    fd.append('file', file)
    return api.post('/admin/uploads/video', fd).then((r) => r.data)
  },

  // ---------- mensagens de contato ----------
  contactMessages: () =>
    api.get('/admin/contact-messages').then((r) => r.data),

  contactUnreadCount: () =>
    api.get('/admin/contact-messages/unread-count').then((r) => r.data),

  markContactRead: (id) =>
    api.patch(`/admin/contact-messages/${id}/read`).then((r) => r.data),

  deleteContactMessage: (id) =>
    api.delete(`/admin/contact-messages/${id}`).then((r) => r.data),

  // ---------- auditoria ----------
  auditLogs: (params = {}) =>
    api.get('/admin/audit', { params }).then((r) => r.data),

  auditActions: () =>
    api.get('/admin/audit/actions').then((r) => r.data),
}