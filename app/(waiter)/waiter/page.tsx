'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { getShiftByDate, getOrders, getFlavors } from '@/app/actions'
import ShiftCalendar from '@/app/components/ShiftCalendar'
import ShiftStartForm from '@/app/components/ShiftStartForm'
import OrderCard from '@/app/components/OrderCard'
import OrderForm from '@/app/components/OrderForm'
import DateCarousel from '@/app/components/DateCarousel'
import { Plus, ArrowLeft, X } from 'lucide-react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'

function getTodayString() {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const STORAGE_KEY = 'waiter_selected_date'

export default function WaiterPage() {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString())
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false)
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // Cargar fecha guardada en localStorage
  useEffect(() => {
    const savedDate = localStorage.getItem(STORAGE_KEY)
    if (savedDate) {
      setSelectedDate(savedDate)
    }
    setIsLoaded(true)
  }, [])

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate)
    localStorage.setItem(STORAGE_KEY, newDate)
  }

  // Consultar en BD si existe un turno para la fecha seleccionada
  const { 
    data: activeShift, 
    isLoading: shiftLoading, 
    mutate: mutateShift 
  } = useSWR(isLoaded && selectedDate ? ['shiftByDate', selectedDate] : null, () => getShiftByDate(selectedDate))

  const { data: orders } = useSWR(isLoaded && selectedDate ? ['orders', selectedDate] : null, () => getOrders(selectedDate), { refreshInterval: 2000 })
  const { data: flavors } = useSWR('flavors', getFlavors)

  const formattedSelectedDate = selectedDate
    ? new Date(`${selectedDate}T00:00:00`).toLocaleDateString('es-ES', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    : ''

  return (
    <div className="min-h-screen bg-slate-50 pb-28 sm:pb-32 flex flex-col">
      {/* Header Fijo con Selector Carrusel de Fechas */}
      <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-2 sm:px-6 py-2 sm:py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-4">
          {/* Izquierda: Botón Inicio / Título */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <Link 
              href="/" 
              className="p-1.5 sm:p-2.5 bg-slate-100 rounded-xl sm:rounded-2xl hover:bg-slate-200 transition-colors"
              aria-label="Volver al inicio"
            >
              <ArrowLeft className="w-4 h-4 sm:w-6 sm:h-6 text-slate-700" />
            </Link>
            <h1 className="text-lg sm:text-2xl font-black text-slate-800 hidden sm:block">Pedidos</h1>
          </div>

          {/* Centro: Carrusel de Días */}
          <div className="flex-1 min-w-0 max-w-xl mx-auto flex justify-center px-0.5">
            <DateCarousel
              selectedDate={selectedDate}
              onSelectDate={handleDateChange}
              onOpenCalendar={() => setIsCalendarOpen(true)}
              variant="light"
            />
          </div>

          {/* Derecha: Badge de Órdenes Disponibles */}
          <div className="bg-orange-100 text-orange-700 px-2 sm:px-5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl font-black text-xs sm:text-base flex items-center gap-1 shrink-0">
            <span className="hidden sm:inline">Disponibles:</span>
            <span className="sm:hidden">Disp:</span>
            <span className="text-xs sm:text-xl font-extrabold">
              {activeShift ? activeShift.remainingRawOrders : 0}
            </span>
          </div>
        </div>
      </header>

      {/* Sub-header informativo con la fecha seleccionada */}
      <div className="bg-slate-100 border-b border-slate-200 px-4 py-1.5 text-center text-xs sm:text-sm font-semibold text-slate-500 flex items-center justify-center gap-2">
        <span>Fecha de trabajo activa:</span>
        <span className="text-orange-600 font-extrabold capitalize">{formattedSelectedDate}</span>
      </div>

      <main className="p-3 sm:p-6 max-w-7xl mx-auto w-full flex-1">
        {/* Cargando turno */}
        {shiftLoading && (
          <div className="py-20 flex items-center justify-center font-black text-lg sm:text-xl text-slate-400 text-center">
            Comprobando registro de turno para {selectedDate}...
          </div>
        )}

        {/* Si NO existe turno registrado para la fecha seleccionada */}
        {!shiftLoading && !activeShift && (
          <div className="py-8 max-w-md mx-auto">
            <ShiftStartForm 
              selectedDate={selectedDate} 
              onStarted={() => mutateShift()} 
              onBack={() => setIsCalendarOpen(true)}
            />
          </div>
        )}

        {/* Vista principal de Pedidos con Turno Activo */}
        {!shiftLoading && activeShift && (
          <>
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
                  selectedDate={selectedDate}
                  onClose={() => setShowOrderForm(false)} 
                />
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4 sm:mb-8">
                  <h2 className="text-xl sm:text-3xl font-black text-slate-800">Órdenes Actuales</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  <AnimatePresence>
                    {orders?.map((order, idx) => (
                      <OrderCard key={order.id} order={order} queueIndex={idx + 1} />
                    ))}
                  </AnimatePresence>
                  {orders?.length === 0 && (
                    <div className="col-span-full py-12 sm:py-20 text-center text-slate-400 font-bold text-base sm:text-xl border-2 sm:border-4 border-dashed border-slate-200 rounded-2xl sm:rounded-3xl p-4">
                      No hay órdenes activas para hoy.
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* FAB button */}
      {!showOrderForm && activeShift && (
        <button 
          onClick={() => setShowOrderForm(true)}
          className="fixed bottom-6 right-6 w-14 h-14 sm:w-20 sm:h-20 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl sm:rounded-[2rem] shadow-2xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95 z-20"
          aria-label="Crear nueva orden"
        >
          <Plus className="w-7 h-7 sm:w-10 sm:h-10" />
        </button>
      )}

      {/* Modal de Calendario Completo */}
      <AnimatePresence>
        {isCalendarOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-2 border border-slate-200 shadow-2xl"
            >
              <button
                onClick={() => setIsCalendarOpen(false)}
                className="absolute top-4 right-4 z-10 p-2 bg-slate-100 text-slate-500 hover:text-slate-800 rounded-full transition-colors"
                aria-label="Cerrar calendario"
              >
                <X className="w-5 h-5" />
              </button>
              <ShiftCalendar
                selectedDate={selectedDate}
                onSelectDate={(dStr) => setSelectedDate(dStr)}
                onConfirmDate={(dStr) => {
                  handleDateChange(dStr)
                  setIsCalendarOpen(false)
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
