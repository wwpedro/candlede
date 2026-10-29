import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../../../components/admin/PageHeader.jsx'
import DataTable from '../../../components/admin/DataTable.jsx'
import StatusBadge from '../../../components/admin/StatusBadge.jsx'
import { adminApi } from '../../../services/api.js'
import { adaptInventoryList } from '../../../services/adapters.js'

export default function AdminEstoque() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [situation, setSituation] = useState('todas')
  const [error, setError] = useState('')

  useEffect(() => {
    adminApi.inventory()
      .then((data) => setList(adaptInventoryList(data)))
      .catch((err) => {
        console.error(err)
        setError('Não foi possível carregar o estoque.')
      })
      .finally(() => setLoading(false))
  }, [])

  const classify = (item) => {
    if (item.quantity === 0) return { tone: 'muted', label: 'Sem estoque' }
    if (item.lowStock) return { tone: 'muted', label: 'Estoque baixo' }
    return { tone: 'dark', label: 'Normal' }
  }

  const filtered = useMemo(() => {
    return list.filter((item) => {
      const matchQ = item.productName.toLowerCase().includes(query.toLowerCase())
      let matchS = true
      if (situation === 'normal')    matchS = !item.lowStock && item.quantity > 0
      if (situation === 'low')       matchS = item.lowStock && item.quantity > 0
      if (situation === 'out')       matchS = item.quantity === 0
      return matchQ && matchS
    })
  }, [list, query, situation])

  const columns = [
    { key: 'productName', label: 'Produto' },
    { key: 'quantity', label: 'Atual' },
    { key: 'minimumQuantity', label: 'Mínimo' },
    { key: 'situation', label: 'Situação', render: (r) => {
      const c = classify(r)
      return <StatusBadge tone={c.tone}>{c.label}</StatusBadge>
    }},
    { key: 'actions', label: '', render: (r) => (
      <Link to={`/admin/estoque/${r.productId}`} className="link-quiet">Ver estoque</Link>
    )},
  ]

  return (
    <div className="admin-page">
      <PageHeader title="Estoque" subtitle="Controle de disponibilidade dos produtos" />

      <div className="admin-filters">
        <input
          className="input admin-filters__search"
          placeholder="Buscar produto..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select className="input admin-filters__select" value={situation} onChange={(e) => setSituation(e.target.value)}>
          <option value="todas">Todas as situações</option>
          <option value="normal">Estoque normal</option>
          <option value="low">Estoque baixo</option>
          <option value="out">Sem estoque</option>
        </select>
      </div>

      {error && <p className="auth-form__error">{error}</p>}

      {loading ? (
        <p className="text-muted">Carregando…</p>
      ) : (
        <DataTable columns={columns} rows={filtered} emptyMessage="Nenhum produto corresponde aos filtros." />
      )}
    </div>
  )
}