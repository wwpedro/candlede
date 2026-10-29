import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../../components/admin/PageHeader.jsx'
import DataTable from '../../../components/admin/DataTable.jsx'
import StatusBadge from '../../../components/admin/StatusBadge.jsx'
import ConfirmModal from '../../../components/admin/ConfirmModal.jsx'
import Button from '../../../components/ui/Button.jsx'
import { adminApi } from '../../../services/api.js'
import { adaptAdminProductList } from '../../../services/adapters.js'

function formatBRL(v) {
  return `R$ ${Number(v).toFixed(2).replace('.', ',')}`
}

export default function AdminProdutos() {
  const navigate = useNavigate()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [cat, setCat] = useState('todas')
  const [error, setError] = useState('')

  // estado do modal de confirmação
  const [confirming, setConfirming] = useState(null)   // { id, name } | null
  const [deactivating, setDeactivating] = useState(false)

  const load = () => {
    setLoading(true)
    adminApi.products()
      .then((data) => setList(adaptAdminProductList(data)))
      .catch((err) => {
        console.error(err)
        setError('Não foi possível carregar os produtos.')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    return list.filter((p) => {
      const matchQ = p.name.toLowerCase().includes(query.toLowerCase())
      const matchCat = cat === 'todas' || p.categoryName.toLowerCase() === cat.toLowerCase()
      return matchQ && matchCat
    })
  }, [list, query, cat])

  const handleDeactivate = async () => {
    if (!confirming) return
    setDeactivating(true)
    try {
      await adminApi.deactivateProduct(confirming.id)
      setConfirming(null)
      load()
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao desativar.')
    } finally {
      setDeactivating(false)
    }
  }

  const columns = [
    { key: 'name', label: 'Produto', render: (r) => (
      <div className="admin-table__product">
        <div className="admin-table__thumb">
          {r.image ? <img src={r.image} alt="" /> : null}
        </div>
        <span>{r.name}</span>
      </div>
    )},
    { key: 'categoryName', label: 'Categoria' },
    { key: 'price', label: 'Preço', render: (r) => formatBRL(r.price) },
    { key: 'stock', label: 'Estoque', render: (r) => (
      <span className="admin-table__stock">
        {r.stock}
        {r.stock === 0 && <StatusBadge tone="muted">Sem estoque</StatusBadge>}
        {r.stock > 0 && r.lowStock && <StatusBadge tone="muted">Baixo</StatusBadge>}
      </span>
    )},
    { key: 'active', label: 'Status', render: (r) => (
      <StatusBadge tone={r.active ? 'dark' : 'muted'}>
        {r.active ? 'Ativo' : 'Inativo'}
      </StatusBadge>
    )},
    { key: 'actions', label: '', render: (r) => (
      <div className="admin-table__actions" onClick={(e) => e.stopPropagation()}>
        <button className="link-quiet" onClick={() => navigate(`/admin/produtos/${r.id}`)}>
          Editar
        </button>
        {r.active && (
          <button
            className="link-quiet"
            onClick={() => setConfirming({ id: r.id, name: r.name })}
          >
            Desativar
          </button>
        )}
      </div>
    )},
  ]

  return (
    <div className="admin-page">
      <PageHeader
        title="Produtos"
        subtitle="Gerencie os produtos disponíveis na Candlede"
        action={<Button variant="primary" to="/admin/produtos/novo">+ Novo produto</Button>}
      />

      <div className="admin-filters">
        <input
          className="input admin-filters__search"
          placeholder="Buscar produto..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select className="input admin-filters__select" value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="todas">Todas as categorias</option>
          <option value="Velas">Velas</option>
          <option value="Perfumes">Perfumes</option>
          <option value="Cremes">Cremes</option>
          <option value="Aromatizadores">Aromatizadores</option>
        </select>
      </div>

      {error && <p className="auth-form__error">{error}</p>}

      {loading ? (
        <p className="text-muted">Carregando produtos…</p>
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          onRowClick={(row) => navigate(`/admin/produtos/${row.id}`)}
          emptyMessage="Nenhum produto encontrado."
        />
      )}

      {confirming && (
        <ConfirmModal
          title="Desativar produto?"
          message={`"${confirming.name}" deixará de aparecer na loja. Você pode reativar depois.`}
          confirmLabel={deactivating ? 'Desativando…' : 'Desativar'}
          danger
          onConfirm={handleDeactivate}
          onCancel={() => setConfirming(null)}
        />
      )}
    </div>
  )
}