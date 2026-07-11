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
import { Search, Trash2, Plus, Calendar, ChevronLeft, ChevronRight, Check, X, Clock, Save } from "lucide-react";
import { toast } from "sonner";
import {
  MEETING_AVAILABILITY_KEY,
  MEETING_SLOT_MINUTES,
  WEEKDAY_LABELS,
  DEFAULT_AVAILABILITY,
  parseAvailability,
  type MeetingAvailability,
} from "~/lib/meeting-availability";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/ui/primitives/dialog";
import { Textarea } from "~/ui/primitives/textarea";

interface Meeting {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  date: string;
  startTime: string;
  endTime: string;
  subject: string | null;
  status: "pendente" | "aprovado" | "rejeitado" | "cancelado";
  createdAt: string;
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [view, setView] = useState<"calendar" | "table">("calendar");
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    type: "reject" | "cancel" | null;
    meetingId: number | null;
    reason: string;
  }>({
    open: false,
    type: null,
    meetingId: null,
    reason: "",
  });

  const [createDialog, setCreateDialog] = useState({
    open: false,
    userId: "",
    date: "",
    startTime: "",
    endTime: "",
    subject: "",
  });

  const [users, setUsers] = useState<Array<{ id: number; name: string; email: string }>>([]);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Disponibilidade (dias da semana + intervalo de horas) para os clientes marcarem.
  const [availability, setAvailability] = useState<MeetingAvailability>(DEFAULT_AVAILABILITY);
  const [savingAvailability, setSavingAvailability] = useState(false);

  useEffect(() => {
    fetchMeetings();
    fetchUsers();
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      const res = await fetch(
        `/api/admin/settings?key=${MEETING_AVAILABILITY_KEY}`,
        { credentials: "include" },
      );
      if (res.ok) {
        const json = (await res.json()) as { data?: { value?: string } | null };
        setAvailability(parseAvailability(json.data?.value));
      }
    } catch (error) {
      console.error("Erro ao carregar disponibilidade:", error);
    }
  };

  const toggleWeekday = (day: number) => {
    setAvailability((prev) => ({
      ...prev,
      weekdays: prev.weekdays.includes(day)
        ? prev.weekdays.filter((d) => d !== day)
        : [...prev.weekdays, day].sort((a, b) => a - b),
    }));
  };

  const saveAvailability = async () => {
    if (availability.weekdays.length === 0) {
      toast.error("Escolhe pelo menos um dia da semana");
      return;
    }
    if (availability.startTime >= availability.endTime) {
      toast.error("A hora de fim tem de ser depois da hora de início");
      return;
    }
    setSavingAvailability(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          key: MEETING_AVAILABILITY_KEY,
          value: JSON.stringify(availability),
        }),
      });
      if (res.ok) {
        toast.success("Disponibilidade guardada");
      } else {
        toast.error("Erro ao guardar disponibilidade");
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao guardar disponibilidade");
    } finally {
      setSavingAvailability(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json() as { users: Array<{ id: number; name: string; email: string }> };
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Erro ao carregar utilizadores:", error);
    }
  };

  const fetchMeetings = async () => {
    try {
      const res = await fetch("/api/admin/meetings");
      if (res.ok) {
        const data = await res.json();
        setMeetings((data as { data: Meeting[] }).data || []);
      }
    } catch (error) {
      console.error("Erro ao carregar reuniões:", error);
      toast.error("Erro ao carregar reuniões");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmMeeting = async (meetingId: number) => {
    try {
      const res = await fetch(`/api/admin/meetings/${meetingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "aprovado" }),
      });

      if (res.ok) {
        setMeetings(
          meetings.map((m) =>
            m.id === meetingId ? { ...m, status: "aprovado" as const } : m
          )
        );
        toast.success("Reunião aprovada");
      } else {
        toast.error("Erro ao aprovar reunião");
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao aprovar reunião");
    }
  };

  const handleCreateMeeting = async () => {
    try {
      if (!createDialog.userId || !createDialog.date || !createDialog.startTime) {
        toast.error("Preencha todos os campos obrigatórios");
        return;
      }

      const res = await fetch("/api/admin/meetings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: parseInt(createDialog.userId),
          date: createDialog.date,
          startTime: createDialog.startTime,
          endTime: createDialog.endTime || createDialog.startTime,
          subject: createDialog.subject,
        }),
      });

      if (res.ok) {
        toast.success("Reunião criada com sucesso");
        setCreateDialog({
          open: false,
          userId: "",
          date: "",
          startTime: "",
          endTime: "",
          subject: "",
        });
        fetchMeetings();
      } else {
        toast.error("Erro ao criar reunião");
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao criar reunião");
    }
  };

  const handleRejectMeeting = async (meetingId: number) => {
    setActionDialog({
      open: true,
      type: "reject",
      meetingId,
      reason: "",
    });
  };

  const handleDeleteMeeting = async (meetingId: number) => {
    setActionDialog({
      open: true,
      type: "cancel",
      meetingId,
      reason: "",
    });
  };

  const handleActionSubmit = async () => {
    if (!actionDialog.meetingId) return;

    try {
      const isReject = actionDialog.type === "reject";
      const endpoint = `/api/admin/meetings/${actionDialog.meetingId}`;
      const method = isReject ? "PATCH" : "DELETE";
      const body = isReject
        ? JSON.stringify({ status: "rejeitado", reason: actionDialog.reason })
        : JSON.stringify({ reason: actionDialog.reason });

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body,
      });

      if (res.ok) {
        await fetchMeetings();
        toast.success(
          isReject ? "Reunião rejeitada com sucesso" : "Reunião cancelada com sucesso"
        );
        setActionDialog({ open: false, type: null, meetingId: null, reason: "" });
      } else {
        toast.error(
          isReject ? "Erro ao rejeitar reunião" : "Erro ao cancelar reunião"
        );
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao processar ação");
    }
  };

  const filteredMeetings = useMemo(() => {
    return meetings.filter(
      (meeting) =>
        (meeting.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        meeting.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meeting.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [meetings, searchTerm]);

  const statusColors = {
    pendente: "bg-yellow-100 text-yellow-800",
    aprovado: "bg-green-100 text-green-800",
    rejeitado: "bg-red-100 text-red-800",
    cancelado: "bg-gray-100 text-gray-800",
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pendente: "Pendente",
      aprovado: "Aprovado",
      rejeitado: "Rejeitado",
      cancelado: "Cancelado",
    };
    return labels[status as keyof typeof labels] || status;
  };

  // Calendar logic
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getMeetingsForDate = (day: number) => {
    return meetings.filter((m) => {
      // Não mostrar reuniões rejeitadas ou canceladas no calendário
      if (m.status === "rejeitado" || m.status === "cancelado") return false;
      
      const meetingDate = new Date(m.date);
      return (
        meetingDate.getDate() === day &&
        meetingDate.getMonth() === currentMonth.getMonth() &&
        meetingDate.getFullYear() === currentMonth.getFullYear()
      );
    });
  };

  // Mapear datas com reuniões e quantidade
  const meetingsByDate = useMemo(() => {
    const map = new Map<string, number>();
    meetings.forEach((m) => {
      // Só contar reuniões pendentes ou aprovadas
      if (m.status === "rejeitado" || m.status === "cancelado") return;
      
      const dateKey = new Date(m.date).toDateString();
      map.set(dateKey, (map.get(dateKey) || 0) + 1);
    });
    return map;
  }, [meetings]);

  // Obter cor baseada no número de reuniões
  const getDateColor = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const count = meetingsByDate.get(date.toDateString()) || 0;
    
    if (count === 0) return "";
    if (count === 1) return "bg-green-200";
    if (count === 2) return "bg-green-400";
    return "bg-green-600 text-white";
  };

  const calendarDays = useMemo(() => {
    const days = [];
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  }, [currentMonth]);

  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Reuniões</h1>
          <p className="mt-1 text-sm text-gray-600">A carregar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reuniões</h1>
          <p className="mt-1 text-sm text-gray-600">
            {filteredMeetings.length} reunião(ões) registada(s)
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={view === "calendar" ? "default" : "outline"}
            onClick={() => setView("calendar")}
            size="sm"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Calendário
          </Button>
          <Button
            variant={view === "table" ? "default" : "outline"}
            onClick={() => setView("table")}
            size="sm"
          >
            Lista
          </Button>
          <Button size="sm" onClick={() => setCreateDialog({ ...createDialog, open: true })}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Reunião
          </Button>
        </div>
      </div>

      {/* Painel de Disponibilidade */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">Disponibilidade para reuniões</h2>
          </div>
          <p className="text-sm text-gray-600">
            Define em que dias e horas os clientes podem marcar. As reuniões têm{" "}
            {MEETING_SLOT_MINUTES} minutos e são geradas automaticamente dentro deste intervalo.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Dias da semana</label>
              <div className="flex flex-wrap gap-2">
                {WEEKDAY_LABELS.map((label, day) => {
                  const active = availability.weekdays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleWeekday(day)}
                      className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                        active
                          ? "border-primary bg-primary text-white"
                          : "border-gray-300 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-end gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Hora de início</label>
                <Input
                  type="time"
                  value={availability.startTime}
                  onChange={(e) =>
                    setAvailability((p) => ({ ...p, startTime: e.target.value }))
                  }
                  className="w-36"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Hora de fim</label>
                <Input
                  type="time"
                  value={availability.endTime}
                  onChange={(e) =>
                    setAvailability((p) => ({ ...p, endTime: e.target.value }))
                  }
                  className="w-36"
                />
              </div>
              <Button onClick={saveAvailability} disabled={savingAvailability} className="gap-2">
                <Save className="h-4 w-4" />
                {savingAvailability ? "A guardar..." : "Guardar disponibilidade"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {view === "calendar" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentMonth(
                    new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
                  )
                }
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-bold">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentMonth(
                    new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
                  )
                }
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1">
              {dayNames.map((day) => (
                <div
                  key={day}
                  className="text-center font-semibold text-sm text-gray-600 py-2"
                >
                  {day}
                </div>
              ))}
              {calendarDays.map((day, idx) => {
                const dayMeetings = day ? getMeetingsForDate(day) : [];
                const dateColor = day ? getDateColor(day) : "";
                return (
                  <div
                    key={idx}
                    className={`border rounded p-2 min-h-24 ${
                      day
                        ? `${dateColor || "bg-white"} hover:opacity-90 cursor-pointer transition-opacity`
                        : "bg-gray-50 border-gray-100"
                    }`}
                  >
                    {day && (
                      <>
                        <div className={`font-semibold text-sm mb-1 ${dateColor.includes("text-white") ? "text-white" : ""}`}>
                          {day}
                        </div>
                        <div className="space-y-1">
                          {dayMeetings.slice(0, 3).map((meeting) => (
                            <div
                              key={meeting.id}
                              className={`text-xs p-1 rounded truncate ${
                                meeting.status === "pendente"
                                  ? "bg-yellow-200 text-yellow-900"
                                  : meeting.status === "aprovado"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-200 text-gray-800"
                              }`}
                              title={`${meeting.subject || "Reunião"} - ${meeting.userName}`}
                            >
                              {meeting.startTime}
                            </div>
                          ))}
                          {dayMeetings.length > 3 && (
                            <div className="text-xs text-gray-600 font-semibold">
                              +{dayMeetings.length - 3} mais
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {view === "table" && (
        <Card>
          <CardHeader>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Pesquisar por título, cliente ou email..."
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
                    <TableHead>Cliente</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Hora</TableHead>
                    <TableHead>Assunto</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMeetings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">Nenhuma reunião encontrada</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMeetings.map((meeting) => (
                      <TableRow key={meeting.id}>
                        <TableCell className="font-medium">
                          {meeting.userName}
                        </TableCell>
                        <TableCell className="text-sm">
                          {meeting.userEmail}
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(meeting.date).toLocaleDateString("pt-PT", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            timeZone: "UTC"
                          })}
                        </TableCell>
                        <TableCell className="text-sm">
                          {meeting.startTime} - {meeting.endTime}
                        </TableCell>
                        <TableCell className="text-sm max-w-xs truncate">
                          {meeting.subject || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={statusColors[meeting.status]}
                            variant="outline"
                          >
                            {getStatusLabel(meeting.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {meeting.status === "pendente" && (
                              <>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-8 w-8 text-green-600"
                                  onClick={() => handleConfirmMeeting(meeting.id)}
                                  title="Aprovar"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-8 w-8 text-red-600"
                                  onClick={() => handleRejectMeeting(meeting.id)}
                                  title="Rejeitar"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button
                              size="icon"
                              variant="destructive"
                              className="h-8 w-8"
                              onClick={() => handleDeleteMeeting(meeting.id)}
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
      )}

      {/* Dialog para Rejeitar/Cancelar com Motivo */}
      <Dialog 
        open={actionDialog.open} 
        onOpenChange={(open) => {
          if (!open) {
            setActionDialog({ open: false, type: null, meetingId: null, reason: "" });
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.type === "reject" ? "Rejeitar Reunião" : "Cancelar Reunião"}
            </DialogTitle>
            <DialogDescription>
              {actionDialog.type === "reject" 
                ? "Tem a certeza que deseja rejeitar esta reunião? O cliente será notificado."
                : "Tem a certeza que deseja cancelar esta reunião? O cliente será notificado."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="reason" className="text-sm font-medium">
                Motivo (opcional)
              </label>
              <Textarea
                id="reason"
                placeholder="Descreva o motivo da rejeição/cancelamento..."
                value={actionDialog.reason}
                onChange={(e) => 
                  setActionDialog({ ...actionDialog, reason: e.target.value })
                }
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => 
                setActionDialog({ open: false, type: null, meetingId: null, reason: "" })
              }
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleActionSubmit}
            >
              {actionDialog.type === "reject" ? "Rejeitar" : "Cancelar Reunião"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para Criar Nova Reunião */}
      <Dialog 
        open={createDialog.open} 
        onOpenChange={(open) => {
          if (!open) {
            setCreateDialog({
              open: false,
              userId: "",
              date: "",
              startTime: "",
              endTime: "",
              subject: "",
            });
            setUserSearchTerm("");
            setShowUserDropdown(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Nova Reunião</DialogTitle>
            <DialogDescription>
              Marque uma reunião para um utilizador
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <label className="text-sm font-medium">Utilizador *</label>
              <Input
                type="text"
                placeholder="Escrever nome ou email do utilizador..."
                value={userSearchTerm}
                onChange={(e) => {
                  setUserSearchTerm(e.target.value);
                  setShowUserDropdown(true);
                }}
                onFocus={() => setShowUserDropdown(true)}
                className="mt-1"
              />
              {showUserDropdown && userSearchTerm && (
                <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {users
                    .filter((user) => 
                      user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                      user.email.toLowerCase().includes(userSearchTerm.toLowerCase())
                    )
                    .map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => {
                          setCreateDialog({ ...createDialog, userId: String(user.id) });
                          setUserSearchTerm(`${user.name} (${user.email})`);
                          setShowUserDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 flex flex-col"
                      >
                        <span className="font-medium">{user.name}</span>
                        <span className="text-xs text-gray-500">{user.email}</span>
                      </button>
                    ))}
                  {users.filter((user) => 
                    user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                    user.email.toLowerCase().includes(userSearchTerm.toLowerCase())
                  ).length === 0 && (
                    <div className="px-4 py-2 text-sm text-gray-500">
                      Nenhum utilizador encontrado
                    </div>
                  )}
                </div>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Data *</label>
              <Input
                type="date"
                value={createDialog.date}
                onChange={(e) => setCreateDialog({ ...createDialog, date: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm font-medium">Hora Início *</label>
                <Input
                  type="time"
                  value={createDialog.startTime}
                  onChange={(e) => setCreateDialog({ ...createDialog, startTime: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Hora Fim</label>
                <Input
                  type="time"
                  value={createDialog.endTime}
                  onChange={(e) => setCreateDialog({ ...createDialog, endTime: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Assunto</label>
              <Textarea
                value={createDialog.subject}
                onChange={(e) => setCreateDialog({ ...createDialog, subject: e.target.value })}
                placeholder="Assunto da reunião (opcional)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreateDialog({
                  open: false,
                  userId: "",
                  date: "",
                  startTime: "",
                  endTime: "",
                  subject: "",
                });
                setUserSearchTerm("");
                setShowUserDropdown(false);
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreateMeeting}>
              Criar Reunião
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
