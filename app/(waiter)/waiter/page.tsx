'use client'

import useSWR from 'swr'
import { getActiveShift, getOrders, getFlavors } from '@/app/actions'
import ShiftStartForm from '@/app/components/ShiftStartForm'
import OrderCard from '@/app/components/OrderCard'
import OrderForm from '@/app/components/OrderForm'
import { useState } from 'react'
import { Plus, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function WaiterPage() {
  const { data: activeShift, isLoading: shiftLoading, mutate: mutateShift } = useSWR('activeShift', getActiveShift)
  const { data: orders } = useSWR('orders', getOrders, { refreshInterval: 2000 })
  const { data: flavors } = useSWR('flavors', getFlavors)
  
  const [showOrderForm, setShowOrderForm] = useState(false)

  if (shiftLoading) return <div className="min-h-screen flex items-center justify-center font-bold text-2xl text-slate-500">Cargando...</div>

  if (!activeShift) {
    return (
      <div className="min-h-screen bg-slate-50 relative">
        <Link href="/" className="absolute top-6 left-6 p-4 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow">
          <ArrowLeft className="w-8 h-8 text-slate-600" />
        </Link>
        <ShiftStartForm onStarted={() => mutateShift()} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      {/* Header Fijo */}
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-3 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-colors">
            <ArrowLeft className="w-6 h-6 text-slate-700" />
          </Link>
          <h1 className="text-2xl font-black text-slate-800">Pedidos</h1>
        </div>
        <div className="bg-orange-100 text-orange-700 px-6 py-3 rounded-2xl font-black text-xl flex items-center gap-3">
          <span>Órdenes Disponibles:</span>
          <span className="text-3xl">{activeShift.remainingRawOrders}</span>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto">
        {showOrderForm ? (
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black text-slate-800">Nuevo Pedido</h2>
              <button 
                onClick={() => setShowOrderForm(false)}
                className="font-bold text-slate-500 hover:text-slate-700 text-lg px-6 py-3 bg-white rounded-2xl shadow-sm border border-slate-100"
              >
                Cancelar
              </button>
            </div>
            <OrderForm flavors={flavors || []} maxOrders={activeShift.remainingRawOrders} onClose={() => setShowOrderForm(false)} />
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black text-slate-800">Órdenes Actuales</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orders?.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
              {orders?.length === 0 && (
                <div className="col-span-full py-20 text-center text-slate-400 font-bold text-xl border-4 border-dashed border-slate-200 rounded-3xl">
                  No hay órdenes activas.
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* FAB button */}
      {!showOrderForm && (
        <button 
          onClick={() => setShowOrderForm(true)}
          className="fixed bottom-8 right-8 w-20 h-20 bg-orange-600 hover:bg-orange-700 text-white rounded-[2rem] shadow-2xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
        >
          <Plus className="w-10 h-10" />
        </button>
      )}
    </div>
  )
}
