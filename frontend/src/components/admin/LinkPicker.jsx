import { useEffect, useMemo, useState } from 'react'
import { adminApi, catalogApi } from '../../services/api.js'
import { adaptAdminProductList, adaptAdminCategoryList } from '../../services/adapters.js'

// Rotas fixas
const STATIC_ROUTES = [
  { label: 'Home',              value: '/',           icon: '🏠' },
  { label: 'Todos os produtos', value: '/produtos',   icon: '🛍️' },
  { label: 'Sobre',             value: '/sobre',      icon: '📖' },
  { label: 'Contato',           value: '/contato',    icon: '✉️' },
  { label: 'Carrinho',          value: '/carrinho',   icon: '🛒' },
  { label: 'Login',             value: '/login',      icon: '🔑' },
  { label: 'Cadastro',          value: '/cadastro',   icon: '📝' },
]

export default function LinkPicker({ currentValue, onChange, onClose }) {
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState('produtos') // produtos | categorias | paginas
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      adminApi.products().then(adaptAdminProductList).catch(() => []),
      catalogApi.getCategories().then(adaptAdminCategoryList).catch(() => []),
    ]).then(([prods, cats]) => {
      setProducts(prods)
      setCategories(cats)
    }).finally(() => setLoading(false))
  }, [])

  const q = query.toLowerCase().trim()

  const filteredProducts = useMemo(() =>
    products.filter((p) => p.name.toLowerCase().includes(q)),
    [products, q]
  )

  const filteredCategories = useMemo(() =>
    categories.filter((c) => c.name.toLowerCase().includes(q)),
    [categories, q]
  )

  const filteredPages = useMemo(() =>
    STATIC_ROUTES.filter((r) =>
      r.label.toLowerCase().includes(q) || r.value.toLowerCase().includes(q)
    ),
    [q]
  )

  const pick = (val) => {
    onChange(val)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--lg" onClick={(e) => e.stopPropagation()}>
        <div className="link-picker__header">
          <h2 className="modal__title" style={{ margin: 0 }}>
            Escolher destino do botão
          </h2>
          <button className="icon-btn" onClick={onClose} aria-label="Fechar">
            ✕
          </button>
        </div>

        {/* Busca */}
        <input
          className="input"
          placeholder="Buscar produto, categoria ou página..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          style={{ marginTop: 16 }}
        />

        {/* Tabs */}
        <div className="link-picker__tabs">
          <button
            className={`link-picker__tab${tab === 'produtos' ? ' is-active' : ''}`}
            onClick={() => setTab('produtos')}
          >
            Produtos ({products.length})
          </button>
          <button
            className={`link-picker__tab${tab === 'categorias' ? ' is-active' : ''}`}
            onClick={() => setTab('categorias')}
          >
            Categorias ({categories.length})
          </button>
          <button
            className={`link-picker__tab${tab === 'paginas' ? ' is-active' : ''}`}
            onClick={() => setTab('paginas')}
          >
            Páginas
          </button>
        </div>

        {/* Lista */}
        <div className="link-picker__list">
          {loading && <p className="text-muted" style={{ padding: 32, textAlign: 'center' }}>Carregando…</p>}

          {!loading && tab === 'produtos' && (
            filteredProducts.length === 0 ? (
              <p className="text-muted" style={{ padding: 32, textAlign: 'center' }}>
                Nenhum produto encontrado.
              </p>
            ) : (
              <div className="link-picker__grid">
                {filteredProducts.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`link-picker__card${currentValue === `/produto/${p.id}` ? ' is-selected' : ''}`}
                    onClick={() => pick(`/produto/${p.id}`)}
                  >
                    <div className="link-picker__thumb">
                      {p.image
                        ? <img src={p.image} alt={p.name} />
                        : <span className="link-picker__thumb-empty">sem imagem</span>}
                    </div>
                    <span className="link-picker__name">{p.name}</span>
                    <span className="link-picker__value">/produto/{p.id}</span>
                  </button>
                ))}
              </div>
            )
          )}

          {!loading && tab === 'categorias' && (
            filteredCategories.length === 0 ? (
              <p className="text-muted" style={{ padding: 32, textAlign: 'center' }}>
                Nenhuma categoria encontrada.
              </p>
            ) : (
              <div className="link-picker__grid">
                {filteredCategories.map((c) => (
                  <button
                    key={c.slug}
                    type="button"
                    className={`link-picker__card${currentValue === `/categorias/${c.slug}` ? ' is-selected' : ''}`}
                    onClick={() => pick(`/categorias/${c.slug}`)}
                  >
                    <div className="link-picker__thumb link-picker__thumb--icon">
                      <span>📁</span>
                    </div>
                    <span className="link-picker__name">{c.name}</span>
                    <span className="link-picker__value">/categorias/{c.slug}</span>
                  </button>
                ))}
              </div>
            )
          )}

          {!loading && tab === 'paginas' && (
            <div className="link-picker__list-simple">
              {filteredPages.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  className={`link-picker__row${currentValue === r.value ? ' is-selected' : ''}`}
                  onClick={() => pick(r.value)}
                >
                  <span className="link-picker__icon">{r.icon}</span>
                  <span className="link-picker__label">{r.label}</span>
                  <span className="link-picker__value">{r.value}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div className="modal__actions" style={{ marginTop: 16 }}>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}