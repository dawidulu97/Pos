import type { Order, OrderItem } from "./supabase"
import type { Settings } from "./settings-context"
import { formatCurrency } from "./utils"

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
export interface PrintableOrder extends Order {
  order_items: OrderItem[] // always array (empty OK)
  subtotal: number
  taxAmount: number
  totalDiscount: number
  totalFees: number
}

export interface PrintableSettings extends Settings {}

/* ------------------------------------------------------------------ */
/*  Console receipt (preview-friendly)                                 */
/* ------------------------------------------------------------------ */
const ln = (w = 32) => "-".repeat(w)

function printToConsole(o: PrintableOrder, s: PrintableSettings) {
  const { currencySymbol, decimalPlaces } = s

  console.log("\n" + ln())
  console.log(`ORDER ${o.id.slice(0, 8).toUpperCase()} – ${o.status}`)
  console.log(ln())

  o.order_items.forEach((it) =>
    console.log(
      `${it.quantity} × ${it.name || "Unknown Item"} @ ${formatCurrency(it.price, currencySymbol, decimalPlaces)}`,
    ),
  )

  console.log(ln())
  console.log(`Subtotal : ${formatCurrency(o.subtotal, currencySymbol, decimalPlaces)}`)
  if (o.totalDiscount > 0) {
    console.log(`Discount : -${formatCurrency(o.totalDiscount, currencySymbol, decimalPlaces)}`)
  }
  if (o.totalFees > 0) {
    console.log(`Fees     : +${formatCurrency(o.totalFees, currencySymbol, decimalPlaces)}`)
  }
  console.log(`Tax      : +${formatCurrency(o.tax_amount, currencySymbol, decimalPlaces)}`)
  console.log(`TOTAL    : ${formatCurrency(o.total, currencySymbol, decimalPlaces)}`)
  console.log(ln())

  if (o.customer_name && o.customer_name !== "Guest") {
    console.log(`Customer : ${o.customer_name}`)
  }
  if (o.shipping_address) {
    console.log(`Shipping : ${o.shipping_address}, ${o.shipping_city || ""}`)
    console.log(`Provider : ${o.delivery_provider_name || "N/A"}`)
    console.log(`Cost     : ${formatCurrency(o.shipping_cost, currencySymbol, decimalPlaces)}`)
  }

  console.log(`Paid with: ${o.payment_method}`)
  console.log(`Amount   : ${formatCurrency(o.amount_paid, currencySymbol, decimalPlaces)}`)
  console.log(`Change   : ${formatCurrency(o.change_due, currencySymbol, decimalPlaces)}`)
  console.log(ln())
  console.log(`Date     : ${new Date(o.created_at).toLocaleString()}`)
  console.log(`Store    : ${s.storeName}`)
  console.log(ln())
}

/* ------------------------------------------------------------------ */
/*  Print functions (stubbed for preview)                              */
/* ------------------------------------------------------------------ */
export async function printReceipt(order: Order, settings: Settings) {
  const printableOrder: PrintableOrder = {
    ...order,
    order_items: order.order_items || [],
    subtotal: order.subtotal || 0,
    taxAmount: order.tax_amount || 0,
    totalDiscount: order.total_discount || 0,
    totalFees: order.total_fees || 0,
  }
  const printableSettings: PrintableSettings = {
    ...settings,
    taxRate: settings.taxRate || 0,
    decimalPlaces: settings.decimalPlaces || 2,
    currencySymbol: settings.currencySymbol || "$",
    storeName: settings.storeName || "My Store",
    receiptPrinterEnabled: settings.receiptPrinterEnabled || false,
    shipping: settings.shipping || { enabled: false },
    paymentMethods: settings.paymentMethods || [],
    deliveryProviders: settings.deliveryProviders || [],
    openSooq: settings.openSooq || { enabled: false, apiKey: "", storeId: "" },
  }

  console.log("--- Simulating Receipt Print ---")
  printToConsole(printableOrder, printableSettings)
  console.log("--------------------------------")
  // In a real application, this would interface with a physical printer
  // e.g., using WebUSB, WebBluetooth, or a backend service.
}

export async function printInvoice(order: Order, settings: Settings) {
  const printableOrder: PrintableOrder = {
    ...order,
    order_items: order.order_items || [],
    subtotal: order.subtotal || 0,
    taxAmount: order.tax_amount || 0,
    totalDiscount: order.total_discount || 0,
    totalFees: order.total_fees || 0,
  }
  const printableSettings: PrintableSettings = {
    ...settings,
    taxRate: settings.taxRate || 0,
    decimalPlaces: settings.decimalPlaces || 2,
    currencySymbol: settings.currencySymbol || "$",
    storeName: settings.storeName || "My Store",
    receiptPrinterEnabled: settings.receiptPrinterEnabled || false,
    shipping: settings.shipping || { enabled: false },
    paymentMethods: settings.paymentMethods || [],
    deliveryProviders: settings.deliveryProviders || [],
    openSooq: settings.openSooq || { enabled: false, apiKey: "", storeId: "" },
  }

  console.log("--- Simulating Invoice Print ---")
  console.log(`\n*** INVOICE for ${printableSettings.storeName} ***`)
  printToConsole(printableOrder, printableSettings)
  console.log("--------------------------------")
  // In a real application, this would generate a more formal PDF or
  // send data to an invoicing service.
}
