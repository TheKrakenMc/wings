'use client'

import useSWR from 'swr'
import { getShiftByDate, getOrders, getFlavors } from '@/app/actions'
import ShiftCalendar from '@/app/components/ShiftCalendar'
import ShiftStartForm from '@/app/components/ShiftStartForm'
import OrderCard from '@/app/components/OrderCard'
import OrderForm from '@/app/components/OrderForm'
import { useState } from 'react'
import { Plus, ArrowLeft, Calendar as CalendarIcon } from 'lucide-react'
import Link from 'next/link'

function getTodayString() {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function WaiterPage() {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString())
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(true)
  const [showOrderForm, setShowOrderForm] = useState(false)

  // Consultar en BD si existe un turno para la fecha seleccionada
  const { 
    data: activeShift, 
    isLoading: shiftLoading, 
    mutate: mutateShift 
  } = useSWR(selectedDate ? ['shiftByDate', selectedDate] : null, () => getShiftByDate(selectedDate))

  const { data: orders } = useSWR('orders', getOrders, { refreshInterval: 2000 })
  const { data: flavors } = useSWR('flavors', getFlavors)

  const formattedSelectedDate = selectedDate
    ? new Date(`${selectedDate}T00:00:00`).toLocaleDateString('es-ES', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
      })
    : ''

  // Modo Selección de Fecha (Calendario)
  if (isCalendarOpen) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-3 sm:p-6">
        <div className="w-full max-w-md mx-auto mb-4 sm:mb-6 flex items-center gap-3">
          <Link 
            href="/" 
            className="p-2.5 sm:p-3 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95 border border-slate-200 shrink-0"
            aria-label="Volver al menú principal"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-slate-700" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 leading-tight">Turno y Fecha</h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">Selecciona el día de trabajo</p>
          </div>
        </div>

        <ShiftCalendar 
          selectedDate={selectedDate}
          onSelectDate={(dateStr) => setSelectedDate(dateStr)}
          onConfirmDate={() => setIsCalendarOpen(false)}
        />
      </div>
    )
  }

  // Cargando turno para la fecha seleccionada
  if (shiftLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 font-black text-lg sm:text-xl text-slate-500 text-center">
        Comprobando registro para {selectedDate}...
      </div>
    )
  }

  // Si NO existe turno registrado para la fecha seleccionada
  if (!activeShift) {
    return (
      <div className="min-h-screen bg-slate-50 p-3 sm:p-6 flex flex-col items-center justify-center">
        <div className="w-full max-w-md mb-4 flex items-center">
          <Link 
            href="/" 
            className="p-2.5 sm:p-3 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-200 shrink-0"
            aria-label="Volver al menú principal"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-slate-700" />
          </Link>
        </div>
        <ShiftStartForm 
          selectedDate={selectedDate} 
          onStarted={() => mutateShift()} 
          onBack={() => setIsCalendarOpen(true)}
        />
      </div>
    )
  }

  // Vista principal de Pedidos con Turno Activo
  return (
    <div className="min-h-screen bg-slate-50 pb-28 sm:pb-32">
      {/* Header Fijo con Selector de Calendario */}
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-3 sm:px-6 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link 
              href="/" 
              className="p-2 sm:p-3 bg-slate-100 rounded-xl sm:rounded-2xl hover:bg-slate-200 transition-colors"
              aria-label="Volver al inicio"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-slate-700" />
            </Link>
            <h1 className="text-lg sm:text-2xl font-black text-slate-800">Pedidos</h1>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Botón para cambiar fecha / abrir calendario */}
            <button
              onClick={() => setIsCalendarOpen(true)}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-orange-50 text-slate-700 hover:text-orange-600 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm transition-all border border-slate-200 hover:border-orange-200 active:scale-95 shrink-0"
            >
              <CalendarIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500 shrink-0" />
              <span className="capitalize text-xs sm:text-sm">{formattedSelectedDate}</span>
            </button>

            {/* Badge de Órdenes Disponibles */}
            <div className="bg-orange-100 text-orange-700 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm flex items-center gap-1 shrink-0">
              <span className="hidden sm:inline">Disponibles:</span>
              <span className="sm:hidden">Disp:</span>
              <span className="text-sm sm:text-base font-extrabold">{activeShift.remainingRawOrders}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="p-3 sm:p-6 max-w-7xl mx-auto">
        {showOrderForm ? (
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-4 sm:mb-8">
              <h2 className="text-xl sm:text-3xl font-black text-slate-800">Nuevo Pedido</h2>
              <button 
                onClick={() => setShowOrderForm(false)}
                className="font-bold text-slate-500 hover:text-slate-700 text-sm sm:text-lg px-4 sm:px-6 py-2 sm:py-3 bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200"
              >
                Cancelar
              </button>
            </div>
            <OrderForm 
              flavors={flavors || []} 
              maxOrders={activeShift.remainingRawOrders} 
              onClose={() => setShowOrderForm(false)} 
            />
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4 sm:mb-8">
              <h2 className="text-xl sm:text-3xl font-black text-slate-800">Órdenes Actuales</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {orders?.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
              {orders?.length === 0 && (
                <div className="col-span-full py-12 sm:py-20 text-center text-slate-400 font-bold text-base sm:text-xl border-2 sm:border-4 border-dashed border-slate-200 rounded-2xl sm:rounded-3xl p-4">
                  No hay órdenes activas para esta fecha.
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
          className="fixed bottom-6 right-6 w-14 h-14 sm:w-20 sm:h-20 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl sm:rounded-[2rem] shadow-2xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95 z-20"
          aria-label="Crear nueva orden"
        >
          <Plus className="w-7 h-7 sm:w-10 sm:h-10" />
        </button>
      )}
    </div>
  )
}

