# Production Checklist

Use esta lista antes de colocar Doe Sangue Angola em produção.

## Código

- `npm run check:lines` passa.
- `npm run test` passa.
- `npm run smoke` passa.
- `npm run typecheck` passa.
- `npm run build` passa.
- Nenhum ficheiro ultrapassa 250 linhas.

## Web

- Vercel usa `npm run build:web`.
- `/auth` abre.
- `/admin` protege Admin.
- `/hospital` protege Hospital.
- `/mobile` protege Dador.
- Logout funciona.

## Supabase

- Migrations aplicadas.
- RLS ativo.
- Contas de teste criadas.
- `users.role` tem `admin`, `hospital` ou `donor`.
- Service role key está apenas no Vercel.
- Seed de teste não contém dados reais de pacientes.

## Mobile

- Development build Android instalado.
- Expo Go continua em modo simulado.
- Push token regista em development build.
- Dador recebe pedido compatível.
- Dador aceita ou recusa sem crash.

## Workflow Crítico

- Hospital cria pedido urgente.
- Admin vê pedido.
- Matching encontra dadores.
- Dador vê pedido no app.
- Dador aceita.
- PIN de 4 dígitos é gerado.
- Hospital valida PIN.
- Pedido fica concluído.
- Recompensas atualizam.
- Auditoria regista ações.
- Notificações antigas ficam lidas.

## Decisão Final

Só publicar quando staging passar o workflow crítico com uma clínica real de
teste e pelo menos 20 dadores internos.
