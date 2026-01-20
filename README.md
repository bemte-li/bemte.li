<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="frontend/public/Logo-Horizontal-White.svg">
    <source media="(prefers-color-scheme: light)" srcset="frontend/public/Logo-Horizontal.svg">
    <img src="frontend/public/Logo-Horizontal.svg" alt="Bemte.li Logo" width="400">
  </picture>
</div>

> Uma alternativa de niusleter 100% brasileira, gratuita e de código aberto.

## O que é o Bemte.li?

O Bemte.li não é uma plataforma, nem um aplicativo. Não tem anúncios, não tem empresários, não tem visão de lucro. Não é uma rede social algoritmizada e algoritmizável. **O Bemte.li envia e-mails e arquiva seus conteúdos num endereço na Internet.**

Este projeto nasce da convicção (ingênua, porém convicção) de **fazer algo, na internet, que ruma na contramão do feudalismo digital.** Desenvolvido por três pessoas – uma designer, um programador e um escritor – com vontade de resgatar um canto da internet que foi desmantelado pelo capitalismo de plataforma.

### Nossa Filosofia

- **Contra o capitalismo de plataforma**: Substack não é sinônimo de niusleter
- **Internet feita pelas pessoas comuns**: Não por grandes empresas privadas
- **Código aberto e transparente**: Como quem te oferece um pedaço de bolo e logo te dá a receita
- **Processo humano**: Sem pressa e sem pausa, no tempo que tiver que ser
- **Independência técnica**: Hospedamos nosso próprio servidor de e-mail
- **Arrecadação coletiva**: Sem anúncios, sem visão de lucro

## 🛠 Stack Tecnológico

### Frontend
- **Next.js 14** - Framework React para produção
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS utilitário
- **TipTap** - Editor de texto rico

### Backend
- **Go** - Linguagem de programação
- **PocketBase** - Backend-as-a-Service em Go
- **SQLite** - Banco de dados
- **Stalwart Mail Server** - Servidor de e-mail próprio

### Infraestrutura
- **Docker & Docker Compose** - Containerização
- **Nginx** - Proxy reverso e servidor web
- **Let's Encrypt** - Certificados SSL/TLS
- **SMTP4Dev** - Servidor de e-mail para desenvolvimento

## 🚀 Como Começar

### Pré-requisitos

- Docker e Docker Compose
- Make (para comandos automatizados)
- Node.js 18+ (opcional, para desenvolvimento local)

### Configuração Inicial

1. **Clone o repositório:**
```bash
git clone https://github.com/bemte-li/bemte.li.git
cd bemte.li
```

2. **Inicie o ambiente de desenvolvimento:**
```bash
make dev
```

### Acessando os Serviços

Após iniciar o ambiente, você pode acessar:

- **Frontend**: http://localhost:3030
- **API Backend**: http://localhost:8090/_/
- **Interface de E-mail**: http://localhost:8025

## 📋 Comandos Make

| Comando | Descrição |
|---------|-----------|
| `make help` | Mostra todos os comandos disponíveis |
| `make dev` | Inicia o ambiente de desenvolvimento |
| `make down` | Para o ambiente de desenvolvimento |
| `make restart` | Reinicia o ambiente de desenvolvimento |
| `make logs` | Mostra logs de todos os containers |
| `make frontend-logs` | Mostra logs do frontend |
| `make backend-logs` | Mostra logs do backend |
| `make mail-logs` | Mostra logs do servidor de e-mail |
| `make clean` | Limpa completamente o ambiente (requer sudo) |
| `make test` | Executa os testes |
| `make lint` | Executa os linters |
| `make squash-migrations` | Compacta as migrações do banco |

## 🔧 Desenvolvimento

### Usuário de Desenvolvimento

No modo de desenvolvimento, uma conta de superusuário é criada automaticamente:
- **E-mail**: dev@bemte.li
- **Senha**: dev1234567

### Fluxo de Trabalho

- O frontend roda em modo de desenvolvimento com hot-reloading
- O backend usa Air para hot-reloading automático
- Migrações do banco são aplicadas automaticamente
- Mudanças no código são refletidas automaticamente

### Estrutura do Projeto

```
bemteli/
├── frontend/          # Aplicação Next.js
│   ├── src/
│   │   ├── app/      # App Router do Next.js
│   │   ├── components/ # Componentes React
│   │   └── lib/      # Utilitários e configurações
├── backend/          # API PocketBase em Go
│   ├── internal/     # Código interno da aplicação
│   ├── migrations/   # Migrações do banco de dados
│   └── pb_data/     # Dados do PocketBase
├── docker/          # Configurações Docker
│   ├── nginx/       # Configurações do Nginx
│   └── scripts/     # Scripts de automação
└── terraform/       # Infraestrutura como código
```

## 🤝 Como contribuir

- **Reportar bugs**: Se você encontrar um problema, abra uma issue.

Por enquanto este projeto é mantido por um único desenvolvedor. Tenha paciência. E se você quiser contribuir, fique à vontade.

## 📝 Licença

Este projeto é de código aberto. A licença específica será definida em breve.

## 📞 Contato

- **Site**: [bemte.li](https://bemte.li)
- **GitHub**: [github.com/bemte-li/bemte.li](https://github.com/bemte-li/bemte.li)
- **E-mail**: [nos@bemte.li](mailto:nos@bemte.li)
