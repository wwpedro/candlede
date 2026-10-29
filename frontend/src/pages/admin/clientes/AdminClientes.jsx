import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../../components/admin/PageHeader.jsx'
import DataTable from '../../../components/admin/DataTable.jsx'
import StatusBadge from '../../../components/admin/StatusBadge.jsx'
import { adminApi } from '../../../services/api.js'
import { adaptCustomerList } from '../../../services/adapters.js'

export default function AdminClientes() {
  const navigate = useNavigate()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    adminApi.customers()
      .then((data) => setList(adaptCustomerList(data)))
      .catch((err) => {
        console.error(err)
        setError('Não foi possível carregar os clientes.')
      })
      .finally(() => setLoading(false))
  }, [])

  const filtered = list.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.email.toLowerCase().includes(query.toLowerCase())
  )

  const columns = [
    { key: 'name', label: 'Nome' },
    { key: 'email', label: 'E-mail' },
    { key: 'phone', label: 'Telefone', render: (r) => r.phone || '—' },
    { key: 'createdAt', label: 'Cadastro', render: (r) => new Date(r.createdAt).toLocaleDateString('pt-BR') },
    { key: 'active', label: 'Status', render: (r) => (
      <StatusBadge tone={r.active ? 'dark' : 'muted'}>
        {r.active ? 'Ativo' : 'Inativo'}
      </StatusBadge>
    )},
  ]

  return (
    <div className="admin-page">
      <PageHeader title="Clientes" subtitle="Visualize os clientes cadastrados" />

      <div className="admin-filters">
        <input
          className="input admin-filters__search"
          placeholder="Buscar por nome ou e-mail..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {error && <p className="auth-form__error">{error}</p>}

      {loading ? (
        <p className="text-muted">Carregando…</p>
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          onRowClick={(row) => navigate(`/admin/clientes/${row.id}`)}
          emptyMessage="Nenhum cliente encontrado."
        />
      )}
    </div>
  )
}