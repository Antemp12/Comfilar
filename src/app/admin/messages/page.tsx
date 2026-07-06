"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronsUpDown, Loader2, MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { cn } from "~/lib/cn";
import { Button } from "~/ui/primitives/button";
import { Input } from "~/ui/primitives/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/ui/primitives/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/ui/primitives/popover";

interface Customer {
  id: number;
  name: string;
  email: string;
  type: string;
}

const messageSchema = z
  .object({
    target: z.enum(["user", "all"]),
    userId: z.number().int().positive().optional(),
    title: z.string().trim().min(2, "O título deve ter pelo menos 2 caracteres"),
    message: z.string().trim().min(2, "A mensagem é obrigatória"),
  })
  .refine((d) => d.target === "all" || !!d.userId, {
    path: ["userId"],
    message: "Escolhe um cliente",
  });

type FieldErrors = Partial<Record<"userId" | "title" | "message", string>>;

export default function AdminMessagesPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [target, setTarget] = useState<"user" | "all">("user");
  const [userId, setUserId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [sending, setSending] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [comboOpen, setComboOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/users", { credentials: "include" });
        const data = (await res.json()) as { users?: Customer[] };
        const clientes = (data.users ?? []).filter((u) => u.type === "cliente");
        setCustomers(clientes);
      } catch (error) {
        console.error("Erro ao carregar clientes:", error);
        toast.error("Erro ao carregar clientes");
      } finally {
        setLoadingCustomers(false);
      }
    })();
  }, []);

  const selectedCustomer = useMemo(
    () => customers.find((c) => String(c.id) === userId),
    [customers, userId],
  );

  const handleSend = async () => {
    const parsed = messageSchema.safeParse({
      target,
      userId: userId ? Number(userId) : undefined,
      title,
      message,
    });
    if (!parsed.success) {
      const errs: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FieldErrors;
        if (key && !errs[key]) errs[key] = issue.message;
      }
      setErrors(errs);
      return;
    }
    setErrors({});
    setSending(true);
    try {
      const res = await fetch("/api/admin/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          target,
          userId: target === "user" ? Number(userId) : undefined,
          title,
          message,
        }),
      });
      const data = (await res.json()) as { success?: boolean; message?: string; sentTo?: number };
      if (!res.ok || !data.success) throw new Error(data?.message || "Falha ao enviar");
      toast.success(
        target === "all"
          ? `Anúncio enviado a ${data.sentTo} cliente(s)`
          : "Mensagem enviada",
      );
      setTitle("");
      setMessage("");
      if (target === "user") setUserId("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao enviar");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-900 dark:text-white">
          <MessageSquare className="h-7 w-7" />
          Mensagens
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Envia uma mensagem a um cliente ou um anúncio a todos os clientes
        </p>
      </div>

      <div className="max-w-2xl space-y-5 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        {/* Destinatário */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
            Para
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTarget("user")}
              className={`flex-1 rounded-lg border px-4 py-2 text-sm ${
                target === "user"
                  ? "border-primary bg-primary/5 font-medium text-primary"
                  : "border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-300"
              }`}
            >
              Um cliente
            </button>
            <button
              type="button"
              onClick={() => setTarget("all")}
              className={`flex-1 rounded-lg border px-4 py-2 text-sm ${
                target === "all"
                  ? "border-primary bg-primary/5 font-medium text-primary"
                  : "border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-300"
              }`}
            >
              Todos os clientes ({customers.length})
            </button>
          </div>
        </div>

        {/* Seletor de cliente */}
        {target === "user" && (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-900 dark:text-white">
              Cliente
            </label>
            <Popover open={comboOpen} onOpenChange={setComboOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={comboOpen}
                  disabled={loadingCustomers}
                  className={cn(
                    "w-full justify-between font-normal",
                    errors.userId && "border-red-500",
                    !selectedCustomer && "text-muted-foreground",
                  )}
                >
                  {loadingCustomers
                    ? "A carregar…"
                    : selectedCustomer
                      ? `${selectedCustomer.name} — ${selectedCustomer.email}`
                      : "Procurar cliente…"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[--radix-popover-trigger-width] p-0"
                align="start"
              >
                <Command>
                  <CommandInput placeholder="Procurar por nome ou email…" />
                  <CommandList>
                    <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                    <CommandGroup>
                      {customers.map((c) => (
                        <CommandItem
                          key={c.id}
                          value={`${c.name} ${c.email}`}
                          onSelect={() => {
                            setUserId(String(c.id));
                            setErrors((p) => ({ ...p, userId: undefined }));
                            setComboOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              userId === String(c.id) ? "opacity-100" : "opacity-0",
                            )}
                          />
                          <div className="flex flex-col">
                            <span>{c.name}</span>
                            <span className="text-xs text-muted-foreground">{c.email}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {errors.userId && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.userId}</p>
            )}
          </div>
        )}

        {target === "all" && (
          <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
            Esta mensagem será enviada a <strong>todos os {customers.length} clientes</strong>.
          </div>
        )}

        {/* Título */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-900 dark:text-white">
            Título
          </label>
          <Input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setErrors((p) => ({ ...p, title: undefined }));
            }}
            placeholder="Ex: Promoção de cimento esta semana"
            aria-invalid={!!errors.title}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>
          )}
        </div>

        {/* Mensagem */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-900 dark:text-white">
            Mensagem
          </label>
          <textarea
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setErrors((p) => ({ ...p, message: undefined }));
            }}
            rows={5}
            placeholder="Escreve a tua mensagem…"
            className={`w-full rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:text-white ${
              errors.message ? "border-red-500" : "border-gray-300 dark:border-gray-700"
            }`}
          />
          {errors.message && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.message}</p>
          )}
        </div>

        {target === "user" && selectedCustomer && (
          <p className="text-xs text-gray-500">
            Vai aparecer nas notificações de <strong>{selectedCustomer.name}</strong>.
          </p>
        )}

        <Button className="gap-2" onClick={handleSend} disabled={sending}>
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Enviar
        </Button>
      </div>
    </div>
  );
}
