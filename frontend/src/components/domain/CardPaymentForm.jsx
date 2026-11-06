import { useMemo } from 'react'
import { initMercadoPago, CardPayment } from '@mercadopago/sdk-react'

// Inicializa o SDK uma única vez
initMercadoPago(import.meta.env.VITE_MP_PUBLIC_KEY, {
  locale: 'pt-BR',
})

export default function CardPaymentForm({
  amount,
  onSubmit,
  onError,
}) {
  // Configura o Brick
  const initialization = useMemo(
    () => ({ amount: Number(amount) }),
    [amount]
  )

  const customization = useMemo(
    () => ({
      visual: {
        style: {
          theme: 'default',
          customVariables: {
            baseColor: '#111111',
            baseColorFirstVariant: '#111111',
            baseColorSecondVariant: '#666666',
            textPrimaryColor: '#333333',
            textSecondaryColor: '#666666',
            inputBackgroundColor: '#FFFFFF',
            formBackgroundColor: '#FFFFFF',
            buttonTextColor: '#FFFFFF',
            borderRadiusSmall: '2px',
            borderRadiusMedium: '2px',
            borderRadiusLarge: '2px',
            fontSizeMedium: '14px',
            fontFamily: '"Manrope", sans-serif',
          },
        },
      },
      paymentMethods: {
        // minInstallments é o que faz o seletor de parcelas aparecer
        minInstallments: 1,
        // 12x é o padrão do mercado — ajuste conforme sua política
        maxInstallments: 12,
      },
    }),
    []
  )

  const callbacks = useMemo(
    () => ({
      onReady: () => {
        // Opcional: esconder loader
      },
      onSubmit: async (formData, additionalData) => {
        // formData.token = token seguro do cartão
        // Envia pro backend (que já recebe e repassa pro Mercado Pago)
        await onSubmit({
          token: formData.token,
          paymentMethodId: formData.payment_method_id,
          paymentType: additionalData.paymentTypeId, // "credit_card" | "debit_card"
          installments: formData.installments,
          issuerId: formData.issuer_id,
          payerEmail: formData.payer?.email,
          payerIdentification: formData.payer?.identification,
        })
      },
      onError: (error) => {
        console.error('[BRICK] erro:', error)
        onError?.(error)
      },
    }),
    [onSubmit, onError]
  )

  return (
    <div className="card-payment-brick">
      <CardPayment
        initialization={initialization}
        customization={customization}
        onSubmit={callbacks.onSubmit}
        onReady={callbacks.onReady}
        onError={callbacks.onError}
      />
    </div>
  )
}