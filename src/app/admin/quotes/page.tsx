"use client";

import { useState, useEffect, useMemo } from "react";
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
import { Search, Eye, CheckCircle, XCircle, Send } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/ui/primitives/dialog";

interface Quote {
  id: number;
  userId: number;
  quoteNumber: string;
  customerName: string;
  customerEmail: string;
  status: "pendente" | "analise" | "aprovado" | "rejeitado" | "convertido";
  total: number;
  items: number;
  createdAt: string;
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      const res = await fetch("/api/admin/quotes");
      if (res.ok) {
        const data = (await res.json()) as any;
        setQuotes(data.data || []);
      }
    } catch (error) {
      console.error("Erro ao carregar orçamentos:", error);
      toast.error("Erro ao carregar orçamentos");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveQuote = async (quoteId: number) => {
    try {
      const res = await fetch(`/api/admin/quotes/${quoteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "aprovado" }),
      });

      if (res.ok) {
        setQuotes(
          quotes.map((q) =>
            q.id === quoteId ? { ...q, status: "aprovado" } : q
          )
        );
        toast.success("Orçamento aprovado");
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao aprovar orçamento");
    }
  };

  const handleRejectQuote = async (quoteId: number) => {
    try {
      const res = await fetch(`/api/admin/quotes/${quoteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejeitado" }),
      });

      if (res.ok) {
        setQuotes(
          quotes.map((q) =>
            q.id === quoteId ? { ...q, status: "rejeitado" } : q
          )
        );
        toast.success("Orçamento rejeitado");
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao rejeitar orçamento");
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedQuote) {
      toast.error("Escreva uma mensagem");
      return;
    }

    setIsSending(true);
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedQuote.userId,
          type: "mensagem",
          title: `Mensagem sobre orçamento ${selectedQuote.quoteNumber}`,
          message: message,
          relatedId: selectedQuote.id,
        }),
      });

      if (res.ok) {
        toast.success("Mensagem enviada com sucesso");
        setShowMessageDialog(false);
        setMessage("");
        setSelectedQuote(null);
      } else {
        toast.error("Erro ao enviar mensagem");
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao enviar mensagem");
    } finally {
      setIsSending(false);
    }
  };

  const filteredQuotes = useMemo(() => {
    return quotes.filter(
      (quote) =>
        quote.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [quotes, searchTerm]);

  const statusColors = {
    pendente: "bg-yellow-100 text-yellow-800",
    analise: "bg-blue-100 text-blue-800",
    aprovado: "bg-green-100 text-green-800",
    rejeitado: "bg-red-100 text-red-800",
    convertido: "bg-purple-100 text-purple-800",
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pendente: "Pendente",
      analise: "Em análise",
      aprovado: "Aprovado",
      rejeitado: "Rejeitado",
      convertido: "Convertido",
    };
    return labels[status as keyof typeof labels] || status;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Orçamentos</h1>
          <p className="mt-1 text-sm text-gray-600">A carregar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Orçamentos</h1>
          <p className="mt-1 text-sm text-gray-600">
            {filteredQuotes.length} orçamento(s) encontrado(s)
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchTerm(e.target.value)
              }
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
                {filteredQuotes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <p className="text-gray-500">Nenhum orçamento encontrado</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredQuotes.map((quote) => (
                    <TableRow key={quote.id}>
                      <TableCell className="font-medium">
                        {quote.quoteNumber}
                      </TableCell>
                      <TableCell>{quote.customerName}</TableCell>
                      <TableCell className="text-sm">{quote.customerEmail}</TableCell>
                      <TableCell>{quote.items}</TableCell>
                      <TableCell className="font-semibold">
                        €{quote.total.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={statusColors[quote.status]}
                          variant="outline"
                        >
                          {getStatusLabel(quote.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(quote.createdAt).toLocaleDateString("pt-PT")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                            title="Ver detalhes"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                            onClick={() => {
                              setSelectedQuote(quote);
                              setShowMessageDialog(true);
                            }}
                            title="Enviar mensagem"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                          {(quote.status === "pendente" ||
                            quote.status === "analise") && (
                            <>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8 text-green-600"
                                onClick={() => handleApproveQuote(quote.id)}
                                title="Aprovar"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8 text-red-600"
                                onClick={() => handleRejectQuote(quote.id)}
                                title="Rejeitar"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
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

      {/* Dialog para enviar mensagem */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Mensagem ao Cliente</DialogTitle>
            <DialogDescription>
              {selectedQuote &&
                `Orçamento ${selectedQuote.quoteNumber} - ${selectedQuote.customerName}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Mensagem
              </label>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                placeholder="Escreva a sua mensagem aqui..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowMessageDialog(false);
                  setMessage("");
                  setSelectedQuote(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSendMessage}
                disabled={isSending || !message.trim()}
              >
                {isSending ? "A enviar..." : "Enviar Mensagem"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
