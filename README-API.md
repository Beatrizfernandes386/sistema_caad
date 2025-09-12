# 🚀 Sistema CAAD - Guia de Configuração e Teste

## 📋 Visão Geral
O Sistema CAAD foi completamente migrado para uma arquitetura **Backend API + Banco de Dados**, removendo a dependência do `localStorage` e implementando uma solução robusta e escalável.

## ⚙️ Configuração Centralizada da API

### Arquivo `config.js`
```javascript
const API_CONFIG = {
  BASE_URL: 'http://localhost',  // ← ALTERE AQUI PARA MUDAR A URL
  PORT: 3000,                    // ← ALTERE AQUI PARA MUDAR A PORTA

  // URL completa gerada automaticamente
  get API_URL() {
    return `${this.BASE_URL}:${this.PORT}`;
  }
};
```

### Como Alterar URL e Porta
1. **Para desenvolvimento local:** Mantenha `http://localhost:3000`
2. **Para produção:** Altere `BASE_URL` para o domínio do servidor
3. **Para porta diferente:** Altere o valor de `PORT`

**Exemplo para produção:**
```javascript
BASE_URL: 'https://api.meusistema.com',
PORT: 443,
```

## 🛠️ Instalação e Configuração

### 1. Instalar Dependências
```bash
cd backend
npm install express cors bcryptjs jsonwebtoken better-sqlite3
```

### 2. Criar Usuários Iniciais
```bash
node create-users.js
```

### 3. Iniciar Servidor
```bash
node server.js
```

### 4. Acessar Sistema
- **Aplicação:** Abrir `index.html` no navegador
- **Testes:** Abrir `test-api.html` para testar APIs

## 🔑 Credenciais de Acesso

| Usuário | E-mail | Senha | Permissões |
|---------|--------|-------|------------|
| Admin | `admin@caad.com` | `caad110207` | Total |
| Viewer | `visual@caad.com` | `caad110207` | Leitura |

## 🧪 Teste das Funcionalidades

### Página de Teste (`test-api.html`)
Use a página `test-api.html` para testar todas as APIs:

1. **Testar Conexão** - Verifica se o servidor está online
2. **SIM Cards Disponíveis** - Testa se os chips cadastrados aparecem
3. **Equipamentos Novos** - Lista equipamentos disponíveis
4. **Clientes Ativos** - Lista clientes cadastrados
5. **Autenticação** - Testa login e geração de token

### Problema dos Chips Não Aparecendo

Se os chips não estiverem aparecendo no cadastro de clientes:

1. **Verifique o status no banco:**
   - Chips devem ter status `'available'` ou `'DISPONÍVEL'`
   - A API busca por ambos os formatos

2. **Teste via página de teste:**
   - Abra `test-api.html`
   - Clique em "Carregar SIM Cards Disponíveis"
   - Se aparecer uma lista vazia, cadastre chips no módulo de estoque

3. **Verificação no banco de dados:**
   ```sql
   SELECT * FROM sim_cards WHERE status IN ('available', 'DISPONÍVEL');
   ```

## 📊 APIs Disponíveis

### Autenticação
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Informações do usuário
- `POST /api/auth/logout` - Logout

### Clientes
- `GET /api/clients/active` - Clientes ativos
- `GET /api/clients/canceled` - Clientes cancelados
- `POST /api/clients` - Criar cliente
- `PUT /api/clients/:id` - Atualizar cliente
- `DELETE /api/clients/:id` - Excluir cliente

### Inventário
- `GET /api/inventory/new` - Equipamentos novos
- `GET /api/inventory/used` - Equipamentos usados
- `GET /api/inventory/sim-cards` - Todos os chips
- `GET /api/inventory/lost` - Equipamentos perdidos
- `GET /api/inventory/available-imeis` - IMEIs disponíveis
- `GET /api/inventory/available-sim-cards` - Chips disponíveis
- `POST /api/inventory/equipment` - Cadastrar equipamento
- `POST /api/inventory/sim-card` - Cadastrar chip

### Planos
- `GET /api/plans` - Todos os planos
- `POST /api/plans` - Criar plano
- `PUT /api/plans/:id` - Atualizar plano
- `DELETE /api/plans/:id` - Excluir plano

### Sinistros
- `GET /api/claims` - Todos os sinistros
- `POST /api/claims` - Criar sinistro
- `PUT /api/claims/:id` - Atualizar sinistro
- `DELETE /api/claims/:id` - Excluir sinistro
- `GET /api/claims/search/:query` - Buscar sinistros

### Logs
- `GET /api/logs` - Todos os logs
- `GET /api/logs/stats` - Estatísticas dos logs

## 🔧 Estrutura do Banco de Dados

### Tabelas Principais
- `users` - Usuários do sistema
- `clients` - Clientes (ativos e cancelados)
- `equipment_new` - Equipamentos novos
- `equipment_used` - Equipamentos usados
- `sim_cards` - Chips SIM
- `lost_equipment` - Equipamentos perdidos
- `plans` - Planos de serviço
- `claims` - Sinistros
- `logs` - Logs de auditoria

## 🚨 Solução de Problemas

### Erro: "Cannot find module"
```bash
# No diretório backend
npm install
```

### Erro: "Porta já em uso"
```bash
# Mude a porta no config.js ou mate o processo
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Erro: "SIM Cards não aparecem"
1. Verifique se os chips foram cadastrados
2. Confirme o status dos chips no banco
3. Teste via `test-api.html`

### Erro: "Token expirado"
- Faça login novamente
- Tokens expiram em 24 horas

## 📈 Melhorias Implementadas

### ✅ Centralização de Configuração
- URL e porta da API em um único local
- Fácil alteração para diferentes ambientes

### ✅ Correção do Bug dos Chips
- API agora busca por múltiplos formatos de status
- Compatibilidade com dados existentes

### ✅ Sistema de Testes
- Página dedicada para testar todas as APIs
- Verificação visual do status do sistema

### ✅ Segurança Aprimorada
- JWT tokens com expiração
- Controle de permissões por role
- Logs de auditoria completos

## 🎯 Próximos Passos

1. **Teste completo** usando `test-api.html`
2. **Verifique os chips** no cadastro de clientes
3. **Configure a URL** para o ambiente de produção
4. **Implemente backup** do banco de dados
5. **Configure HTTPS** para produção

---

**Sistema pronto para produção!** 🚀