# Android APK Build

Este guia prepara o APK piloto do Doe Sangue Angola para instalar fora do Expo Go.

## Configuração verificada

- Nome: `Doe Sangue Angola`
- Android package: `ao.doesangue.app`
- Version code: configurável por `EXPO_PUBLIC_ANDROID_VERSION_CODE`, padrão `1`
- Ícone: `apps/mobile/assets/icon.png`
- Ícone adaptativo: `apps/mobile/assets/adaptive-icon.png`
- Ícone de notificação: `apps/mobile/assets/notification-icon.png`
- Splash screen: `apps/mobile/assets/splash.png`
- Permissão Android: `POST_NOTIFICATIONS`
- Canal push padrão: `blood-alerts`

## Perfis EAS

Use os perfis em `apps/mobile/eas.json`:

- `development`: APK com development client para testes técnicos.
- `preview`: APK interno simples para validação visual/mock.
- `pilot`: APK interno com Supabase e push Expo para piloto real.
- `production`: Android App Bundle para loja.

## Variáveis de produção

Configure como segredos no EAS, nunca dentro do código:

```bash
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value https://SEU-PROJETO.supabase.co
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value SUA_CHAVE_ANON
eas secret:create --scope project --name EXPO_PUBLIC_API_URL --value https://SEU-WEB.vercel.app
eas secret:create --scope project --name EXPO_PUBLIC_EAS_PROJECT_ID --value SEU_PROJECT_ID
eas secret:create --scope project --name EXPO_PUBLIC_ANDROID_VERSION_CODE --value 1
```

Não coloque `SUPABASE_SERVICE_ROLE_KEY` no app móvel.

## Gerar APK piloto

```bash
cd apps/mobile
eas build --platform android --profile pilot
```

O perfil `pilot` gera `.apk` para distribuição interna.

## Verificações antes de enviar

1. Web/Vercel online.
2. Supabase migrations aplicadas.
3. Hospital piloto verificado.
4. Dadores piloto criados.
5. Pedido de sangue de teste criado.
6. Push testado em dispositivo físico.
7. APK abre sem Expo Go.
