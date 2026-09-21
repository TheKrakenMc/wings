'use client'

import useSWR from 'swr'
import { getOrders } from '@/app/actions'
import OrderCard from '@/app/components/OrderCard'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

export default function KitchenPage() {
  const { data: orders } = useSWR('orders', getOrders, { refreshInterval: 2000 })

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <header className="sticky top-0 z-10 bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-3 bg-slate-700 rounded-2xl hover:bg-slate-600 transition-colors">
            <ArrowLeft className="w-6 h-6 text-white" />
          </Link>
          <h1 className="text-3xl font-black text-white">Cocina</h1>
        </div>
        <div className="bg-red-500/20 text-red-400 px-6 py-3 rounded-2xl font-black text-xl flex items-center gap-3 border border-red-500/30">
          <span>Órdenes Pendientes:</span>
          <span className="text-3xl">{orders?.filter(o => o.status === 'PENDING').length || 0}</span>
        </div>
      </header>

      <main className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {orders?.map((order, idx) => (
              <OrderCard key={order.id} order={order} isKitchen={true} queueIndex={idx + 1} />
            ))}
          </AnimatePresence>
          
          {orders?.length === 0 && (
            <div className="col-span-full py-32 text-center text-slate-500 font-bold text-2xl border-4 border-dashed border-slate-700 rounded-3xl">
              La cocina está libre, excelente trabajo.
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
