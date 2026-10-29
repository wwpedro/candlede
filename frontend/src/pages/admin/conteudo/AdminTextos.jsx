import { useEffect, useMemo, useState } from 'react'
import PageHeader from '../../../components/admin/PageHeader.jsx'
import { adminApi } from '../../../services/api.js'
import { adaptContentList } from '../../../services/adapters.js'

// Nomes amigáveis para cada grupo de chaves
const GROUP_LABELS = {
  home:      'Página Inicial',
  sobre:     'Página Sobre',
  entrega:   'Entrega',
  pagamento: 'Pagamento',
  privacidade: 'Privacidade',
  termos:    'Termos de uso',
  contato:   'Contato',
  geral:     'Geral',
}

// Ordem de exibição dos grupos
const GROUP_ORDER = ['home', 'sobre', 'entrega', 'pagamento', 'privacidade', 'termos', 'contato', 'geral']

function groupKey(item) {
  if (!item.key.includes('_')) return 'geral'
  return item.key.split('_')[0]
}

export default function AdminTextos() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    adminApi.contents()
      .then((data) => setList(adaptContentList(data)))
      .catch((err) => {
        console.error(err)
        setError('Não foi possível carregar os textos.')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  // ---------- agrupa por prefixo ----------
  const grouped = useMemo(() => {
    const groups = {}
    list.forEach((item) => {
      const key = groupKey(item)
      if (!groups[key]) groups[key] = []
      groups[key].push(item)
    })
    return groups
  }, [list])

  // ---------- ordena os grupos ----------
  const orderedGroupKeys = useMemo(() => {
    const keys = Object.keys(grouped)
    return keys.sort((a, b) => {
      const ia = GROUP_ORDER.indexOf(a)
      const ib = GROUP_ORDER.indexOf(b)
      return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib)
    })
  }, [grouped])

  const openEdit = (item) => setEditing({ ...item })
  const close = () => setEditing(null)

  const handleChange = (e) =>
    setEditing((p) => ({ ...p, [e.target.name]: e.target.value }))

  const save = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await adminApi.updateContent(editing.key, {
        title: editing.title,
        content: editing.content,
        active: editing.active,
      })
      await load()
      close()
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar conteúdo.')
    }
  }

  return (
    <div className="admin-page">
      <PageHeader
        title="Textos institucionais"
        subtitle="Gerencie os conteúdos exibidos no site"
      />

      {error && <p className="auth-form__error">{error}</p>}

      {loading ? (
        <p className="text-muted">Carregando…</p>
      ) : list.length === 0 ? (
        <div className="admin-empty">
          <p className="admin-empty__title">Nenhum texto cadastrado</p>
          <p className="admin-empty__text">
            Os textos são criados automaticamente pelo backend na primeira execução.
          </p>
        </div>
      ) : (
        <div className="admin-text-groups">
          {orderedGroupKeys.map((key) => (
            <section key={key} className="admin-text-group">
              <header className="admin-text-group__head">
                <h2 className="admin-text-group__title">
                  {GROUP_LABELS[key] || key}
                </h2>
                <span className="admin-text-group__count">
                  {grouped[key].length} {grouped[key].length === 1 ? 'item' : 'itens'}
                </span>
              </header>

              <div className="admin-content-list">
                {grouped[key].map((item) => (
                  <article key={item.id} className="admin-content-card">
                    <div style={{ flex: 1 }}>
                      <p className="admin-content-card__key">{item.key}</p>
                      <h3 className="admin-content-card__title">{item.title}</h3>
                      <p className="admin-content-card__text">{item.content}</p>
                    </div>
                    <button
                      className="link-quiet"
                      onClick={() => openEdit(item)}
                    >
                      Editar →
                    </button>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* ---------- MODAL ---------- */}
      {editing && (
        <div className="modal-overlay" onClick={close}>
          <div className="modal modal--lg" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal__title">Editar texto</h2>

            <p className="admin-content-card__key" style={{ marginBottom: 16 }}>
              {editing.key}
            </p>

            <form className="admin-form" onSubmit={save}>
              <div className="field">
                <label>Nome (aparece só no admin)</label>
                <input
                  name="title"
                  value={editing.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="field">
                <label>Conteúdo (é o que aparece no site)</label>
                <textarea
                  name="content"
                  rows={10}
                  value={editing.content}
                  onChange={handleChange}
                  required
                />
                <small className="field__hint">
                  {editing.key.includes('image') || editing.key.includes('imagem')
                    ? 'Aqui deve ser o caminho da imagem (ex: /images/foto.jpg) ou uma URL completa.'
                    : 'Texto que será exibido no site.'}
                </small>
              </div>

              <div className="modal__actions">
                <button type="button" className="btn btn--ghost" onClick={close}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn--primary">
                  Salvar alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}