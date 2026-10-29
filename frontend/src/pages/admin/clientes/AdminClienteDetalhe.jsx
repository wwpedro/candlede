import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PageHeader from '../../../components/admin/PageHeader.jsx'
import StatusBadge from '../../../components/admin/StatusBadge.jsx'
import { adminApi } from '../../../services/api.js'
import { adaptCustomer, adaptOrderList } from '../../../services/adapters.js'

function formatBRL(v) {
  return `R$ ${Number(v).toFixed(2).replace('.', ',')}`
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('pt-BR')
}

const STATUS_LABEL = {
  received: 'Recebido',
  preparing: 'Preparando',
  shipped: 'Enviado',
  delivered: 'Entregue',
  canceled: 'Cancelado',
}

export default function AdminClienteDetalhe() {
  const { id } = useParams()
  const [customer, setCustomer] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    adminApi.customer(id)
      .then((data) => {
        setCustomer(adaptCustomer(data.customer))
        setOrders(adaptOrderList(data.orders))
      })
      .catch((err) => {
        console.error(err)
        setError('Cliente não encontrado.')
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="admin-page">
        <p className="text-muted">Carregando…</p>
      </div>
    )
  }

  if (error || !customer) {
    return (
      <div className="admin-page">
        <PageHeader title="Cliente não encontrado" />
        <Link to="/admin/clientes" className="btn btn--ghost">Voltar</Link>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <Link to="/admin/clientes" className="back-link">← Voltar para clientes</Link>

      <PageHeader title={customer.name} subtitle={customer.email} />

      <section className="admin-block">
        <h2 className="admin-block__title">Dados pessoais</h2>
        <div className="admin-info-grid">
          <div>
            <p className="admin-kpi__label">Nome</p>
            <p className="admin-text">{customer.name}</p>
          </div>
          <div>
            <p className="admin-kpi__label">E-mail</p>
            <p className="admin-text">{customer.email}</p>
          </div>
          <div>
            <p className="admin-kpi__label">Telefone</p>
            <p className="admin-text">{customer.phone || '—'}</p>
          </div>
          <div>
            <p className="admin-kpi__label">Cadastro</p>
            <p className="admin-text">{formatDate(customer.createdAt)}</p>
          </div>
          <div>
            <p className="admin-kpi__label">Status</p>
            <p style={{ marginTop: 6 }}>
              <StatusBadge tone={customer.active ? 'dark' : 'muted'}>
                {customer.active ? 'Ativo' : 'Inativo'}
              </StatusBadge>
            </p>
          </div>
        </div>
      </section>

      <section className="admin-block">
        <h2 className="admin-block__title">Histórico de pedidos</h2>
        {orders.length === 0 ? (
          <p className="admin-table-empty">Nenhum pedido deste cliente.</p>
        ) : (
          <table className="admin-table admin-table--compact">
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Data</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td><Link to={`/admin/pedidos/${o.id}`}>#{o.id}</Link></td>
                  <td>{formatDate(o.date)}</td>
                  <td>{formatBRL(o.total)}</td>
                  <td><StatusBadge tone="muted">{STATUS_LABEL[o.status]}</StatusBadge></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}