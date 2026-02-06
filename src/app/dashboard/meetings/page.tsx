"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { Calendar as CalendarIcon, Clock, AlertCircle, CheckCircle, XCircle } from "lucide-react";

import { RoleGuard } from "~/lib/role-guard";
import { useAuth } from "~/lib/auth-context";
import { Calendar } from "~/ui/primitives/calendar";
import { Button } from "~/ui/primitives/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/ui/primitives/card";
import { Input } from "~/ui/primitives/input";
import { Label } from "~/ui/primitives/label";
import { Separator } from "~/ui/primitives/separator";
import { toast } from "sonner";

type MeetingRequest = {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  subject: string | null;
  status: "pendente" | "aprovado" | "rejeitado" | "cancelado";
};

export default function MeetingsPage() {
  const { user } = useAuth();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [subject, setSubject] = useState("");
  const [requests, setRequests] = useState<MeetingRequest[]>([]);

  const timeSlots = useMemo(() => {
    const slots: string[] = [];
    for (let h = 9; h <= 18; h++) {
      for (const m of [0, 30]) {
        const hh = String(h).padStart(2, "0");
        const mm = String(m).padStart(2, "0");
        slots.push(`${hh}:${mm}`);
      }
    }
    return slots;
  }, []);

  const fetchRequests = async () => {
    const res = await fetch("/api/meetings/requests", { credentials: "include" });
    if (res.ok) {
      const data = (await res.json()) as { success: boolean; data?: MeetingRequest[] };
      setRequests(data.data ?? []);
    }
  };

  useEffect(() => {
    void fetchRequests();
  }, []);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) {
      toast.error("Selecione uma data");
      return;
    }
    // Validate start < end
    if (startTime >= endTime) {
      toast.error("Horário inválido: fim deve ser após início");
      return;
    }
    const body = {
      date: selectedDate.toISOString(),
      start: startTime,
      end: endTime,
      subject,
    };
    const res = await fetch("/api/meetings/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });
    if (res.ok) {
      toast.info("Pedido de agendamento enviado. Aguardando confirmação.");
      setSubject("");
      void fetchRequests();
    } else {
      const err = (await res.json()) as { message?: string };
      toast.error(err.message ?? "Erro ao enviar pedido");
    }
  };

  return (
    <RoleGuard allowedRoles={["cliente"]}>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="container mx-auto max-w-7xl px-4 py-8">
            <div className="flex items-center gap-3 mb-2">
              <CalendarIcon className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-slate-900">Agenda</h1>
            </div>
            <p className="text-slate-600">
              Bem-vindo, <span className="font-semibold text-slate-900">{user?.name}</span>. Agende uma reunião com nossa equipe.
            </p>
          </div>
        </div>

        <div className="container mx-auto max-w-7xl px-4 py-12">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left: Schedule form */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-md border-slate-200">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-slate-200">
                  <CardTitle className="text-xl text-slate-900">Agendar Reunião</CardTitle>
                  <p className="text-sm text-slate-600 mt-1 font-normal">Escolha uma data, horário e descreva o assunto</p>
                </CardHeader>
                <CardContent className="pt-6 grid gap-6 md:grid-cols-2">
                  <div className="flex justify-center">
                    <div className="calendar-wrapper rounded-lg border border-slate-300 bg-white p-4 shadow-md">
 <Calendar
  mode="single"
  selected={selectedDate}
  onSelect={setSelectedDate}
  locale={pt}
  weekStartsOn={1}
/>

</div>
                  </div>

                  <form className="space-y-5" onSubmit={handleRequest}>
                    <div className="grid gap-2">
                      <Label className="text-sm font-semibold text-slate-700">Data Selecionada</Label>
                      <Input
                        readOnly
                        value={selectedDate ? format(selectedDate, "dd/MM/yyyy (EEEE)", { locale: ptBR }) : "—"}
                        className="bg-slate-50 cursor-not-allowed font-medium"
                      />
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="grid gap-2">
                        <Label className="text-sm font-semibold text-slate-700">Horário Inicial</Label>
                        <select
                          className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                        >
                          {timeSlots.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-sm font-semibold text-slate-700">Horário Final</Label>
                        <select
                          className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                        >
                          {timeSlots.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label className="text-sm font-semibold text-slate-700">Assunto/Objetivo</Label>
                      <Input
                        placeholder="Ex.: Revisão de orçamento, Apresentação de projeto..."
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="border-slate-300 focus:ring-blue-500"
                      />
                    </div>

                    <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
                      <div className="flex gap-2">
                        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-900">
                          <p className="font-medium">Informações Importantes</p>
                          <p className="mt-1 text-blue-800">Seu pedido será analisado pela nossa equipe. Você receberá uma notificação com a confirmação ou reagendamento sugerido.</p>
                        </div>
                      </div>
                    </div>

                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 h-auto">
                      Pedir Agendamento
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Right: Upcoming meetings */}
            <div className="space-y-6">
              <Card className="shadow-md border-slate-200">
                <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-slate-200">
                  <CardTitle className="text-lg text-slate-900">Suas Solicitações</CardTitle>
                  <p className="text-sm text-slate-600 mt-1 font-normal">{requests.length} {requests.length === 1 ? 'pedido' : 'pedidos'}</p>
                </CardHeader>
                <CardContent className="pt-6 space-y-3 max-h-96 overflow-y-auto">
                  {requests.length === 0 && (
                    <div className="text-center py-8">
                      <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm text-slate-500">Nenhuma solicitação de agendamento</p>
                    </div>
                  )}
                  {requests.map((m) => {
                    const statusConfig = {
                      pendente: { bg: "bg-amber-50", border: "border-amber-200", icon: Clock, label: "Pendente", color: "text-amber-700" },
                      aprovado: { bg: "bg-green-50", border: "border-green-200", icon: CheckCircle, label: "Aprovado", color: "text-green-700" },
                      rejeitado: { bg: "bg-red-50", border: "border-red-200", icon: XCircle, label: "Rejeitado", color: "text-red-700" },
                      cancelado: { bg: "bg-slate-50", border: "border-slate-200", icon: XCircle, label: "Cancelado", color: "text-slate-500" },
                    };
                    const config = statusConfig[m.status];
                    const StatusIcon = config.icon;

                    return (
                      <div key={m.id} className={`rounded-lg border ${config.border} ${config.bg} p-4 space-y-2`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900">
                              {format(new Date(m.date), "dd 'de' MMMM")}
                            </p>
                            <p className="text-sm text-slate-700 flex items-center gap-1 mt-1">
                              <Clock className="w-4 h-4" />
                              {m.startTime}—{m.endTime}
                            </p>
                            {m.subject && (
                              <p className="text-sm text-slate-600 mt-2 italic">"{m.subject}"</p>
                            )}
                          </div>
                        </div>
                        <Separator className="opacity-40" />
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2">
                            <StatusIcon className={`w-4 h-4 ${config.color}`} />
                            <span className={`text-xs font-semibold ${config.color}`}>
                              {config.label}
                            </span>
                          </div>
                          {m.status === "pendente" && (
                            <button
                              onClick={async () => {
                                const res = await fetch("/api/meetings/requests", {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json" },
                                  credentials: "include",
                                  body: JSON.stringify({ id: m.id, action: "cancel" }),
                                });
                                if (res.ok) {
                                  toast.success("Solicitação cancelada");
                                  void fetchRequests();
                                }
                              }}
                              className="text-xs text-red-600 hover:text-red-800 hover:underline font-medium"
                            >
                              Cancelar
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card className="shadow-md border-slate-200">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-slate-200">
                  <CardTitle className="text-lg text-slate-900">Dicas & Orientações</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4 text-sm text-slate-700">
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <span className="text-emerald-600 font-bold">→</span>
                      <span>Escolha um horário com pelo menos <strong>24h de antecedência</strong></span>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-emerald-600 font-bold">→</span>
                      <span>Descreva brevemente o <strong>objetivo da reunião</strong></span>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-emerald-600 font-bold">→</span>
                      <span>Você será <strong>notificado</strong> da confirmação ou reagendamento</span>
                    </div>
                  </div>
                  <Separator className="opacity-40" />
                  <p>
                    Precisa de ajuda? Visite a página de <Link href="/dashboard/support" className="text-blue-600 hover:text-blue-700 hover:underline font-semibold">suporte</Link>.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
