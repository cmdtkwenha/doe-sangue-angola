# Guia de Testes

Este projeto usa testes simples e verificações locais para manter a base estável.

## Comandos Principais

- `npm run check:lines`: confirma que todos os ficheiros ficam abaixo de 250 linhas.
- `npm run audit`: verifica imports relativos, traduções base, duplicados e possíveis ficheiros sem uso.
- `npm run lint`: executa a mesma auditoria em modo detalhado.
- `npm run test`: testa regras de negócio críticas.
- `npm run typecheck`: compila a web e valida TypeScript do mobile.

## Fluxos Manuais

### Admin

1. Abrir `/auth`.
2. Entrar como admin.
3. Confirmar redirecionamento para `/admin`.
4. Rever KPIs, ticker, mapa, inventário, filas e logs.
5. Abrir páginas de gestão em `/admin/hospitals`, `/admin/donors`, `/admin/requests`, `/admin/notifications`, `/admin/fraud` e `/admin/audit`.

### Hospital

1. Entrar como hospital.
2. Confirmar redirecionamento para `/hospital`.
3. Criar pedido urgente mock.
4. Confirmar dadores a caminho, PIN e inventário.
5. Testar ações rápidas e painéis de auditoria.

### Dador

1. Entrar como dador.
2. Confirmar redirecionamento para `/mobile`.
3. Ver pedidos disponíveis.
4. Abrir detalhes do pedido.
5. Aceitar ou recusar pedido mock.
6. Rever pontos, recompensas, cartão digital e partilha.

## Responsividade

Testar larguras aproximadas:

- Desktop: 1440px.
- Tablet: 768px.
- Mobile: 390px.

Confirmar:

- Sidebar colapsa ou empilha corretamente.
- Tabelas continuam legíveis.
- Botões têm alvo de toque confortável.
- Texto não sobrepõe cards ou gráficos.
- Navegação inferior mobile permanece visível.

## Acessibilidade

- Usar Tab para navegar.
- Confirmar foco visível.
- Confirmar labels em formulários.
- Confirmar `Saltar para o conteúdo principal`.
- Confirmar mensagens de erro em Português.
