import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import Container from '../ui/Container.jsx'
import {
  IconSearch, IconUser, IconCart, IconMenu, IconClose,
} from '../ui/Icons.jsx'
import { categories } from '../../data/catalog.js'
// IMPORTANTE: Importações para o autocomplete e notificações
import { catalogApi, orderApi } from '../../services/api.js'
import { adaptProductList } from '../../services/adapters.js'

const links = [
  { to: '/', label: 'Home' },
  { to: '/produtos', label: 'Produtos' },
  { to: '/sobre', label: 'Sobre' },
  { to: '/contato', label: 'Contato' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [userMenu, setUserMenu] = useState(false)
  const [catMenu, setCatMenu] = useState(false)
  
  // ESTADO DO SINO DE NOTIFICAÇÃO
  const [pendingOrders, setPendingOrders] = useState(0)

  const { count } = useCart()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const userRef = useRef(null)
  const catRef = useRef(null)

  // Fecha dropdowns ao clicar fora
  useEffect(() => {
    const onClick = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) setUserMenu(false)
      if (catRef.current && !catRef.current.contains(e.target)) setCatMenu(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  // Trava scroll do body quando menu mobile ou busca estiverem abertos
  useEffect(() => {
    document.body.style.overflow = open || searchOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open, searchOpen])

  // BUSCA NOTIFICAÇÕES (Só se for cliente logado)
  useEffect(() => {
    if (user && user.role === 'customer') {
      orderApi.getPendingConfirmationCount()
        .then((res) => setPendingOrders(res.count))
        .catch((err) => console.error("Erro ao buscar notificações", err))
    } else {
      setPendingOrders(0)
    }
  }, [user])

  useEffect(() => {
    const handleRefresh = () => {
      if (user && user.role === 'customer') {
        orderApi.getPendingConfirmationCount()
          .then((res) => setPendingOrders(res.count))
          .catch((err) => console.error("Erro ao atualizar notificações", err))
      }
    }

    window.addEventListener('candlede:refresh-notifications', handleRefresh)
    
    return () => window.removeEventListener('candlede:refresh-notifications', handleRefresh)
  }, [user])

  const linkClass = ({ isActive }) =>
    `site-header__link${isActive ? ' is-active' : ''}`

  const handleLogout = () => {
    logout()
    setUserMenu(false)
    setOpen(false)
    navigate('/', { replace: true })
  }

  return (
    <header className="site-header">
      <Container>
        {/* LINHA 1: logo */}
        <div className="site-header__top">
          <button
            className="icon-btn mobile-only site-header__burger"
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <IconClose /> : <IconMenu />}
          </button>

          <Link to="/" className="site-header__logo">Candlede</Link>
        </div>

        {/* LINHA 2: menu + ícones */}
        <div className="site-header__bottom desktop-only">
          <nav className="site-header__main">
            {links.map((l) =>
              l.hasCategories ? (
                <div
                  key={l.to}
                  className="site-header__dropdown"
                  ref={catRef}
                  onMouseEnter={() => setCatMenu(true)}
                  onMouseLeave={() => setCatMenu(false)}
                >
                  <NavLink to={l.to} className={linkClass}>
                    {l.label} ▾
                  </NavLink>
                  {catMenu && (
                    <div className="site-header__dropdown-panel">
                      <Link to="/produtos" onClick={() => setCatMenu(false)}>Todos</Link>
                      {categories.map((c) => (
                        <Link
                          key={c.slug}
                          to={`/categorias/${c.slug}`}
                          onClick={() => setCatMenu(false)}
                        >
                          {c.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <NavLink key={l.to} to={l.to} end={l.to === '/'} className={linkClass}>
                  {l.label}
                </NavLink>
              )
            )}
          </nav>

          <div className="site-header__actions">
            <button
              className="icon-btn"
              aria-label="Buscar"
              onClick={() => setSearchOpen(true)}
            >
              <IconSearch />
            </button>

            {/* ==========================================
                SINO DE NOTIFICAÇÃO (Só aparece se for cliente logado)
                ========================================== */}
            {user && user.role === 'customer' && (
              <Link 
                to="/meus-pedidos" 
                className="icon-btn cart-btn" 
                aria-label="Notificações" 
                title={pendingOrders > 0 ? "Você tem pedidos para confirmar!" : "Nenhuma notificação"}
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 01-3.46 0" />
                </svg>
                {pendingOrders > 0 && (
                  <span className="cart-btn__count" style={{ background: '#e74c3c', top: '-4px', right: '-4px' }}>
                    {pendingOrders}
                  </span>
                )}
              </Link>
            )}

            <div className="site-header__dropdown" ref={userRef}>
              <button
                className="icon-btn icon-btn--user"
                aria-label={user ? 'Minha conta' : 'Entrar'}
                onClick={() => (user ? setUserMenu((v) => !v) : navigate('/login'))}
              >
                <IconUser />
                {user && <span className="user-dot" />}
              </button>

              {user && userMenu && (
                <div className="site-header__dropdown-panel site-header__dropdown-panel--right">
                  <p className="site-header__dropdown-title">{user.name}</p>
                  <Link to="/minha-conta" onClick={() => setUserMenu(false)}>Minha conta</Link>
                  <Link to="/meus-pedidos" onClick={() => setUserMenu(false)}>Meus pedidos</Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" onClick={() => setUserMenu(false)}>Painel admin</Link>
                  )}
                  <hr className="site-header__dropdown-divider" />
                  <button onClick={handleLogout} className="site-header__dropdown-logout">
                    Sair
                  </button>
                </div>
              )}
            </div>

            <Link to="/carrinho" className="icon-btn cart-btn" aria-label="Carrinho">
              <IconCart />
              {count > 0 && <span className="cart-btn__count">{count}</span>}
            </Link>
          </div>
        </div>
      </Container>

      {/* BUSCA */}
      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}

      {/* MENU MOBILE */}
      {open && (
        <>
          <div className="mobile-menu-backdrop" onClick={() => setOpen(false)} />
          
          <div className="mobile-menu">
            <nav className="mobile-menu__nav">
              {links.map((l) => (
                <NavLink key={l.to} to={l.to} end={l.to === '/'} onClick={() => setOpen(false)}>
                  {l.label}
                </NavLink>
              ))}
              <hr className="site-header__dropdown-divider" />
              {user ? (
                <>
                  <NavLink to="/minha-conta" onClick={() => setOpen(false)}>Minha conta</NavLink>
                  <NavLink to="/meus-pedidos" onClick={() => setOpen(false)}>
                    Meus pedidos {pendingOrders > 0 && <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>({pendingOrders})</span>}
                  </NavLink>
                  {user.role === 'admin' && (
                    <NavLink to="/admin" onClick={() => setOpen(false)}>Painel admin</NavLink>
                  )}
                  <button className="mobile-menu__logout" onClick={handleLogout}>
                    Sair
                  </button>
                </>
              ) : (
                <NavLink to="/login" onClick={() => setOpen(false)}>Entrar</NavLink>
              )}
            </nav>
          </div>
        </>
      )}
    </header>
  )
}

/* ---------- OVERLAY DE BUSCA COM AUTOCOMPLETE ---------- */
function SearchOverlay({ onClose }) {
  const [q, setQ] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [isFetching, setIsFetching] = useState(false)
  
  const navigate = useNavigate()
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  // Lógica do Autocomplete
  useEffect(() => {
    const query = q.trim()

    if (query.length < 2) {
      setSuggestions([])
      return
    }

    // Timer para não fazer requisição a cada letra (Debounce)
    const timer = setTimeout(async () => {
      setIsFetching(true)
      try {
        const data = await catalogApi.searchProducts(query)
        const adapted = adaptProductList(data)
        setSuggestions(adapted.slice(0, 5)) // Pega no máximo 5 sugestões
      } catch (err) {
        console.error('Erro ao buscar sugestões', err)
      } finally {
        setIsFetching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [q])

  const submit = (e) => {
    e.preventDefault()
    if (!q.trim()) return
    navigate(`/busca?q=${encodeURIComponent(q.trim())}`)
    onClose()
  }

  const handleSelectSuggestion = (productId) => {
    navigate(`/produto/${productId}`)
    onClose()
  }

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-overlay__panel" onClick={(e) => e.stopPropagation()}>
        
        <form onSubmit={submit} className="search-overlay__form">
          <IconSearch />
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar produtos..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoComplete="off"
          />
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Fechar">
            <IconClose />
          </button>
        </form>

        {/* LISTA DE SUGESTÕES */}
        {q.trim().length >= 2 && (
          <div className="search-overlay__suggestions">
            {isFetching ? (
              <p className="search-suggestion__loading">Buscando no banco...</p>
            ) : suggestions.length > 0 ? (
              suggestions.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="search-suggestion"
                  onClick={() => handleSelectSuggestion(p.id)}
                >
                  <img src={p.image} alt={p.name} className="search-suggestion__img" />
                  <div className="search-suggestion__info">
                    <span className="search-suggestion__name">{p.name}</span>
                    <span className="search-suggestion__price">
                      R$ {p.price.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </button>
              ))
            ) : (
              <p className="search-suggestion__empty">Nenhum produto encontrado.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}