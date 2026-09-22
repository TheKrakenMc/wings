'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { getOrders } from '@/app/actions'
import OrderCard from '@/app/components/OrderCard'
import DateCarousel from '@/app/components/DateCarousel'
import ShiftCalendar from '@/app/components/ShiftCalendar'
import { ArrowLeft, X } from 'lucide-react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'

function getTodayString() {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const STORAGE_KEY = 'kitchen_selected_date'

export default function KitchenPage() {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString())
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // Cargar fecha desde localStorage al montar
  useEffect(() => {
    const savedDate = localStorage.getItem(STORAGE_KEY)
    if (savedDate) {
      setSelectedDate(savedDate)
    }
    setIsLoaded(true)
  }, [])

  // Persistir fecha seleccionada en localStorage
  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate)
    localStorage.setItem(STORAGE_KEY, newDate)
  }

  // Filtrar pedidos en backend por fecha seleccionada
  const { data: orders } = useSWR(
    isLoaded ? ['orders', selectedDate] : null,
    () => getOrders(selectedDate),
    { refreshInterval: 2000 }
  )

  const pendingCount = orders?.filter(o => o.status === 'PENDING').length || 0

  const formattedDate = selectedDate
    ? new Date(`${selectedDate}T00:00:00`).toLocaleDateString('es-ES', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    : ''

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Header Fijo con Carrusel de Calendario en el Centro */}
      <header className="sticky top-0 z-20 bg-slate-800 border-b border-slate-700/80 px-2 sm:px-6 py-2 sm:py-3 shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-4">
          {/* Izquierda: Volver y Título */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <Link 
              href="/" 
              className="p-1.5 sm:p-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl sm:rounded-2xl transition-colors"
              aria-label="Volver al menú principal"
            >
              <ArrowLeft className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </Link>
            <h1 className="text-lg sm:text-2xl font-black text-white hidden sm:block">Cocina</h1>
          </div>

          {/* Centro: Carrusel de Días / Calendario */}
          <div className="flex-1 min-w-0 max-w-xl mx-auto flex justify-center px-0.5">
            <DateCarousel 
              selectedDate={selectedDate} 
              onSelectDate={handleDateChange} 
              onOpenCalendar={() => setIsCalendarOpen(true)}
            />
          </div>

          {/* Derecha: Badge de Pendientes */}
          <div className="bg-red-500/20 text-red-400 px-2 sm:px-5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl font-black text-xs sm:text-lg flex items-center gap-1 border border-red-500/30 shrink-0">
            <span className="hidden sm:inline">Pendientes:</span>
            <span className="sm:hidden">Pend:</span>
            <span className="text-xs sm:text-2xl font-extrabold">{pendingCount}</span>
          </div>
        </div>
      </header>

      {/* Sub-header informativo con fecha activa */}
      <div className="bg-slate-800/50 border-b border-slate-700/50 px-4 py-1.5 text-center text-xs sm:text-sm font-semibold text-slate-400 flex items-center justify-center gap-2">
        <span>Mostrando pedidos del día:</span>
        <span className="text-orange-400 font-extrabold capitalize">{formattedDate}</span>
      </div>

      {/* Grilla de Pedidos de Cocina */}
      <main className="p-3 sm:p-6 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto">
          <AnimatePresence>
            {orders?.map((order, idx) => (
              <OrderCard key={order.id} order={order} isKitchen={true} queueIndex={idx + 1} />
            ))}
          </AnimatePresence>
          
          {orders && orders.length === 0 && (
            <div className="col-span-full py-20 sm:py-32 text-center text-slate-400 font-bold text-lg sm:text-2xl border-2 sm:border-4 border-dashed border-slate-700 rounded-2xl sm:rounded-3xl p-6 bg-slate-800/30">
              <p>No hay pedidos pendientes.</p>
              <p className="text-sm sm:text-base font-normal text-slate-500 mt-2">Excelente trabajo o selecciona otra fecha en el carrusel superior.</p>
            </div>
          )}
        </div>
      </main>

      {/* Modal de Calendario Completo (Opcional al presionar el ícono de calendario) */}
      <AnimatePresence>
        {isCalendarOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-slate-900 rounded-3xl p-2 border border-slate-700 shadow-2xl"
            >
              <button
                onClick={() => setIsCalendarOpen(false)}
                className="absolute top-4 right-4 z-10 p-2 bg-slate-800 text-slate-400 hover:text-white rounded-full transition-colors"
                aria-label="Cerrar calendario"
              >
                <X className="w-5 h-5" />
              </button>
              <ShiftCalendar
                selectedDate={selectedDate}
                onSelectDate={(dStr) => {
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
