import { useEffect, useState } from 'react'
import PageHeader from '../../../components/admin/PageHeader.jsx'
import DataTable from '../../../components/admin/DataTable.jsx'
import StatusBadge from '../../../components/admin/StatusBadge.jsx'
import ConfirmModal from '../../../components/admin/ConfirmModal.jsx'
import LinkPicker from '../../../components/admin/LinkPicker.jsx'
import { adminApi } from '../../../services/api.js'
import { adaptBannerList } from '../../../services/adapters.js'

const EMPTY = {
  title: '', subtitle: '',
  imageUrl: '', videoUrl: '',
  buttonText: '', buttonLink: '',
  displayOrder: 1, active: true,
}

export default function AdminBanners() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')
  const [confirming, setConfirming] = useState(null)
  const [showLinkPicker, setShowLinkPicker] = useState(false)
  const [uploadingImg, setUploadingImg] = useState(false)
  const [uploadingVid, setUploadingVid] = useState(false)

  // =========================================================
  // CARREGAR
  // =========================================================
  const load = () => {
    setLoading(true)
    adminApi.banners()
      .then((data) => setList(adaptBannerList(data)))
      .catch((err) => {
        console.error(err)
        setError('Não foi possível carregar os banners.')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  // =========================================================
  // MODAL
  // =========================================================
  const openNew = () => setEditing({ ...EMPTY, _new: true })
  const openEdit = (b) => setEditing({ ...b, _new: false })
  const close = () => {
    setEditing(null)
    setShowLinkPicker(false)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setEditing((p) => ({
      ...p,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  // =========================================================
  // UPLOADS
  // =========================================================
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImg(true)
    setError('')
    try {
      const { url } = await adminApi.uploadImage(file)
      setEditing((p) => ({ ...p, imageUrl: url }))
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao enviar imagem.')
    } finally {
      setUploadingImg(false)
      e.target.value = ''
    }
  }

  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingVid(true)
    setError('')
    try {
      const { url } = await adminApi.uploadVideo(file)
      setEditing((p) => ({ ...p, videoUrl: url }))
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao enviar vídeo.')
    } finally {
      setUploadingVid(false)
      e.target.value = ''
    }
  }

  // =========================================================
  // SALVAR
  // =========================================================
  const save = async (e) => {
    e.preventDefault()
    setError('')

    if (!editing.imageUrl && !editing.videoUrl) {
      setError('Pelo menos uma imagem ou um vídeo é obrigatório.')
      return
    }

    if (!editing.title?.trim()) {
      setError('Título é obrigatório.')
      return
    }

    try {
      const payload = {
        title: editing.title.trim(),
        subtitle: editing.subtitle?.trim() || null,
        imageUrl: editing.imageUrl || null,
        videoUrl: editing.videoUrl || null,
        buttonText: editing.buttonText?.trim() || null,
        buttonLink: editing.buttonLink?.trim() || null,
        displayOrder: Number(editing.displayOrder) || 1,
        active: editing.active,
      }

      if (editing._new) {
        await adminApi.createBanner(payload)
      } else {
        await adminApi.updateBanner(editing.id, payload)
      }
      await load()
      close()
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar banner.')
    }
  }

  // =========================================================
  // CONFIRMAR (desativar/excluir)
  // =========================================================
  const doConfirm = async () => {
    if (!confirming) return
    try {
      if (confirming.action === 'deactivate') {
        await adminApi.deactivateBanner(confirming.id)
      } else {
        await adminApi.deleteBanner(confirming.id)
      }
      setConfirming(null)
      load()
    } catch (err) {
      alert(err.response?.data?.message || 'Erro.')
      setConfirming(null)
    }
  }

  // =========================================================
  // DERIVADOS
  // =========================================================
  const sorted = [...list].sort((a, b) => a.displayOrder - b.displayOrder)
  const heroBanner = sorted.find((b) => b.active)

  // =========================================================
  // COLUNAS
  // =========================================================
  const columns = [
    {
      key: 'imageUrl',
      label: 'Preview',
      render: (r) => (
        <div className="admin-table__thumb">
          {r.videoUrl ? (
            <video src={r.videoUrl} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : r.imageUrl ? (
            <img src={r.imageUrl} alt="" />
          ) : (
            <span className="text-muted" style={{ fontSize: 10 }}>—</span>
          )}
        </div>
      ),
    },
    { key: 'title', label: 'Título' },
    {
      key: 'videoUrl',
      label: 'Vídeo',
      render: (r) => r.videoUrl
        ? <StatusBadge tone="dark">Sim</StatusBadge>
        : <span className="text-muted">—</span>,
    },
    { key: 'displayOrder', label: 'Ordem' },
    {
      key: 'active',
      label: 'Status',
      render: (r) => (
        <StatusBadge tone={r.active ? 'dark' : 'muted'}>
          {r.active ? 'Ativo' : 'Inativo'}
        </StatusBadge>
      ),
    },
    {
      key: 'role',
      label: 'Onde aparece',
      render: (r) => {
        if (!r.active) return <span className="text-muted">— (inativo)</span>
        if (heroBanner && r.id === heroBanner.id) {
          return <StatusBadge tone="dark">Capa da Home</StatusBadge>
        }
        return <span className="text-muted">Não exibido</span>
      },
    },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        <div className="admin-table__actions" onClick={(e) => e.stopPropagation()}>
          <button className="link-quiet" onClick={() => openEdit(r)}>Editar</button>
          {r.active && (
            <button
              className="link-quiet"
              onClick={() => setConfirming({ id: r.id, action: 'deactivate', name: r.title })}
            >
              Desativar
            </button>
          )}
          <button
            className="link-quiet"
            onClick={() => setConfirming({ id: r.id, action: 'delete', name: r.title })}
          >
            Excluir
          </button>
        </div>
      ),
    },
  ]

  // =========================================================
  // RENDER
  // =========================================================
  return (
    <div className="admin-page">
      <PageHeader
        title="Banners"
        subtitle="Banners exibidos no topo da página inicial (Hero)"
        action={<button className="btn btn--primary" onClick={openNew}>+ Novo banner</button>}
      />

      {/* ---------- AVISO ---------- */}
      <div className="admin-block" style={{ background: 'var(--color-background)' }}>
        <h3 className="admin-block__title" style={{ fontSize: 16 }}>ℹ️ Como funciona</h3>
        <ul className="admin-text--muted" style={{ paddingLeft: 20, margin: '8px 0 0', lineHeight: 1.7 }}>
          <li><strong>Apenas 1 banner é exibido</strong> — o ativo de menor <em>Ordem</em></li>
          <li>Ele aparece no <strong>topo da página inicial</strong>, ocupando a tela toda</li>
          <li>Se tiver <strong>vídeo</strong>, o vídeo é exibido</li>
          <li>Se <strong>não tiver vídeo</strong>, só a imagem aparece</li>
          <li>A <strong>imagem é opcional</strong> — é o fallback caso o vídeo não carregue</li>
        </ul>
      </div>

      {error && !editing && <p className="auth-form__error">{error}</p>}

      {/* ---------- PRÉVIA ---------- */}
      {heroBanner && (
        <div className="admin-block">
          <h3 className="admin-block__title" style={{ fontSize: 16 }}>Prévia do banner ativo</h3>
          <p className="admin-text--muted" style={{ marginBottom: 12 }}>
            É este que está aparecendo na capa agora:
          </p>
          <div className="banner-preview">
            {heroBanner.videoUrl ? (
              <video
                className="banner-preview__media"
                src={heroBanner.videoUrl}
                poster={heroBanner.imageUrl || undefined}
                autoPlay
                muted
                loop
                playsInline
              />
            ) : heroBanner.imageUrl ? (
              <img
                className="banner-preview__media"
                src={heroBanner.imageUrl}
                alt={heroBanner.title}
              />
            ) : (
              <div className="banner-preview__media" style={{ background: '#000' }} />
            )}
            <div className="banner-preview__overlay" />
            <div className="banner-preview__content">
              <p className="banner-preview__title">{heroBanner.title}</p>
              {heroBanner.subtitle && (
                <p className="banner-preview__subtitle">{heroBanner.subtitle}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---------- LISTA ---------- */}
      {loading ? (
        <p className="text-muted">Carregando…</p>
      ) : list.length === 0 ? (
        <div className="admin-empty">
          <p className="admin-empty__title">Nenhum banner cadastrado</p>
          <p className="admin-empty__text">
            Crie o primeiro banner para aparecer no topo da Home.
          </p>
          <button className="btn btn--primary" onClick={openNew}>+ Criar banner</button>
        </div>
      ) : (
        <DataTable columns={columns} rows={sorted} emptyMessage="Nenhum banner." />
      )}

      {/* =========================================================
          MODAL DE EDIÇÃO
          ========================================================= */}
      {editing && (
        <div className="modal-overlay" onClick={close}>
          <div className="modal modal--lg" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal__title">
              {editing._new ? 'Novo banner' : 'Editar banner'}
            </h2>

            <form className="admin-form" onSubmit={save}>

              {/* ---------- IMAGEM ---------- */}
              <div className="field">
                <label>
                  Imagem de fundo
                  {!editing.videoUrl && ' *'}
                  {editing.videoUrl && <span className="text-muted" style={{ fontWeight: 400 }}> (opcional com vídeo)</span>}
                </label>
                <div className="admin-image-upload">
                  <input
                    type="file"
                    accept="image/*"
                    id="bannerImage"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="bannerImage" className="btn btn--ghost">
                    {uploadingImg ? 'Enviando…' : 'Escolher imagem'}
                  </label>
                  <span className="admin-image-upload__hint">
                    JPG, PNG ou WEBP · até 5MB
                  </span>
                </div>
                <input
                  name="imageUrl"
                  value={editing.imageUrl}
                  onChange={handleChange}
                  placeholder="Ou cole uma URL"
                  style={{ marginTop: 8 }}
                  required={!editing.videoUrl}
                />
                {editing.videoUrl && !editing.imageUrl && (
                  <small className="field__hint">
                    Sem imagem de capa. Se o vídeo falhar, o banner fica preto.
                  </small>
                )}
              </div>

              {editing.imageUrl && (
                <div className="admin-form__preview admin-form__preview--banner">
                  <img src={editing.imageUrl} alt="" />
                </div>
              )}

              {/* ---------- VÍDEO ---------- */}
              <div className="field">
                <label>Vídeo (substitui a imagem no Hero)</label>
                <div className="admin-image-upload">
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    id="bannerVideo"
                    onChange={handleVideoUpload}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="bannerVideo" className="btn btn--ghost">
                    {uploadingVid ? 'Enviando…' : 'Escolher vídeo'}
                  </label>
                  <span className="admin-image-upload__hint">
                    MP4 ou WEBM · 8–15s em loop
                  </span>
                </div>
                <input
                  name="videoUrl"
                  value={editing.videoUrl}
                  onChange={handleChange}
                  placeholder="Ou cole uma URL de vídeo"
                  style={{ marginTop: 8 }}
                />
                {editing.videoUrl && (
                  <button
                    type="button"
                    className="link-quiet"
                    style={{ alignSelf: 'flex-start', marginTop: 4 }}
                    onClick={() => setEditing((p) => ({ ...p, videoUrl: '' }))}
                  >
                    Remover vídeo
                  </button>
                )}
                {editing.videoUrl && !editing.imageUrl && (
                  <small className="field__hint" style={{ color: '#c0392b' }}>
                    ⚠️ Sem imagem de capa. Se o vídeo falhar, o banner fica preto.
                  </small>
                )}
              </div>

              {/* ---------- TEXTO ---------- */}
              <div className="field">
                <label>Título *</label>
                <input
                  name="title"
                  value={editing.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="field">
                <label>Subtítulo</label>
                <input
                  name="subtitle"
                  value={editing.subtitle}
                  onChange={handleChange}
                />
              </div>

              {/* ---------- BOTÃO ---------- */}
              <div className="admin-form__row">
                <div className="field">
                  <label>Texto do botão</label>
                  <input
                    name="buttonText"
                    value={editing.buttonText}
                    onChange={handleChange}
                    placeholder="Explorar produtos"
                  />
                </div>

                <div className="field">
                  <label>Destino do botão</label>
                  <div className="link-picker__field">
                    <div className="link-picker__display">
                      {editing.buttonLink || (
                        <span className="text-muted">Nenhum destino escolhido</span>
                      )}
                    </div>
                    <button
                      type="button"
                      className="btn btn--ghost"
                      onClick={() => setShowLinkPicker(true)}
                    >
                      Escolher
                    </button>
                    {editing.buttonLink && (
                      <button
                        type="button"
                        className="link-quiet"
                        onClick={() => setEditing((p) => ({ ...p, buttonLink: '' }))}
                      >
                        Limpar
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* ---------- ORDEM + STATUS ---------- */}
              <div className="admin-form__row">
                <div className="field">
                  <label>Ordem (menor = aparece primeiro)</label>
                  <input
                    name="displayOrder"
                    type="number"
                    min="1"
                    value={editing.displayOrder}
                    onChange={handleChange}
                  />
                  <small className="field__hint">
                    O banner ativo de menor número aparece na capa.
                  </small>
                </div>
                <div className="field">
                  <label>Status</label>
                  <label className="admin-checkbox" style={{ marginTop: 12 }}>
                    <input
                      type="checkbox"
                      name="active"
                      checked={editing.active}
                      onChange={handleChange}
                    />
                    <span>Ativo (aparece na Home)</span>
                  </label>
                </div>
              </div>

              {error && <p className="auth-form__error">{error}</p>}

              <div className="modal__actions">
                <button type="button" className="btn btn--ghost" onClick={close}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn--primary">
                  Salvar banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL DE CONFIRMAÇÃO
          ========================================================= */}
      {confirming && (
        <ConfirmModal
          title={confirming.action === 'delete' ? 'Excluir banner?' : 'Desativar banner?'}
          message={
            confirming.action === 'delete'
              ? `"${confirming.name}" será removido permanentemente.`
              : `"${confirming.name}" deixa de aparecer na Home. Você pode reativar depois.`
          }
          confirmLabel={confirming.action === 'delete' ? 'Excluir' : 'Desativar'}
          danger
          onConfirm={doConfirm}
          onCancel={() => setConfirming(null)}
        />
      )}

      {/* =========================================================
          LINK PICKER (fora do modal de edição)
          ========================================================= */}
      {showLinkPicker && editing && (
        <LinkPicker
          currentValue={editing.buttonLink}
          onChange={(val) => setEditing((p) => ({ ...p, buttonLink: val }))}
          onClose={() => setShowLinkPicker(false)}
        />
      )}
    </div>
  )
}