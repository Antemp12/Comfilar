"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/ui/primitives/table";
import { Card, CardContent, CardHeader, CardTitle } from "~/ui/primitives/card";
import { Badge } from "~/ui/primitives/badge";
import { Button } from "~/ui/primitives/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/ui/primitives/dialog";
import { Eye, Package } from "lucide-react";
import { toast } from "sonner";

interface OrderItem {
  id: number;
  orderId: number;
  materialId: number;
  quantity: number;
  unitPrice: number;
  material: {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
  };
}

interface Order {
  id: number;
  orderNumber: string;
  status: "processamento" | "preparacao" | "enviado" | "entregue";
  total: number;
  items: number;
  itemsDetails?: OrderItem[];
  createdAt: string;
  estimatedDelivery?: string;
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const fetchMyOrders = async () => {
    try {
      const res = await fetch("/api/customer/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.data || []);
      } else if (res.status === 401) {
        toast.error("Por favor, faça login para ver suas encomendas");
      }
    } catch (error) {
      console.error("Erro ao carregar encomendas:", error);
      toast.error("Erro ao carregar encomendas");
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    processamento: "bg-blue-100 text-blue-800",
    preparacao: "bg-yellow-100 text-yellow-800",
    enviado: "bg-purple-100 text-purple-800",
    entregue: "bg-green-100 text-green-800",
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      processamento: "Em Processamento",
      preparacao: "Em Preparação",
      enviado: "Enviada",
      entregue: "Entregue",
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      processamento: "📋",
      preparacao: "📦",
      enviado: "🚚",
      entregue: "✅",
    };
    return icons[status as keyof typeof icons] || "📦";
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Minhas Encomendas</h1>
          <p className="mt-1 text-sm text-gray-600">A carregar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Minhas Encomendas</h1>
          <p className="mt-1 text-sm text-gray-600">
            Você tem {orders.length} encomenda(s)
          </p>
        </div>
        <Link href="/products">
          <Button>Continuar Compras</Button>
        </Link>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhuma encomenda ainda
              </h3>
              <p className="text-gray-600 mb-4">
                Você ainda não fez nenhuma compra. Explore nossos produtos!
              </p>
              <Link href="/products">
                <Button>Ver Produtos</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Vista em cards para mobile/tablet */}
          <div className="grid gap-4 md:hidden">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">
                        {order.orderNumber}
                      </CardTitle>
                      <p className="text-xs text-gray-600 mt-1">
                        {new Date(order.createdAt).toLocaleDateString("pt-PT")}
                      </p>
                    </div>
                    <Badge className={statusColors[order.status]}>
                      {getStatusIcon(order.status)}{" "}
                      {getStatusLabel(order.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Itens:</span>
                    <span className="font-medium">{order.items}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-bold text-lg">
                      €{Number(order.total).toFixed(2)}
                    </span>
                  </div>
                  {order.estimatedDelivery && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Entrega:</span>
                      <span>
                        {new Date(order.estimatedDelivery).toLocaleDateString(
                          "pt-PT"
                        )}
                      </span>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    className="w-full mt-3"
                    size="sm"
                    onClick={() => handleViewDetails(order)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalhes
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Vista em tabela para desktop */}
          <Card className="hidden md:block">
            <CardHeader>
              <CardTitle>Histórico de Encomendas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Itens</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Entrega Estimada</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          {order.orderNumber}
                        </TableCell>
                        <TableCell>{order.items}</TableCell>
                        <TableCell className="font-bold">
                          €{Number(order.total).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[order.status]}>
                            {getStatusIcon(order.status)}{" "}
                            {getStatusLabel(order.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(order.createdAt).toLocaleDateString(
                            "pt-PT"
                          )}
                        </TableCell>
                        <TableCell>
                          {order.estimatedDelivery
                            ? new Date(order.estimatedDelivery).toLocaleDateString(
                                "pt-PT"
                              )
                            : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                            onClick={() => handleViewDetails(order)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de Detalhes */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedOrder?.orderNumber}</DialogTitle>
            <DialogDescription>
              Status: <Badge className={statusColors[selectedOrder?.status || "processamento"]}>{getStatusLabel(selectedOrder?.status || "processamento")}</Badge>
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Resumo */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-xl font-bold text-blue-600">€{Number(selectedOrder.total).toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Itens</p>
                  <p className="text-xl font-bold">{selectedOrder.items}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Data</p>
                  <p className="text-sm font-medium">{new Date(selectedOrder.createdAt).toLocaleDateString("pt-PT")}</p>
                </div>
              </div>

              {/* Itens da Encomenda */}
              <div className="space-y-3">
                <h3 className="font-semibold">Itens da Encomenda</h3>
                {selectedOrder.itemsDetails && selectedOrder.itemsDetails.length > 0 ? (
                  <div className="space-y-3">
                    {selectedOrder.itemsDetails.map((item) => (
                      <div key={item.id} className="flex gap-4 border-b pb-3 last:border-0">
                        {/* Imagem */}
                        <div className="relative w-16 h-16 bg-gray-100 rounded-md flex-shrink-0 overflow-hidden">
                          {item.material.image ? (
                            <Image
                              src={item.material.image}
                              alt={item.material.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              📦
                            </div>
                          )}
                        </div>

                        {/* Detalhes */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">{item.material.name}</h4>
                          <p className="text-sm text-gray-600 truncate">{item.material.category}</p>
                          {item.material.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.material.description}</p>
                          )}
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-sm font-medium">Qt: {item.quantity}</span>
                            <span className="text-sm">€{Number(item.unitPrice).toFixed(2)}</span>
                            <span className="text-sm font-bold">= €{(item.quantity * Number(item.unitPrice)).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Nenhum item encontrado</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
