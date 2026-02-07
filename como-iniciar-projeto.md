# Como iniciar o projeto (Comfilar)

Este guia explica como iniciar o projeto num computador que já tem o código.

## 1) Pré-requisitos

- **Node.js** (versão LTS) - inclui npm
- **Bun** (recomendado, usado no projeto)
- **MySQL** (ou acesso a uma base MySQL remota)

### Instalar Node.js (se ainda não tiver)

1. Acede a [https://nodejs.org/](https://nodejs.org/)
2. Descarrega a versão **LTS (Long Term Support)**
3. Executa o instalador (npm vem incluído)
4. Verifica a instalação:

```bash
node --version
npm --version
```

### Instalar Bun (se ainda não tiver)

No Windows (PowerShell):

```bash
powershell -c "irm bun.sh/install.ps1 | iex"
```

No Linux/macOS:

```bash
curl -fsSL https://bun.sh/install | bash
```

### Instalar MySQL (se ainda não tiver)

**Windows:**
1. Acede a [https://dev.mysql.com/downloads/installer/](https://dev.mysql.com/downloads/installer/)
2. Descarrega o MySQL Installer
3. Executa e instala o MySQL Server
4. Durante a instalação, define uma password para o utilizador root

**Linux (Ubuntu/Debian):**

```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

**macOS (com Homebrew):**

```bash
brew install mysql
brew services start mysql
```

### Instalar Apache (opcional, para produção)

**Windows:**
1. Acede a [https://www.apachelounge.com/download/](https://www.apachelounge.com/download/)
2. Descarrega a versão mais recente do Apache
3. Extrai para `C:\Apache24`
4. Abre PowerShell como Administrador e executa:

```bash
cd C:\Apache24\bin
.\httpd.exe -k install
.\httpd.exe -k start
```

**Linux (Ubuntu/Debian):**

```bash
sudo apt update
sudo apt install apache2
sudo systemctl start apache2
sudo systemctl enable apache2
```

**macOS (com Homebrew):**

```bash
brew install httpd
brew services start httpd
```

> **Nota:** Para desenvolvimento local, não é necessário Apache pois o Next.js tem servidor próprio (`bun dev`). Apache é útil apenas para ambientes de produção.

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
