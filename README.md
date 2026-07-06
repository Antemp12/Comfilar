
# Comfilar

Plataforma para gerir **orçamentos e pedidos de materiais de construção**, construída com **Next.js 15** (App Router + Turbopack), **Drizzle ORM** sobre **MySQL** e autenticação com **Better Auth**.

---

## Stack

| Camada        | Tecnologia                                   |
| ------------- | -------------------------------------------- |
| Framework     | Next.js 15 (React 19, App Router, Turbopack) |
| Base de dados | MySQL + Drizzle ORM                          |
| Autenticação  | Better Auth                                  |
| UI            | Tailwind CSS 4 + shadcn/ui + Radix           |
| Email         | Resend                                       |
| Uploads       | UploadThing                                  |
| Runtime       | Bun (recomendado)                            |

---

## 1. Pré-requisitos

- **[Bun](https://bun.sh)** 1.3+ (gestor de pacotes e runtime usado pelo projeto)
- **[Node.js](https://nodejs.org)** LTS (22+) — necessário para alguns scripts
- **[XAMPP](https://www.apachefriends.org/)** (fornece o MySQL/MariaDB usado pelo projeto)

> 💡 Este projeto usa o **MySQL do XAMPP**. Basta abrir o **XAMPP Control Panel** e clicar em **Start** no módulo **MySQL** — não é preciso instalar MySQL à parte.

### Instalar Bun

**Windows (PowerShell):**

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

**Linux / macOS:**

```bash
curl -fsSL https://bun.sh/install | bash
```

Verificar:

```bash
bun --version
node --version
```

---

## 2. Instalar dependências

A partir da raiz do projeto:

```bash
bun install
```

---

## 3. Configurar variáveis de ambiente

O projeto lê o ficheiro **`.env.local`**. Cria-o (ou edita o existente) com:

```env
# URL pública e do servidor (tem de coincidir com a porta onde a app corre)
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_SERVER_APP_URL=http://localhost:3000

# Ligação MySQL do XAMPP — por defeito o XAMPP usa o utilizador "root" SEM password
DATABASE_URL="mysql://root:@localhost:3306/comfilar"

# Better Auth (gera um segredo aleatório, ex.: openssl rand -base64 32)
BETTER_AUTH_SECRET="coloca-aqui-um-segredo-forte"
BETTER_AUTH_URL=http://localhost:3000
AUTH_SECRET="coloca-aqui-um-segredo-forte"

# Email (Resend) — opcional para desenvolvimento local
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
```

> ⚠️ **Atenção à porta:** o comando `bun dev` arranca em **`http://localhost:3000`** por defeito.
> Garante que `NEXT_PUBLIC_APP_URL`, `NEXT_SERVER_APP_URL` e `BETTER_AUTH_URL` apontam todos para a **mesma porta**, senão a autenticação falha.

---

## 4. Preparar a base de dados

Com o **MySQL do XAMPP iniciado**, abre o **phpMyAdmin** (http://localhost/phpmyadmin) e cria a base de dados `comfilar` (uma vez). Ou, em alternativa, importa diretamente o dump SQL incluído **`comfilar.sql`** pelo phpMyAdmin (separador *Importar*) — isto já cria as tabelas.

Se preferires criar/atualizar o schema pelo Drizzle:

```bash
bun db:push
```

### (Opcional) Dados de exemplo

```bash
bun db:seed          # categorias e materiais de exemplo
bun run scripts/create-admin.ts        # criar um utilizador admin
bun run scripts/create-catalogs.ts     # popular catálogos
```

---

## 5. Arrancar o projeto

```bash
bun dev
```

Abre o browser em **http://localhost:3000**.

---

## Comandos disponíveis

| Comando          | O que faz                                                       |
| ---------------- | -------------------------------------------------------------- |
| `bun dev`        | Servidor de desenvolvimento (Turbopack) em `localhost:3000`    |
| `bun run build`  | Build de produção                                              |
| `bun db:push`    | Aplica o schema Drizzle à base de dados                        |
| `bun db:studio`  | Abre o Drizzle Studio (GUI da base de dados)                   |
| `bun db:seed`    | Popula a base de dados com dados de exemplo                    |
| `bun db:auth`    | Gera/sincroniza o schema de autenticação                       |
| `bun check`      | Type-check, lint (ESLint + Biome) e knip                       |
| `bun tests`      | Corre os testes em `./.tests`                                  |
| `bun run ui`     | Adiciona componentes shadcn/ui                                 |

---

## Estrutura do projeto

```
src/
├── app/         # Rotas e páginas (App Router)
├── config/      # Configuração da aplicação
├── context/     # React contexts
├── css/         # Estilos globais
├── db/          # Drizzle: schema, seed, ligação
├── lib/         # Utilitários e auth
├── ui/          # Componentes de interface
└── middleware.ts
scripts/         # Scripts utilitários (admin, catálogos, funcionários)
drizzle/         # Migrações geradas pelo Drizzle
```

---

## Resolução de problemas

- **Erro de ligação à base de dados:** confirma que o módulo **MySQL** está em **Start** no XAMPP Control Panel e que a base `comfilar` existe no phpMyAdmin.
- **Login/autenticação falha:** verifica que todas as variáveis de URL apontam para a mesma porta da app.
- **Porta 3000 ocupada:** podes arrancar noutra porta com `bun dev --port 3001` (atualiza também as variáveis de ambiente).
