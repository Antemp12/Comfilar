"use client";

import { useState, useEffect } from "react";
import { Button } from "~/ui/primitives/button";
import { Input } from "~/ui/primitives/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/ui/primitives/table";
import { Card, CardContent, CardHeader } from "~/ui/primitives/card";
import { Badge } from "~/ui/primitives/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/ui/primitives/dialog";
import { Search, Eye, Trash2, Check, X } from "lucide-react";
import { toast } from "sonner";

interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: "processamento" | "preparacao" | "enviado" | "entregue";
  total: number;
  items: number;
  createdAt: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<"processamento" | "preparacao" | "enviado" | "entregue">("processamento");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.data || []);
      }
    } catch (error) {
      console.error("Erro ao carregar encomendas:", error);
      toast.error("Erro ao carregar encomendas");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    if (!confirm("Tem a certeza que deseja eliminar esta encomenda?")) return;

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setOrders(orders.filter((o) => o.id !== orderId));
        toast.success("Encomenda eliminada com sucesso");
      } else {
        toast.error("Erro ao eliminar encomenda");
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao eliminar encomenda");
    }
  };

  const handleChangeStatus = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setShowStatusDialog(true);
  };

  const handleSaveStatus = async () => {
    if (!selectedOrder) return;

    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setOrders(
          orders.map((o) =>
            o.id === selectedOrder.id ? { ...o, status: newStatus } : o
          )
        );
        setShowStatusDialog(false);
        setSelectedOrder(null);
        toast.success("Status atualizado com sucesso");
      } else {
        toast.error("Erro ao atualizar status");
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao atualizar status");
    }
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Encomendas</h1>
          <p className="mt-1 text-sm text-gray-600">A carregar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Encomendas</h1>
          <p className="mt-1 text-sm text-gray-600">
            {filteredOrders.length} encomenda(s) encontrada(s)
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Pesquisar por número, cliente ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Itens</TableHead>
                  <TableHead>Total (€)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <p className="text-gray-500">Nenhuma encomenda encontrada</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell className="text-sm">
                        {order.customerName}
                      </TableCell>
                      <TableCell className="text-sm">
                        {order.customerEmail}
                      </TableCell>
                      <TableCell>{order.items}</TableCell>
                      <TableCell className="font-semibold">
                        €{order.total.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={statusColors[order.status]}
                          variant="outline"
                        >
                          {getStatusLabel(order.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(order.createdAt).toLocaleDateString("pt-PT")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleChangeStatus(order)}
                          >
                            {order.status === "processing" ? (
                              <>
                                <Check className="h-4 w-4 mr-1" />
                                Aceitar
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4 mr-1" />
                                Ver
                              </>
                            )}
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            className="h-8 w-8"
                            onClick={() => handleDeleteOrder(order.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Mudança de Status */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atualizar Status da Encomenda</DialogTitle>
            <DialogDescription>
              Encomenda: {selectedOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Novo Status</label>
              <select
                value={newStatus}
                onChange={(e) =>
                  setNewStatus(
                    e.target.value as "processamento" | "preparacao" | "enviado" | "entregue"
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="processamento">Em Processamento</option>
                <option value="preparacao">Em Preparação</option>
                <option value="enviado">Enviada</option>
                <option value="entregue">Entregue</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowStatusDialog(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleSaveStatus}>
                Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
