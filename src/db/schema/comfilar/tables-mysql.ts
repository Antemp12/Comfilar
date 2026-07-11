import {
  decimal,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
  boolean,
  json,
} from "drizzle-orm/mysql-core";

// ============================================
// PRICE TYPES TABLE (tipo_preco)
// ============================================
export const priceTypesTable = mysqlTable("tipo_preco", {
  id: int("id").primaryKey().autoincrement(),
  type: mysqlEnum("tipo", ["unitario", "m2", "litro", "kg", "m3"]).notNull(),
});

// ============================================
// CATEGORIES TABLE (categoria)
// ============================================
export const categoriesTable = mysqlTable("categoria", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("nome", { length: 100 }).notNull(),
  parentCategoryId: int("id_categoria_pai").references((): any => categoriesTable.id, { onDelete: "cascade" }),
  image: text("image"),
  isFeatured: boolean("is_featured").default(false),
  isActive: boolean("is_active").default(true), // Categoria ativa (visível para clientes) ou desativada
  managedBy: varchar("managed_by", { length: 20 }).default("admin"), // admin ou funcionario
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// ============================================
// CATEGORY ATTRIBUTES TABLE (category_attributes)
// ============================================
export const categoryAttributesTable = mysqlTable("category_attributes", {
  id: int("id").primaryKey().autoincrement(),
  categoryId: int("category_id")
    .notNull()
    .references(() => categoriesTable.id, { onDelete: "cascade" }),
  attributeName: varchar("attribute_name", { length: 100 }).notNull(),
  attributeValues: json("attribute_values").$type<string[]>().notNull(),
});

// ============================================
// MATERIALS TABLE (material)
// ============================================
export const materialsTable = mysqlTable("material", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("nome", { length: 150 }).notNull(),
  description: text("descricao"),
  price: decimal("preco", { precision: 10, scale: 2 }).notNull(),
  stock: int("stock").default(0),
  image: text("imagem").notNull(), // URL da imagem principal
  categoryId: int("id_categoria")
    .notNull()
    .references(() => categoriesTable.id, { onDelete: "cascade" }),
  priceTypeId: int("id_tipo_preco").references(() => priceTypesTable.id),
  isFeatured: boolean("is_featured").default(false),
  managedBy: varchar("managed_by", { length: 20 }).default("admin"), // admin ou funcionario
  attributes: json("attributes").$type<Record<string, string>>().default({}), // Atributos dinâmicos por categoria (ex: cor, diâmetro, etc)
  isDeleted: boolean("is_deleted").default(false), // Soft delete para preservar referências em pedidos
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// ============================================
// MATERIAL VARIANTS TABLE (variações de produtos)
// ============================================
export const materialVariantsTable = mysqlTable("material_variants", {
  id: int("id").primaryKey().autoincrement(),
  materialId: int("material_id")
    .notNull()
    .references(() => materialsTable.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(), // ex: "Cor", "Tamanho"
  value: varchar("value", { length: 100 }).notNull(), // ex: "Vermelho", "M"
  label: varchar("label", { length: 100 }), // ex: "Vermelho (#FF0000)" para melhor apresentação
  image: text("image"), // URL da imagem da variação (opcional)
  stock: int("stock").default(0), // Stock específico da variação
  priceAdjustment: decimal("price_adjustment", { precision: 10, scale: 2 }).default("0"), // Ajuste de preço (ex: +5€)
  isAvailable: boolean("is_available").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});


// ============================================
// MATERIAL IMAGES TABLE (imagens do produto, 1 a 3)
// ============================================
export const materialImagesTable = mysqlTable("material_images", {
  id: int("id").primaryKey().autoincrement(),
  materialId: int("material_id")
    .notNull()
    .references(() => materialsTable.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  ordem: int("ordem").notNull().default(0),
  isDefault: boolean("is_default").notNull().default(false),
});

// ============================================
// USERS TABLE (utilizador)
// ============================================
export const utilizadorTable = mysqlTable("utilizador", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("nome", { length: 100 }).notNull(),
  email: varchar("email", { length: 120 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  type: mysqlEnum("tipo", ["cliente", "funcionario", "admin"])
    .notNull()
    .default("cliente"),
  registrationDate: timestamp("data_registo").notNull().defaultNow(),
});

// ============================================
// QUOTE REQUESTS TABLE (pedido_orca)
// ============================================
export const quoteRequestsTable = mysqlTable("pedido_orca", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("id_utilizador")
    .notNull()
    .references(() => utilizadorTable.id, { onDelete: "cascade" }),
  status: mysqlEnum("estado", [
    "pendente",
    "analise",
    "aprovado",
    "rejeitado",
    "convertido",
  ])
    .notNull()
    .default("pendente"),
  date: timestamp("data").notNull().defaultNow(),
});

// ============================================
// QUOTE ITEMS TABLE (pedido_orca_item)
// ============================================
export const quoteItemsTable = mysqlTable(
  "pedido_orca_item",
  {
    id: int("id").primaryKey().autoincrement(),
    quoteId: int("id_pedido_orca")
      .notNull()
      .references(() => quoteRequestsTable.id, { onDelete: "cascade" }),
    materialId: int("id_material")
      .notNull()
      .references(() => materialsTable.id),
    quantity: int("quantidade").notNull().default(1),
  },
  (table) => ({
    uniqueQuoteMaterial: uniqueIndex("pedido_orca_item_id_pedido_orca_id_material_unique").on(
      table.quoteId,
      table.materialId,
    ),
  }),
);

// ============================================
// ORDERS TABLE (encomenda)
// ============================================
export const ordersTable = mysqlTable("encomenda", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("id_utilizador")
    .notNull()
    .references(() => utilizadorTable.id, { onDelete: "cascade" }),
  quoteId: int("id_pedido_orca")
    .notNull()
    .unique()
    .references(() => quoteRequestsTable.id, { onDelete: "cascade" }),
  status: mysqlEnum("estado", [
    "processamento",
    "preparacao",
    "enviado",
    "entregue",
  ])
    .notNull()
    .default("processamento"),
  confirmationDate: timestamp("data_confirm").notNull().defaultNow(),
});

// ============================================
// ORDER ITEMS TABLE (encomenda_item)
// ============================================
export const orderItemsTable = mysqlTable("encomenda_item", {
  id: int("id").primaryKey().autoincrement(),
  orderId: int("id_encomenda")
    .notNull()
    .references(() => ordersTable.id, { onDelete: "cascade" }),
  materialId: int("id_material")
    .notNull()
    .references(() => materialsTable.id),
  quantity: int("quantidade").notNull().default(1),
  unitPrice: decimal("preco_unitario", { precision: 10, scale: 2 }).notNull(),
});

// ============================================
// MEETINGS TABLE (reuniao)
// ============================================
export const meetingsTable = mysqlTable("reuniao", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("id_utilizador")
    .notNull()
    .references(() => utilizadorTable.id, { onDelete: "cascade" }),
  date: timestamp("data").notNull().defaultNow(),
  description: text("descricao"),
});

// ============================================
// MEETING REQUESTS TABLE (pedido_reuniao)
// ============================================
export const meetingRequestsTable = mysqlTable("pedido_reuniao", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("id_utilizador")
    .notNull()
    .references(() => utilizadorTable.id, { onDelete: "cascade" }),
  date: timestamp("data").notNull(),
  startTime: varchar("hora_inicio", { length: 5 }).notNull(), // HH:mm
  endTime: varchar("hora_fim", { length: 5 }).notNull(), // HH:mm
  subject: varchar("assunto", { length: 200 }),
  status: mysqlEnum("estado", ["pendente", "aprovado", "rejeitado", "cancelado"]).notNull().default("pendente"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============================================
// NOTIFICATIONS TABLE (notificacoes)
// ============================================
export const notificationsTable = mysqlTable("notificacoes", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("id_utilizador")
    .notNull()
    .references(() => utilizadorTable.id, { onDelete: "cascade" }),
  type: mysqlEnum("tipo", [
    "pedido_criado",
    "pedido_confirmado",
    "pedido_preparacao",
    "pedido_enviado",
    "pedido_entregue",
    "reuniao_agendada",
    "reuniao_cancelada",
    "sistema",
    "mensagem",
    "promocao",
  ])
    .notNull(),
  title: varchar("titulo", { length: 150 }).notNull(),
  message: text("mensagem").notNull(),
  color: varchar("cor", { length: 20 }),
  relatedId: int("id_relacionado"), // ID do pedido ou reunião relacionada
  read: boolean("lido").default(false),
  sentEmail: boolean("email_enviado").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============================================
// FAVORITES TABLE (favoritos)
// ============================================
export const favoritesTable = mysqlTable(
  "favoritos",
  {
    id: int("id").primaryKey().autoincrement(),
    userId: int("id_utilizador")
      .notNull()
      .references(() => utilizadorTable.id, { onDelete: "cascade" }),
    materialId: int("id_material")
      .notNull()
      .references(() => materialsTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    uniqueUserMaterial: uniqueIndex("favoritos_user_material_unique").on(
      table.userId,
      table.materialId,
    ),
  }),
);

// ============================================
// SITE SETTINGS TABLE (configuracoes_site)
// ============================================
export const siteSettingsTable = mysqlTable("configuracoes_site", {
  id: int("id").primaryKey().autoincrement(),
  key: varchar("chave", { length: 100 }).notNull().unique(),
  value: text("valor"),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});
