import Link from 'next/link'
import { ChefHat, ClipboardList } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-5xl font-black text-slate-800 mb-3 sm:mb-4 tracking-tight">
            Sistema de Pedidos <span className="text-orange-500">Alitas</span>
          </h1>
          <p className="text-base sm:text-xl text-slate-500 font-medium">Selecciona tu rol para continuar</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <Link href="/waiter" className="group">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-slate-200 hover:border-orange-500 hover:shadow-xl hover:shadow-orange-100 transition-all flex flex-col items-center text-center cursor-pointer active:scale-95">
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-orange-100 rounded-full flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-orange-500 group-hover:text-white text-orange-500 transition-colors shrink-0">
                <ClipboardList className="w-8 h-8 sm:w-12 sm:h-12" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 mb-1 sm:mb-2">Pedidos</h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">Tomar órdenes, cobrar e inventario</p>
            </div>
          </Link>

          <Link href="/kitchen" className="group">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-slate-200 hover:border-red-500 hover:shadow-xl hover:shadow-red-100 transition-all flex flex-col items-center text-center cursor-pointer active:scale-95">
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-red-100 rounded-full flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-red-500 group-hover:text-white text-red-500 transition-colors shrink-0">
                <ChefHat className="w-8 h-8 sm:w-12 sm:h-12" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 mb-1 sm:mb-2">Cocina</h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">Visualizar y preparar órdenes</p>
            </div>
          </Link>
        </div>
      </div>
    </main>
  )
}
