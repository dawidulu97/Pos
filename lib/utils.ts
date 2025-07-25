import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function formatCurrency(amount: number, currencySymbol = "$", decimalPlaces = 2): string {
  const formatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
    useGrouping: true,
  })
  return `${currencySymbol}${formatter.format(amount)}`
}

interface CartItem {
  price: number
  quantity: number
  discount?: number // Percentage discount
}

export function calculateTotal(
  cart: CartItem[],
  taxRate: number,
  fees: { description: string; amount: number }[],
  totalOrderDiscountPercentage: number,
) {
  let subtotal = 0
  let totalDiscountAmount = 0

  cart.forEach((item) => {
    const itemTotal = item.price * item.quantity
    const itemDiscountAmount = item.discount ? (itemTotal * item.discount) / 100 : 0
    subtotal += itemTotal - itemDiscountAmount
  })

  // Apply total order discount after item-specific discounts
  const orderDiscountAmount = (subtotal * totalOrderDiscountPercentage) / 100
  totalDiscountAmount += orderDiscountAmount
  subtotal -= orderDiscountAmount

  const totalFeesAmount = fees.reduce((sum, fee) => sum + fee.amount, 0)

  const taxAmount = subtotal * taxRate
  const total = subtotal + taxAmount + totalFeesAmount

  return {
    subtotal,
    totalDiscountAmount,
    totalFeesAmount,
    taxAmount,
    total,
  }
}
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
