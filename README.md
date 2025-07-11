# 💰 Gestor Financeiro Compartilhado

Sistema fullstack moderno para gestão financeira pessoal compartilhada, ideal para casais. Desenvolvido com Django (DRF) no backend e React no frontend.

## 🚀 Funcionalidades

### ✅ Implementadas
- **Sistema de Autenticação Completo**
  - Login e registro de usuários
  - Recuperação de senha
  - Autenticação JWT
  - Gestão de perfil

- **Arquitetura Backend (Django + DRF)**
  - Modelos completos para gestão financeira
  - API REST com endpoints especializados
  - Sistema de autenticação JWT
  - Validações e serializers customizados

- **Interface Frontend (React)**
  - Layout responsivo com CSS puro
  - Sistema de rotas protegidas
  - Componentes reutilizáveis
  - Contextos para gerenciamento de estado

### 🚧 Em Desenvolvimento
- Lançamento de receitas e despesas
- Categorias dinâmicas
- Controle de caixa
- Planejamento futuro (4 meses)
- Relatórios e exportação
- Métricas e dashboards

## 🛠️ Tecnologias Utilizadas

### Backend
- **Django 5.2.4** - Framework web
- **Django REST Framework** - API REST
- **Django REST Framework SimpleJWT** - Autenticação JWT
- **Django CORS Headers** - Configuração CORS
- **SQLite** - Banco de dados (desenvolvimento)
- **Python 3.11** - Linguagem de programação

### Frontend
- **React 19.1.0** - Biblioteca JavaScript
- **React Router DOM** - Roteamento
- **Axios** - Cliente HTTP
- **Lucide React** - Ícones
- **CSS Puro** - Estilização (sem frameworks CSS)
- **Vite** - Build tool

## 📋 Pré-requisitos

- Python 3.11+
- Node.js 20+
- pnpm (gerenciador de pacotes)

## 🔧 Instalação e Configuração

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd gestor-financeiro
```

### 2. Configuração do Backend

```bash
# Criar e ativar ambiente virtual
python3.11 -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate     # Windows

# Instalar dependências
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers python-decouple reportlab python-dateutil

# Aplicar migrações
python manage.py migrate

# Criar superusuário (opcional)
python manage.py createsuperuser

# Iniciar servidor backend
python manage.py runserver 0.0.0.0:8000
```

### 3. Configuração do Frontend

```bash
# Navegar para o diretório frontend
cd frontend

# Instalar dependências
pnpm install

# Iniciar servidor de desenvolvimento
pnpm run dev --host
```

## 🌐 Acesso à Aplicação

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api
- **Admin Django**: http://localhost:8000/admin

## 📁 Estrutura do Projeto

```
gestor-financeiro/
├── backend/                 # Configurações Django
├── authentication/         # App de autenticação
├── financial/              # App financeiro principal
├── reports/                # App de relatórios
├── frontend/               # Aplicação React
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── contexts/       # Contextos React
│   │   ├── pages/          # Páginas da aplicação
│   │   ├── services/       # Serviços de API
│   │   └── utils/          # Utilitários e rotas
├── venv/                   # Ambiente virtual Python
├── manage.py               # Script de gerenciamento Django
└── README.md               # Este arquivo
```

## 🔑 Endpoints da API

### Autenticação
- `POST /api/auth/register/` - Registro de usuário
- `POST /api/auth/login/` - Login
- `POST /api/auth/token/refresh/` - Renovar token
- `GET /api/auth/profile/` - Perfil do usuário
- `PATCH /api/auth/profile/update/` - Atualizar perfil

### Financeiro
- `GET /api/financial/categories/` - Listar categorias
- `GET /api/financial/incomes/` - Listar receitas
- `GET /api/financial/expenses/` - Listar despesas
- `GET /api/financial/cashflow/` - Fluxo de caixa
- `GET /api/financial/metrics/` - Métricas financeiras
- `GET /api/financial/planning/` - Planejamento futuro

## 🎨 Características do Design

- **CSS Puro**: Sem frameworks CSS, seguindo especificação do projeto
- **Responsivo**: Funciona em desktop e mobile
- **Acessível**: Componentes com suporte a acessibilidade
- **Modular**: Componentes reutilizáveis com CSS individual

## 🔐 Segurança

- Autenticação JWT com refresh tokens
- Validações no backend e frontend
- Proteção CORS configurada
- Rotas protegidas no frontend
- Sanitização de dados

## 📱 Funcionalidades Planejadas

### Lançamentos
- [x] Receitas (Fixa, Única, Parcelada)
- [x] Despesas (Fixa, Única, Parcelada)
- [x] Categorização dinâmica
- [x] Responsável (Pessoa 1, Pessoa 2, Ambos)

### Controle
- [x] Caixa inicial
- [x] Marcação de pagamentos
- [x] Status (Pago, Pendente, Atrasado)

### Planejamento
- [x] Projeção de 4 meses
- [x] Saldos futuros
- [x] Controle de parcelas

### Relatórios
- [x] Métricas em tempo real
- [x] Exportação JSON
- [x] Relatórios PDF
- [x] Backup de dados

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👥 Autores

- **Desenvolvedor Principal** - Implementação completa do sistema

## 🆘 Suporte

Para suporte, abra uma issue no repositório ou entre em contato através dos canais oficiais.

---

**Nota**: Este é um projeto em desenvolvimento ativo. Algumas funcionalidades podem estar em fase de implementação.

