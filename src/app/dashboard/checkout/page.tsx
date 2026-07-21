"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import { Check, ChevronLeft, ChevronRight, CheckCircle, AlertCircle } from "lucide-react";

import { useCart } from "~/lib/hooks/use-cart";
import { useAuth } from "~/lib/auth-context";
import { Button } from "~/ui/primitives/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "~/ui/primitives/dialog";
import { Input } from "~/ui/primitives/input";
import { Label } from "~/ui/primitives/label";
import { Textarea } from "~/ui/primitives/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "~/ui/primitives/card";
import { Checkbox } from "~/ui/primitives/checkbox";
import { Calendar } from "~/ui/primitives/calendar";
import Image from "next/image";
import {
  MEETING_AVAILABILITY_KEY,
  MEETING_SLOT_MINUTES,
  DEFAULT_AVAILABILITY,
  parseAvailability,
  generateSlots,
  addMinutesToTime,
  WEEKDAY_LABELS,
  type MeetingAvailability,
} from "~/lib/meeting-availability";

type Step = 1 | 2 | 3;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart, updateQuantity, removeItem } = useCart();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = React.useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showSuccessModal, setShowSuccessModal] = React.useState(false);

  // Agendamento é opcional: só aparece se o cliente escolher "Sim".
  const [wantsMeeting, setWantsMeeting] = React.useState(false);
  const [availability, setAvailability] = React.useState<MeetingAvailability>(DEFAULT_AVAILABILITY);
  const timeSlots = React.useMemo(
    () => generateSlots(availability.startTime, availability.endTime, MEETING_SLOT_MINUTES),
    [availability],
  );

  // Horas já ocupadas por dia: { "YYYY-MM-DD": ["09:00", ...] }
  const [busySlots, setBusySlots] = React.useState<Record<string, string[]>>({});

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/admin/settings?key=${MEETING_AVAILABILITY_KEY}`);
        if (res.ok) {
          const json = (await res.json()) as { data?: { value?: string } | null };
          setAvailability(parseAvailability(json.data?.value));
        }
      } catch {
        /* usa o valor por defeito */
      }
    })();
  }, []);

  React.useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch("/api/meetings/busy", {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
          credentials: "include",
        });
        if (res.ok) {
          const json = (await res.json()) as { data?: Record<string, string[]> };
          setBusySlots(json.data ?? {});
        }
      } catch {
        /* sem info de ocupação — mostra tudo como livre */
      }
    })();
  }, []);

  // "YYYY-MM-DD" a partir de uma Date local (bate com o valor escolhido pelo cliente).
  const toDateKey = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate(),
    ).padStart(2, "0")}`;

  const todayStart = React.useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  // Um dia está indisponível se: for passado, não for dia de atendimento,
  // ou já tiver todos os slots ocupados.
  const isDayUnavailable = React.useCallback(
    (date: Date) => {
      if (date < todayStart) return true;
      if (!availability.weekdays.includes(date.getDay())) return true;
      const taken = busySlots[toDateKey(date)] ?? [];
      return timeSlots.length > 0 && taken.length >= timeSlots.length;
    },
    [todayStart, availability.weekdays, busySlots, timeSlots.length],
  );

  // Dia de atendimento futuro que ainda tem slots livres → marcado a verde.
  const isDayFree = React.useCallback(
    (date: Date) => {
      if (date < todayStart) return false;
      if (!availability.weekdays.includes(date.getDay())) return false;
      const taken = busySlots[toDateKey(date)] ?? [];
      return timeSlots.length === 0 || taken.length < timeSlots.length;
    },
    [todayStart, availability.weekdays, busySlots, timeSlots.length],
  );

  // Dia de atendimento futuro totalmente ocupado → marcado a vermelho.
  const isDayFull = React.useCallback(
    (date: Date) => {
      if (date < todayStart) return false;
      if (!availability.weekdays.includes(date.getDay())) return false;
      const taken = busySlots[toDateKey(date)] ?? [];
      return timeSlots.length > 0 && taken.length >= timeSlots.length;
    },
    [todayStart, availability.weekdays, busySlots, timeSlots.length],
  );

  const [formData, setFormData] = React.useState({
    // Etapa 1: Informações
    deliveryAddress: "",
    deliveryCity: "",
    deliveryPostalCode: "",
    contactPhone: "",
    notes: "",
    
    // Etapa 3: Agenda
    meetingDate: "",
    meetingTime: "",
    meetingNotes: "",
  });

  // Horas ocupadas para o dia atualmente selecionado.
  const takenTimesForSelected = formData.meetingDate
    ? busySlots[formData.meetingDate] ?? []
    : [];

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal;

  const handleNext = () => {
    if (currentStep === 1) {
      // Validar informações
      if (!formData.deliveryAddress || !formData.deliveryCity || !formData.deliveryPostalCode || !formData.contactPhone) {
        toast.error("Por favor, preencha todos os campos obrigatórios");
        return;
      }
    }
    
    if (currentStep === 2) {
      // Validar que há itens
      if (items.length === 0) {
        toast.error("Adicione pelo menos um produto ao carrinho");
        return;
      }
    }
    
    if (currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as Step);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  const handleSubmit = async () => {
    // Agendamento é opcional. Só validar se o cliente escolheu agendar.
    if (wantsMeeting) {
      if (!formData.meetingDate || !formData.meetingTime) {
        toast.error("Por favor, preencha a data e hora do agendamento");
        return;
      }
      const [y, m, d] = formData.meetingDate.split("-").map(Number);
      const weekday = new Date(y, (m || 1) - 1, d || 1).getDay();
      if (!availability.weekdays.includes(weekday)) {
        toast.error("Esse dia não está disponível para reuniões");
        return;
      }
      if (!formData.meetingNotes || formData.meetingNotes.trim().length === 0) {
        toast.error("Por favor, descreva o motivo da reunião");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("authToken");
      console.log("Submitting order with data:", {
        items: items.map(item => ({
          materialId: Number(item.id),
          quantity: item.quantity,
          price: item.price,
        })),
        formData,
        total,
        token: token ? "present" : "missing"
      });
      
      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          items: items.map(item => ({
            materialId: Number(item.id),
            quantity: item.quantity,
            price: item.price,
          })),
          deliveryAddress: formData.deliveryAddress,
          deliveryCity: formData.deliveryCity,
          deliveryPostalCode: formData.deliveryPostalCode,
          contactPhone: formData.contactPhone,
          notes: formData.notes,
          meetingDate: wantsMeeting ? formData.meetingDate : "",
          meetingTime: wantsMeeting ? formData.meetingTime : "",
          meetingNotes: wantsMeeting ? formData.meetingNotes : "",
          total,
        }),
      });

      if (!response.ok) {
        const error = (await response.json()) as { error?: string };
        throw new Error(error.error || "Erro ao criar encomenda");
      }

      await response.json();
      
      // Mostrar o modal de sucesso (sem limpar carrinho ainda)
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao criar encomenda");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Carrinho vazio</h1>
        <p className="text-muted-foreground mb-8">
          Adicione produtos ao carrinho antes de fazer checkout
        </p>
        <Button onClick={() => router.push("/products")}>
          Ver Produtos
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Progress Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-4">
          {/* Step 1 */}
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              currentStep >= 1 ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 text-gray-400'
            }`}>
              {currentStep > 1 ? <Check className="w-5 h-5" /> : '1'}
            </div>
            <span className={`ml-2 font-medium ${currentStep >= 1 ? 'text-gray-900' : 'text-gray-400'}`}>
              Informações
            </span>
          </div>

          <div className={`w-16 h-0.5 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`} />

          {/* Step 2 */}
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              currentStep >= 2 ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 text-gray-400'
            }`}>
              {currentStep > 2 ? <Check className="w-5 h-5" /> : '2'}
            </div>
            <span className={`ml-2 font-medium ${currentStep >= 2 ? 'text-gray-900' : 'text-gray-400'}`}>
              Itens
            </span>
          </div>

          <div className={`w-16 h-0.5 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`} />

          {/* Step 3 */}
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              currentStep >= 3 ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 text-gray-400'
            }`}>
              3
            </div>
            <span className={`ml-2 font-medium ${currentStep >= 3 ? 'text-gray-900' : 'text-gray-400'}`}>
              Confirmar
            </span>
          </div>
        </div>
      </div>

      {/* Step 1: Informações */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Informações de Entrega</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="address">Morada *</Label>
                <Input
                  id="address"
                  value={formData.deliveryAddress}
                  onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                  placeholder="Rua, número, andar..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Cidade *</Label>
                <Input
                  id="city"
                  value={formData.deliveryCity}
                  onChange={(e) => setFormData({ ...formData, deliveryCity: e.target.value })}
                  placeholder="Lisboa"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode">Código Postal *</Label>
                <Input
                  id="postalCode"
                  value={formData.deliveryPostalCode}
                  onChange={(e) => setFormData({ ...formData, deliveryPostalCode: e.target.value })}
                  placeholder="1000-000"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  placeholder="+351 912 345 678"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Informações adicionais sobre a entrega..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Itens */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Revisar Itens ({items.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 border-b pb-4 last:border-0">
                <Checkbox defaultChecked disabled />
                
                <div className="relative w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                  <Image
                    src={item.image || "/images/placeholder.png"}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                  <p className="text-sm text-gray-500">{item.category}</p>
                  <p className="text-sm font-medium text-blue-600 mt-1">
                    €{item.price.toFixed(2)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                  >
                    -
                  </Button>
                  <span className="w-12 text-center font-medium">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </Button>
                </div>

                <div className="text-right w-24">
                  <p className="font-bold text-gray-900">
                    €{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(item.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  Apagar
                </Button>
              </div>
            ))}

            <div className="pt-4 border-t">
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-blue-600">€{total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Confirmar (agendamento opcional) */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Confirmar Encomenda</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Quer agendar uma reunião? Sim / Não */}
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium text-gray-900">
                Quer agendar uma reunião relacionada com esta encomenda?
              </p>
              <p className="text-sm text-gray-600 mt-1">
                É opcional — pode finalizar sem marcar reunião.
              </p>
              <div className="mt-3 flex gap-2">
                <Button
                  type="button"
                  variant={wantsMeeting ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setWantsMeeting(true);
                    if (!formData.meetingTime && timeSlots.length > 0) {
                      setFormData((prev) => ({ ...prev, meetingTime: timeSlots[0] }));
                    }
                  }}
                >
                  Sim, quero agendar
                </Button>
                <Button
                  type="button"
                  variant={!wantsMeeting ? "default" : "outline"}
                  size="sm"
                  onClick={() => setWantsMeeting(false)}
                >
                  Não, obrigado
                </Button>
              </div>
            </div>

            {wantsMeeting && (
              <>
                <p className="text-xs text-gray-500">
                  Disponível:{" "}
                  {availability.weekdays
                    .slice()
                    .sort((a, b) => a - b)
                    .map((d) => WEEKDAY_LABELS[d])
                    .join(", ")}{" "}
                  · {availability.startTime}–{availability.endTime} · reuniões de{" "}
                  {MEETING_SLOT_MINUTES} min
                </p>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Data *</Label>
                    <div className="inline-block rounded-lg border bg-white">
                      <Calendar
                        mode="single"
                        selected={
                          formData.meetingDate
                            ? new Date(`${formData.meetingDate}T00:00:00`)
                            : undefined
                        }
                        onSelect={(date) => {
                          if (!date) {
                            setFormData((prev) => ({
                              ...prev,
                              meetingDate: "",
                              meetingTime: "",
                            }));
                            return;
                          }
                          const key = toDateKey(date);
                          const taken = busySlots[key] ?? [];
                          const firstFree =
                            timeSlots.find((t) => !taken.includes(t)) ?? "";
                          setFormData((prev) => ({
                            ...prev,
                            meetingDate: key,
                            meetingTime: firstFree,
                          }));
                        }}
                        disabled={isDayUnavailable}
                        modifiers={{ free: isDayFree, full: isDayFull }}
                        modifiersClassNames={{
                          free: "bg-green-100 text-green-800 font-medium",
                          full: "bg-red-200 text-red-800 line-through",
                        }}
                      />
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <span className="h-3 w-3 rounded-sm border border-green-300 bg-green-100" />{" "}
                        Livre
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="h-3 w-3 rounded-sm border border-red-300 bg-red-200" />{" "}
                        Ocupado
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="h-3 w-3 rounded-sm border border-gray-300 bg-gray-100" />{" "}
                        Indisponível
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="meetingTime">Horário ({MEETING_SLOT_MINUTES} min) *</Label>
                    {!formData.meetingDate ? (
                      <p className="text-sm text-gray-500">
                        Escolha primeiro um dia no calendário.
                      </p>
                    ) : timeSlots.length === 0 ? (
                      <p className="text-sm text-gray-500">Sem horários disponíveis.</p>
                    ) : (
                      <select
                        id="meetingTime"
                        value={formData.meetingTime}
                        onChange={(e) => setFormData({ ...formData, meetingTime: e.target.value })}
                        className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">— Selecionar —</option>
                        {timeSlots.map((t) => {
                          const taken = takenTimesForSelected.includes(t);
                          return (
                            <option key={t} value={t} disabled={taken}>
                              {t} — {addMinutesToTime(t, MEETING_SLOT_MINUTES)}
                              {taken ? " (ocupado)" : ""}
                            </option>
                          );
                        })}
                      </select>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meetingNotes">Motivo da Reunião *</Label>
                  <Textarea
                    id="meetingNotes"
                    value={formData.meetingNotes}
                    onChange={(e) => setFormData({ ...formData, meetingNotes: e.target.value })}
                    placeholder="Descreva o motivo ou objetivo da reunião..."
                    rows={3}
                  />
                </div>

                <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
                  <div className="flex gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-900">
                      <p className="font-semibold">Pedido de Agendamento</p>
                      <p className="mt-1">
                        Este agendamento será enviado como um <strong>pedido de reunião</strong> que precisará ser
                        <strong> aprovado pela nossa equipa</strong>. Receberá uma notificação assim que o pedido for analisado.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Summary */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-3">Resumo da Encomenda</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Morada:</span>
                  <span className="font-medium">{formData.deliveryAddress}, {formData.deliveryCity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Telefone:</span>
                  <span className="font-medium">{formData.contactPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Itens:</span>
                  <span className="font-medium">{items.length} produto(s)</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total:</span>
                  <span className="text-blue-600">€{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="mt-6 flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        {currentStep < 3 ? (
          <Button onClick={handleNext}>
            Continuar
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "A processar..." : "Finalizar Encomenda"}
          </Button>
        )}
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={(open) => {
        // Impedir fechar clicando fora - só deixar fechar via botão
        if (!open) return;
        setShowSuccessModal(open);
      }}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <DialogTitle className="text-2xl">Encomenda Criada com Sucesso!</DialogTitle>
            <DialogDescription className="text-base pt-4">
              A sua encomenda foi registada e será visualizada por um funcionário.
              <br />
              <br />
              Aguarde pela confirmação. Obrigado!
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 pt-4">
            <Button 
              onClick={() => {
                clearCart();
                setShowSuccessModal(false);
                router.push("/dashboard/my-orders");
              }} 
              className="w-full"
            >
              Ver Minhas Encomendas
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                clearCart();
                setShowSuccessModal(false);
                router.push("/dashboard/home");
              }}
              className="w-full"
            >
              Voltar à Página Inicial
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
