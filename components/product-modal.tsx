"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import type { Product, Category } from "@/lib/supabase"

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  onProductSaved: (product: Omit<Product, "created_at" | "updated_at">) => Promise<void>
  onDeleteProduct: (productId: string) => Promise<void>
  product?: Product | null
  categories: Category[]
  onAddCategory: (categoryName: string) => Promise<void>
}

export function ProductModal({
  isOpen,
  onClose,
  onProductSaved,
  onDeleteProduct,
  product,
  categories,
  onAddCategory,
}: ProductModalProps) {
  const [name, setName] = useState(product?.name || "")
  const [description, setDescription] = useState(product?.description || "")
  const [price, setPrice] = useState(product?.price.toString() || "")
  const [sku, setSku] = useState(product?.sku || "")
  const [image, setImage] = useState(product?.image || "")
  const [stock, setStock] = useState(product?.stock?.toString() || "0")
  const [selectedCategory, setSelectedCategory] = useState(product?.category || "")
  const [newCategoryName, setNewCategoryName] = useState("")
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false)

  useEffect(() => {
    if (product) {
      setName(product.name)
      setDescription(product.description || "")
      setPrice(product.price.toString())
      setSku(product.sku || "")
      setImage(product.image || "")
      setStock(product.stock?.toString() || "0")
      setSelectedCategory(product.category || "")
    } else {
      setName("")
      setDescription("")
      setPrice("")
      setSku("")
      setImage("")
      setStock("0")
      setSelectedCategory("")
    }
    setNewCategoryName("")
    setShowNewCategoryInput(false)
  }, [product, isOpen])

  const handleSave = async () => {
    if (!name.trim() || !price.trim()) {
      toast({
        title: "Missing Information",
        description: "Product name and price are required.",
        variant: "destructive",
      })
      return
    }
    const parsedPrice = Number.parseFloat(price)
    const parsedStock = Number.parseInt(stock)

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      toast({
        title: "Invalid Price",
        description: "Price must be a positive number.",
        variant: "destructive",
      })
      return
    }
    if (isNaN(parsedStock) || parsedStock < 0) {
      toast({
        title: "Invalid Stock",
        description: "Stock must be a non-negative integer.",
        variant: "destructive",
      })
      return
    }

    const productToSave: Omit<Product, "created_at" | "updated_at"> = {
      id: product?.id || crypto.randomUUID(),
      name: name.trim(),
      description: description.trim() || null,
      price: parsedPrice,
      sku: sku.trim() || null,
      image: image.trim() || null,
      stock: parsedStock,
      category: selectedCategory || null,
    }
    await onProductSaved(productToSave)
  }

  const handleDelete = async () => {
    if (product?.id && confirm(`Are you sure you want to delete ${product.name}?`)) {
      await onDeleteProduct(product.id)
    }
  }

  const handleAddNewCategory = async () => {
    if (newCategoryName.trim()) {
      await onAddCategory(newCategoryName.trim())
      setSelectedCategory(newCategoryName.trim())
      setNewCategoryName("")
      setShowNewCategoryInput(false)
    } else {
      toast({
        title: "Invalid Category Name",
        description: "Category name cannot be empty.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Add New Product"}</DialogTitle>
          <DialogDescription>
            {product ? "Edit the details of this product." : "Fill in the details for a new product."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Product Name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Product Description"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                step="0.01"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="0"
                min="0"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="Unique SKU" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="image">Image URL</Label>
            <Input
              id="image"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <div className="flex items-center gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={() => setShowNewCategoryInput(!showNewCategoryInput)}>
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
            {showNewCategoryInput && (
              <div className="flex items-center gap-2 mt-2">
                <Input
                  placeholder="New category name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
                <Button onClick={handleAddNewCategory}>Add</Button>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          {product && (
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Product</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
