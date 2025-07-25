import type { Order, OrderItem, Product } from "./supabase"
import type { Settings } from "./settings-context"
import { formatCurrency } from "./utils"

export interface ReceiptData extends Order {
  order_items: OrderItem[] // Use OrderItem type for items
  subtotal: number
  taxAmount: number
  totalDiscount: number
  totalFees: number
  // Add settings properties directly for printing
  currencySymbol: string
  decimalPlaces: number
  storeName: string
  printReceiptAutomatically: boolean
  // Optional fields for receipt
  cashier?: string
  change?: number
}

export interface PrintableOrder extends Order {
  order_items: Array<OrderItem & Partial<Product>> // OrderItem with optional Product details
  subtotal: number
  taxAmount: number
  totalDiscount: number
  totalFees: number
}

export interface PrintableSettings extends Settings {
  // Add any settings specific to printing if needed
}

export class ThermalReceiptPrinter {
  private static ESC = "\x1B"
  private static GS = "\x1D"

  // Thermal printer commands
  private static commands = {
    INIT: "\x1B\x40",
    ALIGN_CENTER: "\x1B\x61\x01",
    ALIGN_LEFT: "\x1B\x61\x00",
    ALIGN_RIGHT: "\x1B\x61\x02",
    BOLD_ON: "\x1B\x45\x01",
    BOLD_OFF: "\x1B\x45\x00",
    UNDERLINE_ON: "\x1B\x2D\x01",
    UNDERLINE_OFF: "\x1B\x2D\x00",
    DOUBLE_HEIGHT: "\x1B\x21\x10",
    DOUBLE_WIDTH: "\x1B\x21\x20",
    NORMAL_SIZE: "\x1B\x21\x00",
    CUT_PAPER: "\x1D\x56\x00",
    FEED_LINE: "\x0A",
    FEED_LINES: (n: number) => "\x1B\x64" + String.fromCharCode(n),
  }

  static generateReceipt(data: ReceiptData): string {
    const { commands } = this
    let receipt = ""

    // Initialize printer
    receipt += commands.INIT

    // Header
    receipt += commands.ALIGN_CENTER
    receipt += commands.DOUBLE_HEIGHT
    receipt += commands.BOLD_ON
    receipt += `${data.storeName || "FRUIT & VEGETABLES"}\n`
    receipt += commands.NORMAL_SIZE
    receipt += commands.BOLD_OFF
    receipt += "123 Market Street\n"
    receipt += "City, State 12345\n"
    receipt += "Tel: (555) 123-4567\n"
    receipt += this.line(32)

    // Order info
    receipt += commands.ALIGN_LEFT
    receipt += `Order #: ${data.id.substring(0, 8).toUpperCase()}\n`
    receipt += `Date: ${new Date(data.created_at).toLocaleDateString()}\n`
    receipt += `Time: ${new Date(data.created_at).toLocaleTimeString()}\n`
    receipt += `Cashier: ${data.cashier || "N/A"}\n`
    receipt += `Customer: ${data.customer_name || "Guest"}\n`
    receipt += this.line(32)

    // Items
    receipt += commands.BOLD_ON
    receipt += this.formatLine("ITEM", "QTY", "PRICE", "TOTAL")
    receipt += commands.BOLD_OFF
    receipt += this.line(32)

    data.order_items.forEach((item) => {
      const itemTotal = item.quantity * item.price * (1 - (item.discount || 0) / 100)
      receipt += this.formatItemLine(
        item.name,
        item.quantity.toString(),
        `${data.currencySymbol || "£"}${item.price.toFixed(data.decimalPlaces || 2)}`,
        `${data.currencySymbol || "£"}${itemTotal.toFixed(data.decimalPlaces || 2)}`,
      )
      if (item.discount && item.discount > 0) {
        receipt += `  (-${item.discount}% item discount)\n`
      }
    })

    receipt += this.line(32)

    // Totals
    receipt += commands.ALIGN_RIGHT
    receipt += `Subtotal: ${data.currencySymbol || "£"}${data.subtotal.toFixed(data.decimalPlaces || 2)}\n`
    if (data.totalDiscount > 0) {
      receipt += `Discount: -${data.currencySymbol || "£"}${data.totalDiscount.toFixed(data.decimalPlaces || 2)}\n`
    }
    if (data.totalFees > 0) {
      receipt += `Fees: ${data.currencySymbol || "£"}${data.totalFees.toFixed(data.decimalPlaces || 2)}\n`
    }
    if (data.taxAmount > 0) {
      receipt += `Tax: ${data.currencySymbol || "£"}${data.taxAmount.toFixed(data.decimalPlaces || 2)}\n`
    }
    if (data.shipping_cost > 0) {
      receipt += `Shipping: ${data.currencySymbol || "£"}${data.shipping_cost.toFixed(data.decimalPlaces || 2)}\n`
      if (data.delivery_provider_name) {
        receipt += `  (Provider: ${data.delivery_provider_name})\n`
      }
      if (data.shipping_address) {
        receipt += `  (Address: ${data.shipping_address})\n`
      }
    }
    receipt += commands.BOLD_ON
    receipt += commands.DOUBLE_HEIGHT
    receipt += `TOTAL: ${data.currencySymbol || "£"}${data.total_amount.toFixed(data.decimalPlaces || 2)}\n`
    receipt += commands.NORMAL_SIZE
    receipt += commands.BOLD_OFF

    // Payment info
    receipt += commands.ALIGN_LEFT
    receipt += this.line(32)
    receipt += `Paid: ${data.currencySymbol || "£"}${data.amount_paid.toFixed(data.decimalPlaces || 2)}\n`
    if (data.change_due > 0) {
      receipt += `Change: ${data.currencySymbol || "£"}${data.change_due.toFixed(data.decimalPlaces || 2)}\n`
    }
    receipt += `Payment Method: ${data.payment_method}\n`
    if (data.notes) {
      receipt += `Notes: ${data.notes}\n`
    }

    // Footer
    receipt += this.line(32)
    receipt += commands.ALIGN_CENTER
    receipt += "Thank you for your business!\n"
    receipt += "Please come again\n"
    receipt += commands.FEED_LINES(3)

    // Cut paper
    receipt += commands.CUT_PAPER

    return receipt
  }

