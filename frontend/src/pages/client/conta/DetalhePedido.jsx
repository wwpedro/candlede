import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { orderApi } from '../../../services/api.js'
import { adaptOrder } from '../../../services/adapters.js'

function formatBRL(v) {
  return `R$ ${Number(v).toFixed(2).replace('.', ',')}`
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
}

const STEPS = ['received', 'paid', 'preparing', 'shipped', 'delivered']
const STEP_LABEL = {
  received:  'Pedido recebido',
  paid:      'Pagamento confirmado',
  preparing: 'Preparando',
  shipped:   'Enviado',
  delivered: 'Entregue',
}

export default function DetalhePedido() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    orderApi.get(id)
      .then((data) => {
        if (mounted) setOrder(adaptOrder(data))
      })
      .catch((err) => {
        console.error(err)
        if (mounted) setError('Pedido não encontrado.')
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => { mounted = false }
  }, [id])

  if (loading) {
    return (
      <div className="account-page">
        <p className="text-muted">Carregando pedido…</p>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="account-page">
        <h1 className="account-page__title">Pedido não encontrado</h1>
        <Link to="/meus-pedidos" className="btn btn--ghost">Voltar</Link>
      </div>
    )
  }

  const isCanceled = order.status === 'canceled'
  const isPaid = order.payment.status === 'approved'
  const isPreparing = ['preparing', 'shipped', 'delivered'].includes(order.status)

  // Índice atual da timeline
  let currentIndex = STEPS.indexOf(order.status === 'received' ? 'received' : order.status)
  if (order.status === 'received' && isPaid) currentIndex = 1

  // ---------- AVISO DE 24H ----------
  // Mostra quando: pagamento aprovado + pedido ainda recebido (não começou a preparar)
  const showPreparingNotice = isPaid && order.status === 'received' && !isCanceled

  return (
    <div className="account-page">
      <Link to="/meus-pedidos" className="back-link">← Voltar para meus pedidos</Link>

      <header className="account-page__head">
        <h1 className="account-page__title">Pedido #{order.id}</h1>
        <p className="account-page__subtitle">{formatDate(order.date)}</p>
      </header>

      {/* ---------- AVISO DE 24H ---------- */}
      {showPreparingNotice && (
        <section className="order-notice">
          <div className="order-notice__icon">⏱</div>
          <div className="order-notice__content">
            <p className="order-notice__title">Aguardando preparação</p>
            <p className="order-notice__text">
              Seu pagamento foi confirmado. O fornecedor irá preparar seu pedido
              em <strong>até 24 horas</strong>. Você será notificado quando ele
              for enviado.
            </p>
          </div>
        </section>
      )}

      {/* ---------- TIMELINE ---------- */}
      <section className="order-status">
        <h2 className="section-label">Status</h2>

        {isCanceled ? (
          <p className="order-canceled">Este pedido foi cancelado.</p>
        ) : (
          <ol className="order-timeline">
            {STEPS.map((step, idx) => {
              const done = idx <= currentIndex
              return (
                <li
                  key={step}
                  className={`order-timeline__step${done ? ' is-done' : ''}`}
                >
                  <span className="order-timeline__dot" />
                  <span className="order-timeline__label">{STEP_LABEL[step]}</span>
                </li>
              )
            })}
          </ol>
        )}
      </section>

      {/* ---------- ITENS ---------- */}
      <section className="order-section">
        <h2 className="section-label">Produtos</h2>
        <div className="order-items">
          {order.items.map((it) => (
            <div key={it.id} className="order-item">
              <div className="order-item__media">
                <img src={it.image} alt={it.name} />
              </div>
              <div className="order-item__info">
                <p className="order-item__name">{it.name}</p>
                <p className="order-item__qty">
                  {it.qty} × {formatBRL(it.price)}
                </p>
              </div>
              <span className="order-item__total">{formatBRL(it.subtotal)}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- RESUMO ---------- */}
      <section className="order-section">
        <h2 className="section-label">Resumo</h2>
        <div className="order-summary">
          <div className="order-summary__row">
            <span>Subtotal</span><span>{formatBRL(order.subtotal)}</span>
          </div>
          <div className="order-summary__row">
            <span>Frete</span>
            <span>{order.shipping === 0 ? 'grátis' : formatBRL(order.shipping)}</span>
          </div>
          <hr className="order-summary__divider" />
          <div className="order-summary__row order-summary__row--total">
            <span>Total</span><span>{formatBRL(order.total)}</span>
          </div>
        </div>
      </section>

      {/* ---------- PAGAMENTO ---------- */}
      <section className="order-section">
        <h2 className="section-label">Pagamento</h2>
        <p className="order-text">
          {order.payment.method === 'pix' && 'PIX'}
          {order.payment.method === 'credit' && 'Cartão de crédito'}
          {order.payment.method === 'debit' && 'Cartão de débito'}
        </p>
        <p className="order-text text-muted">
          {order.payment.status === 'approved' && 'Pagamento aprovado'}
          {order.payment.status === 'pending' && 'Aguardando pagamento'}
          {order.payment.status === 'refused' && 'Pagamento recusado'}
          {order.payment.status === 'cancelled' && 'Pagamento cancelado'}
        </p>
      </section>

      {/* ---------- ENTREGA ---------- */}
      <section className="order-section">
        <h2 className="section-label">Entrega</h2>
        <address className="order-address">
          <strong>{order.address.name}</strong><br />
          {order.address.street}, {order.address.number}
          {order.address.complement && ` — ${order.address.complement}`}<br />
          {order.address.district}<br />
          {order.address.city} - {order.address.state}<br />
          {order.address.zip}
        </address>
      </section>
    </div>
  )
}