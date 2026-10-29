import { useEffect, useState } from 'react'
import PageHeader from '../../../components/admin/PageHeader.jsx'
import DataTable from '../../../components/admin/DataTable.jsx'
import StatusBadge from '../../../components/admin/StatusBadge.jsx'
import { adminApi } from '../../../services/api.js'
import { adaptAdminCategoryList } from '../../../services/adapters.js'

const EMPTY = { name: '', description: '', active: true }

export default function AdminCategorias() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    adminApi.categories()
      .then((data) => setList(adaptAdminCategoryList(data)))
      .catch((err) => {
        console.error(err)
        setError('Não foi possível carregar as categorias.')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openNew = () => setEditing({ ...EMPTY, _new: true })
  const openEdit = (c) => setEditing({ ...c, _new: false })
  const close = () => setEditing(null)

  const handleChange = (e) =>
    setEditing((p) => ({ ...p, [e.target.name]: e.target.value }))

  const save = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const payload = {
        name: editing.name,
        description: editing.description,
        active: editing.active ?? true,
      }
      if (editing._new) {
        await adminApi.createCategory(payload)
      } else {
        await adminApi.updateCategory(editing.id, payload)
      }
      await load()
      close()
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar categoria.')
    }
  }

  const toggle = async (cat) => {
  try {
    if (cat.active) {
      if (!confirm(`Desativar "${cat.name}"? Os produtos dessa categoria também serão desativados.`)) return
      await adminApi.deactivateCategory(cat.id)
    } else {
      // Reativa categoria (mas NÃO reativa os produtos automaticamente)
      await adminApi.updateCategory(cat.id, {
        name: cat.name,
        description: cat.description,
        active: true,
      })
    }
    load()
  } catch (err) {
    alert(err.response?.data?.message || 'Erro.')
  }
}

  const columns = [
    { key: 'name', label: 'Nome' },
    { key: 'slug', label: 'Slug', render: (r) => r.slug || '—' },
    { key: 'description', label: 'Descrição', render: (r) => r.description || '—' },
    { key: 'active', label: 'Status', render: (r) => (
      <StatusBadge tone={r.active ? 'dark' : 'muted'}>
        {r.active ? 'Ativa' : 'Inativa'}
      </StatusBadge>
    )},
    { key: 'actions', label: '', render: (r) => (
      <div className="admin-table__actions" onClick={(e) => e.stopPropagation()}>
        <button className="link-quiet" onClick={() => openEdit(r)}>Editar</button>
        <button className="link-quiet" onClick={() => toggle(r)}>
          {r.active ? 'Desativar' : 'Ativar'}
        </button>
      </div>
    )},
  ]

  return (
    <div className="admin-page">
      <PageHeader
        title="Categorias"
        subtitle="Organize os produtos da sua loja"
        action={<button className="btn btn--primary" onClick={openNew}>+ Nova categoria</button>}
      />

      {error && <p className="auth-form__error">{error}</p>}

      {loading ? (
        <p className="text-muted">Carregando…</p>
      ) : (
        <DataTable columns={columns} rows={list} emptyMessage="Nenhuma categoria cadastrada." />
      )}

      {editing && (
        <div className="modal-overlay" onClick={close}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal__title">
              {editing._new ? 'Nova categoria' : 'Editar categoria'}
            </h2>

            <form className="admin-form" onSubmit={save}>
              <div className="field">
                <label>Nome</label>
                <input name="name" value={editing.name} onChange={handleChange} required />
              </div>

              <div className="field">
                <label>Descrição</label>
                <textarea name="description" rows={3} value={editing.description} onChange={handleChange} />
              </div>

              <div className="modal__actions">
                <button type="button" className="btn btn--ghost" onClick={close}>Cancelar</button>
                <button type="submit" className="btn btn--primary">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}