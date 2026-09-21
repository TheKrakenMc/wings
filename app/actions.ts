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

export async function createOrder(data: CreateOrderInput) {
  const activeShift = await getActiveShift()
  if (!activeShift) {
    throw new Error('No hay un turno activo')
  }

  if (activeShift.remainingRawOrders < data.orderQuantity) {
    throw new Error('No hay suficientes alitas en inventario')
  }

  // Restar inventario
  await prisma.shiftInventory.update({
    where: { id: activeShift.id },
    data: { remainingRawOrders: activeShift.remainingRawOrders - data.orderQuantity }
  })

  // Crear orden — construir explícitamente para que Prisma tipifique Json correctamente
  const order = await prisma.order.create({
    data: {
      customerName: data.customerName || null,
      phone: data.phone || null,
      isDelivery: data.isDelivery,
      deliveryAddress: data.deliveryAddress || null,
      orderQuantity: data.orderQuantity,
      flavors: data.flavors as unknown as Prisma.InputJsonValue, // string[][] serializado como Json
      isTakeaway: data.isTakeaway ?? false,
      totalCost: data.totalCost,
      status: OrderStatus.PENDING
    }
  })

  return order
}

export async function getOrders() {
  return await prisma.order.findMany({
    where: {
      status: {
        in: [OrderStatus.PENDING, OrderStatus.PREPARING]
      }
    },
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
