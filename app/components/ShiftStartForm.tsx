'use client'

import { useState } from 'react'
import { startShiftForDate, startShift } from '@/app/actions'
import { Store, Calendar, ArrowLeft } from 'lucide-react'

interface ShiftStartFormProps {
  selectedDate?: string
  onStarted: () => void
  onBack?: () => void
}

export default function ShiftStartForm({ selectedDate, onStarted, onBack }: ShiftStartFormProps) {
  const [loading, setLoading] = useState(false)
  const [orders, setOrders] = useState('')

  const formattedDate = selectedDate
    ? new Date(`${selectedDate}T00:00:00`).toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const num = parseInt(orders)
    if (isNaN(num) || num <= 0) return

    setLoading(true)
    try {
      if (selectedDate) {
        await startShiftForDate(selectedDate, num)
      } else {
        await startShift(num)
      }
      onStarted()
    } catch (error) {
      console.error(error)
      alert("Error al iniciar turno")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-3 sm:p-4 w-full">
      <div className="bg-white p-5 sm:p-8 rounded-3xl shadow-xl w-full max-w-md text-center border border-slate-100 relative">
        {onBack && (
          <button
            onClick={onBack}
            className="absolute top-4 left-4 sm:top-6 sm:left-6 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
            title="Cambiar fecha"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        )}

        <Store className="w-12 h-12 sm:w-16 sm:h-16 text-orange-500 mx-auto mb-3 sm:mb-4" />
        <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-1">Registrar Turno</h2>
        
        {formattedDate && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-xl font-bold text-xs mb-4 sm:mb-6 capitalize">
            <Calendar className="w-3.5 h-3.5" />
            {formattedDate}
          </div>
        )}

        <p className="text-slate-500 text-xs sm:text-sm mb-5 sm:mb-6">
          No hay órdenes disponibles registradas para esta fecha. Ingresa el inventario inicial para comenzar.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-left font-bold text-slate-700 mb-2 text-xs sm:text-sm uppercase tracking-wider">
              Órdenes crudas disponibles
            </label>
            <input 
              type="number" 
              required
              min="1"
              value={orders}
              onChange={(e) => setOrders(e.target.value)}
              className="w-full text-xl sm:text-2xl p-3 sm:p-4 border-2 border-slate-200 rounded-2xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all outline-none font-black text-center"
              placeholder="Ej. 50"
              autoFocus
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full min-h-[50px] sm:min-h-[56px] text-base sm:text-lg font-black bg-orange-600 hover:bg-orange-700 text-white rounded-2xl transition-all shadow-lg shadow-orange-100 active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Registrando...' : 'Registrar y Comenzar Turno'}
          </button>
        </form>
      </div>
    </div>
  )
}
