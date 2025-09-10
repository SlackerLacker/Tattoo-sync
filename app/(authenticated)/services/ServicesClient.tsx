"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Package, Edit, Trash2, MoreHorizontal, Clock, DollarSign, Tag } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Service } from "@/types"

interface ServicesClientProps {
  services: Service[]
}

interface Product {
  id: number
  name: string
  description: string
  category: "aftercare" | "jewelry" | "merchandise" | "supplies"
  price: number
  stock: number
  isActive: boolean
  sku: string
}

const initialProducts: Product[] = [
  {
    id: 1,
    name: "Tattoo Aftercare Cream",
    description: "Premium healing cream for new tattoos",
    category: "aftercare",
    price: 25,
    stock: 45,
    isActive: true,
    sku: "TAC-001",
  },
  {
    id: 2,
    name: "Antibacterial Soap",
    description: "Gentle soap for tattoo cleaning",
    category: "aftercare",
    price: 15,
    stock: 32,
    isActive: true,
    sku: "ABS-002",
  },
  {
    id: 3,
    name: "Studio T-Shirt",
    description: "Official studio merchandise",
    category: "merchandise",
    price: 30,
    stock: 18,
    isActive: true,
    sku: "TSH-003",
  },
  {
    id: 4,
    name: "Titanium Piercing Jewelry",
    description: "High-quality titanium jewelry",
    category: "jewelry",
    price: 45,
    stock: 12,
    isActive: true,
    sku: "TPJ-004",
  },
]

