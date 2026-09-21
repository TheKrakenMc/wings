'use client'

import { useState } from 'react'
import { startShift } from '@/app/actions'
import { Store } from 'lucide-react'

export default function ShiftStartForm({ onStarted }: { onStarted: () => void }) {
  const [loading, setLoading] = useState(false)
  const [orders, setOrders] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const num = parseInt(orders)
    if (isNaN(num) || num <= 0) return

    setLoading(true)
    try {
      await startShift(num)
      onStarted()
    } catch (error) {
      console.error(error)
      alert("Error al iniciar turno")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md text-center">
        <Store className="w-20 h-20 text-orange-500 mx-auto mb-6" />
        <h2 className="text-3xl font-black text-slate-800 mb-2">Iniciar Turno</h2>
        <p className="text-slate-500 mb-8">Ingresa el inventario inicial para comenzar</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-left font-bold text-slate-700 mb-2 text-lg">
              Órdenes crudas disponibles hoy
            </label>
            <input 
              type="number" 
              required
              min="1"
              value={orders}
              onChange={(e) => setOrders(e.target.value)}
              className="w-full text-2xl p-4 border-2 border-slate-200 rounded-2xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all outline-none"
              placeholder="Ej. 50"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full min-h-[64px] text-xl font-bold bg-orange-600 hover:bg-orange-700 text-white rounded-2xl transition-colors active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Iniciando...' : 'Comenzar Turno'}
          </button>
        </form>
      </div>
    </div>
  )
}
