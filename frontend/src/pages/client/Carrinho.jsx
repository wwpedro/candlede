import { useEffect } from 'react' // <-- OBRIGATÓRIO IMPORTAR ISSO
import { Link } from 'react-router-dom'
import Container from '../../components/ui/Container.jsx'
import { useCart } from '../../context/CartContext.jsx'

function formatBRL(value) {
  return `R$ ${Number(value).toFixed(2).replace('.', ',')}`
}

export default function Carrinho() {
  // Adicionado o 'refresh' aqui na desestruturação
  const { items, increment, decrement, remove, subtotal, loading, refresh } = useCart()

  // Esse é o segredo: o array vazio [] no final faz rodar apenas 1 vez ao abrir a tela
  useEffect(() => {
    refresh()
  }, []) 

  if (loading) {
    return (
      <Container>
        <div className="cart">
          <h1 className="cart-title">Seu Carrinho</h1>
          <p className="text-muted" style={{ padding: '48px 0' }}>
            Carregando carrinho…
          </p>
        </div>
      </Container>
    )
  }

  if (items.length === 0) {
    return (
      <Container>
        <div className="cart-empty">
          <h1 className="cart-title">Seu Carrinho</h1>
          <hr className="hairline" />
          <div className="cart-empty__body">
            <p>Sua sacola está vazia.</p>
            <Link to="/produtos" className="btn btn--ghost">
              continuar comprando
            </Link>
          </div>
        </div>
      </Container>
    )
  }

  return (
    <Container>
      <div className="cart">
        <h1 className="cart-title">Seu Carrinho</h1>

        <div className="cart__grid">
          <div className="cart__list">
            <hr className="hairline hairline--top" />

            {items.map((item) => (
              <article className="cart-item" key={item.cartItemId}>
                <Link to={`/produto/${item.id}`} className="cart-item__media">
                  <img src={item.image} alt={item.name} />
                </Link>

                <div className="cart-item__info">
                  <div className="cart-item__head">
                    <div>
                      <h3 className="cart-item__name">
                        <Link to={`/produto/${item.id}`}>{item.name}</Link>
                      </h3>
                      <p className="cart-item__line">{item.line}</p>
                    </div>
                    <span className="cart-item__price">
                      {formatBRL(item.price)}
                    </span>
                  </div>

                  <div className="cart-item__controls">
                    <div className="qty">
                      <button
                        type="button"
                        className="qty__btn"
                        onClick={() => decrement(item.cartItemId)}
                        aria-label="Diminuir quantidade"
                      >
                        −
                      </button>
                      <span className="qty__value">{item.qty}</span>
                      <button
                        type="button"
                        className="qty__btn"
                        onClick={() => increment(item.cartItemId)}
                        aria-label="Aumentar quantidade"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      className="cart-item__remove"
                      onClick={() => remove(item.cartItemId)}
                    >
                      Remover
                    </button>
                  </div>
                </div>
              </article>
            ))}

            <hr className="hairline hairline--bottom" />
          </div>

          <aside className="cart__summary">
            <div className="summary">
              <h2 className="summary__title">Resumo</h2>

              <div className="summary__row">
                <span>Subtotal</span>
                <span>{formatBRL(subtotal)}</span>
              </div>

              <div className="summary__row">
                <span>Frete</span>
                <span className="summary__free">A calcular</span>
              </div>

              <hr className="summary__divider" />

              <div className="summary__row summary__row--total">
                <span>Total</span>
                <span>{formatBRL(subtotal)}</span>
              </div>

              <Link to="/checkout" className="btn btn--primary summary__cta">
                Finalizar Pedido
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </Container>
  )
}