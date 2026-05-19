# Aplicar Schema Supabase

Use este guia quando o Supabase Table Editor aparece sem tabelas.

## 1. Instalar e Entrar

```bash
npm install -g supabase
supabase login
```

## 2. Ligar ao Projeto

No painel Supabase, copie o `project-ref` no URL do projeto.

```bash
supabase link --project-ref seu-project-ref
```

## 3. Aplicar as Migrations

```bash
supabase db push
```

Este comando cria ou confirma estas tabelas:

- `users`
- `donors`
- `hospitals`
- `blood_requests`
- `appointments`
- `notifications`
- `rewards`
- `audit_logs`
- `fraud_reviews`

Também ativa Row Level Security e cria políticas por papel:

- Admin vê dados nacionais.
- Hospital vê e gere apenas o próprio hospital.
- Dador vê o próprio perfil, pedidos compatíveis, notificações e recompensas.

## 4. Criar Utilizadores Auth

Crie no Supabase Auth:

- `admin@sangueangola.ao`
- `hospital@sangueangola.ao`
- `donor@sangueangola.ao`

Depois copie os IDs desses utilizadores para os perfis públicos, se necessário.

## 5. Aplicar Seed de Teste

```bash
supabase db execute --file supabase/seed/core_required_seed.sql
```

O seed cria perfis, um hospital verificado, um dador, um pedido, uma notificação,
uma recompensa, auditoria e uma revisão de fraude.

## 6. Importar Hospitais Reais

Confirme as variáveis:

```bash
export NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
```

Depois rode:

```bash
npm run import:hospitals
```

O import lê `data/imports/angola_hospitals.csv`, valida as colunas e evita
duplicados por `name`, `province` e `municipality`.

## 7. Verificar

No Supabase Table Editor, confirme:

1. As tabelas aparecem.
2. `hospitals` tem pelo menos 25 hospitais/clínicas após o import.
3. `users`, `donors`, `blood_requests`, `appointments` e `notifications` têm dados de teste.

Se algo falhar, volte a correr:

```bash
supabase db push
npm run import:hospitals
```
