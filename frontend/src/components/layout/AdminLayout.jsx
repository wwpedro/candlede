import { useState } from 'react'
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { IconMenu, IconClose } from '../ui/Icons.jsx'

const NAV = [
  { section: null, items: [{ to: '/admin', label: 'Dashboard', end: true }] },
  { section: 'Catálogo', items: [
    { to: '/admin/produtos', label: 'Produtos' },
    { to: '/admin/categorias', label: 'Categorias' },
  ]},
  { section: 'Estoque', items: [
    { to: '/admin/estoque', label: 'Estoque' },
  ]},
  { section: 'Vendas', items: [
    { to: '/admin/pedidos', label: 'Pedidos' },
  ]},
  /*
  { section: 'Conteúdo', items: [
    { to: '/admin/banners', label: 'Banners' },
    { to: '/admin/textos', label: 'Textos' },
  ]},
  */
  { section: 'Clientes', items: [
    { to: '/admin/clientes', label: 'Clientes' },
  ]},
]
export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="admin-shell">
      {/* ---------- MOBILE TOPBAR ---------- */}
      <div className="admin-topbar">
        <button className="icon-btn" aria-label="Abrir menu" onClick={() => setOpen(true)}>
          <IconMenu />
        </button>
        <span className="admin-topbar__brand">Candlede Admin</span>
      </div>

      {/* ---------- SIDEBAR ---------- */}
      <aside className={`admin-sidebar${open ? ' is-open' : ''}`}>
        <div className="admin-sidebar__head">
          <Link to="/" className="admin-sidebar__brand">
            <span className="admin-sidebar__brand-top">Candlede</span>
            <span className="admin-sidebar__brand-sub">Admin</span>
          </Link>
          <button className="icon-btn admin-sidebar__close" onClick={() => setOpen(false)} aria-label="Fechar">
            <IconClose />
          </button>
        </div>

        <nav className="admin-nav">
          {NAV.map((group, gi) => (
            <div className="admin-nav__group" key={gi}>
              {group.section && <p className="admin-nav__section">{group.section}</p>}
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `admin-nav__link${isActive ? ' is-active' : ''}`}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="admin-sidebar__foot">
          <p className="admin-sidebar__user">{user?.name || 'Administrador'}</p>
          <p className="admin-sidebar__role">Administrador</p>
          <button className="admin-nav__link admin-nav__link--logout" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </aside>

      {open && <div className="admin-backdrop" onClick={() => setOpen(false)} />}

      {/* ---------- CONTENT ---------- */}
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  )
}