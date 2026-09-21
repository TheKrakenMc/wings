import Link from 'next/link'
import { ChefHat, ClipboardList } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-slate-800 mb-4 tracking-tight">
            Sistema de Pedidos <span className="text-orange-500">Alitas</span>
          </h1>
          <p className="text-xl text-slate-500 font-medium">Selecciona tu rol para continuar</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/waiter" className="group">
            <div className="bg-white p-8 rounded-3xl border-2 border-slate-200 hover:border-orange-500 hover:shadow-xl hover:shadow-orange-100 transition-all flex flex-col items-center text-center cursor-pointer active:scale-95">
              <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-orange-500 group-hover:text-white text-orange-500 transition-colors">
                <ClipboardList className="w-12 h-12" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-2">Pedidos</h2>
              <p className="text-slate-500 font-medium">Tomar órdenes, cobrar e inventario</p>
            </div>
          </Link>

          <Link href="/kitchen" className="group">
            <div className="bg-white p-8 rounded-3xl border-2 border-slate-200 hover:border-red-500 hover:shadow-xl hover:shadow-red-100 transition-all flex flex-col items-center text-center cursor-pointer active:scale-95">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-red-500 group-hover:text-white text-red-500 transition-colors">
                <ChefHat className="w-12 h-12" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-2">Cocina</h2>
              <p className="text-slate-500 font-medium">Visualizar y preparar órdenes</p>
            </div>
          </Link>
        </div>
      </div>
    </main>
  )
}