export default function ServicesClient({ services: initialServices }: ServicesClientProps) {
  const [services, setServices] = useState<Service[]>(initialServices)
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [activeTab, setActiveTab] = useState("services")

  // Service states
  const [isAddServiceDialogOpen, setIsAddServiceDialogOpen] = useState(false)
  const [isEditServiceDialogOpen, setIsEditServiceDialogOpen] = useState(false)
  const [isDeleteServiceDialogOpen, setIsDeleteServiceDialogOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [serviceFormData, setServiceFormData] = useState<Partial<Service>>({})

  // Product states
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false)
  const [isEditProductDialogOpen, setIsEditProductDialogOpen] = useState(false)
  const [isDeleteProductDialogOpen, setIsDeleteProductDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [productFormData, setProductFormData] = useState<Partial<Product>>({})

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "tattoo":
        return "bg-purple-100 text-purple-800"
      case "piercing":
        return "bg-blue-100 text-blue-800"
      case "consultation":
        return "bg-green-100 text-green-800"
      case "touch-up":
        return "bg-orange-100 text-orange-800"
      case "aftercare":
        return "bg-pink-100 text-pink-800"
      case "jewelry":
        return "bg-yellow-100 text-yellow-800"
      case "merchandise":
        return "bg-indigo-100 text-indigo-800"
      case "supplies":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Service functions
  const resetServiceForm = () => {
    setServiceFormData({})
    setSelectedService(null)
  }

  const handleAddService = async () => {
    if (serviceFormData.name && serviceFormData.category && serviceFormData.price) {
      const { duration, ...rest } = serviceFormData
      const payload = {
        ...rest,
        duration_minutes: duration ? duration * 60 : 0,
      }
      const response = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (response.ok) {
        const newService = await response.json()
        setServices([...services, newService[0]])
        setIsAddServiceDialogOpen(false)
        resetServiceForm()
      }
    }
  }

  const handleEditService = async () => {
    if (selectedService && serviceFormData.name && serviceFormData.category && serviceFormData.price) {
      const { duration, ...rest } = serviceFormData
      const payload = {
        ...rest,
        duration_minutes: duration ? duration * 60 : 0,
      }
      const response = await fetch(`/api/services/${selectedService.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (response.ok) {
        const updatedService = await response.json()
        setServices(
          services.map((service) => (service.id === selectedService.id ? updatedService[0] : service)),
        )
        setIsEditServiceDialogOpen(false)
        resetServiceForm()
      }
    }
  }

  const handleDeleteService = async () => {
    if (selectedService) {
      const response = await fetch(`/api/services/${selectedService.id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        setServices(services.filter((service) => service.id !== selectedService.id))
        setIsDeleteServiceDialogOpen(false)
        resetServiceForm()
      }
    }
  }

  const openEditServiceDialog = (service: Service) => {
    setSelectedService(service)
    setServiceFormData(service)
    setIsEditServiceDialogOpen(true)
  }

  const openDeleteServiceDialog = (service: Service) => {
    setSelectedService(service)
    setIsDeleteServiceDialogOpen(true)
  }

  // Product functions
  const resetProductForm = () => {
    setProductFormData({})
    setSelectedProduct(null)
  }

  const handleAddProduct = () => {
    if (productFormData.name && productFormData.category && productFormData.price) {
      const newProduct: Product = {
        id: Math.max(...products.map((p) => p.id)) + 1,
        name: productFormData.name,
        description: productFormData.description || "",
        category: productFormData.category as Product["category"],
        price: productFormData.price,
        stock: productFormData.stock || 0,
        isActive: true,
        sku: productFormData.sku || `SKU-${Date.now()}`,
      }
      setProducts([...products, newProduct])
      setIsAddProductDialogOpen(false)
      resetProductForm()
    }
  }

  const handleEditProduct = () => {
    if (selectedProduct && productFormData.name && productFormData.category && productFormData.price) {
      const updatedProducts = products.map((product) =>
        product.id === selectedProduct.id ? { ...product, ...productFormData } : product,
      )
      setProducts(updatedProducts)
      setIsEditProductDialogOpen(false)
      resetProductForm()
    }
  }

  const handleDeleteProduct = () => {
    if (selectedProduct) {
      setProducts(products.filter((product) => product.id !== selectedProduct.id))
      setIsDeleteProductDialogOpen(false)
      resetProductForm()
    }
  }

  const openEditProductDialog = (product: Product) => {
    setSelectedProduct(product)
    setProductFormData(product)
    setIsEditProductDialogOpen(true)
  }

  const openDeleteProductDialog = (product: Product) => {
    setSelectedProduct(product)
    setIsDeleteProductDialogOpen(true)
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Services & Products</h1>
          <p className="text-muted-foreground">Manage your tattoo services, pricing, and products</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="grid gap-4 md:grid-cols-4 flex-1 mr-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Total Services</span>
                  </div>
                  <p className="text-2xl font-bold mt-2">{services.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <span className="text-sm font-medium">Active</span>
                  </div>
                  <p className="text-2xl font-bold mt-2">{services.filter((s) => s.isActive).length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Avg. Price</span>
                  </div>
                  <p className="text-2xl font-bold mt-2">
                    ${Math.round(services.reduce((sum, s) => sum + s.price, 0) / services.length)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium">Avg. Duration</span>
                  </div>
                  <p className="text-2xl font-bold mt-2">
                    {(services.reduce((sum, s) => sum + s.duration, 0) / services.length).toFixed(1)}h
                  </p>
                </CardContent>
              </Card>
            </div>
            <Dialog open={isAddServiceDialogOpen} onOpenChange={setIsAddServiceDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Service
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add New Service</DialogTitle>
                  <DialogDescription>Create a new service offering for your shop.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="service-name">Service Name *</Label>
                    <Input
                      id="service-name"
                      placeholder="Enter service name"
                      value={serviceFormData.name || ""}
                      onChange={(e) => setServiceFormData({ ...serviceFormData, name: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="service-description">Description</Label>
                    <Textarea
                      id="service-description"
                      placeholder="Describe the service..."
                      value={serviceFormData.description || ""}
                      onChange={(e) => setServiceFormData({ ...serviceFormData, description: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="service-category">Category *</Label>
                      <Select
                        value={serviceFormData.category || ""}
                        onValueChange={(value) =>
                          setServiceFormData({ ...serviceFormData, category: value as Service["category"] })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tattoo">Tattoo</SelectItem>
                          <SelectItem value="piercing">Piercing</SelectItem>
                          <SelectItem value="consultation">Consultation</SelectItem>
                          <SelectItem value="touch-up">Touch-up</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="service-price">Price ($) *</Label>
                      <Input
                        id="service-price"
                        type="number"
                        placeholder="100"
                        value={serviceFormData.price || ""}
                        onChange={(e) =>
                          setServiceFormData({ ...serviceFormData, price: Number.parseInt(e.target.value) })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="service-duration">Duration (hours)</Label>
                    <Input
                      id="service-duration"
                      type="number"
                      step="0.5"
                      placeholder="1"
                      value={serviceFormData.duration || ""}
                      onChange={(e) =>
                        setServiceFormData({ ...serviceFormData, duration: Number.parseFloat(e.target.value) })
                      }
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddServiceDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddService}>Add Service</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Card key={service.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      <CardDescription className="mt-1">{service.description}</CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditServiceDialog(service)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Service
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openDeleteServiceDialog(service)} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Service
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge className={getCategoryColor(service.category)}>{service.category}</Badge>
                    <Badge variant={service.isActive ? "default" : "secondary"}>
                      {service.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />${service.price}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {service.duration}h
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">{service.popularity}% popular</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="grid gap-4 md:grid-cols-4 flex-1 mr-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Total Products</span>
                  </div>
                  <p className="text-2xl font-bold mt-2">{products.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <span className="text-sm font-medium">In Stock</span>
                  </div>
                  <p className="text-2xl font-bold mt-2">{products.filter((p) => p.stock > 0).length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Total Value</span>
                  </div>
                  <p className="text-2xl font-bold mt-2">
                    ${products.reduce((sum, p) => sum + p.price * p.stock, 0).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium">Low Stock</span>
                  </div>
                  <p className="text-2xl font-bold mt-2">{products.filter((p) => p.stock < 10).length}</p>
                </CardContent>
              </Card>
            </div>
            <Dialog open={isAddProductDialogOpen} onOpenChange={setIsAddProductDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                  <DialogDescription>Add a new product to your inventory.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="product-name">Product Name *</Label>
                    <Input
                      id="product-name"
                      placeholder="Enter product name"
                      value={productFormData.name || ""}
                      onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="product-description">Description</Label>
                    <Textarea
                      id="product-description"
                      placeholder="Describe the product..."
                      value={productFormData.description || ""}
                      onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="product-category">Category *</Label>
                      <Select
                        value={productFormData.category || ""}
                        onValueChange={(value) =>
                          setProductFormData({ ...productFormData, category: value as Product["category"] })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="aftercare">Aftercare</SelectItem>
                          <SelectItem value="jewelry">Jewelry</SelectItem>
                          <SelectItem value="merchandise">Merchandise</SelectItem>
                          <SelectItem value="supplies">Supplies</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="product-sku">SKU</Label>
                      <Input
                        id="product-sku"
                        placeholder="SKU-001"
                        value={productFormData.sku || ""}
                        onChange={(e) => setProductFormData({ ...productFormData, sku: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="product-price">Price ($) *</Label>
                      <Input
                        id="product-price"
                        type="number"
                        placeholder="25"
                        value={productFormData.price || ""}
                        onChange={(e) =>
                          setProductFormData({ ...productFormData, price: Number.parseInt(e.target.value) })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="product-stock">Stock Quantity</Label>
                      <Input
                        id="product-stock"
                        type="number"
                        placeholder="50"
                        value={productFormData.stock || ""}
                        onChange={(e) =>
                          setProductFormData({ ...productFormData, stock: Number.parseInt(e.target.value) })
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddProductDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddProduct}>Add Product</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Card key={product.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <CardDescription className="mt-1">{product.description}</CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditProductDialog(product)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Product
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openDeleteProductDialog(product)} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Product
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge className={getCategoryColor(product.category)}>{product.category}</Badge>
                    <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                      {product.stock > 0 ? "In Stock" : "Out of Stock"}
                    </Badge>
                    {product.stock < 10 && product.stock > 0 && (
                      <Badge variant="outline" className="text-orange-600">
                        Low Stock
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />${product.price}
                      </div>
                      <div className="flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        {product.stock} in stock
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">SKU: {product.sku}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Service Edit Dialog */}
      <Dialog open={isEditServiceDialogOpen} onOpenChange={setIsEditServiceDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription>Update service information and pricing.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-service-name">Service Name *</Label>
              <Input
                id="edit-service-name"
                placeholder="Enter service name"
                value={serviceFormData.name || ""}
                onChange={(e) => setServiceFormData({ ...serviceFormData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-service-description">Description</Label>
              <Textarea
                id="edit-service-description"
                placeholder="Describe the service..."
                value={serviceFormData.description || ""}
                onChange={(e) => setServiceFormData({ ...serviceFormData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-service-category">Category *</Label>
                <Select
                  value={serviceFormData.category || ""}
                  onValueChange={(value) =>
                    setServiceFormData({ ...serviceFormData, category: value as Service["category"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tattoo">Tattoo</SelectItem>
                    <SelectItem value="piercing">Piercing</SelectItem>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="touch-up">Touch-up</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-service-price">Price ($) *</Label>
                <Input
                  id="edit-service-price"
                  type="number"
                  placeholder="100"
                  value={serviceFormData.price || ""}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, price: Number.parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-service-duration">Duration (hours)</Label>
                <Input
                  id="edit-service-duration"
                  type="number"
                  step="0.5"
                  placeholder="1"
                  value={serviceFormData.duration || ""}
                  onChange={(e) =>
                    setServiceFormData({ ...serviceFormData, duration: Number.parseFloat(e.target.value) })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-service-status">Status</Label>
                <Select
                  value={serviceFormData.isActive ? "active" : "inactive"}
                  onValueChange={(value) => setServiceFormData({ ...serviceFormData, isActive: value === "active" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditServiceDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditService}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Product Edit Dialog */}
      <Dialog open={isEditProductDialogOpen} onOpenChange={setIsEditProductDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update product information and inventory.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-product-name">Product Name *</Label>
              <Input
                id="edit-product-name"
                placeholder="Enter product name"
                value={productFormData.name || ""}
                onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-product-description">Description</Label>
              <Textarea
                id="edit-product-description"
                placeholder="Describe the product..."
                value={productFormData.description || ""}
                onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-product-category">Category *</Label>
                <Select
                  value={productFormData.category || ""}
                  onValueChange={(value) =>
                    setProductFormData({ ...productFormData, category: value as Product["category"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aftercare">Aftercare</SelectItem>
                    <SelectItem value="jewelry">Jewelry</SelectItem>
                    <SelectItem value="merchandise">Merchandise</SelectItem>
                    <SelectItem value="supplies">Supplies</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-product-sku">SKU</Label>
                <Input
                  id="edit-product-sku"
                  placeholder="SKU-001"
                  value={productFormData.sku || ""}
                  onChange={(e) => setProductFormData({ ...productFormData, sku: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-product-price">Price ($) *</Label>
                <Input
                  id="edit-product-price"
                  type="number"
                  placeholder="25"
                  value={productFormData.price || ""}
                  onChange={(e) => setProductFormData({ ...productFormData, price: Number.parseInt(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-product-stock">Stock Quantity</Label>
                <Input
                  id="edit-product-stock"
                  type="number"
                  placeholder="50"
                  value={productFormData.stock || ""}
                  onChange={(e) => setProductFormData({ ...productFormData, stock: Number.parseInt(e.target.value) })}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditProductDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditProduct}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Service Delete Dialog */}
      <AlertDialog open={isDeleteServiceDialogOpen} onOpenChange={setIsDeleteServiceDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Service</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedService?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteService} className="bg-red-600 hover:bg-red-700">
              Delete Service
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Product Delete Dialog */}
      <AlertDialog open={isDeleteProductDialogOpen} onOpenChange={setIsDeleteProductDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedProduct?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct} className="bg-red-600 hover:bg-red-700">
              Delete Product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
