# 🔐 SISTEMA DE AUTENTICAÇÃO COMFILAR

## ✅ Implementado

Sistema de autenticação completo com:
- ✅ Hashing de passwords com bcryptjs
- ✅ Login/Register/Logout
- ✅ Token-based authentication
- ✅ Cookies seguros (HttpOnly)
- ✅ Validação de permissões por role
- ✅ Gestão de utilizadores (admin)

---

## 📋 API ENDPOINTS

### **1. LOGIN**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "cliente@example.com",
  "password": "password123"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "user": {
    "id": 1,
    "email": "cliente@example.com",
    "name": "João Silva",
    "type": "cliente"
  },
  "token": "base64_token_here"
}
```

**Nota:** O token é guardado automaticamente em cookie `auth_token`

---

### **2. REGISTER (Cliente)**
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "password123",
  "type": "cliente"  // opcional, default é "cliente"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Utilizador criado com sucesso",
  "user": {
    "id": 2,
    "email": "joao@example.com",
    "name": "João Silva",
    "type": "cliente"
  }
}
```

---

### **3. GET UTILIZADOR AUTENTICADO**
```http
GET /api/auth/me
Authorization: Bearer token_here
```

**Resposta:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "cliente@example.com",
    "name": "João Silva",
    "type": "cliente",
    "registrationDate": "2025-01-01T10:00:00Z"
  }
}
```

---

### **4. LOGOUT**
```http
POST /api/auth/logout
```

**Resposta:**
```json
{
  "success": true,
  "message": "Logout realizado com sucesso"
}
```

**Nota:** Remove cookie `auth_token`

---

## 👨‍💼 ADMIN - GESTÃO DE UTILIZADORES

### **5. LISTAR TODOS OS UTILIZADORES** (Admin only)
```http
GET /api/admin/users
Authorization: Bearer admin_token_here
```

**Resposta:**
```json
{
  "success": true,
  "users": [
    {
      "id": 1,
      "email": "admin@example.com",
      "name": "Admin",
      "type": "admin",
      "registrationDate": "2025-01-01T10:00:00Z"
    },
    {
      "id": 2,
      "email": "func@example.com",
      "name": "Funcionário",
      "type": "funcionario",
      "registrationDate": "2025-01-02T10:00:00Z"
    }
  ]
}
```

---

### **6. CRIAR NOVO UTILIZADOR** (Admin only)
```http
POST /api/admin/users
Authorization: Bearer admin_token_here
Content-Type: application/json

{
  "name": "Novo Funcionário",
  "email": "novo@example.com",
  "password": "password123",
  "type": "funcionario"  // cliente, funcionario, ou admin
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Utilizador criado com sucesso",
  "user": {
    "id": 5,
    "email": "novo@example.com",
    "name": "Novo Funcionário",
    "type": "funcionario"
  }
}
```

---

### **7. ELIMINAR UTILIZADOR** (Admin only)
```http
DELETE /api/admin/users/5
Authorization: Bearer admin_token_here
```

**Resposta:**
```json
{
  "success": true,
  "message": "Utilizador eliminado com sucesso"
}
```

---

### **8. ATUALIZAR TIPO DE UTILIZADOR** (Admin only)
```http
PATCH /api/admin/users/5
Authorization: Bearer admin_token_here
Content-Type: application/json

{
  "type": "admin"  // cliente, funcionario, ou admin
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Tipo de utilizador atualizado com sucesso",
  "user": {
    "id": 5,
    "email": "novo@example.com",
    "name": "Novo Funcionário",
    "type": "admin"
  }
}
```

---

## 🔑 Como Usar o Token

### **Opção 1: Header Authorization**
```http
GET /api/auth/me
Authorization: Bearer your_token_here
```

### **Opção 2: Cookie (Automático)
O token é guardado em cookie `auth_token` automaticamente no login.
O navegador envia-o automaticamente em todas as requisições.

---

## 🚨 Códigos de Erro

| Status | Mensagem | Significado |
|--------|----------|-------------|
| 400 | Dados inválidos | Schema validation falhou |
| 401 | Não autenticado | Token em falta ou inválido |
| 403 | Acesso negado | User não tem permissão para esta ação |
| 404 | Utilizador não encontrado | ID do utilizador não existe |
| 409 | Email já registado | Email já existe na BD |
| 500 | Erro ao fazer login | Erro no servidor |

---

## 📊 Tipos de Utilizador

### **Cliente**
- Pode ver catálogo de materiais
- Pode criar orçamentos
- Pode ver seus orçamentos e encomendas
- Pode agendar reuniões
- Acesso: `/dashboard/cliente`

### **Funcionário**
- Tudo que cliente pode (exceto criar orçamentos proprios)
- Pode aprovar/rejeitar orçamentos
- Pode atualizar status de encomendas
- Pode ver todas as reuniões
- Acesso: `/dashboard/funcionario`

### **Admin**
- Tudo que funcionário pode
- Pode criar/eliminar/atualizar utilizadores
- Pode gerir materiais (CRUD)
- Pode gerir categorias
- Acesso: `/dashboard/admin`

---

## 🔐 Segurança

- ✅ Passwords hasheadas com bcryptjs (10 salt rounds)
- ✅ Tokens HTTP-only (não acessíveis por JavaScript)
- ✅ Secure flag em cookies (HTTPS em produção)
- ✅ Validação de token em cada requisição
- ✅ SameSite=Lax para proteção contra CSRF

---

## 📝 Próximos Passos

1. ✅ Sistema de autenticação completo
2. ⬜ Criar API endpoints para materiais (com variações + imagens)
3. ⬜ Criar API endpoints para orçamentos
4. ⬜ Sistema de notificações (email + site)
5. ⬜ Frontend pages (cliente/funcionário/admin)

---

## 🧪 Teste com Postman/Insomnia

**1. Register como cliente:**
```
POST http://localhost:3000/api/auth/register
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "123456",
  "type": "cliente"
}
```

**2. Login:**
```
POST http://localhost:3000/api/auth/login
{
  "email": "joao@example.com",
  "password": "123456"
}
```

**3. Guardar o token da resposta e usar:**
```
GET http://localhost:3000/api/auth/me
Authorization: Bearer <token_aqui>
```

**4. Logout:**
```
POST http://localhost:3000/api/auth/logout
```

---

**Autenticação está pronta! 🎉**

Próximo passo: **Criar endpoints para Materiais (com variações + imagens)**

Quer que comece? 🚀
