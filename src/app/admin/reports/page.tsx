"use client";

import { useState, useEffect } from "react";
import { Button } from "~/ui/primitives/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/ui/primitives/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/ui/primitives/table";
import { Badge } from "~/ui/primitives/badge";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Download, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface ReportData {
  period: string;
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  lowStockCount: number;
  topProducts: Array<{ name: string; sales: number; revenue: number }>;
  revenueByMonth: Array<{ month: string; revenue: number }>;
  revenueByCategory: Array<{ category: string; revenue: number }>;
  ordersByStatus: Array<{ status: string; count: number }>;
  lowStockProducts: Array<{ name: string; stock: number }>;
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("month");

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const fetchReports = async () => {
    try {
      const res = await fetch(`/api/admin/reports?period=${dateRange}`);
      if (res.ok) {
        const reportData = (await res.json()) as { data: ReportData };
        setData(reportData.data);
      }
    } catch (error) {
      console.error("Erro ao carregar relatórios:", error);
      toast.error("Erro ao carregar relatórios");
    } finally {
      setLoading(false);
    }
  };

  // Gera e descarrega um CSV com o resumo do relatório.
  const handleExportCSV = () => {
    if (!data) return;
    const lines: string[] = [];
    const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;

    lines.push("Resumo");
    lines.push(`${esc("Receita Total (€)")},${esc(data.totalRevenue.toFixed(2))}`);
    lines.push(`${esc("Encomendas")},${esc(data.totalOrders)}`);
    lines.push(`${esc("Utilizadores")},${esc(data.totalUsers)}`);
    lines.push(`${esc("Materiais com stock baixo")},${esc(data.lowStockCount)}`);
    lines.push("");

    lines.push("Produtos Mais Vendidos");
    lines.push([esc("Produto"), esc("Vendas"), esc("Receita (€)")].join(","));
    data.topProducts.forEach((p) =>
      lines.push([esc(p.name), esc(p.sales), esc(p.revenue.toFixed(2))].join(",")),
    );
    lines.push("");

    lines.push("Receita por Mês");
    lines.push([esc("Mês"), esc("Receita (€)")].join(","));
    data.revenueByMonth.forEach((m) =>
      lines.push([esc(m.month), esc(m.revenue.toFixed(2))].join(",")),
    );
    lines.push("");

    lines.push("Receita por Categoria");
    lines.push([esc("Categoria"), esc("Receita (€)")].join(","));
    data.revenueByCategory.forEach((c) =>
      lines.push([esc(c.category), esc(c.revenue.toFixed(2))].join(",")),
    );
    lines.push("");

    lines.push("Materiais com Stock Baixo");
    lines.push([esc("Material"), esc("Stock")].join(","));
    data.lowStockProducts.forEach((p) =>
      lines.push([esc(p.name), esc(p.stock)].join(",")),
    );

    // BOM para o Excel abrir com acentos corretos.
    const blob = new Blob(["﻿" + lines.join("\r\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-${dateRange}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Relatório exportado (CSV)");
  };

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Relatórios</h1>
          <p className="mt-1 text-sm text-gray-600">A carregar...</p>
        </div>
      </div>
    );
  }

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Relatórios</h1>
          <p className="mt-1 text-sm text-gray-600">
            Análise e estatísticas da plataforma
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="week">Esta Semana</option>
            <option value="month">Este Mês</option>
            <option value="quarter">Este Trimestre</option>
            <option value="year">Este Ano</option>
          </select>
          <Button onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Métricas principais */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Receita Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{data.totalRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              No período selecionado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Encomendas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalOrders}</div>
            <p className="text-xs text-gray-500 mt-1">No período selecionado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Stock Baixo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                data.lowStockCount > 0 ? "text-amber-600" : ""
              }`}
            >
              {data.lowStockCount}
            </div>
            <p className="text-xs text-gray-500 mt-1">Materiais a repor</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Utilizadores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalUsers}</div>
            <p className="text-xs text-gray-500 mt-1">Clientes ativos</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Receita por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `€${Number(value).toFixed(2)}`} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  name="Receita (€)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Encomendas por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.ordersByStatus}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {data.ordersByStatus.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Receita por categoria + Stock baixo */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Receita por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            {data.revenueByCategory.length === 0 ? (
              <p className="py-12 text-center text-sm text-gray-500">
                Sem vendas no período
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.revenueByCategory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip formatter={(value) => `€${Number(value).toFixed(2)}`} />
                  <Bar dataKey="revenue" fill="#10b981" name="Receita (€)" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Materiais com Stock Baixo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-[300px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.lowStockProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center py-4">
                        Todos os materiais têm stock suficiente
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.lowStockProducts.map((p, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant="outline"
                            className={
                              p.stock <= 0
                                ? "text-red-600 border-red-300"
                                : "text-amber-600 border-amber-300"
                            }
                          >
                            {p.stock}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Produtos mais vendidos */}
      <Card>
        <CardHeader>
          <CardTitle>Produtos Mais Vendidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead className="text-right">Vendas</TableHead>
                  <TableHead className="text-right">Receita (€)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.topProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4">
                      Nenhum produto vendido neste período
                    </TableCell>
                  </TableRow>
                ) : (
                  data.topProducts.map((product, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline">{product.sales}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        €{product.revenue.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
