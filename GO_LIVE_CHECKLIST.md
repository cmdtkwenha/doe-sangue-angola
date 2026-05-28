# Checklist Go-Live

Use esta lista no dia de lançamento do piloto.

## Bloqueio de Funcionalidades

- `NEXT_PUBLIC_FEATURE_FREEZE=true`.
- Não fazer novas funcionalidades durante o piloto.
- Apenas correções críticas aprovadas.
- Registar qualquer mudança em `CHANGELOG.md`.

## Ambiente

- `NEXT_PUBLIC_APP_ENV=production`.
- `NEXT_PUBLIC_AUTH_MODE=supabase`.
- `NEXT_PUBLIC_DATA_MODE=supabase`.
- `NEXT_PUBLIC_PUSH_MODE=expo`.
- `NEXT_PUBLIC_SUPABASE_URL` configurado.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` configurado.
- `SUPABASE_SERVICE_ROLE_KEY` apenas no servidor.
- `NEXT_PUBLIC_MAINTENANCE_MODE=false`.

## Supabase

- Migrações aplicadas com `supabase db push`.
- RLS ativo nas tabelas críticas.
- Trigger de criação de utilizador validado.
- Hospitais reais importados.
- Backups Supabase ativos.
- Exportação CSV testada.

## Contas de Piloto

- Admin confirmado.
- Hospital confirmado e ligado a hospital aprovado.
- Dadores de teste confirmados.
- Emails e telefones de teste revistos.

## Fluxo Operacional

- Hospital cria pedido.
- Admin vê pedido.
- Dador vê pedido compatível.
- Dador aceita pedido.
- PIN aparece no dador.
- Hospital vê dador.
- Hospital valida PIN.
- Hospital conclui doação.
- Admin vê auditoria.

## Monitorização

- `/status` operacional.
- `/admin/launch` operacional.
- Checklist automática sem erros críticos.
- Notificações in-app testadas.
- Realtime testado em duas janelas.
- Logs de erro sem falhas novas.

## Backup e Recuperação

- `BACKUP_RECOVERY.md` revisto.
- `ROLLBACK_PLAN.md` revisto.
- Exportar CSV antes do piloto:
  - dadores;
  - hospitais;
  - pedidos;
  - respostas de dadores.
- Responsável técnico sabe restaurar backup Supabase.

## Comunicação

- Equipa sabe usar o roteiro `FINAL_TEST_SCRIPT.md`.
- Canal de suporte definido.
- Contacto de emergência operacional definido.
- Mensagem de manutenção preparada.

## Critério Para Avançar

Avançar apenas se:

- build passa;
- typecheck passa;
- login funciona nos três papéis;
- fluxo pedido → PIN → conclusão funciona;
- rollback está claro;
- equipa sabe quem contactar se algo falhar.

## Critério Para Pausar

Pausar o piloto se:

- RLS expõe dados errados;
- dadores não conseguem ver PIN;
- hospitais não conseguem validar PIN;
- pedidos não aparecem no Admin;
- Supabase fica indisponível por mais de 15 minutos;
- erro crítico afeta dados reais.
