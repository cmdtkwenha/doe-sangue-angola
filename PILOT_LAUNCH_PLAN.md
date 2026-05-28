# Plano do Primeiro Piloto — Doe Sangue Angola

Objetivo: testar o produto com 1 hospital e 5 dadores antes de abrir ao público.

## Equipa do Piloto

- 1 fundador/admin para observar o painel nacional.
- 1 responsável do hospital para criar e gerir pedidos.
- 5 dadores de teste em Luanda.
- 1 pessoa de suporte para registar problemas.

## Ambiente

- Web publicado em Vercel.
- Supabase em modo produção.
- App Android instalada por APK/EAS build.
- Notificações reais testadas em development build ou produção.

## Dados Necessários

- Hospital piloto selecionado da tabela real `hospitals`.
- 5 dadores com perfis completos.
- Pelo menos 1 dador compatível com O-.
- Tabelas `blood_requests`, `donor_responses`, `notifications` e `audit_logs` ativas.

## Roteiro Principal

1. Admin entra e abre `/admin`.
2. Hospital entra e abre `/hospital`.
3. Hospital cria pedido O- urgente.
4. Admin confirma pedido em tempo real.
5. Dador compatível vê pedido no telemóvel.
6. Dador aceita pedido.
7. Dador mostra PIN no ecrã.
8. Hospital confirma chegada.
9. Hospital valida PIN.
10. Hospital conclui doação.
11. Admin confirma estado final e audit logs.

## Critérios de Sucesso

- Login funciona nos três papéis.
- Hospital cria pedido sem erro.
- Dador aceita e recebe PIN.
- PIN do dador é igual ao visto pelo hospital.
- Estado termina em “Doação concluída”.
- Notificações e logs são criados.
- Nenhum crash acontece no telemóvel.

## Critérios de Paragem

Parar o piloto se:

- Login falhar para mais de um papel.
- Pedido não gravar no Supabase.
- PIN divergente entre dador e hospital.
- Hospital conseguir ver dados de outro hospital.
- App Android fechar sozinha durante aceite ou PIN.

## Depois do Piloto

- Recolher feedback de cada perfil.
- Exportar ou copiar problemas críticos.
- Corrigir apenas bloqueadores antes do segundo teste.
- Confirmar novamente `npm run typecheck` e `npm run build`.
