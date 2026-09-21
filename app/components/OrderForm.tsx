'use client'

import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createOrder } from '@/app/actions'
import { Check, Send, ChevronRight } from 'lucide-react'
import { mutate } from 'swr'
import { Flavor } from '@prisma/client'

const orderSchema = z.object({
  customerName: z.string().optional(),
  phone: z.string().optional(),
  isDelivery: z.boolean(),
  deliveryAddress: z.string().optional(),
  orderQuantity: z.number().min(1, 'Debe pedir al menos 1 orden'),
  // flavors: un array por cada orden, cada una con 1-2 salsas
  flavors: z.array(z.array(z.string()).min(1, 'Cada orden necesita al menos 1 salsa').max(2)),
  isTakeaway: z.boolean()
}).superRefine((data, ctx) => {
  if (data.isDelivery && (!data.deliveryAddress || data.deliveryAddress.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'La dirección es obligatoria para envíos a domicilio',
      path: ['deliveryAddress']
    })
  }
  // Verificar que hay tantos subarrays como órdenes
  if (data.flavors.length !== data.orderQuantity) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Selecciona salsas para todas las órdenes',
      path: ['flavors']
    })
  }
})

type OrderFormValues = z.infer<typeof orderSchema>

export default function OrderForm({ flavors, maxOrders, onClose }: { flavors: Flavor[], maxOrders: number, onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const [activeOrderIdx, setActiveOrderIdx] = useState(0)

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      isDelivery: false,
      isTakeaway: false,
      orderQuantity: 1,
      flavors: [[]]
    }
  })

  const isDelivery = watch('isDelivery')
  const orderQuantity = watch('orderQuantity')
  const allFlavors = watch('flavors')

  // Sincronizar el array de salsas cuando cambia la cantidad de órdenes
  useEffect(() => {
    const current = allFlavors ?? []
    if (current.length < orderQuantity) {
      const newArr = [...current, ...Array.from({ length: orderQuantity - current.length }, () => [])]
      setValue('flavors', newArr)
    } else if (current.length > orderQuantity) {
      setValue('flavors', current.slice(0, orderQuantity))
    }
    // Resetear índice activo si queda fuera de rango
    if (activeOrderIdx >= orderQuantity) setActiveOrderIdx(orderQuantity - 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderQuantity])

  const onSubmit = async (data: OrderFormValues) => {
    setLoading(true)
    try {
      const basePrice = 85.00
      const totalCost = basePrice * data.orderQuantity
      await createOrder({ ...data, totalCost })
      mutate('orders')
      mutate('activeShift')
      onClose()
    } catch (error: unknown) {
      alert((error as Error).message || 'Error al crear la orden')
    } finally {
      setLoading(false)
    }
  }

  const completedOrders = (allFlavors ?? []).filter(f => f && f.length > 0).length
  const allComplete = completedOrders === orderQuantity

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
      {/* Detalles básicos */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-slate-800">Detalles Básicos</h3>
        <div className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 text-xs sm:text-sm">Nombre (Opcional)</label>
              <input {...register('customerName')} className="w-full p-3 sm:p-4 text-base sm:text-lg border-2 border-slate-200 rounded-xl sm:rounded-2xl focus:border-orange-500 outline-none" placeholder="Nombre" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 text-xs sm:text-sm">Teléfono (Opcional)</label>
              <input {...register('phone')} className="w-full p-3 sm:p-4 text-base sm:text-lg border-2 border-slate-200 rounded-xl sm:rounded-2xl focus:border-orange-500 outline-none" placeholder="Teléfono" />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5 text-xs sm:text-sm">Cantidad de Órdenes (5pz c/u)</label>
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => { if (orderQuantity > 1) setValue('orderQuantity', orderQuantity - 1) }}
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-slate-100 hover:bg-slate-200 text-2xl sm:text-3xl font-black text-slate-700 flex items-center justify-center transition-colors active:scale-95 shrink-0"
              >-</button>
              <div className="flex-1 py-2.5 sm:py-3 text-2xl sm:text-3xl font-black border-2 border-slate-200 rounded-xl sm:rounded-2xl text-center bg-white text-slate-800">
                {orderQuantity}
              </div>
              <button
                type="button"
                onClick={() => { if (orderQuantity < maxOrders) setValue('orderQuantity', orderQuantity + 1) }}
                disabled={orderQuantity >= maxOrders}
                className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl text-2xl sm:text-3xl font-black flex items-center justify-center transition-colors shrink-0 ${orderQuantity >= maxOrders ? 'bg-slate-100 text-slate-300' : 'bg-orange-100 hover:bg-orange-200 text-orange-700 active:scale-95'}`}
              >+</button>
            </div>
            <input type="hidden" {...register('orderQuantity', { valueAsNumber: true })} />
            {errors.orderQuantity && <p className="text-red-500 font-bold mt-1 text-xs sm:text-sm">{errors.orderQuantity.message}</p>}
          </div>
        </div>
      </div>

      {/* Tipo de servicio */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-slate-800">Tipo de Servicio</h3>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
          <Controller
            name="isTakeaway"
            control={control}
            render={({ field }) => (
              <button type="button"
                onClick={() => { const v = !field.value; field.onChange(v); if (v) setValue('isDelivery', false) }}
                className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-lg border-2 transition-all ${field.value ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-slate-200 text-slate-500'}`}
              >Para Llevar</button>
            )}
          />
          <Controller
            name="isDelivery"
            control={control}
            render={({ field }) => (
              <button type="button"
                onClick={() => { const v = !field.value; field.onChange(v); if (v) setValue('isTakeaway', false) }}
                className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-lg border-2 transition-all ${field.value ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-slate-200 text-slate-500'}`}
              >A Domicilio</button>
            )}
          />
        </div>
        {isDelivery && (
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 text-xs sm:text-sm">Dirección de Entrega</label>
            <textarea {...register('deliveryAddress')} className="w-full p-3 sm:p-4 text-base sm:text-lg border-2 border-slate-200 rounded-xl sm:rounded-2xl focus:border-orange-500 outline-none" rows={2} placeholder="Calle, Número, Colonia..." />
            {errors.deliveryAddress && <p className="text-red-500 font-bold mt-1 text-xs sm:text-sm">{errors.deliveryAddress.message}</p>}
          </div>
        )}
      </div>

      {/* Salsas por orden */}
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Header con progreso */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg sm:text-xl font-bold text-slate-800">Salsas por Orden</h3>
          <span className={`text-sm sm:text-lg font-black px-3 sm:px-4 py-1 rounded-full ${allComplete ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
            {completedOrders}/{orderQuantity}
          </span>
        </div>

        {/* Tabs de órdenes */}
        <div className="flex gap-2 px-3 sm:px-4 pt-3 sm:pt-4 overflow-x-auto pb-2">
          {Array.from({ length: orderQuantity }).map((_, i) => {
            const orderFlavors = allFlavors?.[i] ?? []
            const isDone = orderFlavors.length > 0
            const isActive = activeOrderIdx === i
            return (
              <button
                key={i}
                type="button"
                onClick={() => setActiveOrderIdx(i)}
                className={`shrink-0 px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center gap-1.5 sm:gap-2 border-2 ${
                  isActive
                    ? 'bg-slate-800 text-white border-slate-800'
                    : isDone
                    ? 'bg-green-50 text-green-700 border-green-300'
                    : 'bg-slate-50 text-slate-500 border-slate-200'
                }`}
              >
                {isDone && !isActive && <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                Orden {i + 1}
                {!isActive && isDone && (
                  <span className="text-[10px] sm:text-xs font-bold opacity-70">{orderFlavors.join(', ').substring(0, 10)}{orderFlavors.join(', ').length > 10 ? '…' : ''}</span>
                )}
              </button>
            )
          })}
        </div>

        {/* Panel de salsas del orden activo */}
        <Controller
          name="flavors"
          control={control}
          render={({ field }) => {
            const currentFlavors: string[] = field.value?.[activeOrderIdx] ?? []
            const maxReached = currentFlavors.length >= 2

            const toggle = (flavorName: string) => {
              const updated = [...(field.value ?? [])]
              const cur = updated[activeOrderIdx] ?? []
              if (cur.includes(flavorName)) {
                updated[activeOrderIdx] = cur.filter(f => f !== flavorName)
              } else if (cur.length < 2) {
                updated[activeOrderIdx] = [...cur, flavorName]
              }
              field.onChange(updated)

              // Auto-avanzar al siguiente orden si se llenó y no es el último
              if (updated[activeOrderIdx]?.length === 2 && activeOrderIdx < orderQuantity - 1) {
                setTimeout(() => setActiveOrderIdx(activeOrderIdx + 1), 220)
              }
            }

            return (
              <div className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2.5 sm:mb-3">
                  <p className="text-slate-500 font-semibold text-xs sm:text-sm">
                    Orden {activeOrderIdx + 1} — máx 2 salsas
                  </p>
                  <span className={`text-xs sm:text-sm font-black ${maxReached ? 'text-green-600' : 'text-slate-400'}`}>
                    {currentFlavors.length}/2
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {flavors.map(f => {
                    const isSelected = currentFlavors.includes(f.name)
                    const isDisabled = !isSelected && maxReached
                    return (
                      <button
                        key={f.id}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => toggle(f.name)}
                        className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-lg border-2 transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                            : isDisabled
                            ? 'opacity-40 bg-slate-50 border-slate-200'
                            : 'border-slate-200 hover:border-orange-300 active:scale-95'
                        }`}
                      >
                        <span className="truncate">{f.name}</span>
                        {isSelected && <Check className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 shrink-0 ml-1" />}
                      </button>
                    )
                  })}
                </div>

                {/* Botón avanzar si ya hay salsas y no es el último */}
                {currentFlavors.length > 0 && activeOrderIdx < orderQuantity - 1 && (
                  <button
                    type="button"
                    onClick={() => setActiveOrderIdx(activeOrderIdx + 1)}
                    className="mt-3 sm:mt-4 w-full py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-slate-100 hover:bg-slate-200 font-bold text-sm sm:text-base text-slate-700 flex items-center justify-center gap-2 transition-colors"
                  >
                    Siguiente: Orden {activeOrderIdx + 2}
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                )}
              </div>
            )
          }}
        />

        {errors.flavors && (
          <p className="px-4 sm:px-6 pb-3 sm:pb-4 text-red-500 font-bold text-xs sm:text-sm">
            {typeof errors.flavors.message === 'string'
              ? errors.flavors.message
              : 'Selecciona salsas para todas las órdenes'}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || !allComplete}
        className={`w-full min-h-[58px] sm:min-h-[72px] text-lg sm:text-2xl font-black text-white rounded-2xl sm:rounded-3xl transition-colors active:scale-95 flex items-center justify-center gap-3 sm:gap-4 shadow-lg ${allComplete ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-200' : 'bg-slate-300 cursor-not-allowed'} disabled:opacity-70`}
      >
        <Send className="w-5 h-5 sm:w-8 sm:h-8" />
        {loading ? 'Procesando...' : !allComplete ? `Faltan ${orderQuantity - completedOrders} orden(es) sin salsas` : 'Confirmar Pedido'}
      </button>
    </form>
  )
}
