'use client'

import { motion } from 'framer-motion'
import { Check, ChefHat, Clock, MapPin, Phone, User, X } from 'lucide-react'
import { updateOrderStatus, cancelOrder } from '@/app/actions'
import { OrderStatus, Order } from '@prisma/client'
import { useState } from 'react'
import { mutate } from 'swr'

type OrderCardProps = {
  order: Order & { flavors: unknown }
  isKitchen?: boolean
  queueIndex?: number
}

export default function OrderCard({ order, isKitchen = false, queueIndex }: OrderCardProps) {
  const [loading, setLoading] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)

  const isPending = order.status === 'PENDING'
  const isPreparing = order.status === 'PREPARING'
  const isDelivered = order.status === 'DELIVERED'

  const handleNextState = async () => {
    setLoading(true)
    const nextStatus = isPreparing ? OrderStatus.DELIVERED : OrderStatus.PREPARING
    await updateOrderStatus(order.id, nextStatus)
    mutate('orders')
    setLoading(false)
  }

  const handleCancel = async () => {
    setCancelling(true)
    try {
      await cancelOrder(order.id)
      mutate('orders')
      mutate('activeShift')
    } catch (e: unknown) {
      alert((e as Error).message || 'Error al cancelar')
    } finally {
      setCancelling(false)
      setConfirmCancel(false)
    }
  }

  // ─────────────────────────────────────────────
  // VISTA COCINA — minimalista, proporciones fijas
  // ─────────────────────────────────────────────
  if (isKitchen) {
    const flavors = order.flavors
    const isMatrix = Array.isArray(flavors) && flavors.length > 0 && Array.isArray(flavors[0])

    const statusColors = {
      card: isPending ? 'border-red-500/40' : 'border-orange-500/40',
      text: isPending ? 'text-red-400' : 'text-orange-400',
      button: isPending ? 'bg-red-600 hover:bg-red-500' : 'bg-orange-600 hover:bg-orange-500',
    }

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        layout
        className={`bg-slate-800 border-2 ${statusColors.card} rounded-3xl flex flex-col h-[320px] transition-colors duration-300`}
      >
        {/* ── Header (altura fija) ── */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <span className={`text-4xl font-black leading-none ${statusColors.text}`}>#{queueIndex}</span>
            <div className="flex flex-col">
              <span className={`text-[10px] font-black uppercase tracking-widest ${statusColors.text} opacity-70`}>
                {order.isDelivery ? 'Domicilio' : order.isTakeaway ? 'Para Llevar' : 'Comedor'}
              </span>
              <span className="text-slate-400 text-xs font-semibold flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3" />
                {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
          {order.customerName && (
            <span className="text-slate-300 font-bold text-xs bg-slate-700 px-3 py-1.5 rounded-xl truncate max-w-[110px]">
              {order.customerName}
            </span>
          )}
        </div>

        {/* ── Zona de salsas — 2 columnas, sin scroll ── */}
        <div className="flex-1 px-5 min-h-0 overflow-hidden">
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 h-full content-start">
            {isMatrix
              ? (flavors as string[][]).map((orderFlavors: string[], i: number) => (
                  <div key={i} className="flex flex-col gap-1">
                    <span className={`text-[9px] font-black uppercase tracking-widest ${statusColors.text} opacity-50`}>
                      Orden {i + 1}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {orderFlavors.map((f: string, j: number) => (
                        <span key={j} className="px-2 py-0.5 rounded-md font-bold bg-slate-700 text-slate-100 text-[11px] leading-4">{f}</span>
                      ))}
                    </div>
                  </div>
                ))
              : (flavors as string[]).map((f: string, i: number) => (
                  <span key={i} className="px-2 py-0.5 rounded-md font-bold bg-slate-700 text-slate-100 text-[11px] leading-4 self-start">{f}</span>
                ))
            }
          </div>
        </div>

        {/* ── Acciones (altura fija, siempre al fondo) ── */}
        <div className="px-5 pb-5 pt-3 space-y-2 shrink-0">
          {!isDelivered && (
            <button
              disabled={loading}
              onClick={handleNextState}
              className={`w-full h-12 text-base font-black rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 text-white ${statusColors.button} disabled:opacity-50`}
            >
              {loading ? 'Procesando...' : isPending
                ? <><ChefHat className="w-5 h-5" /> Empezar</>
                : <><Check className="w-5 h-5" /> Listo / Entregar</>
              }
            </button>
          )}

          {/* Cancelar */}
          {!isDelivered && (
            confirmCancel ? (
              <div className="flex gap-2 h-10">
                <button
                  onClick={() => setConfirmCancel(false)}
                  className="flex-1 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold text-xs transition-colors"
                >
                  No, volver
                </button>
                <button
                  disabled={cancelling}
                  onClick={handleCancel}
                  className="flex-1 rounded-xl bg-red-700 hover:bg-red-600 text-white font-black text-xs transition-colors disabled:opacity-50"
                >
                  {cancelling ? '...' : 'Sí, cancelar'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmCancel(true)}
                className="w-full h-10 rounded-xl bg-slate-700/50 hover:bg-red-900/40 text-slate-500 hover:text-red-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <X className="w-3.5 h-3.5" /> Cancelar pedido
              </button>
            )
          )}
        </div>
      </motion.div>
    )
  }

  // ─────────────────────────────────────────────
  // VISTA MESERO — con datos cliente, altura adaptativa
  // ─────────────────────────────────────────────
  const mColors = {
    card: isPending ? 'bg-red-50 border-red-200' : isPreparing ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200',
    text: isPending ? 'text-red-700' : isPreparing ? 'text-orange-700' : 'text-green-700',
    icon: isPending ? 'text-red-500' : isPreparing ? 'text-orange-500' : 'text-green-500',
    badge: isPending ? 'bg-red-200 text-red-700' : isPreparing ? 'bg-orange-200 text-orange-700' : 'bg-green-200 text-green-700',
  }

  const flavors = order.flavors
  const isMatrix = Array.isArray(flavors) && flavors.length > 0 && Array.isArray(flavors[0])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      layout
      className={`border-2 rounded-2xl sm:rounded-3xl flex flex-col min-h-[300px] sm:h-[320px] ${mColors.card} transition-colors duration-300 overflow-hidden`}
    >
      {/* ── Header compacto ── */}
      <div className="flex items-center justify-between px-3.5 sm:px-5 pt-3.5 sm:pt-4 pb-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <p className={`text-base sm:text-lg font-black ${mColors.text} truncate`}>
            {order.orderQuantity} {order.orderQuantity === 1 ? 'Orden' : 'Órdenes'}
          </p>
          <span className={`text-[9px] sm:text-[10px] font-black px-2 py-0.5 sm:py-1 rounded-lg uppercase tracking-wide ${mColors.badge} shrink-0`}>
            {order.isDelivery ? 'Domicilio' : order.isTakeaway ? 'Llevar' : 'Comedor'}
          </span>
        </div>
        <span className={`text-[11px] sm:text-xs font-semibold flex items-center gap-1 ${mColors.text} opacity-60 shrink-0 ml-1`}>
          <Clock className="w-3 h-3" />
          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* ── Info cliente en fila horizontal ── */}
      <div className="px-3.5 sm:px-5 pb-2 shrink-0 min-h-[36px] flex items-center gap-2.5 overflow-hidden flex-wrap">
        {order.customerName && (
          <span className={`flex items-center gap-1 text-xs sm:text-sm font-bold ${mColors.text} truncate`}>
            <User className="w-3.5 h-3.5 shrink-0" /> {order.customerName}
          </span>
        )}
        {order.phone && (
          <span className={`flex items-center gap-1 text-[11px] sm:text-xs font-semibold ${mColors.text} opacity-60 shrink-0`}>
            <Phone className="w-3 h-3" /> {order.phone}
          </span>
        )}
        {order.isDelivery && order.deliveryAddress && (
          <span className={`flex items-center gap-1 text-[11px] sm:text-xs font-semibold ${mColors.text} opacity-60 truncate w-full`}>
            <MapPin className="w-3 h-3 shrink-0" /> {order.deliveryAddress}
          </span>
        )}
        {!order.customerName && !order.phone && (
          <span className={`text-xs font-semibold ${mColors.text} opacity-40`}>Sin datos de cliente</span>
        )}
      </div>

      {/* ── Zona de salsas — 2 columnas ── */}
      <div className="flex-1 px-3.5 sm:px-5 min-h-0 overflow-hidden py-1">
        <div className="grid grid-cols-2 gap-x-2 sm:gap-x-3 gap-y-1.5 sm:gap-y-2 h-full content-start">
          {isMatrix
            ? (flavors as string[][]).filter((f: string[]) => f.length > 0).map((orderFlavors: string[], i: number) => (
                <div key={i} className="flex flex-col gap-0.5">
                  <span className={`text-[8px] sm:text-[9px] font-black uppercase tracking-widest ${mColors.text} opacity-40`}>
                    Orden {i + 1}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {orderFlavors.map((f: string, j: number) => (
                      <span key={j} className="px-1.5 sm:px-2 py-0.5 rounded-md font-bold bg-white shadow-sm text-slate-700 text-[10px] sm:text-[11px] leading-4">{f}</span>
                    ))}
                  </div>
                </div>
              ))
            : (flavors as string[]).map((f: string, i: number) => (
                <span key={i} className="px-1.5 sm:px-2 py-0.5 rounded-md font-bold bg-white shadow-sm text-slate-700 text-[10px] sm:text-[11px] leading-4 self-start">{f}</span>
              ))
          }
        </div>
      </div>

      {/* ── Acciones (siempre al fondo) ── */}
      <div className="px-3.5 sm:px-5 pb-3.5 sm:pb-5 pt-2 sm:pt-3 space-y-1.5 sm:space-y-2 shrink-0">
        {/* Estado */}
        <div className={`w-full h-10 sm:h-12 flex items-center justify-center text-sm sm:text-base font-black rounded-xl sm:rounded-2xl bg-white/60 ${mColors.text}`}>
          {isPending ? 'En espera' : isPreparing ? 'Preparando...' : '¡Entregado!'}
        </div>

        {/* Cancelar */}
        {!isDelivered && (
          confirmCancel ? (
            <div className="flex gap-2 h-9 sm:h-10">
              <button
                onClick={() => setConfirmCancel(false)}
                className={`flex-1 rounded-xl font-bold text-xs transition-colors bg-white/60 hover:bg-white/80 ${mColors.text}`}
              >
                No, volver
              </button>
              <button
                disabled={cancelling}
                onClick={handleCancel}
                className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs transition-colors disabled:opacity-50"
              >
                {cancelling ? '...' : 'Sí, cancelar'}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmCancel(true)}
              className={`w-full h-8 sm:h-10 rounded-xl bg-white/40 hover:bg-red-100 ${mColors.text} hover:text-red-600 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors`}
            >
              <X className="w-3.5 h-3.5" /> Cancelar pedido
            </button>
          )
        )}
      </div>
    </motion.div>
  )
}

