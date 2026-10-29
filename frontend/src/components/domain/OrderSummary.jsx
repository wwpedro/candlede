import { useState } from 'react'
import { useCart } from '../../context/CartContext.jsx'

function formatBRL(v) {
  return `R$ ${Number(v).toFixed(2).replace('.', ',')}`
}

export default function OrderSummary({
  ctaLabel = 'Continuar →',
  onContinue,
  disabled = false,
  shipping = null, // <--- NOVA PROP AQUI
}) {
  const { items, subtotal } = useCart()
  const [open, setOpen] = useState(false)

  // Se o frete não foi calculado ainda (carrinho), considera 0 pro cálculo do total visual
  const frete = shipping !== null ? shipping : 0
  const totalComFrete = subtotal + frete

  return (
    <aside className="order-summary-box">
      {/* Mobile: cabeçalho clicável */}
      <button
        type="button"
        className="order-summary-box__mobile-head"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span>Resumo do pedido</span>
        <span>{formatBRL(totalComFrete)} {open ? '˄' : '˅'}</span>
      </button>

      <div className={`order-summary-box__body${open ? ' is-open' : ''}`}>
        <h2 className="order-summary-box__title">Resumo do pedido</h2>

        <ul className="order-summary-box__items">
          {items.map((it) => (
            <li key={it.id}>
              <span>
                {it.name} <span className="order-summary-box__qty">x{it.qty}</span>
              </span>
              <span>{formatBRL(it.price * it.qty)}</span>
            </li>
          ))}
        </ul>

        <div className="order-summary-box__row">
          <span>Subtotal</span><span>{formatBRL(subtotal)}</span>
        </div>
        
        <div className="order-summary-box__row">
          <span>Frete</span>
          <span>
            {shipping === null ? (
              <span className="text-muted">A calcular</span>
            ) : shipping === 0 ? (
              <span className="summary__free">grátis</span>
            ) : (
              formatBRL(shipping)
            )}
          </span>
        </div>

        <hr className="order-summary-box__divider" />

        <div className="order-summary-box__row order-summary-box__row--total">
          <span>Total</span>
          <span>{formatBRL(totalComFrete)}</span>
        </div>

        {onContinue && (
          <button
            type="button"
            className="btn btn--primary order-summary-box__cta"
            onClick={onContinue}
            disabled={disabled}
          >
            {ctaLabel}
          </button>
        )}
      </div>
    </aside>
  )
}