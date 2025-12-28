# Arquitetura de Banco de Dados - AccessPass Network

## Visão Geral

Este documento descreve a arquitetura de banco de dados do AccessPass Network implementada no Supabase com PostgreSQL.

**Stack:** Supabase (PostgreSQL 13+) com Row Level Security (RLS) habilitado

---

## Estrutura de Tabelas

### 1. `profiles`

Perfis de usuários que estendem a tabela `auth.users` do Supabase.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | PK, FK para `auth.users.id` |
| `name` | TEXT | Nome completo do usuário |
| `email` | TEXT | Email único |
| `role` | ENUM | `admin`, `company` ou `client` |
| `avatar` | TEXT | URL da foto de perfil |
| `is_active` | BOOLEAN | Status ativo/inativo (padrão: `true`) |
| `company_id` | UUID | FK para `companies.id` (nullable) |
| `member_code` | TEXT | Código único do membro (gerado automaticamente para clientes) |
| `birth_date` | DATE | Data de nascimento (nullable) |
| `phone` | TEXT | Telefone (nullable) |
| `created_at` | TIMESTAMPTZ | Data de criação |
| `updated_at` | TIMESTAMPTZ | Data de atualização |

**Índices:**
- `idx_profiles_role` em `role`
- `idx_profiles_email` em `email`
- `idx_profiles_member_code` em `member_code`
- `idx_profiles_company_id` em `company_id`
- `idx_profiles_is_active` em `is_active`

---

### 2. `companies`

Empresas parceiras que oferecem benefícios.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | PK |
| `slug` | TEXT | Identificador URL-friendly único |
| `name` | TEXT | Nome da empresa |
| `description` | TEXT | Descrição da empresa (nullable) |
| `benefit` | TEXT | Desconto/benefício oferecido |
| `address` | TEXT | Endereço completo |
| `image` | TEXT | URL da imagem (nullable) |
| `is_active` | BOOLEAN | Status ativo/inativo (padrão: `true`) |
| `created_at` | TIMESTAMPTZ | Data de criação |
| `updated_at` | TIMESTAMPTZ | Data de atualização |

**Índices:**
- `idx_companies_slug` em `slug`
- `idx_companies_is_active` em `is_active`
- `idx_companies_name` em `name`
- `idx_companies_search` - Full-text search em português

---

### 3. `validation_logs`

Histórico de validações de acesso dos clientes.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | PK |
| `company_id` | UUID | FK para `companies.id` |
| `client_id` | UUID | FK para `profiles.id` |
| `status` | ENUM | `success` ou `rejected` |
| `validated_by` | UUID | FK para `profiles.id` (usuário que validou) |
| `created_at` | TIMESTAMPTZ | Data/hora da validação |

**Índices:**
- `idx_validation_logs_company` em `company_id`
- `idx_validation_logs_client` em `client_id`
- `idx_validation_logs_created_at` em `created_at DESC`
- `idx_validation_logs_status` em `status`
- `idx_validation_logs_validated_by` em `validated_by`
- Índices compostos para queries otimizadas

---

## Políticas RLS (Row Level Security)

### Tabela: `profiles`

| Política | Operação | Quem | Regra |
|----------|----------|------|-------|
| Admins have full access | ALL | Admin | Admins têm acesso total |
| Users can view own profile | SELECT | Autenticado | Pode ver próprio perfil |
| Users can update own profile | UPDATE | Autenticado | Pode editar próprio perfil (exceto role) |
| Company users can view all clients | SELECT | Company | Pode ver todos os clientes |

### Tabela: `companies`

| Política | Operação | Quem | Regra |
|----------|----------|------|-------|
| Anyone can view active companies | SELECT | Autenticado | Pode ver empresas ativas |
| Admins have full access | ALL | Admin | Admins têm acesso total |
| Company users can view own company | SELECT | Company | Pode ver própria empresa |
| Company users can update own company | UPDATE | Company | Pode editar própria empresa |

### Tabela: `validation_logs`

| Política | Operação | Quem | Regra |
|----------|----------|------|-------|
| Admins can view all logs | SELECT | Admin | Visualiza todos os logs |
| Company users can view own logs | SELECT | Company | Visualiza logs da própria empresa |
| Company users can create logs | INSERT | Company | Cria logs para própria empresa |
| Clients can view own logs | SELECT | Client | Visualiza próprio histórico |
| Only admins can delete logs | DELETE | Admin | Apenas admins podem deletar |

---

## Triggers e Funções

### Triggers

**`update_profiles_updated_at`**
- Atualiza `updated_at` automaticamente em updates de `profiles`

**`update_companies_updated_at`**
- Atualiza `updated_at` automaticamente em updates de `companies`

**`set_client_member_code`**
- Gera automaticamente `member_code` para novos clientes
- Formato: `PASS-XXXX-Y` (ex: `PASS-8821-X`)

**`on_auth_user_created`**
- Cria perfil automaticamente quando usuário se registra via Supabase Auth

**`on_auth_user_deleted`**
- Remove perfil quando usuário é deletado do Auth

### Funções Auxiliares

**`generate_member_code()`**
- Gera código único no formato `PASS-XXXX-Y`
- Verifica duplicatas automaticamente

**`validate_client_access(member_code, company_id)`**
- Valida código do cliente
- Retorna dados completos do cliente

**`get_company_validation_stats(company_id, days)`**
- Retorna estatísticas de validação:
  - Total de validações
  - Validações bem-sucedidas
  - Validações rejeitadas
  - Clientes únicos
  - Taxa de sucesso

---

## Views

### `validation_logs_enriched`

View que enriquece os logs de validação com dados relacionados:

