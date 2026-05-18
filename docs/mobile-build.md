# Mobile Build

Este guia prepara o app de dadores para Expo Development Build e produção.
Expo Go continua útil para mock, mas push real precisa de development build.

## Antes de Gerar Build

1. Criar conta Expo.
2. Instalar EAS CLI:

```bash
npm install -g eas-cli
```

3. Entrar no Expo:

```bash
eas login
```

4. Confirmar `EXPO_PUBLIC_EAS_PROJECT_ID`.

## Development Build

Use para testar push real em telemóvel:

```bash
cd apps/mobile
eas build --profile development --platform android
```

Instale o APK no Android de teste e abra com o backend Vercel configurado.

## Pilot Build

Use para teste interno com Luanda e Benguela:

```bash
cd apps/mobile
eas build --profile pilot --platform android
```

## Production Build

Use depois de validar Supabase, notificações e login:

```bash
cd apps/mobile
eas build --profile production --platform android
```

## Variáveis EAS

Configure no Expo/EAS:

- `EXPO_PUBLIC_API_URL`
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_EAS_PROJECT_ID`

Não configure `SUPABASE_SERVICE_ROLE_KEY` no EAS.

## Checklist Mobile

- App abre sem crash.
- Login de dador funciona.
- Pedido compatível aparece.
- Dador aceita pedido.
- PIN aparece no hospital.
- Push real funciona em development build.
- Expo Go mostra notificações simuladas.
