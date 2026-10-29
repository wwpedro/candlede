import { useEffect, useState } from 'react'
import { addressApi } from '../../../services/api.js'
import {
  adaptAddressList,
  toApiAddress,
} from '../../../services/adapters.js'

const EMPTY = {
  zip: '', street: '', number: '', complement: '',
  district: '', city: '', state: '',
}

export default function MeusEnderecos() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)   // { id?, ...data } | null
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [error, setError] = useState('')

  // ---------- carregar ----------
  const load = async () => {
    setLoading(true)
    try {
      const data = await addressApi.list()
      setList(adaptAddressList(data))
    } catch (err) {
      console.error(err)
      setError('Não foi possível carregar seus endereços.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  // ---------- modal ----------
  const openNew = () => setEditing({ ...EMPTY, _new: true })
  const openEdit = (addr) => setEditing({ ...addr, _new: false })
  const close = () => setEditing(null)

  const handleChange = (e) =>
    setEditing((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const save = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const payload = toApiAddress(editing)
      if (editing._new) {
        await addressApi.create(payload)
      } else {
        await addressApi.update(editing.id, payload)
      }
      await load()
      close()
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar endereço.')
    }
  }

  const doDelete = async () => {
    try {
      await addressApi.remove(confirmDelete)
      setConfirmDelete(null)
      await load()
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao excluir endereço.')
      setConfirmDelete(null)
    }
  }

  return (
    <div className="account-page">
      <header className="account-page__head account-page__head--row">
        <h1 className="account-page__title">Meus endereços</h1>
        <button className="btn btn--primary" onClick={openNew}>
          + Adicionar endereço
        </button>
      </header>

      {error && <p className="auth-form__error">{error}</p>}

      {loading ? (
        <p className="text-muted">Carregando endereços…</p>
      ) : list.length === 0 ? (
        <p className="text-muted">Você ainda não cadastrou nenhum endereço.</p>
      ) : (
        <div className="address-grid">
          {list.map((a) => (
            <article key={a.id} className="address-card">
              <p className="address-card__body">
                {a.street}, {a.number}
                {a.complement && ` — ${a.complement}`}<br />
                {a.district}<br />
                {a.city} - {a.state}<br />
                CEP {a.zip}
              </p>
              <div className="address-card__actions">
                <button className="link-quiet" onClick={() => openEdit(a)}>Editar</button>
                <button className="link-quiet" onClick={() => setConfirmDelete(a.id)}>Excluir</button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* ---------- MODAL: FORM ---------- */}
      {editing && (
        <div className="modal-overlay" onClick={close}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal__title">
              {editing._new ? 'Novo endereço' : 'Editar endereço'}
            </h2>

            <form className="address-form" onSubmit={save}>
              <div className="address-form__row">
                <div className="field">
                  <label>CEP</label>
                  <input name="zip" value={editing.zip} onChange={handleChange} required />
                </div>
                <div className="field">
                  <label>Rua</label>
                  <input name="street" value={editing.street} onChange={handleChange} required />
                </div>
              </div>

              <div className="address-form__row">
                <div className="field">
                  <label>Número</label>
                  <input name="number" value={editing.number} onChange={handleChange} required />
                </div>
                <div className="field">
                  <label>Complemento</label>
                  <input name="complement" value={editing.complement} onChange={handleChange} />
                </div>
              </div>

              <div className="field">
                <label>Bairro</label>
                <input name="district" value={editing.district} onChange={handleChange} required />
              </div>

              <div className="address-form__row">
                <div className="field">
                  <label>Cidade</label>
                  <input name="city" value={editing.city} onChange={handleChange} required />
                </div>
                <div className="field">
                  <label>Estado</label>
                  <input name="state" value={editing.state} onChange={handleChange} maxLength={2} required />
                </div>
              </div>

              <div className="modal__actions">
                <button type="button" className="btn btn--ghost" onClick={close}>Cancelar</button>
                <button type="submit" className="btn btn--primary">Salvar endereço</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------- MODAL: EXCLUIR ---------- */}
      {confirmDelete !== null && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal modal--sm" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal__title">Excluir endereço?</h2>
            <p className="text-muted">Essa ação não pode ser desfeita.</p>
            <div className="modal__actions">
              <button className="btn btn--ghost" onClick={() => setConfirmDelete(null)}>Cancelar</button>
              <button className="btn btn--primary" onClick={doDelete}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}