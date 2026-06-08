# Plano de Rollback

Este plano explica como voltar para uma versão estável após falha de deploy ou migração.

## Quando fazer rollback

Usar rollback se acontecer:

- login bloqueado para Admin, Hospital ou Dador;
- pedidos de sangue não podem ser criados;
- dador aceita pedido mas PIN não aparece;
- validação de PIN falha para todos;
- nova migração quebra tabelas críticas;
- RLS expõe ou bloqueia dados indevidamente;
- build novo quebra páginas críticas.

## Rollback após deploy falhado

1. Pausar testes do piloto.
2. Abrir Vercel.
3. Ir a **Deployments**.
4. Escolher o último deploy validado.
5. Clicar em **Promote to Production**.
6. Confirmar que variáveis de ambiente continuam corretas.
7. Abrir:
   - `/status`;
   - `/auth`;
   - `/admin`;
   - `/hospital`;
   - `/mobile`.
8. Repetir teste rápido:
   - login;
   - criar pedido;
   - aceitar pedido;
   - ver PIN.

## Rollback após migração falhada

1. Não executar reset da base de dados.
2. Copiar o erro completo da migração.
3. Parar novas alterações de esquema.
4. Verificar se a migração já aplicou alguma parte.
5. Se não aplicou nada, corrigir a migration e executar novamente.
6. Se aplicou parcialmente:
   - criar migration corretiva;
   - usar `alter table if exists`;
   - usar `add column if not exists`;
   - nunca apagar dados reais sem aprovação.
7. Se a base ficou inutilizável, restaurar backup Supabase.

## Rollback de dados

Usar apenas quando há corrupção de dados.

1. Exportar estado atual para investigação.
2. Identificar último backup íntegro.
3. Restaurar em staging primeiro, se possível.
4. Validar contagens de utilizadores, hospitais, dadores e pedidos.
5. Restaurar produção.
6. Executar `npm run schema:verify`.

## Modo de manutenção

Se o sistema estiver instável:

1. Ativar `NEXT_PUBLIC_MAINTENANCE_MODE=true`.
2. Fazer redeploy.
3. Informar equipa piloto.
4. Impedir novos pedidos até a recuperação terminar.

## Checklist pós-rollback

- Admin consegue entrar.
- Hospital verificado consegue entrar.
- Dador verificado consegue entrar.
- Pedidos ativos carregam.
- PIN ativo carrega.
- Auditoria regista novas ações.
- Saúde do sistema mostra estado operacional.
