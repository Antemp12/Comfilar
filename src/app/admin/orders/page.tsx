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
import { Search, Eye, Trash2, AlertTriangle, PackageX, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { TablePagination } from "~/ui/components/table-pagination";

interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: "processamento" | "preparacao" | "enviado" | "entregue";
  total: number;
  items: number;
  hasOutOfStock?: boolean;
  hasLowStock?: boolean;
  outOfStockItems?: string[];
  lowStockItems?: string[];
  createdAt: string;
}

interface OrderItemView {
  id: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  material: {
    id: number;
    name: string;
    image: string | null;
    category: { id: number; name: string };
  };
  variant: { id: number; name: string; value: string; label: string | null } | null;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<"processamento" | "preparacao" | "enviado" | "entregue">("processamento");
  const [orderItems, setOrderItems] = useState<OrderItemView[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders");
      if (res.ok) {
        const data = (await res.json()) as { data?: Order[] };
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

  // Abre o detalhe da encomenda e carrega os itens.
  const openDetail = async (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setOrderItems([]);
    setShowDetailDialog(true);
    setLoadingItems(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`);
      const data = (await res.json()) as { data?: { items?: OrderItemView[] } };
      if (res.ok) {
        setOrderItems(data.data?.items ?? []);
      } else {
        toast.error("Erro ao carregar itens da encomenda");
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao carregar itens da encomenda");
    } finally {
      setLoadingItems(false);
    }
  };

  const handleSaveStatus = async () => {
    if (!selectedOrder || newStatus === selectedOrder.status) return;

    setSavingStatus(true);
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
        setSelectedOrder((o) => (o ? { ...o, status: newStatus } : o));
        toast.success("Estado atualizado com sucesso");
      } else {
        toast.error("Erro ao atualizar estado");
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao atualizar estado");
    } finally {
      setSavingStatus(false);
    }
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const paginatedOrders = filteredOrders.slice((page - 1) * pageSize, page * pageSize);

  // Avisos (calculados sobre todas as encomendas, não só a página atual).
  const pendingCount = orders.filter((o) => o.status === "processamento").length;
  const outOfStockCount = orders.filter((o) => o.hasOutOfStock).length;
  const lowStockCount = orders.filter((o) => o.hasLowStock && !o.hasOutOfStock).length;

  useEffect(() => {
    setPage(1);
  }, [searchTerm, pageSize]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

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

      {/* Avisos: encomendas por tratar e problemas de stock */}
      {(pendingCount > 0 || outOfStockCount > 0 || lowStockCount > 0) && (
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {pendingCount > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm text-amber-800 dark:border-amber-800/50 dark:bg-amber-900/20 dark:text-amber-300">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>
                <strong>{pendingCount}</strong> encomenda(s) por tratar (em processamento)
              </span>
            </div>
          )}
          {outOfStockCount > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-2.5 text-sm text-red-800 dark:border-red-800/50 dark:bg-red-900/20 dark:text-red-300">
              <PackageX className="h-4 w-4 shrink-0" />
              <span>
                <strong>{outOfStockCount}</strong> encomenda(s) com itens <strong>sem stock</strong>
              </span>
            </div>
          )}
          {lowStockCount > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-orange-300 bg-orange-50 px-4 py-2.5 text-sm text-orange-800 dark:border-orange-800/50 dark:bg-orange-900/20 dark:text-orange-300">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>
                <strong>{lowStockCount}</strong> encomenda(s) com itens de <strong>stock baixo</strong>
              </span>
            </div>
          )}
        </div>
      )}

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
                  paginatedOrders.map((order) => (
                    <TableRow
                      key={order.id}
                      className={
                        order.hasOutOfStock
                          ? "border-l-2 border-l-red-400"
                          : order.status === "processamento"
                            ? "border-l-2 border-l-amber-400"
                            : ""
                      }
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-1.5">
                          {order.orderNumber}
                          {order.hasOutOfStock ? (
                            <span title={`Sem stock: ${(order.outOfStockItems ?? []).join(", ")}`}>
                              <PackageX className="h-4 w-4 text-red-500" />
                            </span>
                          ) : order.hasLowStock ? (
                            <span title={`Stock baixo: ${(order.lowStockItems ?? []).join(", ")}`}>
                              <AlertTriangle className="h-4 w-4 text-orange-500" />
                            </span>
                          ) : null}
                        </div>
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
                        <div className="flex items-center gap-2">
                          <Badge
                            className={statusColors[order.status]}
                            variant="outline"
                          >
                            {getStatusLabel(order.status)}
                          </Badge>
                          {order.status === "processamento" && (
                            <span className="text-xs font-medium text-amber-600">
                              Por tratar
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(order.createdAt).toLocaleDateString("pt-PT")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openDetail(order)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
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
          {filteredOrders.length > 0 && (
            <div className="mt-4">
              <TablePagination
                page={page}
                totalPages={totalPages}
                pageSize={pageSize}
                total={filteredOrders.length}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                itemLabel="encomenda(s)"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de detalhe da encomenda (itens + estado) */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Encomenda {selectedOrder?.orderNumber}</DialogTitle>
            <DialogDescription>
              {selectedOrder?.customerName}
              {selectedOrder?.customerEmail ? ` · ${selectedOrder.customerEmail}` : ""}
              {selectedOrder
                ? ` · ${new Date(selectedOrder.createdAt).toLocaleDateString("pt-PT")}`
                : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            {/* Itens */}
            <div>
              <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                Itens
              </h3>
              {loadingItems ? (
                <div className="flex items-center justify-center py-8 text-gray-500">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              ) : orderItems.length === 0 ? (
                <p className="py-6 text-center text-sm text-gray-500">
                  Esta encomenda não tem itens.
                </p>
              ) : (
                <div className="divide-y divide-gray-200 rounded-lg border border-gray-200 dark:divide-gray-800 dark:border-gray-800">
                  {orderItems.map((item) => {
                    const name = item.material.name;
                    const noStock = selectedOrder?.outOfStockItems?.includes(name);
                    const lowStock = !noStock && selectedOrder?.lowStockItems?.includes(name);
                    return (
                      <div key={item.id} className="flex items-center gap-3 p-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                            {name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.material.category?.name}
                            {item.variant ? ` · ${item.variant.name}: ${item.variant.value}` : ""}
                          </p>
                          {noStock && (
                            <span className="mt-1 inline-flex items-center gap-1 rounded bg-red-100 px-1.5 py-0.5 text-[11px] font-medium text-red-700 dark:bg-red-900/30 dark:text-red-300">
                              <PackageX className="h-3 w-3" /> Sem stock
                            </span>
                          )}
                          {lowStock && (
                            <span className="mt-1 inline-flex items-center gap-1 rounded bg-orange-100 px-1.5 py-0.5 text-[11px] font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                              <AlertTriangle className="h-3 w-3" /> Stock baixo
                            </span>
                          )}
                        </div>
                        <div className="text-right text-sm">
                          <p className="text-gray-900 dark:text-white">
                            {item.quantity} × €{item.unitPrice.toFixed(2)}
                          </p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            €{item.subtotal.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {selectedOrder && (
                <div className="mt-2 flex justify-end text-sm font-semibold text-gray-900 dark:text-white">
                  Total: €{selectedOrder.total.toFixed(2)}
                </div>
              )}
            </div>

            {/* Estado */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white">
                Estado
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <select
                  value={newStatus}
                  onChange={(e) =>
                    setNewStatus(
                      e.target.value as "processamento" | "preparacao" | "enviado" | "entregue"
                    )
                  }
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="processamento">Em Processamento</option>
                  <option value="preparacao">Em Preparação</option>
                  <option value="enviado">Enviada</option>
                  <option value="entregue">Entregue</option>
                </select>
                <Button
                  onClick={handleSaveStatus}
                  disabled={savingStatus || newStatus === selectedOrder?.status}
                >
                  {savingStatus && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Guardar estado
                </Button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                O cliente é notificado automaticamente quando o estado muda.
              </p>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
