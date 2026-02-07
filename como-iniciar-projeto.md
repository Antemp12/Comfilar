# Como iniciar o projeto (Comfilar)

Este guia explica como iniciar o projeto num computador que já tem o código.

## 1) Pré-requisitos

- **Node.js** (versão LTS)
- **Bun** (recomendado, usado no projeto)
- **MySQL** (ou acesso a uma base MySQL remota)

## 2) Entrar na pasta do projeto

```bash
cd comfilar
```

## 3) Instalar dependências

```bash
bun install
```

## 4) Configurar variáveis de ambiente

```bash
copy .env.example .env
```

Edita o `.env` e configura a ligação à base de dados:

```
DATABASE_URL="mysql://root:SUA_PASSWORD@localhost:3306/comfilar"
```

## 5) Preparar a base de dados (Drizzle)

```bash
bun db:push
```

Se precisares de dados de exemplo:

```bash
bun db:seed
```

## 6) Executar o projeto

```bash
bun dev
```

## 7) Aceder no navegador

- Abre o browser em `http://localhost:3000`.

---

Se não tiveres o Bun instalado, podes instalar com:

```bash
powershell -c "irm bun.sh/install.ps1 | iex"
```
