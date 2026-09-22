'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { OrderStatus, Prisma } from '@prisma/client'

export async function getActiveShift() {
  const shift = await prisma.shiftInventory.findFirst({
    where: { isActive: true },
    orderBy: { date: 'desc' }
  })
  return shift
}

export async function getShiftByDate(dateStr: string) {
  if (!dateStr) return null
  const [year, month, day] = dateStr.split('-').map(Number)
  if (!year || !month || !day) return null

  const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))
  const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999))

  const shift = await prisma.shiftInventory.findFirst({
    where: {
      date: {
        gte: startOfDay,
        lte: endOfDay
      }
    },
    orderBy: { date: 'desc' }
  })
  return shift
}

export async function getActiveShiftDates() {
  const shifts = await prisma.shiftInventory.findMany({
    select: {
      date: true,
      remainingRawOrders: true,
    }
  })

  const result: Record<string, number> = {}
  for (const s of shifts) {
    const d = new Date(s.date)
    const year = d.getUTCFullYear()
    const month = String(d.getUTCMonth() + 1).padStart(2, '0')
    const day = String(d.getUTCDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`
    result[dateStr] = s.remainingRawOrders
  }
  return result
}


export async function startShiftForDate(dateStr: string, initialOrders: number) {
  const [year, month, day] = dateStr.split('-').map(Number)
  const shiftDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0))

  // Desactivar turnos anteriores activos si se desea, o mantener activo el turno actual
  await prisma.shiftInventory.updateMany({
    where: { isActive: true },
    data: { isActive: false }
  })

  // Crear nuevo turno para la fecha elegida
  const shift = await prisma.shiftInventory.create({
    data: {
      date: shiftDate,
      initialRawOrders: initialOrders,
      remainingRawOrders: initialOrders,
      isActive: true
    }
  })

  revalidatePath('/')
  return shift
}

export async function startShift(initialOrders: number) {
  // Desactivar turnos anteriores
  await prisma.shiftInventory.updateMany({
    where: { isActive: true },
    data: { isActive: false }
  })

  // Crear nuevo turno
  const shift = await prisma.shiftInventory.create({
    data: {
      initialRawOrders: initialOrders,
      remainingRawOrders: initialOrders,
      isActive: true
    }
  })

  revalidatePath('/')
  return shift
}

export async function getFlavors() {
  return await prisma.flavor.findMany()
}

type CreateOrderInput = {
  customerName?: string
  phone?: string
  isDelivery: boolean
  deliveryAddress?: string
  orderQuantity: number
  flavors: string[][] // Array de arrays: un array de salsas por orden
  isTakeaway?: boolean
  totalCost: number
}

export async function createOrder(data: CreateOrderInput, targetDateStr?: string) {
  const activeShift = targetDateStr ? await getShiftByDate(targetDateStr) : await getActiveShift()
  if (!activeShift) {
    throw new Error('No hay un turno registrado para esta fecha')
  }

  if (activeShift.remainingRawOrders < data.orderQuantity) {
    throw new Error('No hay suficientes alitas en inventario para esta fecha')
  }

  // Restar inventario del turno de la fecha correspondiente
  await prisma.shiftInventory.update({
    where: { id: activeShift.id },
    data: { remainingRawOrders: activeShift.remainingRawOrders - data.orderQuantity }
  })

  // Determinar la fecha de creación según la fecha seleccionada
  let createdAt: Date | undefined = undefined
  if (targetDateStr) {
    const [year, month, day] = targetDateStr.split('-').map(Number)
    if (year && month && day) {
      const now = new Date()
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
      if (targetDateStr !== todayStr) {
        createdAt = new Date(Date.UTC(year, month - 1, day, now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds()))
      }
    }
  }

  // Crear orden
  const order = await prisma.order.create({
    data: {
      customerName: data.customerName || null,
      phone: data.phone || null,
      isDelivery: data.isDelivery,
      deliveryAddress: data.deliveryAddress || null,
      orderQuantity: data.orderQuantity,
      flavors: data.flavors as unknown as Prisma.InputJsonValue,
      isTakeaway: data.isTakeaway ?? false,
      totalCost: data.totalCost,
      status: OrderStatus.PENDING,
      ...(createdAt ? { createdAt } : {})
    }
  })

  revalidatePath('/')
  return order
}

export async function getOrders(dateStr?: string) {
  const where: Prisma.OrderWhereInput = {
    status: {
      in: [OrderStatus.PENDING, OrderStatus.PREPARING]
    }
  }

  if (dateStr) {
    const [year, month, day] = dateStr.split('-').map(Number)
    if (year && month && day) {
      const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))
      const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999))
      where.createdAt = {
        gte: startOfDay,
        lte: endOfDay
      }
    }
  }

  return await prisma.order.findMany({
    where,
    orderBy: {
      createdAt: 'asc' // FIFO
    }
  })
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const dataToUpdate: Prisma.OrderUpdateInput = { status }

  if (status === OrderStatus.PREPARING) {
    dataToUpdate.preparingAt = new Date()
  } else if (status === OrderStatus.DELIVERED) {
    dataToUpdate.deliveredAt = new Date()
  }

  const order = await prisma.order.update({
    where: { id: orderId },
    data: dataToUpdate
  })

  return order
}

export async function cancelOrder(orderId: string) {
  // Recuperar la orden para devolver el inventario
  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order) throw new Error('Orden no encontrada')

  const activeShift = await getActiveShift()
  if (activeShift) {
    await prisma.shiftInventory.update({
      where: { id: activeShift.id },
      data: { remainingRawOrders: activeShift.remainingRawOrders + order.orderQuantity }
    })
  }

  await prisma.order.delete({ where: { id: orderId } })
}
