# 🎯 BACKEND COMFILAR - STATUS COMPLETO

## ✅ **O QUE ESTÁ IMPLEMENTADO**

### 1. **Base de Dados MySQL - Configuração Completa**
- ✅ Drizzle ORM configurado para MySQL (`mysql2` driver instalado)
- ✅ Schema mapeando as tabelas existentes:
  - `utilizador` (sistema de users nativo)
  - `material`, `categoria`, `tipo_preco`
  - `pedido_orca`, `pedido_orca_item`
  - `encomenda`, `reuniao`
- ✅ Relações entre todas as tabelas definidas
- ✅ Types TypeScript completos

### 2. **Query Helpers - 20+ Funções**
Ficheiro: `src/lib/queries/comfilar-mysql.ts`

**Users:**
- `getUtilizadorById(id)` - Buscar user por ID
- `getUtilizadorByEmail(email)` - Buscar user por email

**Materiais:**
- `getMaterials(limit, offset)` - Listar materiais com paginação
- `getMaterialById(id)` - Detalhes de 1 material
- `getMaterialsByCategory(categoryId)` - Materiais por categoria

**Orçamentos:**
- `getUserQuoteRequests(userId)` - Orçamentos do cliente
- `getQuoteRequestById(id)` - Detalhes completos do orçamento
- `getAllQuoteRequests()` - Todos os orçamentos (admin/funcionário)

**Encomendas:**
- `getUserOrders(userId)` - Encomendas do cliente
- `getOrderById(id)` - Detalhes da encomenda
- `getAllOrders()` - Todas as encomendas

**Reuniões:**
- `getUserMeetings(userId)` - Reuniões do cliente
- `getEmployeeMeetings()` - Todas as reuniões (funcionário)
- `getMeetingById(id)` - Detalhes da reunião

**Categorias:**
- `getAllCategories()` - Listar todas as categorias
- `getCategoryById(id)` - Detalhes de 1 categoria

### 3. **Utility Functions - 15+ Funções**
Ficheiro: `src/lib/comfilar-utils-mysql.ts`

**Cálculos:**
- `calculateQuoteSubtotal()` - Soma total dos items
- `calculateTransportCost()` - Custo de envio (grátis > 500€)
- `calculateQuoteTotal()` - Total com transporte

**Datas:**
- `getEstimatedDeliveryDate()` - Data estimada de entrega
- `formatDatePT()` - Formato DD/MM/YYYY
- `formatDateTimePT()` - Formato completo PT

**Validação:**
- `validateStockAvailability()` - Verifica stock disponível
- `validateQuoteItems()` - Valida items do orçamento

**Formatação:**
- `formatCurrency()` - Formata valores em euros
- `formatQuantityWithUnit()` - Quantidade com unidade (m², kg, L)
- `translateQuoteStatus()` - Traduz status para PT
- `translateOrderStatus()` - Traduz status para PT
- `getStatusColor()` - Cores Tailwind para badges

**Pesquisa/Filtros:**
- `filterMaterialsBySearch()` - Pesquisa em nome/descrição
- `sortMaterials()` - Ordenação por nome/preço/stock

### 4. **Remoções Feitas**
- ❌ Removido `@polar-sh/sdk` (pagamentos online)
- ❌ Removido `@polar-sh/better-auth` (integração pagamentos)
- ❌ Removido `pg` e `postgres` (drivers PostgreSQL)
- ❌ Removido `@types/pg`

---

## 🚧 **O QUE FALTA IMPLEMENTAR NO BACKEND**

### 1. **API Routes - Criar Endpoints** (PRIORIDADE ALTA)

#### **Materiais** (`src/app/api/materials/`)
```
GET    /api/materials           - Listar materiais
GET    /api/materials/[id]      - Detalhes de 1 material
POST   /api/materials           - Criar material (admin)
PUT    /api/materials/[id]      - Atualizar material (admin)
DELETE /api/materials/[id]      - Eliminar material (admin)
```

#### **Categorias** (`src/app/api/categories/`)
```
GET    /api/categories          - Listar categorias
GET    /api/categories/[id]     - Detalhes de 1 categoria
```

#### **Orçamentos** (`src/app/api/quotes/`)
```
GET    /api/quotes              - Listar orçamentos do user
POST   /api/quotes              - Criar pedido de orçamento
GET    /api/quotes/[id]         - Detalhes do orçamento
PATCH  /api/quotes/[id]         - Atualizar status (funcionário)
POST   /api/quotes/[id]/convert - Converter para encomenda
```

#### **Encomendas** (`src/app/api/orders/`)
```
GET    /api/orders              - Listar encomendas do user
GET    /api/orders/[id]         - Detalhes da encomenda
PATCH  /api/orders/[id]         - Atualizar status (funcionário)
```

#### **Reuniões** (`src/app/api/meetings/`)
```
GET    /api/meetings            - Listar reuniões
POST   /api/meetings            - Agendar reunião
GET    /api/meetings/[id]       - Detalhes da reunião
PATCH  /api/meetings/[id]       - Atualizar reunião
DELETE /api/meetings/[id]       - Cancelar reunião
```

### 2. **Autenticação Customizada** (PRIORIDADE ALTA)
Atualmente está a usar Better Auth com tabela `user`, mas a tua BD usa `utilizador`.

**Opções:**
1. **Adaptar Better Auth** para usar tabela `utilizador`
2. **Sistema custom** de login usando a tabela `utilizador`

**Ficheiros a criar:**
```
src/lib/auth-comfilar.ts         - Login/logout custom
src/app/api/auth/login/route.ts  - POST login endpoint
src/app/api/auth/logout/route.ts - POST logout endpoint
src/middleware.ts                 - Proteção de rotas
```