  private static line(length: number): string {
    return "-".repeat(length) + "\n"
  }

  private static formatLine(col1: string, col2: string, col3: string, col4: string): string {
    const width = 32
    const col1Width = 12
    const col2Width = 4
    const col3Width = 8
    const col4Width = 8

    return (
      col1.substring(0, col1Width).padEnd(col1Width) +
      col2.substring(0, col2Width).padStart(col2Width) +
      col3.substring(0, col3Width).padStart(col3Width) +
      col4.substring(0, col4Width).padStart(col4Width) +
      "\n"
    )
  }

  private static formatItemLine(name: string, qty: string, price: string, total: string): string {
    let result = ""
    const nameWidth = 20

    // If name is too long, wrap it
    if (name.length > nameWidth) {
      result += name.substring(0, nameWidth) + "\n"
      result += " ".repeat(nameWidth) + qty.padStart(4) + price.padStart(8) + total.padStart(8) + "\n"
    } else {
      result += name.padEnd(nameWidth) + qty.padStart(4) + price.padStart(8) + total.padStart(8) + "\n"
    }

    return result
  }

  static async print(order: PrintableOrder, settings: PrintableSettings): Promise<void> {
    if (!settings.receiptPrinterEnabled) {
      console.log("Receipt printing is disabled in settings.")
      return
    }

    console.log("\n--- Printing Receipt ---")
    console.log("------------------------------------")
    console.log("          CosyPOS Receipt           ")
    console.log("------------------------------------")
    console.log(`Date: ${new Date(order.created_at).toLocaleString()}`)
    console.log(`Order ID: ${order.id.substring(0, 8)}`)
    if (order.customer_name && order.customer_name !== "Guest") {
      console.log(`Customer: ${order.customer_name}`)
    }
    console.log("------------------------------------")
    console.log("Items:")
    order.order_items.forEach((item) => {
      const itemName = item.name || `Product ID: ${item.product_id}`
      const itemPrice = item.price
      const itemQuantity = item.quantity
      const itemDiscount = item.discount || 0 // Percentage discount
      const itemTotalBeforeDiscount = itemPrice * itemQuantity
      const itemDiscountAmount = (itemTotalBeforeDiscount * itemDiscount) / 100
      const itemTotal = itemTotalBeforeDiscount - itemDiscountAmount

      console.log(
        `  ${itemQuantity}x ${itemName} @ ${formatCurrency(itemPrice, settings.currencySymbol, settings.decimalPlaces)}`,
      )
      if (itemDiscount > 0) {
        console.log(
          `    Discount: ${itemDiscount}% (-${formatCurrency(itemDiscountAmount, settings.currencySymbol, settings.decimalPlaces)})`,
        )
      }
      console.log(`    Total: ${formatCurrency(itemTotal, settings.currencySymbol, settings.decimalPlaces)}`)
    })
    console.log("------------------------------------")
    console.log(
      `Subtotal: ${formatCurrency(order.subtotal + order.totalDiscount, settings.currencySymbol, settings.decimalPlaces)}`,
    )
    if (order.totalDiscount > 0) {
      console.log(`Discount: -${formatCurrency(order.totalDiscount, settings.currencySymbol, settings.decimalPlaces)}`)
    }
    if (order.totalFees > 0) {
      console.log(`Fees: ${formatCurrency(order.totalFees, settings.currencySymbol, settings.decimalPlaces)}`)
    }
    if (settings.taxRate > 0) {
      console.log(
        `Tax (${settings.taxRate * 100}%): ${formatCurrency(order.taxAmount, settings.currencySymbol, settings.decimalPlaces)}`,
      )
    }
    if (order.shipping_address && order.shipping_cost > 0) {
      console.log(`Shipping: ${formatCurrency(order.shipping_cost, settings.currencySymbol, settings.decimalPlaces)}`)
      console.log(`  Address: ${order.shipping_address}`)
      if (order.delivery_provider_name) {
        console.log(`  Provider: ${order.delivery_provider_name}`)
      }
    }
    console.log("------------------------------------")
    console.log(`TOTAL: ${formatCurrency(order.total_amount, settings.currencySymbol, settings.decimalPlaces)}`)
    console.log(`Paid: ${formatCurrency(order.amount_paid, settings.currencySymbol, settings.decimalPlaces)}`)
    console.log(`Change: ${formatCurrency(order.change_due, settings.currencySymbol, settings.decimalPlaces)}`)
    console.log(`Payment Method: ${order.payment_method}`)
    if (order.notes) {
      console.log("Notes:")
      console.log(`  ${order.notes}`)
    }
    console.log("------------------------------------")
    console.log("        Thank You for your purchase!        ")
    console.log("------------------------------------\n")

    // In a real application, you would send this data to a connected thermal printer
    // using a library like 'node-thermal-printer' or a cloud printing service.
    // For this example, we're just logging to the console.
  }

