import { Outlet, Link } from 'react-router-dom'
import Container from '../ui/Container.jsx'

export default function AuthLayout() {
  return (
    <Container>
      <div className="auth">
        <Link to="/" className="auth__logo">Candlede</Link>
        <div className="auth__card">
          <Outlet />
        </div>
      </div>
    </Container>
  )
}