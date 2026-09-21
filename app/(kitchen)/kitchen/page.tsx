'use client'

import useSWR from 'swr'
import { getOrders } from '@/app/actions'
import OrderCard from '@/app/components/OrderCard'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { AnimatePresence } from 'framer-motion'

export default function KitchenPage() {
  const { data: orders } = useSWR('orders', getOrders, { refreshInterval: 2000 })

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <header className="sticky top-0 z-10 bg-slate-800 border-b border-slate-700 px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <Link href="/" className="p-2 sm:p-3 bg-slate-700 rounded-xl sm:rounded-2xl hover:bg-slate-600 transition-colors">
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </Link>
          <h1 className="text-xl sm:text-3xl font-black text-white">Cocina</h1>
        </div>
        <div className="bg-red-500/20 text-red-400 px-3 sm:px-6 py-1.5 sm:py-3 rounded-xl sm:rounded-2xl font-black text-xs sm:text-xl flex items-center gap-1.5 sm:gap-3 border border-red-500/30 shrink-0">
          <span className="hidden xs:inline">Pendientes:</span>
          <span className="xs:hidden">Pend:</span>
          <span className="text-sm sm:text-3xl font-extrabold">{orders?.filter(o => o.status === 'PENDING').length || 0}</span>
        </div>
      </header>

      <main className="p-3 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          <AnimatePresence>
            {orders?.map((order, idx) => (
              <OrderCard key={order.id} order={order} isKitchen={true} queueIndex={idx + 1} />
            ))}
          </AnimatePresence>
          
          {orders?.length === 0 && (
            <div className="col-span-full py-20 sm:py-32 text-center text-slate-500 font-bold text-lg sm:text-2xl border-2 sm:border-4 border-dashed border-slate-700 rounded-2xl sm:rounded-3xl p-4">
              La cocina está libre, excelente trabajo.
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
