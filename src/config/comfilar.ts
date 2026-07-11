/**
 * Comfilar Application Configuration
 * Platform for managing and visualizing construction materials
 */

export const comfilarConfig = {
  // App
  name: "Comfilar",
  description: "Plataforma Web para Gestão e Visualização de Materiais",
  
  // Branding
  company: "Comfilar",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "suporte@comfilar.pt",
  
  // Business Rules
  transport: {
    baseCost: parseFloat(process.env.NEXT_PUBLIC_TRANSPORT_COST_BASE || "25"),
    percentageOfOrder: 0.02, // 2% of order total
  },
  
  delivery: {
    estimatedDays: parseInt(process.env.NEXT_PUBLIC_DELIVERY_DAYS || "3"),
  },
  
  // User Roles
  roles: {
    CLIENT: "client",
    EMPLOYEE: "employee",
    ADMIN: "admin",
  },
  
  // Quote Status
  quoteStatus: {
    PENDING: "pending",
    ANALYZING: "analyzing",
    APPROVED: "approved",
    REJECTED: "rejected",
    CONVERTED: "converted",
  },
  
  // Order Status
  orderStatus: {
    PROCESSING: "processing",
    PREPARATION: "preparation",
    SENT: "sent",
    DELIVERED: "delivered",
  },
  
  // Navigation
  navigation: {
    public: [
      { label: "Home", href: "/" },
      { label: "Catálogo", href: "/products" },
      { label: "Sobre", href: "/about" },
      { label: "Contacto", href: "/contact" },
    ],
    private: [
      { label: "Dashboard", href: "/dashboard/home" },
      { label: "Meus Pedidos", href: "/dashboard/orders" },
      { label: "Perfil", href: "/dashboard/profile" },
      { label: "Reuniões", href: "/dashboard/meetings" },
    ],
    admin: [
      { label: "Materiais", href: "/admin/materials" },
      { label: "Categorias", href: "/admin/categories" },
      { label: "Utilizadores", href: "/admin/users" },
      { label: "Encomendas", href: "/admin/orders" },
    ],
  },
  
  // Pagination
  pagination: {
    perPage: 12,
    maxResults: 100,
  },
  
  // File Upload
  uploads: {
    maxFileSize: 5242880, // 5MB
    acceptedFormats: ["image/jpeg", "image/png", "image/webp"],
  },
};

export type UserRole = typeof comfilarConfig.roles[keyof typeof comfilarConfig.roles];
export type QuoteStatus = typeof comfilarConfig.quoteStatus[keyof typeof comfilarConfig.quoteStatus];
export type OrderStatus = typeof comfilarConfig.orderStatus[keyof typeof comfilarConfig.orderStatus];
