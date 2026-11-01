// ============================================================
// ADAPTERS — Backend ↔ Frontend
// ============================================================

// ---------- PRODUTOS ----------
export function adaptProduct(apiProduct) {
  if (!apiProduct) return null
  return {
    id: apiProduct.id,
    name: apiProduct.name,
    description: apiProduct.description || '',
    line: apiProduct.line || '',
    price: Number(apiProduct.price) || 0,
    image: apiProduct.imageUrl || '/images/produto-1.jpg',
    active: apiProduct.active ?? true,
    categoryId: apiProduct.categoryId,
    categoryName: apiProduct.categoryName,
    stock: apiProduct.stockQuantity ?? 0,
    minimumStock: apiProduct.minimumStock ?? 5,
    lowStock: apiProduct.lowStock ?? false,
  }
}

export function adaptProductList(list) {
  return (list || []).map(adaptProduct)
}

// ---------- CATEGORIAS ----------
export function adaptCategory(apiCategory) {
  if (!apiCategory) return null
  return {
    id: apiCategory.id,
    slug: apiCategory.slug,
    name: apiCategory.name,
    description: apiCategory.description || '',
    active: apiCategory.active ?? true,
  }
}

export function adaptCategoryList(list) {
  return (list || []).map(adaptCategory)
}

// ---------- ADMIN — PRODUTOS ----------
export function adaptAdminProduct(apiProduct) {
  return {
    id: apiProduct.id,
    name: apiProduct.name,
    description: apiProduct.description || '',
    line: apiProduct.line || '',
    price: Number(apiProduct.price) || 0,
    image: apiProduct.imageUrl || '',
    active: apiProduct.active ?? true,
    categoryId: apiProduct.categoryId,
    categoryName: apiProduct.categoryName || '—',
    stock: apiProduct.stockQuantity ?? 0,
    minimumStock: apiProduct.minimumStock ?? 5,
    lowStock: apiProduct.lowStock ?? false,
  }
}

export function adaptAdminProductList(list) {
  return (list || []).map(adaptAdminProduct)
}

export function toApiProductForm(form) {
  return {
    name: form.name,
    description: form.description,
    line: form.line,
    price: Number(form.price),
    imageUrl: form.image,
    categoryId: Number(form.categoryId),
    initialStock: Number(form.stock),
    minimumStock: Number(form.minimumStock),
  }
}

export function toApiProductUpdate(form) {
  return {
    name: form.name,
    description: form.description,
    line: form.line,
    price: Number(form.price),
    imageUrl: form.image,
    categoryId: Number(form.categoryId),
    active: form.active,
  }
}

// ---------- ADMIN — CATEGORIAS ----------
export function adaptAdminCategory(apiCat) {
  return {
    id: apiCat.id,
    slug: apiCat.slug,
    name: apiCat.name,
    description: apiCat.description || '',
    active: apiCat.active ?? true,
  }
}

export function adaptAdminCategoryList(list) {
  return (list || []).map(adaptAdminCategory)
}

// ---------- CARRINHO ----------
export function adaptCartItem(apiItem) {
  return {
    cartItemId: apiItem.id,
    id: apiItem.productId,
    name: apiItem.productName,
    line: '',
    price: Number(apiItem.unitPrice) || 0,
    image: apiItem.imageUrl || '/images/produto-1.jpg',
    qty: apiItem.quantity,
    subtotal: Number(apiItem.subtotal) || 0,
  }
}

export function adaptCart(apiCart) {
  return {
    id: apiCart?.id ?? null,
    items: (apiCart?.items || []).map(adaptCartItem),
    total: Number(apiCart?.total) || 0,
  }
}

// ---------- ENDEREÇOS ----------
export function adaptAddress(apiAddr) {
  return {
    id: apiAddr.id,
    label: '',
    zip: apiAddr.cep,
    street: apiAddr.street,
    number: apiAddr.number,
    complement: apiAddr.complement || '',
    district: apiAddr.neighborhood,
    city: apiAddr.city,
    state: apiAddr.state,
  }
}

export function adaptAddressList(list) {
  return (list || []).map(adaptAddress)
}

export function toApiAddress(form) {
  return {
    cep: form.zip,
    street: form.street,
    number: form.number,
    complement: form.complement || '',
    neighborhood: form.district,
    city: form.city,
    state: form.state,
  }
}

