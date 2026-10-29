import { products as seedProducts, categories as seedCategories } from './catalog.js'
import { stockHistory as seedHistory } from './admin.js'

const PRODUCTS_KEY = 'candlede:admin:products'
const CATEGORIES_KEY = 'candlede:admin:categories'
const HISTORY_KEY = 'candlede:admin:stockHistory'
const BANNERS_KEY = 'candlede:admin:banners'
const CONTENT_KEY = 'candlede:admin:content'

// ============================================================
// HELPERS
// ============================================================
function read(key, seed) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(seed))
      return seed
    }
    return JSON.parse(raw)
  } catch {
    return seed
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

// ============================================================
// PRODUCTS
// ============================================================
export function getProducts() {
  const enriched = seedProducts.map((p) => ({
    ...p,
    active: true,
    minimumStock: 5,
    categoryName:
      { velas: 'Velas', perfumes: 'Perfumes', cremes: 'Cremes', aromatizadores: 'Aromatizadores' }[p.category] || '—',
  }))
  return read(PRODUCTS_KEY, enriched)
}

export function saveProducts(list) {
  write(PRODUCTS_KEY, list)
  return list
}

export function getProduct(id) {
  return getProducts().find((p) => String(p.id) === String(id)) ?? null
}

export function upsertProduct(product) {
  const list = getProducts()
  const idx = list.findIndex((p) => String(p.id) === String(product.id))

  if (idx === -1) {
    const id = Date.now()
    const created = { ...product, id }
    saveProducts([created, ...list])
    if (product.stock > 0) {
      addMovement(id, {
        type: 'ENTRY',
        qty: product.stock,
        before: 0,
        after: product.stock,
        reason: 'Estoque inicial',
      })
    }
    return created
  }

  const next = [...list]
  next[idx] = { ...next[idx], ...product }
  saveProducts(next)
  return next[idx]
}

export function toggleProductActive(id) {
  const list = getProducts()
  saveProducts(list.map((p) =>
    String(p.id) === String(id) ? { ...p, active: !p.active } : p
  ))
}

export function deleteProduct(id) {
  saveProducts(getProducts().filter((p) => String(p.id) !== String(id)))
}

// ============================================================
// CATEGORIES
// ============================================================
export function getCategories() {
  const enriched = seedCategories.map((c) => ({
    ...c,
    active: true,
    productCount: seedProducts.filter((p) => p.category === c.slug).length,
  }))
  return read(CATEGORIES_KEY, enriched)
}

export function saveCategories(list) {
  write(CATEGORIES_KEY, list)
  return list
}

export function upsertCategory(category) {
  const list = getCategories()
  const idx = list.findIndex((c) => c.slug === category.slug)

  if (idx === -1) {
    const slug = category.slug || category.name.toLowerCase().replace(/\s+/g, '-')
    const created = { ...category, slug, productCount: 0, active: true }
    saveCategories([...list, created])
    return created
  }

  const next = [...list]
  next[idx] = { ...next[idx], ...category }
  saveCategories(next)
  return next[idx]
}

export function toggleCategoryActive(slug) {
  const list = getCategories()
  saveCategories(list.map((c) =>
    c.slug === slug ? { ...c, active: !c.active } : c
  ))
}

// ============================================================
// STOCK HISTORY
// ============================================================
export function getHistory(productId) {
  const all = read(HISTORY_KEY, seedHistory)
  return all[productId] || []
}

export function addMovement(productId, movement) {
  const all = read(HISTORY_KEY, seedHistory)
  const list = all[productId] || []
  const entry = { date: new Date().toISOString(), ...movement }
  all[productId] = [entry, ...list]
  write(HISTORY_KEY, all)
  return entry
}

export function stockEntry(productId, qty, reason) {
  const product = getProduct(productId)
  if (!product) return
  const before = product.stock
  const after = before + qty
  upsertProduct({ ...product, stock: after })
  addMovement(productId, {
    type: 'ENTRY',
    qty: +qty,
    before,
    after,
    reason: reason || 'Entrada manual',
  })
}

export function stockAdjust(productId, newStock, reason) {
  const product = getProduct(productId)
  if (!product) return
  const before = product.stock
  const diff = newStock - before
  upsertProduct({ ...product, stock: newStock })
  addMovement(productId, {
    type: 'ADJUSTMENT',
    qty: diff,
    before,
    after: newStock,
    reason: reason || 'Ajuste manual',
  })
}

// ============================================================
// BANNERS
// ============================================================
const BANNERS_SEED = [
  {
    id: 1,
    title: 'Essência Candlede',
    subtitle: 'Aromas que transformam momentos',
    imageUrl: '/images/hero.jpg',
    buttonText: 'Explorar produtos',
    buttonLink: '/produtos',
    displayOrder: 1,
    active: true,
  },
  {
    id: 2,
    title: 'Nova coleção',
    subtitle: 'Velas artesanais feitas à mão',
    imageUrl: '/images/editorial-1.jpg',
    buttonText: 'Conhecer',
    buttonLink: '/produtos',
    displayOrder: 2,
    active: false,
  },
]

export function getBanners() {
  return read(BANNERS_KEY, BANNERS_SEED)
}

export function saveBanners(list) {
  write(BANNERS_KEY, list)
  return list
}

export function upsertBanner(banner) {
  const list = getBanners()
  const idx = list.findIndex((b) => b.id === banner.id)
  if (idx === -1) {
    const created = { ...banner, id: Date.now() }
    saveBanners([...list, created])
    return created
  }
  const next = [...list]
  next[idx] = { ...next[idx], ...banner }
  saveBanners(next)
  return next[idx]
}

export function toggleBannerActive(id) {
  saveBanners(getBanners().map((b) =>
    b.id === id ? { ...b, active: !b.active } : b
  ))
}

export function deleteBanner(id) {
  saveBanners(getBanners().filter((b) => b.id !== id))
}

// ============================================================
// CONTEÚDO INSTITUCIONAL
// ============================================================
const CONTENT_SEED = [
  { id: 1, key: 'sobre',     title: 'Sobre a Candlede', content: 'A Candlede nasceu do desejo de transformar o cotidiano em algo mais sensível...', active: true },
  { id: 2, key: 'entrega',   title: 'Entrega e envio',  content: 'Enviamos para todo o Brasil. O prazo varia conforme a região...', active: true },
  { id: 3, key: 'pagamento', title: 'Pagamentos',        content: 'Aceitamos PIX e cartão de crédito/débito.', active: true },
  { id: 4, key: 'privacidade', title: 'Privacidade',     content: 'Seus dados são usados apenas para processar pedidos...', active: true },
  { id: 5, key: 'termos',    title: 'Termos de uso',     content: 'Ao usar a Candlede você concorda com nossos termos...', active: true },
  { id: 6, key: 'contato',   title: 'Contato',           content: 'Fale conosco pelo e-mail candlede@gmail.com.', active: true },
]

export function getContentList() {
  return read(CONTENT_KEY, CONTENT_SEED)
}

export function upsertContent(item) {
  const list = getContentList()
  const idx = list.findIndex((c) => c.key === item.key)
  if (idx === -1) {
    const created = { ...item, id: Date.now() }
    write(CONTENT_KEY, [...list, created])
    return created
  }
  const next = [...list]
  next[idx] = { ...next[idx], ...item }
  write(CONTENT_KEY, next)
  return next[idx]
}

export function getContentByKey(key) {
  return getContentList().find((c) => c.key === key) ?? null
}

// ============================================================
// CLIENTES (mock)
// ============================================================
const CUSTOMERS_SEED = [
  {
    id: 100,
    name: 'Maria Silva',
    email: 'maria@email.com',
    phone: '(82) 99999-9999',
    createdAt: '2026-08-15',
    active: true,
    addresses: [
      { label: 'Casa', street: 'Rua Exemplo', number: '120', district: 'Farol', city: 'Maceió', state: 'AL', zip: '57000-000' },
    ],
  },
  {
    id: 101,
    name: 'João Santos',
    email: 'joao@email.com',
    phone: '(82) 98888-8888',
    createdAt: '2026-07-02',
    active: true,
    addresses: [
      { label: 'Trabalho', street: 'Av. Central', number: '500', district: 'Centro', city: 'Maceió', state: 'AL', zip: '57000-100' },
    ],
  },
  {
    id: 102,
    name: 'Ana Souza',
    email: 'ana@email.com',
    phone: '(82) 97777-7777',
    createdAt: '2026-09-01',
    active: true,
    addresses: [],
  },
]

export function getCustomers() {
  return CUSTOMERS_SEED
}

export function getCustomer(id) {
  return CUSTOMERS_SEED.find((c) => String(c.id) === String(id)) ?? null
}