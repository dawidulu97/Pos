import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { CartItem } from "@/app/page" // Assuming CartItem is defined in app/page.tsx

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currencySymbol = "$", decimalPlaces = 2): string {
  return `${currencySymbol}${amount.toFixed(decimalPlaces)}`
}

export function calculateTotal(
  cart: CartItem[],
  taxRate: number,
  additionalFees: { description: string; amount: number }[],
  totalOrderDiscountPercentage: number,
) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemDiscounts = cart.reduce((sum, item) => sum + (item.discount || 0) * item.quantity, 0)

  const totalFeesAmount = additionalFees.reduce((sum, fee) => sum + fee.amount, 0)

  // Calculate total discount amount based on percentage
  const totalOrderDiscountAmount = subtotal * (totalOrderDiscountPercentage / 100)

  // Total discount is sum of item-specific discounts and order-level discount
  const totalDiscountAmount = itemDiscounts + totalOrderDiscountAmount

  const taxableAmount = subtotal - totalDiscountAmount + totalFeesAmount
  const taxAmount = taxableAmount > 0 ? taxableAmount * taxRate : 0

  const total = subtotal - totalDiscountAmount + totalFeesAmount + taxAmount

  return {
    subtotal,
    totalDiscountAmount,
    totalFeesAmount,
    taxAmount,
    total,
  }
}
