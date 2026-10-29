import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import Container from '../ui/Container.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

const links = [
  { to: '/minha-conta',                label: 'Visão geral',     end: true },
  { to: '/meus-pedidos',               label: 'Meus pedidos' },
  { to: '/minha-conta/enderecos',      label: 'Meus endereços' },
  { to: '/minha-conta/dados',          label: 'Meus dados' },
]

export default function AccountLayout() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <Container>
      <div className="account">
        <aside className="account__sidebar">
          <p className="account__sidebar-label">Minha conta</p>

          <nav className="account__nav">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `account__link${isActive ? ' is-active' : ''}`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <hr className="account__divider" />

          <button
            type="button"
            className="account__link account__logout"
            onClick={handleLogout}
          >
            Sair
          </button>
        </aside>

        <main className="account__content">
          <Outlet />
        </main>
      </div>
    </Container>
  )
}