// ---------- PEDIDOS ----------
const STATUS_TO_FRONT = {
  RECEIVED: 'received',
  PREPARING: 'preparing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  COMPLETED: 'completed',
  CANCELLED: 'canceled',
}

const PAYMENT_STATUS_TO_FRONT = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REFUSED: 'refused',
  CANCELLED: 'cancelled',
}

const PAYMENT_METHOD_TO_FRONT = {
  PIX: 'pix',
  CREDIT_CARD: 'credit',
  DEBIT_CARD: 'debit',
}

export function adaptOrderItem(apiItem) {
  return {
    id: apiItem.id,
    productId: apiItem.productId,
    name: apiItem.productName,
    image: apiItem.imageUrl || '/images/produto-1.jpg',
    qty: apiItem.quantity,
    price: Number(apiItem.unitPrice) || 0,
    subtotal: Number(apiItem.subtotal) || 0,
  }
}

export function adaptOrder(apiOrder) {
  if (!apiOrder) return null
  return {
    id: apiOrder.id,
    date: apiOrder.createdAt,
    status: STATUS_TO_FRONT[apiOrder.status] || apiOrder.status,
    reviewed: apiOrder.reviewed ?? false,
    items: (apiOrder.items || []).map(adaptOrderItem),

    subtotal: Number(apiOrder.subtotal) || 0,
    shipping: Number(apiOrder.shippingPrice) || 0,
    total: Number(apiOrder.total) || 0,

    payment: {
      method: PAYMENT_METHOD_TO_FRONT[apiOrder.paymentMethod] || apiOrder.paymentMethod,
      status: PAYMENT_STATUS_TO_FRONT[apiOrder.paymentStatus] || apiOrder.paymentStatus,
    },

    customer: {
      name: apiOrder.customerName,
      email: apiOrder.customerEmail,
      phone: apiOrder.customerPhone,
    },

    address: {
      name: apiOrder.customerName,
      zip: apiOrder.cep,
      street: apiOrder.street,
      number: apiOrder.number,
      complement: apiOrder.complement || '',
      district: apiOrder.neighborhood,
      city: apiOrder.city,
      state: apiOrder.state,
    },
  }
}

export function adaptOrderList(list) {
  return (list || []).map(adaptOrder)
}

// ---------- ESTOQUE ----------
export function adaptInventory(api) {
  return {
    id: api.id,
    productId: api.productId,
    productName: api.productName,
    quantity: api.quantity ?? 0,
    minimumQuantity: api.minimumQuantity ?? 5,
    lowStock: api.lowStock ?? false,
  }
}

export function adaptInventoryList(list) {
  return (list || []).map(adaptInventory)
}

export function adaptMovement(api) {
  return {
    id: api.id,
    date: api.createdAt,
    type: api.movementType,
    qty: api.quantity,
    before: api.previousQuantity,
    after: api.newQuantity,
    reason: api.reason || '',
    orderId: api.orderId,
  }
}

export function adaptMovementList(list) {
  return (list || []).map(adaptMovement)
}

// ---------- CLIENTES ----------
export function adaptCustomer(api) {
  return {
    id: api.id,
    name: api.name,
    email: api.email,
    phone: api.phone || '',
    active: api.active ?? true,
    createdAt: api.createdAt,
  }
}

export function adaptCustomerList(list) {
  return (list || []).map(adaptCustomer)
}

// ---------- BANNERS ----------
export function adaptBanner(api) {
  return {
    id: api.id,
    title: api.title,
    subtitle: api.subtitle || '',
    imageUrl: api.imageUrl,
    videoUrl: api.videoUrl || '',
    buttonText: api.buttonText || '',
    buttonLink: api.buttonLink || '',
    displayOrder: api.displayOrder ?? 1,
    active: api.active ?? true,
  }
}

export function adaptBannerList(list) {
  return (list || []).map(adaptBanner)
}

// ---------- CONTEÚDO ----------
export function adaptContent(api) {
  return {
    id: api.id,
    key: api.key,
    title: api.title,
    content: api.content,
    active: api.active ?? true,
  }
}

export function adaptContentList(list) {
  return (list || []).map(adaptContent)
}