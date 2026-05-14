# Checklist de Launch Candidate

Use este guia antes de apresentar ou publicar o Doe Sangue Angola.

## Estado LC

- Idioma principal: Português.
- Dados ativos: mock data por defeito.
- Backend real: preparado para Supabase, mas não obrigatório para demo.
- Plataformas: Web Admin, Web Hospital, Mobile Donor em Expo.

## Verificações Obrigatórias

1. Instalar dependências com `npm install`.
2. Confirmar limites de ficheiros com `npm run check:lines`.
3. Executar auditoria local com `npm run audit`.
4. Executar testes com `npm run test`.
5. Validar TypeScript e build web com `npm run typecheck`.
6. Executar build consolidado com `npm run build`.
7. Abrir `/admin`, `/hospital`, `/mobile`, `/auth` e `/unauthorized`.
8. Testar em desktop, tablet e largura móvel.
9. Confirmar que o modo mock continua ativo sem Supabase.
10. Confirmar que `.env.local` não é enviado para repositório.
11. Rever textos visíveis para manter Português em primeiro lugar.

## Critérios de Aceitação

- Nenhum ficheiro acima de 250 linhas.
- Sem imports relativos quebrados.
- Sem falhas de TypeScript.
- Sem erros no build do Next.js.
- Fluxos principais demonstráveis com dados mock.
- Estados de erro, vazio, loading e offline visíveis quando acionados.
- Navegação por teclado e foco visível nas áreas principais.

## Antes de Produção

- Ligar Supabase real apenas depois de validar RLS.
- Confirmar variáveis de ambiente no Vercel e Expo EAS.
- Validar notificações push num dispositivo real.
- Executar revisão de segurança e privacidade.
- Criar contas reais para admin, hospital e dador.
