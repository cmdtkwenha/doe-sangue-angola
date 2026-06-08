# Backup e Recuperação

Este guia prepara a equipa do Doe Sangue Angola para proteger dados do piloto e recuperar o serviço com segurança.

## Dados críticos

Devem ser protegidos:

- `users`
- `profiles`
- `donors`
- `hospitals`
- `blood_requests`
- `request_acceptances`
- `donor_responses`
- `notifications`
- `audit_logs`
- `legal_consents`
- `hospital_inventory`
- `hospital_inventory_movements`

## Processo manual de backup

Antes de cada piloto:

1. Confirmar que está no projeto Supabase correto.
2. Abrir Supabase Dashboard.
3. Ir a **Database > Backups**.
4. Confirmar data e hora do último backup automático.
5. Criar um backup manual, se o plano Supabase permitir.
6. Registar no diário operacional:
   - responsável;
   - data;
   - hora;
   - ambiente;
   - motivo do backup.

## Processo de exportação CSV

Usar CSV quando for necessário preservar dados antes de testes ou reset piloto.

1. Entrar como Admin.
2. Abrir áreas de exportação administrativas.
3. Exportar:
   - dadores;
   - hospitais;
   - pedidos de sangue;
   - aceitações/respostas;
   - notificações;
   - auditoria;
   - inventário.
4. Guardar os ficheiros num local privado.
5. Nunca colocar CSV com dados pessoais no GitHub.

## Exportação via Supabase SQL Editor

Se o painel Admin estiver indisponível:

1. Abrir Supabase SQL Editor.
2. Executar consultas `select` por tabela.
3. Usar a opção de download do resultado.
4. Validar que o ficheiro contém cabeçalhos e linhas esperadas.

## Recomendações Supabase

- Usar backups automáticos do plano Supabase.
- Confirmar a política de retenção antes do piloto.
- Dar acesso ao painel apenas a responsáveis autorizados.
- Ativar autenticação forte nas contas administrativas.
- Testar restauração em ambiente de staging antes de usar produção.

## Recuperação após falha

1. Ativar modo manutenção, se disponível.
2. Parar novas operações do piloto.
3. Exportar estado atual antes de restaurar.
4. Restaurar backup Supabase pelo painel ou CLI.
5. Validar tabelas críticas.
6. Testar login Admin, Hospital e Dador.
7. Testar pedido, aceitação, PIN e conclusão.
8. Reabrir o piloto apenas após validação.

## Segurança dos backups

- Backups e CSV podem conter dados pessoais.
- Guardar apenas em armazenamento privado.
- Partilhar só com equipa autorizada.
- Apagar cópias locais quando já não forem necessárias.
