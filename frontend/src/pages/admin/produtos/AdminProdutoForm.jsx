import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import PageHeader from '../../../components/admin/PageHeader.jsx'
import Button from '../../../components/ui/Button.jsx'
import { adminApi } from '../../../services/api.js'
import {
  adaptAdminCategoryList,
  adaptAdminProduct,
  toApiProductForm,
  toApiProductUpdate,
} from '../../../services/adapters.js'

const EMPTY = {
  name: '',
  description: '',
  line: 'Linha care',
  categoryId: '',
  price: '',           // string
  image: '',
  stock: '',           // string
  minimumStock: '5',   // string
  active: true,
}

export default function AdminProdutoForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [form, setForm] = useState(EMPTY)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [uploadingImg, setUploadingImg] = useState(false)

  // ---------- categorias ----------
  useEffect(() => {
    adminApi.categories()
      .then((data) => {
        const adapted = adaptAdminCategoryList(data)
        setCategories(adapted)
        if (!isEdit && adapted.length > 0) {
          setForm((f) => ({ ...f, categoryId: adapted[0].id }))
        }
      })
      .catch((err) => console.error(err))
  }, [isEdit])

  // ---------- carregar produto ----------
  useEffect(() => {
    if (!isEdit) return
    adminApi.products()
      .then((data) => {
        const found = data.find((p) => String(p.id) === String(id))
        if (!found) throw new Error('Produto não encontrado')
        const adapted = adaptAdminProduct(found)
        setForm({
          name: adapted.name,
          description: adapted.description,
          line: adapted.line || 'Linha care',
          categoryId: adapted.categoryId,
          price: String(adapted.price),           // vira string
          image: adapted.image,
          stock: String(adapted.stock),           // vira string
          minimumStock: String(adapted.minimumStock), // vira string
          active: adapted.active,
        })
      })
      .catch((err) => {
        console.error(err)
        setError('Não foi possível carregar o produto.')
      })
      .finally(() => setLoading(false))
  }, [id, isEdit])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      // number: mantém como string pra permitir apagar tudo
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  // ---------- upload de imagem ----------
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImg(true)
    try {
      const { url } = await adminApi.uploadImage(file)
      setForm((prev) => ({ ...prev, image: url }))
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao enviar imagem.')
    } finally {
      setUploadingImg(false)
      e.target.value = ''
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      // converte strings em número só na hora de enviar
      const payload = {
        ...form,
        price: Number(form.price) || 0,
        stock: Number(form.stock) || 0,
        minimumStock: Number(form.minimumStock) || 0,
      }

      if (isEdit) {
        await adminApi.updateProduct(id, toApiProductUpdate(payload))
      } else {
        await adminApi.createProduct(toApiProductForm(payload))
      }
      navigate('/admin/produtos')
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || 'Erro ao salvar produto.')
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

  return (
    <div className="admin-page">
      <Link to="/admin/produtos" className="back-link">← Voltar para produtos</Link>

      <PageHeader
        title={isEdit ? 'Editar produto' : 'Novo produto'}
        subtitle={isEdit ? form.name : 'Cadastre um novo produto na loja'}
      />

      <form className="admin-form" onSubmit={handleSubmit}>
        <section className="admin-block">
          <h2 className="admin-block__title">Informações do produto</h2>

          <div className="field">
            <label htmlFor="name">Nome</label>
            <input id="name" name="name" value={form.name} onChange={handleChange} required />
          </div>

          <div className="field">
            <label htmlFor="line">Linha</label>
            <input id="line" name="line" value={form.line} onChange={handleChange} />
          </div>

          <div className="field">
            <label htmlFor="description">Descrição</label>
            <textarea id="description" name="description" rows={4} value={form.description} onChange={handleChange} />
          </div>

          <div className="admin-form__row">
            <div className="field">
              <label htmlFor="categoryId">Categoria</label>
              <select id="categoryId" name="categoryId" value={form.categoryId} onChange={handleChange} required>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="price">Preço (R$)</label>
              <input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={handleChange}
                placeholder="0,00"
                required
              />
            </div>
          </div>

          <div className="field">
            <label>Imagem do produto</label>
            <div className="admin-image-upload">
              <input
                type="file"
                accept="image/*"
                id="imageFile"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              <label htmlFor="imageFile" className="btn btn--ghost">
                {uploadingImg ? 'Enviando…' : 'Escolher arquivo'}
              </label>
              <span className="admin-image-upload__hint">
                JPG, PNG ou WEBP · até 5MB
              </span>
            </div>
            <input
              name="image"
              value={form.image}
              onChange={handleChange}
              placeholder="Ou cole uma URL"
              style={{ marginTop: 8 }}
            />
          </div>

          {form.image && (
            <div className="admin-form__preview">
              <img src={form.image} alt="Pré-visualização" />
            </div>
          )}
        </section>

        <section className="admin-block">
          <h2 className="admin-block__title">Estoque</h2>

          <div className="admin-form__row">
            <div className="field">
              <label htmlFor="stock">{isEdit ? 'Estoque atual' : 'Estoque inicial'}</label>
              <input
                id="stock"
                name="stock"
                type="number"
                min="0"
                value={form.stock}
                onChange={handleChange}
                placeholder="0"
                disabled={isEdit}
              />
              {isEdit && (
                <small className="field__hint">
                  Alterar pelo módulo <Link to={`/admin/estoque/${id}`}>Estoque</Link>.
                </small>
              )}
            </div>

            <div className="field">
              <label htmlFor="minimumStock">Estoque mínimo</label>
              <input
                id="minimumStock"
                name="minimumStock"
                type="number"
                min="0"
                value={form.minimumStock}
                onChange={handleChange}
                placeholder="5"
              />
            </div>
          </div>
        </section>

        <section className="admin-block">
          <h2 className="admin-block__title">Publicação</h2>
          <label className="admin-checkbox">
            <input type="checkbox" name="active" checked={form.active} onChange={handleChange} />
            <span>Produto ativo (aparece na loja)</span>
          </label>
        </section>

        {error && <p className="auth-form__error">{error}</p>}

        <div className="admin-form__actions">
          <Button variant="ghost" to="/admin/produtos">Cancelar</Button>
          <button type="submit" className="btn btn--primary" disabled={saving}>
            {saving ? 'Salvando…' : isEdit ? 'Salvar alterações' : 'Criar produto'}
          </button>
        </div>
      </form>
    </div>
  )
}