import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../../components/admin/PageHeader.jsx'
import DataTable from '../../../components/admin/DataTable.jsx'
import StatusBadge from '../../../components/admin/StatusBadge.jsx'
import { adminApi } from '../../../services/api.js'
import { adaptOrderList } from '../../../services/adapters.js'

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
  completed: 'Concluído',
  canceled: 'Cancelado',
}

const STATUS_TONE = {
  received: 'dark',
  preparing: 'dark',
  shipped: 'muted',
  delivered: 'muted',
  completed: 'dark',
  canceled: 'muted',
}

export default function AdminPedidos() {
  const navigate = useNavigate()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('todos')
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    adminApi.orders()
      .then((data) => setList(adaptOrderList(data)))
      .catch((err) => {
        console.error(err)
        setError('Não foi possível carregar os pedidos.')
      })
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    return list.filter((o) => {
      const matchS = status === 'todos' || o.status === status
      const q = query.toLowerCase()
      const matchQ = !q
        || String(o.id).includes(q)
        || o.customer.name.toLowerCase().includes(q)
      return matchS && matchQ
    })
  }, [list, status, query])

  const columns = [
    { key: 'id', label: 'Pedido', render: (r) => `#${r.id}` },
    { key: 'customer', label: 'Cliente', render: (r) => r.customer.name },
    { key: 'date', label: 'Data', render: (r) => formatDate(r.date) },
    { key: 'total', label: 'Total', render: (r) => formatBRL(r.total) },
    { key: 'status', label: 'Status', render: (r) => (
      <StatusBadge tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</StatusBadge>
    )},
  ]

  return (
    <div className="admin-page">
      <PageHeader title="Pedidos" subtitle="Acompanhe e gerencie os pedidos realizados" />

      <div className="admin-filters">
        <input
          className="input admin-filters__search"
          placeholder="Buscar por pedido ou cliente..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select className="input admin-filters__select" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="todos">Todos os status</option>
          <option value="received">Recebido</option>
          <option value="preparing">Preparando</option>
          <option value="shipped">Enviado</option>
          <option value="delivered">Entregue</option>
          <option value="completed">Concluído</option>
          <option value="canceled">Cancelado</option>
        </select>
      </div>

      {error && <p className="auth-form__error">{error}</p>}

      {loading ? (
        <p className="text-muted">Carregando…</p>
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          onRowClick={(row) => navigate(`/admin/pedidos/${row.id}`)}
          emptyMessage="Nenhum pedido encontrado."
        />
      )}
    </div>
  )
}