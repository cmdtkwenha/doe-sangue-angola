# Vercel Deploy

Este guia coloca a Web Platform online: Admin, Hospital e preview Mobile.

## Antes de Começar

Tenha estes itens prontos:

- Conta Vercel.
- Projeto Supabase criado e migrado.
- Repositório ligado ao GitHub.
- Variáveis de `env/vercel.production.example`.

## Configuração no Vercel

1. Crie um novo projeto no Vercel.
2. Escolha este repositório.
3. Use estes comandos:
   - Install Command: `npm install`
   - Build Command: `npm run build:web`
   - Output Directory: `apps/web/.next`
4. Adicione as variáveis de `env/vercel.production.example`.
5. Garanta que `SUPABASE_SERVICE_ROLE_KEY` fica marcada como secreta.
6. Clique em Deploy.

## Variáveis Importantes

`NEXT_PUBLIC_SITE_URL` deve ser o domínio final.

`NEXT_PUBLIC_DATA_MODE=supabase` liga a plataforma às tabelas reais.

`SUPABASE_SERVICE_ROLE_KEY` é secreta. Nunca coloque no mobile.

`NEXT_PUBLIC_PUSH_MODE=expo` mantém a arquitetura de push ativa.

## Verificação Depois do Deploy

- Abrir `/auth`.
- Entrar como Admin.
- Confirmar `/admin`.
- Entrar como Hospital.
- Confirmar `/hospital`.
- Entrar como Dador.
- Confirmar `/mobile`.
- Criar pedido urgente no Hospital.
- Confirmar que o pedido aparece no Admin.
- Confirmar que o dador vê o pedido no Mobile.

## Notas Simples

O Vercel faz deploy automático quando o código entra na branch principal. Use
Preview Deployments para testar antes de mostrar a investidores.

Se algo falhar, volte temporariamente para `NEXT_PUBLIC_DATA_MODE=mock` e
corrija Supabase em staging antes de tentar produção novamente.
