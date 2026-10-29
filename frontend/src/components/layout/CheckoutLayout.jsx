import { Link, Outlet } from 'react-router-dom'
import Container from '../ui/Container.jsx'

export default function CheckoutLayout() {
  return (
    <>
      <header className="checkout-header">
        <Container>
          <div className="checkout-header__inner">
            <Link to="/" className="checkout-header__logo">Candlede</Link>
            <span className="checkout-header__label">Checkout</span>
          </div>
        </Container>
      </header>

      <main className="checkout-main">
        <Container>
          <Link to="/carrinho" className="back-link">← Voltar para o carrinho</Link>
          <Outlet />
        </Container>
      </main>
    </>
  )
}