# Roteiro de Teste Piloto

Objetivo: validar o ciclo real de doação com Admin, Hospital e Dador usando apenas Supabase real.

## Antes de Começar

1. Confirmar `NEXT_PUBLIC_DATA_MODE=supabase`.
2. Confirmar `NEXT_PUBLIC_AUTH_MODE=supabase`.
3. Confirmar migrations aplicadas.
4. Abrir Admin > Prontidão Piloto.
5. Exportar dados atuais, se necessário.
6. Limpar apenas dados operacionais de teste:
   - pedidos de sangue;
   - aceites;
   - PINs;
   - notificações.

## 1. Admin Login

1. Abrir `/auth`.
2. Entrar com a conta admin.
3. Confirmar redirecionamento para `/admin`.
4. Abrir Admin > Prontidão Piloto.
5. Confirmar estado `Operacional` ou analisar avisos.

Resultado esperado: admin entra e vê dados reais sem erro de permissão.

## 2. Registo do Hospital

1. Criar ou usar conta hospital.
2. Entrar como hospital.
3. Registar novo hospital ou selecionar hospital aprovado.
4. Se registar novo hospital, confirmar mensagem de pendência.

Resultado esperado: hospital novo aparece em Admin > Verificação > Hospitais Pendentes.

## 3. Admin Aprova Hospital

1. Entrar como admin.
2. Abrir Admin > Verificação.
3. Abrir Hospitais Pendentes.
4. Ver detalhes do hospital.
5. Aprovar hospital.
6. Confirmar que saiu da lista pendente.

Resultado esperado: hospital fica `Verificado` e pode aceder ao painel hospitalar.

## 4. Registo do Dador

1. Criar ou usar conta de dador.
2. Entrar como dador.
3. Completar perfil:
   - tipo sanguíneo;
   - província;
   - município;
   - telefone;
   - género;
   - data de nascimento;
   - contacto de emergência;
   - consentimento.
4. Guardar perfil.

Resultado esperado: dador aparece em Admin > Verificação > Dadores Pendentes.

## 5. Admin Verifica Dador

1. Entrar como admin.
2. Abrir Admin > Verificação.
3. Abrir Dadores Pendentes.
4. Ver detalhes do dador.
5. Clicar Verificar dador.

Resultado esperado: dador fica `Verificado` e pode ver pedidos compatíveis.

## 6. Hospital Cria Pedido

1. Entrar como hospital verificado.
2. Abrir `/hospital/new-request`.
3. Criar pedido com tipo sanguíneo compatível com o dador de teste.
4. Confirmar modal de criação.
5. Confirmar mensagem de sucesso.

Resultado esperado: pedido aparece em Hospital > Pedidos de Sangue e Admin > Pedidos de Sangue.

## 7. Dador Aceita Pedido

1. Entrar como dador verificado.
2. Abrir `/mobile`.
3. Abrir aba Pedidos.
4. Confirmar que só aparecem pedidos compatíveis.
5. Abrir detalhe do pedido.
6. Aceitar pedido.

Resultado esperado: aceite é criado, vaga reduz e pedido fica associado ao dador.

## 8. Dador Vê PIN

1. Abrir aba PIN.
2. Confirmar que aparece:
   - hospital;
   - tipo sanguíneo;
   - ETA;
   - estado;
   - PIN de 4 dígitos.

Resultado esperado: não aparece a mensagem “Aceite um pedido para gerar o seu PIN” se houver aceite ativo.

## 9. Hospital Valida PIN

1. Entrar como hospital.
2. Abrir Dadores Recebidos ou Painel Principal.
3. Confirmar que o dador aparece em Dadores a Caminho.
4. Clicar Chegou.
5. Introduzir o PIN mostrado pelo dador.
6. Clicar PIN validado.

Resultado esperado: estado muda para `PIN Validado`.

## 10. Hospital Completa Doação

1. No mesmo dador, clicar Doação concluída.
2. Confirmar a ação.
3. Verificar que o dador sai da lista ativa.
4. Abrir Histórico.

Resultado esperado: estado final `Doação concluída`.

## 11. Admin Verifica Relatórios e Auditoria

1. Abrir Admin > Auditoria & Logs.
2. Confirmar eventos:
   - hospital aprovado;
   - dador verificado;
   - pedido criado;
   - dador aceitou;
   - PIN validado;
   - doação concluída.
3. Abrir Admin > Relatórios.
4. Confirmar que pedidos/doações aparecem nos relatórios.

Resultado esperado: auditoria e relatórios refletem o teste real.

## Critério de Aprovação

O piloto passa se:

- os três papéis entram corretamente;
- hospital verificado cria pedido;
- dador verificado aceita pedido compatível;
- PIN aparece no telemóvel do dador;
- hospital valida PIN;
- hospital conclui doação;
- admin vê auditoria e relatórios;
- nenhum utilizador vê dados de outro papel.

## Critério de Falha

Registar bug crítico se:

- login falha para qualquer papel;
- pedido não é gravado;
- dador não vê pedido compatível;
- aceite não cria PIN;
- hospital não vê dador aceite;
- PIN correto é rejeitado;
- doação não conclui;
- permissões permitem acesso indevido.
