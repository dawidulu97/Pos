"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"
import { useSettings } from "@/lib/settings-context"
import type { Order } from "@/lib/supabase"
import { formatCurrency } from "@/lib/utils"
import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"

/**
 * Simple fetch helper (local API).
 */
async function fetchOrders(storeId: string, date?: Date): Promise<Order[]> {
  const iso = date ? date.toISOString() : undefined
  const res = await fetch(`/api/orders/fetch?storeId=${storeId}${iso ? `&date=${iso}` : ""}`)
  if (!res.ok) throw new Error("Failed to fetch orders")
  const { orders } = await res.json()
  return orders as Order[]
}

interface OrdersModalProps {
  isOpen: boolean
  onClose: () => void
  /* -- callbacks wired up from /app/page.tsx -- */
  onVoidOrder: (orderId: string) => void
  onRefundOrder: (orderId: string) => void
  onBatchUpdateStatus: (orderIds: string[], status: Order["status"]) => Promise<void>
  onGenerateInvoice: (order: Order) => Promise<void>
  /** optional seed data while first render happens */
  orders?: Order[]
}

export function OrdersModal({
  isOpen,
  onClose,
  orders: seedOrders = [],
  onVoidOrder,
  onRefundOrder,
  onBatchUpdateStatus,
  onGenerateInvoice,
}: OrdersModalProps) {
  /* --------------------------------------------------------------------- */
  /* local fetch (replaces react-query)                                     */
  /* --------------------------------------------------------------------- */
  const searchParams = useSearchParams()
  const storeId = searchParams.get("storeId") || "dummy_store_id"

  const [remoteOrders, setRemoteOrders] = useState<Order[] | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setLoading(true)
    fetchOrders(storeId)
      .then(setRemoteOrders)
      .catch((err) => {
        console.error(err)
        toast({ title: "Order load error", description: err.message, variant: "destructive" })
      })
      .finally(() => setLoading(false))
  }, [isOpen, storeId])

  const orders: Order[] = remoteOrders ?? seedOrders

  /* --------------------------------------------------------------------- */
  /* UI state                                                              */
  /* --------------------------------------------------------------------- */
  const { settings } = useSettings()
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<string[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)

  /* reset when modal closes */
  useEffect(() => {
    if (!isOpen) {
      setSearch("")
      setSelected([])
      setExpanded(null)
    }
  }, [isOpen])

  const filteredOrders = useMemo(
    () =>
      orders.filter((o) =>
        [o.id, o.customer_name, o.status, o.order_type].join(" ").toLowerCase().includes(search.toLowerCase()),
      ),
    [orders, search],
  )

  /* --------------------------------------------------------------------- */
  /* helpers                                                               */
  /* --------------------------------------------------------------------- */
  const toggleAll = (check: boolean) => setSelected(check ? filteredOrders.map((o) => o.id) : [])

  const toggleOne = (id: string, check: boolean) =>
    setSelected((prev) => (check ? [...prev, id] : prev.filter((x) => x !== id)))

  const batchComplete = async () => {
    if (selected.length === 0) return
    await onBatchUpdateStatus(selected, "completed")
    setSelected([])
  }

  const batchInvoice = async () => {
    if (selected.length === 0) return
    await Promise.all(
      selected.map((id) => {
        const order = orders.find((o) => o.id === id)
        return order ? onGenerateInvoice(order) : Promise.resolve()
      }),
    )
    toast({ title: "Invoices generated", description: `Created ${selected.length} invoices` })
    setSelected([])
  }

  /* --------------------------------------------------------------------- */
  /* render                                                                */
  /* --------------------------------------------------------------------- */
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>All Orders</DialogTitle>
        </DialogHeader>

        {/* search & batch actions */}
        <div className="space-y-4 flex-1 overflow-hidden">
          <Input placeholder="Search orders…" value={search} onChange={(e) => setSearch(e.target.value)} />

          <div className="flex flex-wrap gap-2">
            <Checkbox
              id="all"
              checked={selected.length === filteredOrders.length && filteredOrders.length > 0}
              onCheckedChange={(c) => toggleAll(c as boolean)}
            />
            <label htmlFor="all" className="text-sm">
              Select all&nbsp;({selected.length})
            </label>
            <Button size="sm" disabled={selected.length === 0} onClick={batchComplete}>
              Mark complete
            </Button>
            <Button size="sm" variant="secondary" disabled={selected.length === 0} onClick={batchInvoice}>
              Print invoices
            </Button>
          </div>

          {/* orders list */}
          <ScrollArea className="flex-1 pr-4">
            {loading ? (
              <p className="text-center py-4 text-muted-foreground">Loading…</p>
            ) : filteredOrders.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">No orders found.</p>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((order) => (
                  <Card key={order.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-2 items-start">
                        <Checkbox
                          checked={selected.includes(order.id)}
                          onCheckedChange={(c) => toggleOne(order.id, c as boolean)}
                        />
                        <div>
                          <p className="font-medium">#{order.id.slice(0, 8)}</p>
                          <p className="text-xs text-muted-foreground">
                            {order.customer_name || "Guest"} &middot; {order.status}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-bold">
                          {formatCurrency(
                            order.total_amount ?? order.total,
                            settings.currencySymbol,
                            settings.decimalPlaces,
                          )}
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                        >
                          {expanded === order.id ? "Hide" : "Details"}
                        </Button>
                      </div>
                    </div>

                    {expanded === order.id && (
                      <div className="mt-3 space-y-1 text-sm">
                        <p>
                          <strong>Date:</strong> {new Date(order.created_at).toLocaleString()}
                        </p>
                        <p>
                          <strong>Payment:</strong> {order.payment_method} ({order.payment_status})
                        </p>
                        {order.order_items?.length ? (
                          <>
                            <p className="font-semibold mt-2">Items:</p>
                            <ul className="list-disc list-inside">
                              {order.order_items.map((it) => (
                                <li key={it.id}>
                                  {it.quantity} × {it.name ?? "Item"} –{" "}
                                  {formatCurrency(it.price, settings.currencySymbol, settings.decimalPlaces)}
                                </li>
                              ))}
                            </ul>
                          </>
                        ) : null}

                        <div className="flex gap-2 mt-2">
                          {order.status !== "voided" && (
                            <Button size="sm" variant="outline" onClick={() => onVoidOrder(order.id)}>
                              Void
                            </Button>
                          )}
                          {order.status !== "refunded" && (
                            <Button size="sm" variant="outline" onClick={() => onRefundOrder(order.id)}>
                              Refund
                            </Button>
                          )}
                          <Button size="sm" variant="outline" onClick={() => onGenerateInvoice(order)}>
                            Invoice
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
