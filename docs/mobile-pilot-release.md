# Mobile Pilot Release

Este guia prepara o APK Android interno do app de dadores para testes piloto.

## O Que Foi Configurado

- Nome do app: `Doe Sangue Angola`.
- Android package: `ao.doesangue.app`.
- Perfil EAS interno: `pilot`.
- Ícone placeholder: `apps/mobile/assets/icon.png`.
- Ícone adaptativo Android: `apps/mobile/assets/adaptive-icon.png`.
- Splash screen: `apps/mobile/assets/splash.png`.
- Push real preparado para development/pilot builds.
- Expo Go continua seguro, mas usa notificações simuladas.

## Variáveis Necessárias

Configure no EAS ou no ambiente antes do build:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=SUA_CHAVE_ANON
EXPO_PUBLIC_API_URL=https://SEU-WEB.vercel.app
EXPO_PUBLIC_PUSH_MODE=expo
EXPO_PUBLIC_DATA_MODE=supabase
EXPO_PUBLIC_AUTH_MODE=supabase
```

`EXPO_PUBLIC_API_URL` deve apontar para o web app em produção, porque o APK usa as rotas `/api` para saúde e push.

## Build Android APK

Na raiz do projeto:

```bash
npm install
npx eas login
npx eas build --platform android --profile pilot
```

O perfil `pilot` gera um APK interno, adequado para instalar diretamente em telemóveis de teste.

## Instalar APK de Teste

1. Abra o link do build gerado pelo EAS.
2. Baixe o ficheiro `.apk` no telemóvel Android.
3. Autorize instalação de fontes externas, se o Android pedir.
4. Instale o APK.
5. Abra `Doe Sangue Angola`.

## Teste do Fluxo de Dador

1. Entrar com uma conta de dador real criada no Supabase.
2. Confirmar que o perfil/onboarding do dador existe.
3. Confirmar que aparecem pedidos compatíveis.
4. Aceitar um pedido.
5. Confirmar que o cartão mostra o PIN.
6. No painel hospitalar, confirmar que o dador aparece em `Dadores a Caminho`.
7. Validar o PIN no hospital.
8. Concluir a doação.
9. Confirmar pontos/recompensas e notificações.

## Push Notifications

- Em APK `pilot`, o botão `Ativar notificações` pede permissão Android.
- Em Expo Go, não há token push real; o app usa notificações simuladas.
- Teste push real apenas em APK instalado num dispositivo físico.

## Checklist Antes de Partilhar

- Web em Vercel está online.
- Supabase migrations aplicadas.
- `push_tokens` recebe tokens.
- Conta dador piloto existe.
- Um hospital piloto está ligado.
- Pedido de teste pode ser criado e aceite.
