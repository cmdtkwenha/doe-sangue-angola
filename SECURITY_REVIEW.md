# Revisão de Segurança — Fase 10.1

Data: 2026-06-08

## Resumo

A aplicação usa Supabase Auth, RLS e validações em rotas API para separar Admin, Hospital e Dador.
Esta revisão confirmou os controlos críticos antes do piloto e removeu uso de chave privilegiada dos caminhos da aplicação web.

## RLS Revisto

Tabelas revistas:

- `users`: leitura/atualização do próprio utilizador; Admin lê a plataforma.
- `donors`: Dador lê/atualiza o próprio perfil; Hospital lê apenas dadores ligados às suas aceitações; Admin gere.
- `hospitals`: Hospital lê/atualiza a própria instituição; Admin gere; instituições verificadas ficam visíveis conforme política.
- `blood_requests`: Hospital só cria/consulta pedidos do hospital ligado e verificado; Dador lê pedidos abertos compatíveis; Admin lê tudo.
- `request_acceptances`: Dador lê as suas aceitações; Admin lê tudo.
- `donor_responses`: Dador lê o próprio PIN/histórico; Hospital lê/atualiza respostas do seu hospital; Admin gere.
- `notifications`: utilizadores leem/atualizam as próprias notificações; Admin lê alertas globais.
- `audit_logs`: Admin lê auditoria; ações críticas tentam inserir registos de auditoria.

## Controlos Confirmados

- Contas com `account_status != "Ativo"` são bloqueadas por `requireApiSession` e pelo `proxy`.
- Dadores não verificados são bloqueados antes de aceitar pedidos.
- Hospitais não verificados ou suspensos são bloqueados antes de criar pedidos.
- Rotas `/admin`, `/hospital` e `/mobile` têm proteção por função.
- Operações hospitalares validam `linked_entity_id` contra o hospital alvo.
- Dador só consegue carregar o próprio PIN e histórico por `donor_id`.
- Admin mantém acesso nacional para auditoria, fraude, relatórios e verificação.

## Correções Desta Fase

- Removido uso de `SUPABASE_SERVICE_ROLE_KEY` das rotas web de onboarding hospitalar e dadores aceites.
- Cliente partilhado de Supabase passou a usar apenas chaves anónimas públicas.
- Falhas de PIN agora geram alerta administrativo além de auditoria.
- Schema contract cobre `pin_validity_window` e `flag_excessive_hospital_requests`.

## Fraude e PIN

Controlos ativos:

- Um dador só pode manter uma aceitação ativa.
- PIN tem formato de 4 dígitos.
- PIN expira pela janela configurável do banco.
- PIN não pode ser alterado ou reutilizado após estado final.
- Tentativas falhadas são contadas e podem bloquear temporariamente o PIN.
- Criação excessiva de pedidos por hospital gera revisão de fraude.

## Rotas Revistas

- Admin: `RouteGuard`, `proxy`, APIs `/api/admin/*`.
- Hospital: `RouteGuard`, `HospitalEntityGate`, APIs de pedidos, inventário, dadores e staff.
- Dador: `RouteGuard`, APIs de perfil, pedidos disponíveis, PIN, notificações e preferências.

## Risco Residual

- Inserções de notificações e auditoria ainda dependem de rotas API autenticadas e políticas RLS compatíveis.
- Antes do piloto real, executar `supabase db push` e validar `npm run schema:verify` com variáveis Supabase reais.
- Testar manualmente um utilizador suspenso, hospital pendente e dador pendente no ambiente de produção.

## Resultado

Estado: pronto para novo teste piloto controlado, condicionado à aplicação das migrações no Supabase e verificação remota.
