# Finish Product Plan

Objetivo: transformar Doe Sangue Angola de MVP/mockup funcional para produto pronto para piloto real, sem adicionar funcionalidades novas.

## 1. O Que Ainda É Mock

- Dados de dashboards agregados em `mockStore` e `mockData`.
- Auth demo ainda usado quando `AUTH_MODE=demo`.
- Notificações in-app simuladas quando Expo Push não está configurado.
- Inventário, relatórios, fraude, verificação e analytics usam dados mock em vários painéis.
- Mobile web preview simula app nativa; app Expo existe, mas ainda precisa validação em build real.
- Seeds e migrations existem, mas não foram aplicadas a um Supabase remoto nesta máquina.

## 2. O Que Deve Tornar-Se Real

- Login, sessão e roles via Supabase Auth.
- Pedidos de sangue, agendamentos, notificações, recompensas e auditoria via Supabase.
- Push notifications reais via Expo em development/production build.
- Dashboards com dados vindos de repositórios/API, não arrays diretos.
- RLS com regras por role: admin, hospital e donor.
- Observabilidade mínima: erros, eventos críticos e logs de ações.

## 3. Backend Tables Needed

- `users`
- `donors`
- `hospitals`
- `blood_requests`
- `appointments`
- `notifications`
- `rewards`
- `referrals`
- `family_emergency_requests`
- `audit_logs`
- `fraud_reviews`
- `push_tokens`
- `notification_preferences`

## 4. API/Repository Work Needed

- Remover leituras diretas restantes de `mockStore` em fluxos de produção.
- Criar queries agregadas para métricas nacionais e hospitalares.
- Criar repositórios para inventário, fraude, relatórios e verificação.
- Garantir que todos os writes críticos geram `audit_logs`.
- Garantir fallback mock apenas quando `DATA_MODE=mock` ou Supabase não estiver configurado.
- Validar erros amigáveis em todos os endpoints.

## 5. Mobile App Work Needed

- Testar Expo development build em Android real.
- Confirmar permissões de notificação e token Expo.
- Ligar app nativa ao mesmo `EXPO_PUBLIC_API_URL`.
- Validar login donor, pedidos compatíveis, aceitar pedido, PIN e recompensas.
- Garantir offline/error states sem crash.

## 6. Web Dashboard Work Needed

- Confirmar navegação Admin e Hospital em desktop/mobile.
- Trocar painéis restantes de mock por API quando em Supabase mode.
- Validar route guards por role.
- Validar formulários, ações rápidas, filtros, exportações mock e modais.
- Confirmar que dashboards mostram loading, empty e error states.

## 7. Testing Checklist

- `npm run check:lines`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run smoke`
- Login admin, hospital e donor.
- Hospital cria pedido O-.
- Admin vê pedido.
- Donor vê pedido compatível.
- Donor aceita pedido.
- PIN é gerado.
- Hospital valida PIN.
- Doação é concluída.
- Pontos, notificações e auditoria atualizam.

## 8. Deployment Checklist

- Configurar Supabase remoto.
- Aplicar migrations.
- Aplicar seed piloto.
- Criar contas Auth e mapear `auth_user_id`.
- Configurar env vars no Vercel.
- Deploy web no Vercel.
- Configurar env vars no EAS.
- Build Android com perfil `pilot`.
- Testar URLs públicas e APK.

## 9. Pilot Launch Checklist

- 1 hospital verificado.
- 20 dadores reais/teste.
- Pelo menos 3 dadores recebem notificação.
- Pelo menos 1 pedido completo sem intervenção técnica.
- Hospital confirma que o fluxo é claro.
- Logs de auditoria registam ações críticas.
- Sem erros críticos no build, Vercel, Supabase ou Android.
