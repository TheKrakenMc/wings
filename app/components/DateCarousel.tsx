'use client'

import { useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'

interface DateCarouselProps {
  selectedDate: string // YYYY-MM-DD
  onSelectDate: (dateStr: string) => void
  onOpenCalendar?: () => void
  variant?: 'dark' | 'light'
}

function getTodayString() {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const MONTH_NAMES_SHORT = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
]

const DAY_NAMES_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

export default function DateCarousel({ 
  selectedDate, 
  onSelectDate, 
  onOpenCalendar,
  variant = 'dark'
}: DateCarouselProps) {
  const todayStr = getTodayString()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const selectedItemRef = useRef<HTMLButtonElement>(null)

  // Generate 7 days centered around selectedDate (-3 to +3)
  const days = []
  const baseDate = selectedDate ? new Date(`${selectedDate}T00:00:00`) : new Date()

  for (let offset = -3; offset <= 3; offset++) {
    const d = new Date(baseDate)
    d.setDate(baseDate.getDate() + offset)

    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`

    days.push({
      dateStr,
      dayNum: d.getDate(),
      dayName: DAY_NAMES_SHORT[d.getDay()],
      monthName: MONTH_NAMES_SHORT[d.getMonth()],
      isToday: dateStr === todayStr,
      isSelected: dateStr === selectedDate,
      isCenter: offset === 0
    })
  }

  // Scroll active date into view automatically
  useEffect(() => {
    if (selectedItemRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const item = selectedItemRef.current
      const containerRect = container.getBoundingClientRect()
      const itemRect = item.getBoundingClientRect()

      const scrollLeft = container.scrollLeft + (itemRect.left - containerRect.left) - (container.clientWidth / 2) + (itemRect.width / 2)
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' })
    }
  }, [selectedDate])

  const handlePrevDay = () => {
    const prev = new Date(baseDate)
    prev.setDate(baseDate.getDate() - 1)
    const year = prev.getFullYear()
    const month = String(prev.getMonth() + 1).padStart(2, '0')
    const day = String(prev.getDate()).padStart(2, '0')
    onSelectDate(`${year}-${month}-${day}`)
  }

  const handleNextDay = () => {
    const next = new Date(baseDate)
    next.setDate(baseDate.getDate() + 1)
    const year = next.getFullYear()
    const month = String(next.getMonth() + 1).padStart(2, '0')
    const day = String(next.getDate()).padStart(2, '0')
    onSelectDate(`${year}-${month}-${day}`)
  }

  const isDark = variant === 'dark'

  return (
    <div className={`flex items-center justify-between gap-0.5 xs:gap-1 sm:gap-2 p-1 xs:p-1.5 rounded-2xl border shadow-inner w-full max-w-full min-w-0 select-none ${
      isDark ? 'bg-slate-900/90 border-slate-700/60' : 'bg-slate-100 border-slate-200'
    }`}>
      {/* Botón Día Anterior */}
      <button
        onClick={handlePrevDay}
        className={`p-1 xs:p-1.5 sm:p-2 rounded-xl transition-colors shrink-0 ${
          isDark 
            ? 'text-slate-400 hover:text-white hover:bg-slate-700/60' 
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
        }`}
        title="Día anterior"
        aria-label="Día anterior"
      >
        <ChevronLeft className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
      </button>

      {/* Tira de días del carrusel */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar py-0.5 px-0.5 min-w-0 scroll-smooth snap-x snap-mandatory"
      >
        {days.map((d) => (
          <button
            key={d.dateStr}
            ref={d.isSelected ? selectedItemRef : null}
            onClick={() => onSelectDate(d.dateStr)}
            className={`flex flex-col items-center justify-center px-1.5 xs:px-2.5 sm:px-3.5 py-0.5 xs:py-1 sm:py-1.5 rounded-xl transition-all shrink-0 min-w-[42px] xs:min-w-[50px] sm:min-w-[62px] snap-center ${
              d.isSelected
                ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30 ring-2 ring-orange-500 scale-105 z-10 font-black'
                : d.isToday
                ? isDark
                  ? 'bg-slate-800 text-orange-400 border border-orange-500/40 hover:bg-slate-700 font-extrabold'
                  : 'bg-white text-orange-600 border border-orange-300 hover:bg-orange-50 font-extrabold'
                : isDark
                  ? 'bg-slate-800/60 text-slate-300 hover:bg-slate-700/70 hover:text-white border border-slate-700/40 font-semibold'
                  : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200 shadow-sm font-semibold'
            }`}
          >
            <span className={`text-[8px] xs:text-[9px] sm:text-[10px] uppercase tracking-wider font-bold ${
              d.isSelected 
                ? 'text-orange-100' 
                : d.isToday 
                ? 'text-orange-500' 
                : 'text-slate-400'
            }`}>
              {d.dayName}
            </span>
            <span className="text-xs xs:text-sm sm:text-base leading-tight font-black">
              {d.dayNum}
            </span>
            <span className={`text-[8px] xs:text-[9px] sm:text-[10px] font-medium ${
              d.isSelected ? 'text-orange-100' : 'text-slate-400'
            }`}>
              {d.monthName}
            </span>
          </button>
        ))}
      </div>

      {/* Botón Día Siguiente */}
      <button
        onClick={handleNextDay}
        className={`p-1 xs:p-1.5 sm:p-2 rounded-xl transition-colors shrink-0 ${
          isDark 
            ? 'text-slate-400 hover:text-white hover:bg-slate-700/60' 
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
        }`}
        title="Día siguiente"
        aria-label="Día siguiente"
      >
        <ChevronRight className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
      </button>

      {/* Botón Calendario Modal (opcional) */}
      {onOpenCalendar && (
        <button
          onClick={onOpenCalendar}
          className={`p-1 xs:p-1.5 sm:p-2 rounded-xl transition-colors shrink-0 ml-0.5 border ${
            isDark 
              ? 'text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 border-orange-500/20 bg-slate-800/80' 
              : 'text-orange-600 hover:bg-orange-100 border-orange-200 bg-white'
          }`}
          title="Abrir calendario completo"
          aria-label="Abrir calendario completo"
        >
          <CalendarIcon className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
        </button>
      )}
    </div>
  )
}

