import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { orderApi } from '../../../services/api.js'
import { adaptOrderList } from '../../../services/adapters.js'

function formatBRL(v) {
  return `R$ ${Number(v).toFixed(2).replace('.', ',')}`
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
}

const STATUS_LABEL = {
  received:  'Pedido recebido',
  preparing: 'Preparando',
  shipped:   'Enviado',
  delivered: 'Entregue',
  completed: 'Concluído',
  canceled:  'Cancelado',
}

export default function MeusPedidos() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    orderApi.list()
      .then((data) => {
        if (mounted) setOrders(adaptOrderList(data))
      })
      .catch((err) => {
        console.error(err)
        if (mounted) setError('Não foi possível carregar seus pedidos.')
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => { mounted = false }
  }, [])

  if (loading) {
    return (
      <div className="account-page">
        <h1 className="account-page__title">Meus pedidos</h1>
        <p className="text-muted">Carregando…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="account-page">
        <h1 className="account-page__title">Meus pedidos</h1>
        <p className="auth-form__error">{error}</p>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="account-page">
        <h1 className="account-page__title">Meus pedidos</h1>
        <div className="account-empty">
          <p>Você ainda não fez nenhum pedido.</p>
          <p className="text-muted">
            Quando realizar sua primeira compra, seu pedido aparecerá aqui.
          </p>
          <Link to="/produtos" className="btn btn--ghost">
            Explorar produtos
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="account-page">
      <h1 className="account-page__title">Meus pedidos</h1>

      <div className="order-list">
        {orders.map((o) => {
          const itemsCount = o.items.reduce((s, i) => s + i.qty, 0)
          return (
            <article key={o.id} className="order-card">
              <div className="order-card__head">
                <div>
                  <p className="order-card__id">Pedido #{o.id}</p>
                  <p className="order-card__date">{formatDate(o.date)}</p>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  <span className={`status-dot status-dot--${o.status}`}>
                    {STATUS_LABEL[o.status]}
                  </span>
                  
                  {/* AVISO PARA CONFIRMAR ENTREGA */}
                  {o.status === 'delivered' && (
                    <Link to={`/meus-pedidos/${o.id}`} style={{ fontSize: '12px', color: '#e67e22', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      ⚠️ Confirmar recebimento
                    </Link>
                  )}
                  
                  {/* AVISO PARA AVALIAR: Só aparece se NÃO foi avaliado */}
                  {o.status === 'completed' && !o.reviewed && (
                    <Link to={`/meus-pedidos/${o.id}`} style={{ fontSize: '12px', color: '#d35400', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      ⚠️ Avaliar pedido
                    </Link>
                  )}
                </div>
              </div>

              <div className="order-card__meta">
                <span>{itemsCount} {itemsCount === 1 ? 'produto' : 'produtos'}</span>
                <span className="order-card__total">{formatBRL(o.total)}</span>
              </div>

              <Link
                to={`/meus-pedidos/${o.id}`}
                className="btn btn--ghost order-card__cta"
              >
                Ver pedido
              </Link>
            </article>
          )
        })}
      </div>
    </div>
  )
}