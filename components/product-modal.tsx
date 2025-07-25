"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Plus, Trash2, Edit, QrCode } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import type { Product } from "@/lib/supabase"
import { formatCurrency } from "@/lib/utils"
import type { Settings } from "@/lib/settings-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  products: Product[]
  onProductSaved: (product: Product) => void
  onDeleteProduct: (productIds: string[]) => void
  categories: string[]
  onAddCategory: (category: string) => void
  onViewQrCode: (product: Product) => void
  settings: Settings // Add settings prop
}

export function ProductModal({
  isOpen,
  onClose,
  products,
  onProductSaved,
  onDeleteProduct,
  categories,
  onAddCategory,
  onViewQrCode,
  settings,
}: ProductModalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [selectedProductsForDeletion, setSelectedProductsForDeletion] = useState<string[]>([])

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("")
      setEditingProduct(null)
      setIsEditing(false)
      setNewCategoryName("")
      setSelectedProductsForDeletion([])
    }
  }, [isOpen])

  const filteredProducts = useMemo(() => {
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [products, searchTerm])

  const handleNewProduct = useCallback(() => {
    setEditingProduct({
      id: uuidv4(),
      name: "",
      price: 0,
      image: "📦", // Default image
      category: categories[0] || "Uncategorized", // Default to first category or 'Uncategorized'
      stock: 0,
      sku: "",
    })
    setIsEditing(true)
  }, [categories])

  const handleEditProduct = useCallback((product: Product) => {
    setEditingProduct({ ...product }) // Create a copy to edit
    setIsEditing(true)
  }, [])

  const handleSaveProduct = useCallback(() => {
    if (editingProduct && editingProduct.name && editingProduct.price >= 0 && editingProduct.sku) {
      onProductSaved(editingProduct)
      setIsEditing(false)
      setEditingProduct(null)
    } else {
      alert("Please fill all required fields: Name, Price, SKU.")
    }
  }, [editingProduct, onProductSaved])

  const handleAddCategoryClick = useCallback(() => {
    if (newCategoryName.trim() && !categories.includes(newCategoryName.trim())) {
      onAddCategory(newCategoryName.trim())
      setNewCategoryName("")
    }
  }, [newCategoryName, categories, onAddCategory])

  const handleToggleProductForDeletion = useCallback((productId: string) => {
    setSelectedProductsForDeletion((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    )
  }, [])

  const handleDeleteSelectedProducts = useCallback(() => {
    if (
      selectedProductsForDeletion.length > 0 &&
      window.confirm(
        `Are you sure you want to delete ${selectedProductsForDeletion.length} product(s)? This action cannot be undone.`,
      )
    ) {
      onDeleteProduct(selectedProductsForDeletion)
      setSelectedProductsForDeletion([])
    }
  }, [selectedProductsForDeletion, onDeleteProduct])

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false)
    setEditingProduct(null)
  }, [])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Product" : "Manage Products"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Fill in the product details." : "Add, edit, or delete products from your inventory."}
          </DialogDescription>
        </DialogHeader>

        {isEditing ? (
          <div className="flex-1 flex flex-col space-y-4 overflow-y-auto pr-2">
            <div className="space-y-2">
              <Label htmlFor="productName">Name</Label>
              <Input
                id="productName"
                value={editingProduct?.name || ""}
                onChange={(e) => setEditingProduct((prev) => ({ ...prev!, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="productPrice">Price</Label>
              <Input
                id="productPrice"
                type="number"
                value={editingProduct?.price || 0}
                onChange={(e) => setEditingProduct((prev) => ({ ...prev!, price: Number.parseFloat(e.target.value) }))}
                min={0}
                step={0.01}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="productSKU">SKU</Label>
              <Input
                id="productSKU"
                value={editingProduct?.sku || ""}
                onChange={(e) => setEditingProduct((prev) => ({ ...prev!, sku: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="productStock">Stock</Label>
              <Input
                id="productStock"
                type="number"
                value={editingProduct?.stock || 0}
                onChange={(e) => setEditingProduct((prev) => ({ ...prev!, stock: Number.parseInt(e.target.value) }))}
                min={0}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="productImage">Image (Emoji or URL)</Label>
              <Input
                id="productImage"
                value={editingProduct?.image || ""}
                onChange={(e) => setEditingProduct((prev) => ({ ...prev!, image: e.target.value }))}
                placeholder="e.g., 🍎 or https://example.com/image.png"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="productCategory">Category</Label>
              <Select
                value={editingProduct?.category || ""}
                onValueChange={(value) => setEditingProduct((prev) => ({ ...prev!, category: value }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newCategory">Add New Category</Label>
              <div className="flex gap-2">
                <Input
                  id="newCategory"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Enter new category name"
                />
                <Button onClick={handleAddCategoryClick} disabled={!newCategoryName.trim()}>
                  Add
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-2">
                {filteredProducts.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No products found.</p>
                ) : (
                  filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className={`flex items-center justify-between p-3 rounded-md border ${
                        selectedProductsForDeletion.includes(product.id) ? "bg-red-100 border-red-500" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedProductsForDeletion.includes(product.id)}
                          onChange={() => handleToggleProductForDeletion(product.id)}
                          className="form-checkbox h-4 w-4 text-red-600"
                        />
                        <span className="text-2xl">{product.image}</span>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            SKU: {product.sku} | Stock: {product.stock} |{" "}
                            {formatCurrency(product.price, settings.currencySymbol, settings.decimalPlaces)}
                          </p>
                          <p className="text-xs text-muted-foreground">Category: {product.category}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleEditProduct(product)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => onViewQrCode(product)}>
                          <QrCode className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </>
        )}

        <DialogFooter className="mt-4">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveProduct}
                disabled={!editingProduct?.name || !editingProduct?.sku || editingProduct.price < 0}
              >
                Save Product
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              {selectedProductsForDeletion.length > 0 && (
                <Button variant="destructive" onClick={handleDeleteSelectedProducts}>
                  <Trash2 className="w-4 h-4 mr-2" /> Delete Selected ({selectedProductsForDeletion.length})
                </Button>
              )}
              <Button onClick={handleNewProduct}>
                <Plus className="w-4 h-4 mr-2" /> New Product
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
