"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { Button } from "~/ui/primitives/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/ui/primitives/card";
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

export default function CatalogsPage() {
  const { user } = useAuth();
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Catalog | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<"carousel" | "pricelist">("carousel");
  const [formPages, setFormPages] = useState<string[]>([]);
  const [formPdfUrl, setFormPdfUrl] = useState("");
  const [uploadingPdf, setUploadingPdf] = useState(false);

  const openNew = () => {
    setEditing(null);
    setFormType("carousel");
    setFormPages([]);
    setFormPdfUrl("");
    setShowForm((s) => !s);
  };

  const openEdit = (catalog: Catalog) => {
    setEditing(catalog);
    setFormType(catalog.type === "pricelist" ? "pricelist" : "carousel");
    setFormPages(Array.isArray(catalog.pages) ? catalog.pages : []);
    setFormPdfUrl(catalog.pdfUrl ?? "");
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

  // Fetch catálogos
  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/catalogs", {
          credentials: "include",
        });
        const data = (await response.json()) as any;

        if (data.success && Array.isArray(data.data)) {
          setCatalogs(data.data);
        }
      } catch (error) {
        console.error("Erro ao buscar catálogos:", error);
        toast.error("Erro ao carregar catálogos");
      } finally {
        setLoading(false);
      }
    };

    fetchCatalogs();
  }, []);

  // Verificar se é admin
  if (user?.type !== "admin") {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">Apenas administradores podem acessar esta página.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tens certeza que queres apagar este catálogo?")) return;

    try {
      const response = await fetch(`/api/catalogs/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = (await response.json()) as any;

      if (data.success) {
        setCatalogs((prev) => prev.filter((c) => c.id !== id));
        toast.success("Catálogo apagado com sucesso");
      } else {
        toast.error(data.message || "Erro ao apagar catálogo");
      }
    } catch (error) {
      console.error("Erro ao apagar:", error);
      toast.error("Erro ao apagar catálogo");
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
      toast.error("Título e URL da imagem são obrigatórios");
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
          type: formType,
          pages: formType === "pricelist" ? formPages.map((p) => p.trim()).filter(Boolean) : [],
          pdfUrl: formType === "pricelist" ? formPdfUrl.trim() : "",
        }),
      });

      const data = (await response.json()) as any;

      if (data.success) {
        toast.success(editing ? "Catálogo atualizado" : "Catálogo criado");
        
        if (editing) {
          setCatalogs((prev) =>
            prev.map((c) => (c.id === editing.id ? data.data : c))
          );
        } else {
          setCatalogs((prev) => [data.data, ...prev]);
        }
        
        setShowForm(false);
        setEditing(null);
      } else {
        toast.error(data.message || "Erro ao salvar");
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar catálogo");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">A carregar catálogos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Catálogos (Carrossel)</h1>
            <p className="text-slate-600 mt-1">Gerenciar imagens do carrossel da página inicial</p>
          </div>
          <Button onClick={openNew} className="bg-blue-600 hover:bg-blue-700">
            {showForm ? "Cancelar" : "+ Novo Catálogo"}
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>{editing ? "Editar Catálogo" : "Novo Catálogo"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Título
                  </label>
                  <Input
                    name="title"
                    defaultValue={editing?.title}
                    placeholder="Ex: Promoção Especial"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    URL da Imagem {formType === "pricelist" ? "(capa)" : ""}
                  </label>
                  <Input
                    name="imageUrl"
                    defaultValue={editing?.imageUrl}
                    placeholder="https://..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tipo
                  </label>
                  <select
                    value={formType}
                    onChange={(e) =>
                      setFormType(e.target.value === "pricelist" ? "pricelist" : "carousel")
                    }
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="carousel">Carrossel (imagem única na página inicial)</option>
                    <option value="pricelist">Tabela de preço (várias páginas, folhear)</option>
                  </select>
                </div>

                {formType === "pricelist" && (
                  <div className="space-y-2 rounded-lg border border-blue-200 bg-blue-50/50 p-3">
                    <label className="block text-sm font-medium text-slate-700">
                      PDF do catálogo (recomendado)
                    </label>
                    <p className="text-xs text-slate-500">
                      Carrega o PDF e ele é mostrado a folhear, página a página. Se puseres
                      um PDF, as imagens abaixo são ignoradas.
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handlePdfUpload}
                        disabled={uploadingPdf}
                        className="text-sm"
                      />
                      {uploadingPdf && (
                        <span className="text-xs text-slate-500">A carregar…</span>
                      )}
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
                )}

                {formType === "pricelist" && !formPdfUrl && (
                  <div className="rounded-lg border border-slate-200 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <label className="block text-sm font-medium text-slate-700">
                        Páginas (URLs das imagens, pela ordem)
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
                    {formPages.length === 0 && (
                      <p className="py-2 text-sm text-slate-500">
                        Adiciona as páginas do catálogo. A capa é o URL da imagem acima.
                      </p>
                    )}
                    <div className="space-y-2">
                      {formPages.map((url, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="w-6 text-xs text-slate-400">{idx + 1}</span>
                          <Input
                            value={url}
                            onChange={(e) =>
                              setFormPages((p) =>
                                p.map((u, i) => (i === idx ? e.target.value : u)),
                              )
                            }
                            placeholder="https://... (imagem da página)"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setFormPages((p) => p.filter((_, i) => i !== idx))
                            }
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Descrição (opcional)
                  </label>
                  <Textarea
                    name="description"
                    defaultValue={editing?.description}
                    placeholder="Descrição do catálogo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Ordem (menor = primeiro)
                  </label>
                  <Input
                    name="order"
                    type="number"
                    defaultValue={editing?.order ?? 0}
                  />
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                  {editing ? "Atualizar" : "Criar"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {catalogs.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-slate-500">Nenhum catálogo criado ainda</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {catalogs.map((catalog) => (
              <Card key={catalog.id} className="overflow-hidden">
                <div className="relative w-full h-48 bg-slate-100">
                  <Image
                    src={catalog.imageUrl}
                    alt={catalog.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="pt-4">
                  <h3 className="font-semibold text-slate-900 mb-1">
                    {catalog.title}
                  </h3>
                  {catalog.description && (
                    <p className="text-sm text-slate-600 mb-2 line-clamp-2">
                      {catalog.description}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 mb-3">
                    {catalog.type === "pricelist"
                      ? catalog.pdfUrl
                        ? "Tabela de preço · PDF"
                        : `Tabela de preço · ${Array.isArray(catalog.pages) ? catalog.pages.length : 0} página(s)`
                      : "Carrossel"}{" "}
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
