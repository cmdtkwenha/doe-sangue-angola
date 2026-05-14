# Auditoria de Segurança e Permissões

Esta auditoria verifica o estado atual do MVP Doe Sangue Angola. O produto ainda
usa dados mock por defeito, mas a arquitetura já está preparada para Supabase,
RLS e autenticação real.

## Resultado Geral

Estado: aprovado para demonstração controlada.

O que está protegido:

- Rotas de Admin exigem função `admin`.
- Rotas de Hospital exigem função `hospital`.
- Rotas de Dador exigem função `donor`.
- O middleware valida sessão Supabase quando as variáveis de ambiente existem.
- Em modo mock, o cliente usa contas demo e guarda apenas sessão local de demo.
- A matriz de permissões vive em `accessControlService`.
- Testes cobrem rotas, dados hospitalares, dados de dador e auditoria.

## Rotas Protegidas

| Área | Rotas | Função permitida |
| --- | --- | --- |
| Admin | `/admin`, `/admin/*` | `admin` |
| Hospital | `/hospital`, `/hospital/*` | `hospital` |
| Dador | `/mobile`, `/mobile/*` | `donor` |
| Onboarding Admin | `/onboarding/admin` | `admin` |
| Onboarding Hospital | `/onboarding/hospital` | `hospital` |
| Onboarding Dador | `/onboarding/donor` | `donor` |

Implementação:

- `SecureRouteWrapper` protege o lado cliente.
- `proxy.ts` protege o lado servidor quando Supabase está configurado.
- `RouteGuard` continua disponível como wrapper compatível.

## Matriz de Permissões

| Recurso | Admin | Hospital | Dador |
| --- | --- | --- | --- |
| Dados nacionais | Sim | Não | Não |
| Dados hospitalares | Sim | Apenas o próprio hospital | Não |
| Dados do dador | Sim | Apenas resumo clínico necessário | Apenas o próprio perfil |
| Notificações | Sim | Sim, para pedidos próprios | Sim, próprias |
| Logs de auditoria | Sim | Não | Não |

## Dados Sensíveis

Regras aplicadas ou preparadas:

- Códigos de pacientes devem ser mascarados fora de superfícies clínicas.
- Dadores não devem ver dados nacionais de Admin.
- Hospitais devem receber apenas dados dos seus próprios pedidos.
- Dadores devem receber apenas pedidos compatíveis e dados do próprio perfil.
- PIN de 4 dígitos deve ser tratado como segredo temporário.
- Push tokens devem ficar associados ao dador dono do token.

## Isolamento Hospitalar

O serviço mock já usa `hospitalId` para filtrar pedidos hospitalares. Para
produção, cada leitura e escrita deve validar:

- `users.role = 'hospital'`
- hospital ligado ao `auth.uid()`
- `blood_requests.hospital_id` igual ao hospital autenticado

Nenhum hospital deve consultar pedidos, inventário, marcações ou auditoria de
outro hospital.

## Isolamento do Dador

O dador deve consultar:

- O próprio registo em `donors`.
- As próprias marcações.
- As próprias notificações.
- Pedidos compatíveis e ativos.

O dador não deve consultar:

- Dashboard Admin.
- Fila de fraude.
- Dados de outros dadores.
- Inventário nacional bruto.
- Logs de auditoria.

## Notificações Push

O fluxo mobile usa permissão explícita:

- Primeiro verifica estado atual.
- Só pede permissão se ainda não estiver concedida.
- Só regista token em dispositivo físico.
- Android usa canal `blood-alerts`.
- Preferências do dador ficam separadas por tipo de notificação.

Em produção, tokens Expo/FCM devem ser guardados com RLS por `donor_id`.

## Supabase e RLS

As políticas iniciais estão em:

- `supabase/migrations/001_initial_schema.sql`
- `supabase/migrations/002_push_notifications.sql`

Regras obrigatórias antes de produção:

- Ativar RLS em todas as tabelas sensíveis.
- Admin lê dados nacionais por role `admin`.
- Hospital lê e altera apenas dados do seu hospital.
- Dador lê e altera apenas dados próprios.
- Service role nunca deve ir para cliente web ou mobile.
- Todas as ações importantes devem criar `audit_logs`.

## Lacunas Antes de Produção

Estas lacunas são aceitáveis para demo, mas devem ser resolvidas antes de uso
real:

- API routes ainda usam validação mínima e devem validar sessão no servidor.
- Mock data é mutável em memória e não representa controlo real de permissões.
- Registo de admins deve ser restrito por convite ou operação interna.
- Policies de `appointments`, `rewards` e `audit_logs` devem ser mais granulares.
- Logs devem evitar guardar dados clínicos desnecessários.

## Testes

Cobertura adicionada:

- `tests/role-access.test.ts`
- Rotas principais por função.
- Bloqueio de hospital contra dados de outro hospital.
- Bloqueio de dador contra dados Admin.
- Auditoria apenas Admin.
- Máscara de código de paciente.

Comandos recomendados:

```bash
npm run test
npm run typecheck
npm run audit
```