  private static async printViaSerial(receiptText: string): Promise<void> {
    try {
      // Request serial port access
      const port = await (navigator as any).serial.requestPort()
      await port.open({ baudRate: 9600 })

      const writer = port.writable.getWriter()
      const encoder = new TextEncoder()

      await writer.write(encoder.encode(receiptText))
      await writer.close()
      await port.close()
    } catch (error) {
      throw new Error("Serial printing failed: " + error)
    }
  }

  private static printViaDialog(receiptData: ReceiptData): void {
    // Create a printable HTML version
    const printWindow = window.open("", "_blank", "width=300,height=600")
    if (!printWindow) return

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt</title>
        <style>
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.2;
            margin: 0;
            padding: 10px;
            width: 280px;
          }
          .center { text-align: center; }
          .right { text-align: right; }
          .bold { font-weight: bold; }
          .large { font-size: 16px; }
          .line { border-top: 1px dashed #000; margin: 5px 0; }
          .item-row { display: flex; justify-content: space-between; }
          .item-name { flex: 1; }
          .item-qty, .item-price, .item-total { width: 60px; text-align: right; }
          @media print {
            body { width: auto; }
          }
        </style>
      </head>
      <body>
        <div class="center bold large">${receiptData.storeName || "FRUIT & VEGETABLES"}</div>
        <div class="center">123 Market Street</div>
        <div class="center">City, State 12345</div>
        <div class="center">Tel: (555) 123-4567</div>
        <div class="line"></div>
        
        <div>Order #: ${receiptData.id.substring(0, 8).toUpperCase()}</div>
        <div>Date: ${new Date(receiptData.created_at).toLocaleDateString()}</div>
        <div>Time: ${new Date(receiptData.created_at).toLocaleTimeString()}</div>
        <div>Cashier: ${receiptData.cashier || "N/A"}</div>
        <div>Customer: ${receiptData.customer_name || "Guest"}</div>
        <div class="line"></div>
        
        <div class="item-row bold">
          <span class="item-name">ITEM</span>
          <span class="item-qty">QTY</span>
          <span class="item-price">${receiptData.currencySymbol || "PRICE"}</span>
          <span class="item-total">${receiptData.currencySymbol || "TOTAL"}</span>
        </div>
        <div class="line"></div>
        
        ${receiptData.order_items
          .map(
            (item) => `
          <div class="item-row">
            <span class="item-name">${item.name}</span>
            <span class="item-qty">${item.quantity}</span>
            <span class="item-price">${receiptData.currencySymbol || "£"}${item.price.toFixed(receiptData.decimalPlaces || 2)}</span>
            <span class="item-total">${receiptData.currencySymbol || "£"}${(item.quantity * item.price * (1 - (item.discount || 0) / 100)).toFixed(receiptData.decimalPlaces || 2)}</span>
          </div>
          ${item.discount && item.discount > 0 ? `<div class="right">(-${item.discount}% item discount)</div>` : ""}
        `,
          )
          .join("")}
        
        <div class="line"></div>
        <div class="right">Subtotal: ${receiptData.currencySymbol || "£"}${receiptData.subtotal.toFixed(receiptData.decimalPlaces || 2)}</div>
        ${receiptData.totalDiscount > 0 ? `<div class="right">Discount: -${receiptData.currencySymbol || "£"}${receiptData.totalDiscount.toFixed(receiptData.decimalPlaces || 2)}</div>` : ""}
        ${receiptData.totalFees > 0 ? `<div class="right">Fees: ${receiptData.currencySymbol || "£"}${receiptData.totalFees.toFixed(receiptData.decimalPlaces || 2)}</div>` : ""}
        ${receiptData.taxAmount > 0 ? `<div class="right">Tax: ${receiptData.currencySymbol || "£"}${receiptData.taxAmount.toFixed(receiptData.decimalPlaces || 2)}</div>` : ""}
        ${
          receiptData.shipping_cost > 0
            ? `
          <div class="right">Shipping: ${receiptData.currencySymbol || "£"}${receiptData.shipping_cost.toFixed(receiptData.decimalPlaces || 2)}</div>
          ${receiptData.delivery_provider_name ? `<div class="right">(Provider: ${receiptData.delivery_provider_name})</div>` : ""}
          ${receiptData.shipping_address ? `<div class="right">(Address: ${receiptData.shipping_address})</div>` : ""}
        `
            : ""
        }
        <div class="right bold large">TOTAL: ${receiptData.currencySymbol || "£"}${receiptData.total_amount.toFixed(receiptData.decimalPlaces || 2)}</div>
        
        <div class="line"></div>
        <div class="right">Paid: ${receiptData.currencySymbol || "£"}${receiptData.amount_paid.toFixed(receiptData.decimalPlaces || 2)}</div>
        ${receiptData.change_due > 0 ? `<div class="right">Change: ${receiptData.currencySymbol || "£"}${receiptData.change_due.toFixed(receiptData.decimalPlaces || 2)}</div>` : ""}
        
        <div class="line"></div>
        <div class="bold">Payment Method: ${receiptData.payment_method}</div>
        ${receiptData.notes ? `<div class="bold">Notes: ${receiptData.notes}</div>` : ""}
        
        <div class="line"></div>
        <div class="center">Thank you for your business!</div>
        <div class="center">Please come again</div>
      </body>
      </html>
    `

    printWindow.document.write(html)
    printWindow.document.close()

    // Auto-print after a short delay
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 500)
  }
}

// -----------------------------------------------------------------------------
// Convenience helper
// -----------------------------------------------------------------------------

/**
 * Proxy helper so other modules can simply call `printReceipt(data)`
 * instead of importing the full `ThermalReceiptPrinter` class.
 */
export async function printReceipt(order: PrintableOrder, settings: PrintableSettings): Promise<void> {
  return ThermalReceiptPrinter.print(order, settings)
}
