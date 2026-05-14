# Play Store Checklist

Checklist para publicar o app Android.

## Conta e Identidade

- Conta Google Play Console ativa.
- Package name: `ao.doesangue.app`.
- Nome do app: Doe Sangue Angola.

## Build

Use o perfil production:

```bash
cd apps/mobile
eas build --profile production --platform android
```

O resultado deve ser um Android App Bundle, também chamado AAB.

## Materiais

- Ícone de alta resolução.
- Feature graphic.
- Screenshots de telefone.
- Descrição curta.
- Descrição completa.
- Política de privacidade.

## Permissões

O app usa `POST_NOTIFICATIONS` para alertas de sangue. Explique que as
notificações avisam dadores sobre pedidos urgentes e agendamentos.

## Testes

- Teste interno com equipa.
- Teste fechado com hospitais parceiros.
- Confirmar push notifications em Android real.
- Confirmar que o botão de logout funciona.

## Segurança

Não publicar com dados reais de pacientes em ambiente de teste. Use Supabase
com RLS ativo antes de convidar hospitais externos.
