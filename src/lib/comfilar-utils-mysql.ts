import type {
  Material,
  QuoteItem,
  QuoteItemWithMaterial,
} from "@/db/schema";

// ============================================
// QUOTE CALCULATION UTILITIES
// ============================================

/**
 * Calcula o subtotal de um pedido de orçamento
 * @param items - Array de items com material e quantidade
 * @returns Subtotal em euros
 */
export function calculateQuoteSubtotal(
  items: QuoteItemWithMaterial[],
): number {
  return items.reduce((total, item) => {
    const price = Number.parseFloat(item.material.price);
    return total + price * item.quantity;
  }, 0);
}

/**
 * Calcula o custo de transporte baseado no subtotal
 * @param subtotal - Valor subtotal da encomenda
 * @returns Custo de transporte
 */
export function calculateTransportCost(subtotal: number): number {
  // Grátis para encomendas acima de 500€
  if (subtotal >= 500) {
    return 0;
  }
  
  // 5% do subtotal com mínimo de 15€
  const transportPercentage = subtotal * 0.05;
  return Math.max(transportPercentage, 15);
}

/**
 * Calcula o total do orçamento incluindo transporte
 * @param items - Array de items do orçamento
 * @returns Objeto com subtotal, custo de transporte e total
 */
export function calculateQuoteTotal(items: QuoteItemWithMaterial[]) {
  const subtotal = calculateQuoteSubtotal(items);
  const transportCost = calculateTransportCost(subtotal);
  const total = subtotal + transportCost;

  return {
    subtotal: Number(subtotal.toFixed(2)),
    transportCost: Number(transportCost.toFixed(2)),
    total: Number(total.toFixed(2)),
  };
}

// ============================================
// DATE UTILITIES
// ============================================

/**
 * Calcula a data estimada de entrega
 * @param orderDate - Data da encomenda
 * @param daysToAdd - Número de dias úteis a adicionar (padrão: 5-7 dias)
 * @returns Data estimada de entrega
 */
export function getEstimatedDeliveryDate(
  orderDate: Date = new Date(),
  daysToAdd = 7,
): Date {
  const deliveryDate = new Date(orderDate);
  deliveryDate.setDate(deliveryDate.getDate() + daysToAdd);
  return deliveryDate;
}

/**
 * Formata data para formato português (DD/MM/YYYY)
 * @param date - Data a formatar
 * @returns String formatada
 */
export function formatDatePT(date: Date): string {
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

/**
 * Formata data e hora para formato português
 * @param date - Data a formatar
 * @returns String formatada com data e hora
 */
export function formatDateTimePT(date: Date): string {
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

// ============================================
// VALIDATION UTILITIES
// ============================================

/**
 * Valida se os items de um orçamento têm stock suficiente
 * @param items - Array de items a validar
 * @returns Objeto com resultado da validação
 */
export function validateStockAvailability(
  items: QuoteItemWithMaterial[],
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const item of items) {
    const availableStock = item.material.stock ?? 0;
    if (item.quantity > availableStock) {
      errors.push(
        `Material "${item.material.name}" tem stock insuficiente (disponível: ${availableStock}, pedido: ${item.quantity})`,
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Valida se os items de um orçamento são válidos
 * @param items - Array de items a validar
 * @returns true se válido, false caso contrário
 */
export function validateQuoteItems(
  items: { materialId: number; quantity: number }[],
): boolean {
  if (!items || items.length === 0) {
    return false;
  }

  for (const item of items) {
    if (!item.materialId || item.quantity <= 0) {
      return false;
    }
  }

  return true;
}

// ============================================
// FORMATTING UTILITIES
// ============================================

/**
 * Formata valor monetário para formato português
 * @param value - Valor a formatar
 * @returns String formatada (ex: "1.234,56 €")
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

/**
 * Formata quantidade com unidade de medida
 * @param quantity - Quantidade
 * @param priceType - Tipo de preço (unitario, m2, litro, kg, m3)
 * @returns String formatada (ex: "10 unidades", "5,5 m²")
 */
export function formatQuantityWithUnit(
  quantity: number,
  priceType?: string | null,
): string {
  const unitMap: Record<string, string> = {
    unitario: "unidade(s)",
    m2: "m²",
    litro: "L",
    kg: "kg",
    m3: "m³",
  };

  const unit = priceType ? unitMap[priceType] ?? "unidade(s)" : "unidade(s)";
  return `${quantity} ${unit}`;
}

// ============================================
// STATUS UTILITIES
// ============================================

/**
 * Traduz status de orçamento para português
 * @param status - Status em inglês
 * @returns Status traduzido
 */
export function translateQuoteStatus(
  status: string,
): string {
  const statusMap: Record<string, string> = {
    pendente: "Pendente",
    analise: "Em Análise",
    aprovado: "Aprovado",
    rejeitado: "Rejeitado",
    convertido: "Convertido em Encomenda",
  };

  return statusMap[status] ?? status;
}

/**
 * Traduz status de encomenda para português
 * @param status - Status em inglês
 * @returns Status traduzido
 */
export function translateOrderStatus(
  status: string,
): string {
  const statusMap: Record<string, string> = {
    processamento: "Em Processamento",
    preparacao: "Em Preparação",
    enviado: "Enviado",
    entregue: "Entregue",
  };

  return statusMap[status] ?? status;
}

/**
 * Retorna cor do badge baseado no status
 * @param status - Status da encomenda/orçamento
 * @returns Classe Tailwind para cor
 */
export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    pendente: "bg-yellow-100 text-yellow-800",
    analise: "bg-blue-100 text-blue-800",
    aprovado: "bg-green-100 text-green-800",
    rejeitado: "bg-red-100 text-red-800",
    convertido: "bg-purple-100 text-purple-800",
    processamento: "bg-blue-100 text-blue-800",
    preparacao: "bg-indigo-100 text-indigo-800",
    enviado: "bg-cyan-100 text-cyan-800",
    entregue: "bg-green-100 text-green-800",
  };

  return colorMap[status] ?? "bg-gray-100 text-gray-800";
}

// ============================================
// SEARCH/FILTER UTILITIES
// ============================================

/**
 * Filtra materiais por nome ou descrição
 * @param materials - Array de materiais
 * @param searchTerm - Termo de pesquisa
 * @returns Materiais filtrados
 */
export function filterMaterialsBySearch(
  materials: Material[],
  searchTerm: string,
): Material[] {
  if (!searchTerm || searchTerm.trim() === "") {
    return materials;
  }

  const term = searchTerm.toLowerCase();
  return materials.filter(
    (material) =>
      material.name.toLowerCase().includes(term) ||
      material.description?.toLowerCase().includes(term),
  );
}

/**
 * Ordena materiais por campo específico
 * @param materials - Array de materiais
 * @param sortBy - Campo de ordenação
 * @param order - Ordem (asc/desc)
 * @returns Materiais ordenados
 */
export function sortMaterials(
  materials: Material[],
  sortBy: "name" | "price" | "stock" = "name",
  order: "asc" | "desc" = "asc",
): Material[] {
  return [...materials].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "name":
        comparison = a.name.localeCompare(b.name, "pt-PT");
        break;
      case "price":
        comparison = Number.parseFloat(a.price) - Number.parseFloat(b.price);
        break;
      case "stock":
        comparison = (a.stock ?? 0) - (b.stock ?? 0);
        break;
    }

    return order === "asc" ? comparison : -comparison;
  });
}
