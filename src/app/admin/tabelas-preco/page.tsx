"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { Button } from "~/ui/primitives/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/ui/primitives/card";
import { Input } from "~/ui/primitives/input";
import { Textarea } from "~/ui/primitives/textarea";
import { useAuth } from "~/lib/auth-context";

interface Catalog {
  id: string;
  title: string;
  imageUrl: string;
  description?: string;
  type?: string;
  pages?: string[] | null;
  pdfUrl?: string | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Gestão das Tabelas de Preço (catálogos em PDF que aparecem nas Promoções, a folhear).
 * Usa a mesma tabela `catalogs`, mas só o tipo "pricelist".
 */
export default function PriceTablesPage() {
  const { user } = useAuth();
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Catalog | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formPdfUrl, setFormPdfUrl] = useState("");
  const [formPages, setFormPages] = useState<string[]>([]);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  const priceLists = catalogs.filter((c) => c.type === "pricelist");

  const openNew = () => {
    setEditing(null);
    setFormPdfUrl("");
    setFormPages([]);
    setShowForm((s) => !s);
  };

  const openEdit = (catalog: Catalog) => {
    setEditing(catalog);
    setFormPdfUrl(catalog.pdfUrl ?? "");
    setFormPages(Array.isArray(catalog.pages) ? catalog.pages : []);
    setShowForm(true);
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadingPdf(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data?.error || "Erro ao carregar PDF");
      setFormPdfUrl(data.url);
      toast.success("PDF carregado");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao carregar PDF");
    } finally {
      setUploadingPdf(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch("/api/catalogs", { credentials: "include" });
        const data = (await response.json()) as { success?: boolean; data?: Catalog[] };
        if (data.success && Array.isArray(data.data)) setCatalogs(data.data);
      } catch (error) {
        console.error("Erro ao buscar tabelas de preço:", error);
        toast.error("Erro ao carregar tabelas de preço");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (user?.type !== "admin") {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">Apenas administradores podem aceder a esta página.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tens a certeza que queres apagar esta tabela de preço?")) return;
    try {
      const response = await fetch(`/api/catalogs/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = (await response.json()) as { success?: boolean; message?: string };
      if (data.success) {
        setCatalogs((prev) => prev.filter((c) => c.id !== id));
        toast.success("Tabela de preço apagada");
      } else {
        toast.error(data.message || "Erro ao apagar");
      }
    } catch (error) {
      console.error("Erro ao apagar:", error);
      toast.error("Erro ao apagar");
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const imageUrl = formData.get("imageUrl") as string;
    const description = formData.get("description") as string;
    const order = parseInt(formData.get("order") as string) || 0;

    if (!title || !imageUrl) {
      toast.error("Título e imagem de capa são obrigatórios");
      return;
    }
    if (!formPdfUrl.trim() && formPages.filter((p) => p.trim()).length === 0) {
      toast.error("Carrega um PDF (ou adiciona páginas em imagem)");
      return;
    }

    try {
      const method = editing ? "PUT" : "POST";
      const url = editing ? `/api/catalogs/${editing.id}` : "/api/catalogs";
      const response = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          imageUrl,
          description,
          order,
          type: "pricelist",
          pdfUrl: formPdfUrl.trim(),
          pages: formPages.map((p) => p.trim()).filter(Boolean),
        }),
      });
      const data = (await response.json()) as { success?: boolean; data?: Catalog; message?: string };
      if (data.success) {
        toast.success(editing ? "Tabela atualizada" : "Tabela criada");
        if (editing && data.data) {
          setCatalogs((prev) => prev.map((c) => (c.id === editing.id ? data.data! : c)));
        } else if (data.data) {
          setCatalogs((prev) => [data.data!, ...prev]);
        }
        setShowForm(false);
        setEditing(null);
      } else {
        toast.error(data.message || "Erro ao guardar");
      }
    } catch (error) {
      console.error("Erro ao guardar:", error);
      toast.error("Erro ao guardar");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
            <p className="text-slate-600">A carregar…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Tabelas de Preço</h1>
            <p className="mt-1 text-slate-600">
              Catálogos em PDF que aparecem nas Promoções para o cliente folhear.
            </p>
          </div>
          <Button onClick={openNew} className="bg-blue-600 hover:bg-blue-700">
            {showForm ? "Cancelar" : "+ Nova Tabela de Preço"}
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>{editing ? "Editar Tabela de Preço" : "Nova Tabela de Preço"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Título</label>
                  <Input
                    name="title"
                    defaultValue={editing?.title}
                    placeholder="Ex: LG Ar Condicionado 2026"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Imagem de capa (URL)
                  </label>
                  <Input
                    name="imageUrl"
                    defaultValue={editing?.imageUrl}
                    placeholder="https://... (aparece no cartão das Promoções)"
                    required
                  />
                </div>

                <div className="space-y-2 rounded-lg border border-blue-200 bg-blue-50/50 p-3">
                  <label className="block text-sm font-medium text-slate-700">
                    PDF do catálogo
                  </label>
                  <p className="text-xs text-slate-500">
                    Carrega o PDF (máx. 30 MB) — é mostrado a folhear, página a página.
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handlePdfUpload}
                      disabled={uploadingPdf}
                      className="text-sm"
                    />
                    {uploadingPdf && <span className="text-xs text-slate-500">A carregar…</span>}
                  </div>
                  <Input
                    value={formPdfUrl}
                    onChange={(e) => setFormPdfUrl(e.target.value)}
                    placeholder="ou cola o URL do PDF (https://... .pdf)"
                  />
                  {formPdfUrl && (
                    <p className="truncate text-xs text-green-700">✓ PDF: {formPdfUrl}</p>
                  )}
                </div>

                {!formPdfUrl && (
                  <div className="rounded-lg border border-slate-200 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <label className="block text-sm font-medium text-slate-700">
                        Em alternativa: páginas em imagem (URLs, pela ordem)
                      </label>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setFormPages((p) => [...p, ""])}
                      >
                        + Página
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {formPages.map((url, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="w-6 text-xs text-slate-400">{idx + 1}</span>
                          <Input
                            value={url}
                            onChange={(e) =>
                              setFormPages((p) => p.map((u, i) => (i === idx ? e.target.value : u)))
                            }
                            placeholder="https://... (imagem da página)"
                          />
                          <button
                            type="button"
                            onClick={() => setFormPages((p) => p.filter((_, i) => i !== idx))}
                            className="rounded-md border border-slate-300 px-2 py-2 text-red-500 hover:bg-red-50"
                            aria-label="Remover página"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Descrição (opcional)
                  </label>
                  <Textarea
                    name="description"
                    defaultValue={editing?.description}
                    placeholder="Breve descrição"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Ordem (menor = primeiro)
                  </label>
                  <Input name="order" type="number" defaultValue={editing?.order ?? 0} />
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                  {editing ? "Atualizar" : "Criar"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {priceLists.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-slate-500">Ainda não há tabelas de preço.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {priceLists.map((catalog) => (
              <Card key={catalog.id} className="overflow-hidden">
                <div className="relative h-48 w-full bg-slate-100">
                  <Image src={catalog.imageUrl} alt={catalog.title} fill className="object-cover" />
                </div>
                <CardContent className="pt-4">
                  <h3 className="mb-1 font-semibold text-slate-900">{catalog.title}</h3>
                  <p className="mb-3 text-xs text-slate-500">
                    {catalog.pdfUrl
                      ? "PDF"
                      : `${Array.isArray(catalog.pages) ? catalog.pages.length : 0} página(s)`}{" "}
                    · Ordem: {catalog.order}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEdit(catalog)}
                      className="flex-1"
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(catalog.id)}
                      className="flex-1"
                    >
                      Apagar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
