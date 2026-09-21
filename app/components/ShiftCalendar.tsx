'use client'

import { useState } from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Check, Sparkles } from 'lucide-react'
import useSWR from 'swr'
import { getActiveShiftDates } from '@/app/actions'

interface ShiftCalendarProps {
  selectedDate: string // YYYY-MM-DD
  onSelectDate: (dateStr: string) => void
  onConfirmDate?: (dateStr: string) => void
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

export default function ShiftCalendar({ selectedDate, onSelectDate, onConfirmDate }: ShiftCalendarProps) {
  const { data: shiftDates } = useSWR('shiftDates', getActiveShiftDates, { refreshInterval: 5000 })

  // Inicializar estado del mes visible en el calendario
  const initialDateObj = selectedDate ? new Date(`${selectedDate}T00:00:00`) : new Date()
  const [currentMonth, setCurrentMonth] = useState(initialDateObj.getMonth())
  const [currentYear, setCurrentYear] = useState(initialDateObj.getFullYear())

  const todayStr = new Date().toISOString().split('T')[0]

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(prev => prev - 1)
    } else {
      setCurrentMonth(prev => prev - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(prev => prev + 1)
    } else {
      setCurrentMonth(prev => prev + 1)
    }
  }

  const handleTodayClick = () => {
    const today = new Date()
    setCurrentMonth(today.getMonth())
    setCurrentYear(today.getFullYear())
    onSelectDate(todayStr)
  }

  // Generar cuadrícula de días del mes
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

  const calendarDays = []
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null)
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d)
  }

  const formatDayString = (day: number) => {
    const m = String(currentMonth + 1).padStart(2, '0')
    const d = String(day).padStart(2, '0')
    return `${currentYear}-${m}-${d}`
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-4 sm:p-6 max-w-md w-full mx-auto transition-all overflow-hidden">
      {/* Encabezado del Calendario */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-black shrink-0">
            <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base sm:text-xl font-black text-slate-800 truncate">Fecha en Turno</h3>
            <p className="text-[10px] sm:text-xs font-semibold text-slate-400 truncate">Selecciona el día de trabajo</p>
          </div>
        </div>

        <button
          onClick={handleTodayClick}
          className="flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Hoy
        </button>
      </div>

      {/* Navegador de Mes / Año */}
      <div className="flex items-center justify-between bg-slate-50 p-2 sm:p-3 rounded-2xl mb-3 sm:mb-4">
        <button
          onClick={handlePrevMonth}
          className="p-1.5 sm:p-2 hover:bg-white rounded-xl text-slate-600 transition-all active:scale-95"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <span className="font-extrabold text-slate-800 text-sm sm:text-base">
          {MONTH_NAMES[currentMonth]} {currentYear}
        </span>
        <button
          onClick={handleNextMonth}
          className="p-1.5 sm:p-2 hover:bg-white rounded-xl text-slate-600 transition-all active:scale-95"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1 sm:mb-2">
        {DAY_NAMES.map(day => (
          <span key={day} className="text-[10px] sm:text-xs font-black text-slate-400 py-1">
            {day}
          </span>
        ))}
      </div>

      {/* Matriz de Días */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center mb-3 sm:mb-4">
        {calendarDays.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="h-9 sm:h-11" />
          }

          const dateStr = formatDayString(day)
          const isSelected = selectedDate === dateStr
          const isToday = todayStr === dateStr
          const remainingRawOrders = shiftDates?.[dateStr]
          const hasShift = remainingRawOrders !== undefined
          const hasAvailableOrders = hasShift && remainingRawOrders > 0

          return (
            <button
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              className={`h-9 sm:h-11 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center transition-all relative active:scale-95 ${
                isSelected
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-200 ring-2 ring-orange-500 ring-offset-2'
                  : isToday
                  ? 'bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100 font-black'
                  : hasShift
                  ? 'bg-emerald-50/70 text-slate-800 border border-emerald-200/80 hover:bg-emerald-100/80'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {day}

              {/* Indicador de turno / órdenes disponibles */}
              {hasShift && (
                <span 
                  className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
                    isSelected
                      ? 'bg-white ring-2 ring-orange-500'
                      : hasAvailableOrders
                      ? 'bg-emerald-500 ring-1 ring-white'
                      : 'bg-amber-400 ring-1 ring-white'
                  }`} 
                  title={hasAvailableOrders ? `${remainingRawOrders} órdenes disponibles` : 'Sin órdenes disponibles'}
                />
              )}

              {/* Indicador de día actual si no está seleccionado ni tiene indicador de turno */}
              {isToday && !isSelected && !hasShift && (
                <span className="absolute bottom-0.5 sm:bottom-1 w-1 sm:w-1.5 h-1 sm:h-1.5 bg-orange-500 rounded-full" />
              )}
            </button>
          )
        })}
      </div>

      {/* Leyenda discreta */}
      <div className="flex items-center justify-center gap-4 text-[10px] sm:text-xs text-slate-500 font-semibold mb-3 sm:mb-4 bg-slate-50 py-1.5 px-3 rounded-xl">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          Con órdenes
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
          Agotado
        </span>
      </div>

      {/* Fecha Seleccionada y Botón de Confirmación */}
      <div className="space-y-2.5 sm:space-y-3">
        <div className="bg-slate-50 rounded-2xl p-3 sm:p-4 flex items-center justify-between">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha Elegida:</span>
          <span className="text-sm sm:text-base font-black text-slate-800 capitalize">
            {selectedDate
              ? new Date(`${selectedDate}T00:00:00`).toLocaleDateString('es-ES', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })
              : 'Ninguna'}
          </span>
        </div>

        {onConfirmDate && (
          <button
            onClick={() => onConfirmDate(selectedDate)}
            disabled={!selectedDate}
            className="w-full min-h-[46px] sm:min-h-[52px] bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-black text-sm sm:text-base rounded-2xl shadow-lg shadow-orange-100 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Check className="w-4 h-4 sm:w-5 sm:h-5" />
            Continuar con esta Fecha
          </button>
        )}
      </div>
    </div>
  )
}

