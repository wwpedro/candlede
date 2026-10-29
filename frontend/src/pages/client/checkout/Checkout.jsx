import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import CheckoutSteps from '../../../components/domain/CheckoutSteps.jsx'
import OrderSummary from '../../../components/domain/OrderSummary.jsx'
import { useCart } from '../../../context/CartContext.jsx'
import { useCheckout } from '../../../context/CheckoutContext.jsx'
import { addressApi } from '../../../services/api.js'
import { adaptAddressList, toApiAddress } from '../../../services/adapters.js'
import { calcularFrete } from '../../../utils/shipping.js' // <-- IMPORTANDO A FUNÇÃO

const EMPTY = {
  zip: '', street: '', number: '', complement: '',
  district: '', city: '', state: '',
}

export default function Checkout() {
  const { items, subtotal } = useCart()
  const { address, setAddress } = useCheckout()
  const navigate = useNavigate()

  const [list, setList] = useState([])
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // CÁLCULO DINÂMICO: Usa o CEP do endereço selecionado OU o CEP que está sendo digitado no formulário
  const shippingPrice = useMemo(() => {
    const cepParaCalculo = address ? address.zip : form.zip
    return calcularFrete(cepParaCalculo, subtotal)
  }, [address, form.zip, subtotal])

  useEffect(() => {
    if (items.length === 0) navigate('/carrinho', { replace: true })
  }, [items.length, navigate])

  useEffect(() => {
    let mounted = true
    addressApi.list()
      .then((data) => {
        if (!mounted) return
        const adapted = adaptAddressList(data)
        setList(adapted)
        if (adapted.length === 1 && !address) setAddress(adapted[0])
      })
      .catch((err) => {
        console.error(err)
        if (mounted) setError('Não foi possível carregar seus endereços.')
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => { mounted = false }
  }, []) // eslint-disable-line

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const saveNew = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const created = await addressApi.create(toApiAddress(form))
      const adapted = adaptAddressList([created])[0]
      setList([...list, adapted])
      setAddress(adapted)
      setEditing(false)
      setForm(EMPTY)
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar endereço.')
    }
  }

  const handleContinue = () => {
    if (!address) return
    navigate('/checkout/pagamento')
  }

  const isSelected = (a) => {
    if (!address) return false
    if (address.id && a.id) return address.id === a.id
    return address.zip === a.zip && address.number === a.number && address.complement === a.complement
  }

  return (
    <div className="checkout">
      <header className="checkout__head">
        <h1 className="checkout__title">Finalize seu pedido</h1>
        <CheckoutSteps current={0} />
      </header>

      <div className="checkout__grid">
        <div className="checkout__main">
          <h2 className="section-label">Endereço de entrega</h2>

          {loading ? (
            <p className="text-muted">Carregando endereços…</p>
          ) : (
            <>
              {list.length === 0 && !editing && (
                <p className="text-muted">Você ainda não cadastrou endereços.</p>
              )}

              <div className="address-options">
                {list.map((a, i) => (
                  <button
                    key={a.id ?? i}
                    type="button"
                    className={`address-option${isSelected(a) ? ' is-selected' : ''}`}
                    onClick={() => {
                      setAddress(a)
                      setEditing(false) // Fecha o form se estiver aberto
                    }}
                  >
                    <span className="address-option__radio" aria-hidden="true" />
                    <div className="address-option__body">
                      <address>
                        {a.street}, {a.number}
                        {a.complement && ` — ${a.complement}`}<br />
                        {a.district}<br />
                        {a.city} — {a.state}<br />
                        CEP {a.zip}
                      </address>
                    </div>
                  </button>
                ))}
              </div>

              {!editing && (
                <button
                  type="button"
                  className="link-quiet address-options__add"
                  onClick={() => {
                    setEditing(true)
                    setAddress(null) // Tira a seleção do antigo para calcular o novo
                  }}
                >
                  + Adicionar novo endereço
                </button>
              )}

              {editing && (
                <form className="address-form address-form--inline" onSubmit={saveNew}>
                  <div className="address-form__row">
                    <div className="field"><label>CEP</label><input name="zip" value={form.zip} onChange={handleChange} required /></div>
                    <div className="field"><label>Rua</label><input name="street" value={form.street} onChange={handleChange} required /></div>
                  </div>
                  <div className="address-form__row">
                    <div className="field"><label>Número</label><input name="number" value={form.number} onChange={handleChange} required /></div>
                    <div className="field"><label>Complemento</label><input name="complement" value={form.complement} onChange={handleChange} /></div>
                  </div>
                  <div className="field"><label>Bairro</label><input name="district" value={form.district} onChange={handleChange} required /></div>
                  <div className="address-form__row">
                    <div className="field"><label>Cidade</label><input name="city" value={form.city} onChange={handleChange} required /></div>
                    <div className="field">
                      <label>UF</label>
                      <input 
                        name="state" 
                        value={form.state} 
                        onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase() })} 
                        maxLength={2} 
                        placeholder="Ex: AL" 
                        required 
                      />
                    </div>
                  </div>
                  <div className="modal__actions">
                    <button type="button" className="btn btn--ghost" onClick={() => { setEditing(false); setForm(EMPTY) }}>Cancelar</button>
                    <button type="submit" className="btn btn--primary">Salvar endereço</button>
                  </div>
                </form>
              )}

              {error && <p className="auth-form__error" style={{ marginTop: 16 }}>{error}</p>}
            </>
          )}
        </div>

        <OrderSummary onContinue={handleContinue} disabled={!address} shipping={shippingPrice} />
      </div>
    </div>
  )
}