```sql
SELECT 
  vl.id,
  vl.status,
  vl.created_at,
  c.id as company_id,
  c.name as company_name,
  c.slug as company_slug,
  cl.id as client_id,
  cl.name as client_name,
  cl.email as client_email,
  cl.avatar as client_avatar,
  cl.member_code as client_member_code,
  cl.is_active as client_is_active,
  v.id as validated_by_id,
  v.name as validated_by_name
FROM validation_logs vl
JOIN companies c ON vl.company_id = c.id
JOIN profiles cl ON vl.client_id = cl.id
JOIN profiles v ON vl.validated_by = v.id;
```

---

## Dados Iniciais (Seed)

### Empresas Cadastradas

1. **Burger King Partners**
   - Slug: `burger-king-partners`
   - Benefício: 20% OFF on all Combo Meals
   - Endereço: Av. Paulista, 1000 - SP

2. **FitLife Gym**
   - Slug: `fitlife-gym`
   - Benefício: Free enrollment + 10% monthly discount
   - Endereço: Rua Augusta, 500 - SP

3. **Cinema Cineart**
   - Slug: `cinema-cineart`
   - Benefício: 50% OFF on tickets (Mon-Thu)
   - Endereço: Shopping Center Mall, 3rd Floor

---

## Exemplos de Queries

### Buscar todas as empresas ativas

```sql
SELECT * FROM companies 
WHERE is_active = true 
ORDER BY name;
```

### Validar acesso de cliente

```sql
SELECT * FROM validate_client_access('PASS-8821-X', 'company-uuid-here');
```

### Buscar histórico enriquecido de validações

```sql
SELECT * FROM validation_logs_enriched 
WHERE company_id = 'company-uuid-here' 
ORDER BY created_at DESC 
LIMIT 50;
```

### Estatísticas de validação (últimos 30 dias)

```sql
SELECT * FROM get_company_validation_stats('company-uuid-here', 30);
```

### Buscar empresas com full-text search

```sql
SELECT * FROM companies 
WHERE to_tsvector('portuguese', name || ' ' || description || ' ' || benefit) 
      @@ plainto_tsquery('portuguese', 'burger');
```

---

## Fluxo de Autenticação

### Registro de Novo Usuário

1. Usuário se registra via Supabase Auth
2. Trigger `on_auth_user_created` executa automaticamente
3. Perfil criado em `profiles` com:
   - Dados do `raw_user_meta_data`
   - Role padrão: `client`
   - `member_code` gerado automaticamente (se cliente)
   - Avatar padrão se não fornecido

### Metadados Recomendados no Signup

```javascript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'senha123',
  options: {
    data: {
      name: 'Nome do Usuário',
      role: 'client', // ou 'company', 'admin'
      avatar: 'https://...'
    }
  }
})
```

---

## Relacionamentos

```
auth.users (Supabase Auth)
    ↓ (1:1)
profiles
    ↓ (N:1)
companies

profiles (client)
    ↓ (1:N)
validation_logs
    ↑ (N:1)
companies

profiles (company manager)
    ↓ (1:N)
validation_logs (as validator)
```

---

## Migrações Aplicadas

1. `create_profiles_table` - Tabela de perfis
2. `create_companies_table` - Tabela de empresas
3. `create_validation_logs_table` - Logs de validação
4. `create_update_triggers` - Triggers de atualização
5. `enable_rls_and_policies` - RLS para profiles e companies
6. `validation_logs_rls_policies` - RLS para validation_logs
7. `create_helper_functions_and_views` - Funções e views
8. `seed_initial_data` - Dados iniciais
9. `auth_profile_sync` - Sincronização com Auth

---

## Segurança

### Princípios Implementados

- ✅ **Row Level Security (RLS)** habilitado em todas as tabelas
- ✅ **Least Privilege** - Usuários veem apenas dados permitidos
- ✅ **Audit Trail** - Logs de validação imutáveis (só admin deleta)
- ✅ **Data Integrity** - Foreign keys e constraints
- ✅ **Cascade Deletes** - Integridade referencial mantida
- ✅ **Unique Constraints** - Email, slug, member_code únicos

### Considerações

- Senhas gerenciadas pelo Supabase Auth (bcrypt)
- RLS garante isolamento de dados entre tenants
- Função `SECURITY DEFINER` permite queries controladas
- Índices otimizam performance sem comprometer segurança

---

## Performance

### Índices Estratégicos

- Campos de busca frequente indexados
- Índices compostos para queries complexas
- Full-text search otimizado para português
- Foreign keys indexadas automaticamente

### Otimizações

- Views materializadas podem ser criadas se necessário
- Particionamento de `validation_logs` por data (futuro)
- Cache de estatísticas agregadas (futuro)

---

## Manutenção

### Backup

- Supabase faz backup automático diário
- Point-in-time recovery disponível (planos pagos)

### Monitoring

- Monitorar tamanho das tabelas
- Verificar performance de queries lentas
- Analisar uso de índices

### Limpeza de Dados

```sql
-- Deletar logs antigos (exemplo: > 2 anos)
DELETE FROM validation_logs 
WHERE created_at < NOW() - INTERVAL '2 years';
```

---

## Próximos Passos

1. **Storage Buckets** (opcional)
   - Bucket para avatars de usuários
   - Bucket para imagens de empresas
   - Políticas RLS no storage

2. **Notificações** (opcional)
   - Triggers para enviar emails
   - Webhooks para eventos importantes

3. **Analytics** (opcional)
   - Tabelas agregadas para dashboards
   - Materialização de estatísticas

4. **Expansões Futuras**
   - Tabela de categorias de empresas
   - Sistema de favoritos
   - Avaliações/reviews
   - Histórico de alterações (audit log completo)

---

**Documentação gerada em:** 26/12/2025  
**Versão do Schema:** 1.0  
**Migrações Aplicadas:** 9
