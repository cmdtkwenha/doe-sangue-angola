# Expo EAS Build

Este guia prepara o app móvel Doe Sangue Angola para testes e lançamento.

## Antes de Começar

Instale a CLI da Expo:

```bash
npm install -g eas-cli
```

Faça login:

```bash
eas login
```

## Configuração Inicial

Dentro de `apps/mobile`, execute:

```bash
eas init
```

Copie o `projectId` gerado para `apps/mobile/app.json`.

## Build de Teste Android

```bash
cd apps/mobile
eas build --profile preview --platform android
```

Este build gera um APK para instalar em telemóveis de teste.

## Build de Produção

```bash
cd apps/mobile
eas build --profile production --platform all
```

## Variáveis

Use `env/eas.production.example` como base. Em produção, use:

```bash
EXPO_PUBLIC_DATA_MODE=supabase
EXPO_PUBLIC_API_URL=https://doesangue.ao
```

## Push Notifications

As notificações Expo precisam de build EAS real. Em Expo Go, alguns recursos
podem não representar o comportamento final.