**Tarefas:**
- [ ] Hash de passwords (bcrypt)
- [ ] Sessions/JWT tokens
- [ ] Middleware de autenticação
- [ ] Role-based access (cliente/funcionario/admin)

### 3. **Gestão de Stock** (PRIORIDADE MÉDIA)
Quando uma encomenda é confirmada, reduzir stock automaticamente.

**Ficheiro a criar:**
```typescript
// src/lib/stock-manager.ts
export async function reduceStock(items: QuoteItem[])
export async function restoreStock(items: QuoteItem[])
export async function checkStockBeforeOrder(quoteId: number)
```

### 4. **Notificações/Emails** (PRIORIDADE BAIXA)
Enviar emails quando:
- Cliente cria pedido de orçamento → Email para funcionários
- Funcionário aprova orçamento → Email para cliente
- Encomenda muda de status → Email para cliente
- Reunião é agendada → Email para ambos

**Ferramentas sugeridas:**
- Resend (grátis até 3000 emails/mês)
- Nodemailer

### 5. **Upload de Imagens de Materiais** (PRIORIDADE MÉDIA)
Atualmente a tabela `material` não tem campo `image`. Podes:
1. Adicionar coluna `image TEXT` à tabela
2. Usar UploadThing (já instalado) para upload
3. Guardar URL da imagem no campo

**SQL a executar:**
```sql
ALTER TABLE material ADD COLUMN imagem TEXT;
```

**Schema a atualizar:**
```typescript
// src/db/schema/comfilar/tables-mysql.ts
export const materialsTable = mysqlTable("material", {
  // ... campos existentes
  image: text("imagem"), // ADICIONAR
});
```

### 6. **Dashboard Admin/Funcionário** (PRIORIDADE MÉDIA)
Endpoints para estatísticas:

```
GET /api/admin/stats - Dashboard com:
  - Total de orçamentos (pendente/aprovado/rejeitado)
  - Total de encomendas (por status)
  - Materiais com stock baixo
  - Reuniões agendadas esta semana
```

### 7. **Pesquisa e Filtros Avançados** (PRIORIDADE BAIXA)
```
GET /api/materials?search=ceramica&category=1&minPrice=10&maxPrice=100
GET /api/quotes?status=pendente&userId=5&startDate=2025-01-01
```

### 8. **Validação com Zod** (PRIORIDADE ALTA)
Criar schemas de validação para todos os endpoints:

```typescript
// src/lib/validations/comfilar.ts
export const createQuoteSchema = z.object({
  items: z.array(z.object({
    materialId: z.number(),
    quantity: z.number().min(1),
  })).min(1),
});

export const createMeetingSchema = z.object({
  date: z.date(),
  description: z.string().max(500).optional(),
});
```

### 9. **Testes Unitários** (PRIORIDADE BAIXA)
Criar testes para:
- Utility functions (cálculos, validações)
- Query helpers
- API endpoints

---

## 📝 **PRÓXIMOS PASSOS RECOMENDADOS**

### **Fase 1: Configuração Inicial (1-2 dias)**
1. ✅ Configurar `.env.local` com tua DATABASE_URL MySQL
2. ✅ Executar `bun db:push` para verificar conexão
3. ✅ Executar `bun db:studio` para visualizar dados

### **Fase 2: Autenticação (2-3 dias)**
4. Criar sistema de login custom com tabela `utilizador`
5. Implementar middleware de proteção de rotas
6. Criar páginas de login/register

### **Fase 3: API Core (3-5 dias)**
7. Implementar todos os endpoints de Materiais
8. Implementar endpoints de Orçamentos
9. Implementar endpoints de Encomendas
10. Implementar endpoints de Reuniões

### **Fase 4: Features Adicionais (5-7 dias)**
11. Sistema de gestão de stock
12. Upload de imagens de materiais
13. Notificações por email
14. Dashboard admin

### **Fase 5: Frontend (10-15 dias)**
15. Páginas de listagem de materiais
16. Carrinho de compras
17. Formulário de pedido de orçamento
18. Dashboard de cliente
19. Dashboard de funcionário/admin

---

## 🔧 **COMANDOS ÚTEIS**

```bash
# Verificar conexão à BD
bun db:push

# Ver/editar dados na BD
bun db:studio

# Executar servidor de desenvolvimento
bun dev

# Verificar erros TypeScript
bun check
```

---

## 📊 **PROGRESSO GERAL**

| Componente | Status | Progresso |
|------------|--------|-----------|
| **Database Schema** | ✅ Completo | 100% |
| **Query Helpers** | ✅ Completo | 100% |
| **Utility Functions** | ✅ Completo | 100% |
| **API Endpoints** | ❌ Por fazer | 0% |
| **Autenticação** | ❌ Por fazer | 0% |
| **Gestão de Stock** | ❌ Por fazer | 0% |
| **Upload de Imagens** | ❌ Por fazer | 0% |
| **Emails** | ❌ Por fazer | 0% |
| **Frontend** | ❌ Por fazer | 0% |

**Total Backend: ~35% Completo**

---

## 💡 **RECOMENDAÇÕES FINAIS**

1. **Primeiro:** Configura a conexão MySQL e testa com `bun db:push`
2. **Segundo:** Implementa autenticação (fundamental)
3. **Terceiro:** Cria os API endpoints um por um
4. **Quarto:** Testa cada endpoint no Postman/Insomnia
5. **Quinto:** Começa o frontend com os endpoints prontos

**Quer que comece a implementar alguma destas funcionalidades? Posso começar pelos API endpoints ou pelo sistema de autenticação!**
