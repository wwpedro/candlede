import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PageHeader from '../../../components/admin/PageHeader.jsx'
import StatusBadge from '../../../components/admin/StatusBadge.jsx'
import Button from '../../../components/ui/Button.jsx'
import ConfirmModal from '../../../components/admin/ConfirmModal.jsx'
import { adminApi } from '../../../services/api.js'
import { adaptOrder } from '../../../services/adapters.js'

function formatBRL(v) {
  return `R$ ${Number(v).toFixed(2).replace('.', ',')}`
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
}

const STATUS_LABEL = {
  received: 'Pedido recebido',
  preparing: 'Preparando',
  shipped: 'Enviado',
  delivered: 'Entregue',
  completed: 'Concluído',
  canceled: 'Cancelado',
}

const STATUS_OPTIONS = [
  { value: 'RECEIVED', label: 'Pedido recebido' },
  { value: 'PREPARING', label: 'Preparando' },
  { value: 'SHIPPED', label: 'Enviado' },
  { value: 'DELIVERED', label: 'Entregue' },
  { value: 'COMPLETED', label: 'Concluído' },
  { value: 'CANCELLED', label: 'Cancelado' },
]

const STATUS_FLOW = ['received', 'preparing', 'shipped', 'delivered', 'completed']

export default function AdminPedidoDetalhe() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [confirming, setConfirming] = useState(false)

  const load = () => {
    setLoading(true)
    adminApi.order(id)
      .then((data) => {
        const adapted = adaptOrder(data)
        setOrder(adapted)
        setStatus(data.status)
      })
      .catch((err) => {
        console.error(err)
        setError('Pedido não encontrado.')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [id])

  const handleUpdate = () => {
    setConfirming(true)
  }

  const doUpdate = async () => {
    setSaving(true)
    try {
      await adminApi.updateOrderStatus(id, status)
      setConfirming(false)
      await load()
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao atualizar status.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="admin-page">
        <p className="text-muted">Carregando…</p>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="admin-page">
        <PageHeader title="Pedido não encontrado" />
        <Button variant="ghost" to="/admin/pedidos">Voltar</Button>
      </div>
    )
  }

  const currentIndex = STATUS_FLOW.indexOf(order.status)
  const isCanceled = order.status === 'canceled'
  const isCompleted = order.status === 'completed' // <-- NOVO: Trava de segurança
  const isDangerous = status === 'CANCELLED'

  return (
    <div className="admin-page">
      <Link to="/admin/pedidos" className="back-link">← Voltar para pedidos</Link>

      <PageHeader
        title={`Pedido #${order.id}`}
        subtitle={formatDate(order.date)}
      />

      <section className="admin-block">
        <header className="admin-block__head">
          <h2 className="admin-block__title">Status do pedido</h2>
          <StatusBadge tone={isCompleted ? 'dark' : 'default'}>
            {STATUS_LABEL[order.status]}
          </StatusBadge>
        </header>

        {isCanceled ? (
          <p className="order-canceled">Este pedido foi cancelado.</p>
        ) : (
          <ol className="admin-timeline">
            {STATUS_FLOW.map((step, i) => (
              <li key={step} className={i <= currentIndex ? 'is-done' : ''}>
                <span className="admin-timeline__dot" />
                <span>{STATUS_LABEL[step]}</span>
              </li>
            ))}
          </ol>
        )}

        {/* AVISO: O cliente já confirmou o recebimento */}
        {isCompleted && (
          <p className="text-muted" style={{ marginTop: 16, color: '#27ae60', fontWeight: 500 }}>
            ✓ O cliente já confirmou o recebimento deste pedido.
          </p>
        )}

        <div className="admin-actions-row">
          <select
            className="input admin-filters__select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={isCanceled || isCompleted} // Trava o select se já estiver concluído
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <Button
            variant="primary"
            onClick={handleUpdate}
            disabled={saving || isCanceled || isCompleted || status === order.status.toUpperCase()} // Trava o botão
          >
            Atualizar status
          </Button>
        </div>
      </section>

      <section className="admin-block">
        <h2 className="admin-block__title">Cliente</h2>
        <p className="admin-text">{order.customer.name}</p>
        <p className="admin-text admin-text--muted">{order.customer.email}</p>
        <p className="admin-text admin-text--muted">{order.customer.phone}</p>
      </section>

      <section className="admin-block">
        <h2 className="admin-block__title">Endereço de entrega</h2>
        <address className="admin-address">
          {order.address.name}<br />
          {order.address.street}, {order.address.number}<br />
          {order.address.district}<br />
          {order.address.city} — {order.address.state}<br />
          CEP {order.address.zip}
        </address>
      </section>

      <section className="admin-block">
        <h2 className="admin-block__title">Itens do pedido</h2>
        <ul className="admin-order-items">
          {order.items.map((it) => (
            <li key={it.id}>
              <div className="admin-order-items__thumb">
                {it.image && <img src={it.image} alt="" />}
              </div>
              <div className="admin-order-items__info">
                <p>{it.name}</p>
                <p className="admin-text--muted">{it.qty} × {formatBRL(it.price)}</p>
              </div>
              <span className="admin-order-items__total">{formatBRL(it.subtotal)}</span>
            </li>
          ))}
        </ul>

        <div className="admin-summary">
          <div><span>Subtotal</span><span>{formatBRL(order.subtotal)}</span></div>
          <div><span>Frete</span><span>{order.shipping === 0 ? 'grátis' : formatBRL(order.shipping)}</span></div>
          <div className="admin-summary--total">
            <span>Total</span><span>{formatBRL(order.total)}</span>
          </div>
        </div>
      </section>

      <section className="admin-block">
        <h2 className="admin-block__title">Pagamento</h2>
        <p className="admin-text">
          {order.payment.method === 'pix' && 'PIX'}
          {order.payment.method === 'credit' && 'Cartão de crédito'}
          {order.payment.method === 'debit' && 'Cartão de débito'}
        </p>
        <StatusBadge tone={order.payment.status === 'approved' ? 'dark' : 'muted'}>
          {order.payment.status === 'approved' && 'Aprovado'}
          {order.payment.status === 'pending' && 'Aguardando'}
          {order.payment.status === 'refused' && 'Recusado'}
          {order.payment.status === 'cancelled' && 'Cancelado'}
        </StatusBadge>
      </section>

      {confirming && (
        <ConfirmModal
          title={isDangerous ? 'Cancelar pedido?' : 'Atualizar status?'}
          message={
            isDangerous
              ? 'O estoque dos produtos será devolvido e o pedido não poderá voltar ao fluxo normal.'
              : `O status será alterado para "${STATUS_LABEL[status.toLowerCase()]}".`
          }
          confirmLabel={saving ? 'Salvando…' : isDangerous ? 'Cancelar pedido' : 'Confirmar'}
          danger={isDangerous}
          onConfirm={doUpdate}
          onCancel={() => setConfirming(false)}
        />
      )}
    </div>
  )
}