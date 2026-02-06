"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import { Check, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";

import { useCart } from "~/lib/hooks/use-cart";
import { useAuth } from "~/lib/auth-context";
import { Button } from "~/ui/primitives/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "~/ui/primitives/dialog";
import { Input } from "~/ui/primitives/input";
import { Label } from "~/ui/primitives/label";
import { Textarea } from "~/ui/primitives/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "~/ui/primitives/card";
import { Checkbox } from "~/ui/primitives/checkbox";
import Image from "next/image";

type Step = 1 | 2 | 3;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart, updateQuantity, removeItem } = useCart();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = React.useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showSuccessModal, setShowSuccessModal] = React.useState(false);

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
    // Validar agendamento obrigatório
    if (!formData.meetingDate || !formData.meetingTime) {
      toast.error("Por favor, preencha a data e hora do agendamento");
      return;
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
          meetingDate: formData.meetingDate,
          meetingTime: formData.meetingTime,
          meetingNotes: formData.meetingNotes,
          total,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao criar encomenda");
      }

      const result = await response.json();
      
      // Primeiro mostrar o modal
      setShowSuccessModal(true);
      
      // Depois limpar o carrinho (após 500ms)
      setTimeout(() => {
        clearCart();
      }, 500);
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
              Agendamento
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

      {/* Step 3: Agendamento */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Agendamento *</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              Agende uma reunião ou visita técnica relacionada com esta encomenda.
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="meetingDate">Data *</Label>
                <Input
                  id="meetingDate"
                  type="date"
                  value={formData.meetingDate}
                  onChange={(e) => setFormData({ ...formData, meetingDate: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="meetingTime">Hora *</Label>
                <Input
                  id="meetingTime"
                  type="time"
                  value={formData.meetingTime}
                  onChange={(e) => setFormData({ ...formData, meetingTime: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="meetingNotes">Notas da Reunião</Label>
              <Textarea
                id="meetingNotes"
                value={formData.meetingNotes}
                onChange={(e) => setFormData({ ...formData, meetingNotes: e.target.value })}
                placeholder="Assunto ou objetivo da reunião..."
                rows={3}
              />
            </div>

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
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
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
          <div className="flex justify-center pt-4">
            <Button onClick={() => router.push("/dashboard")} className="w-full">
              Voltar à Página Inicial
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
