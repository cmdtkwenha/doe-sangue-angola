# Codex Instructions — Doe Sangue Angola

You are building Doe Sangue Angola.

Create a premium connected platform with:

1. Web Platform
   - Admin Portal
   - Hospital/Clinic Portal

2. Mobile App
   - Donor app

Language:
- Portuguese first.
- Prepare English and French support.

Design:
- Follow the supplied mockup images.
- Premium healthcare design.
- Angola colors: red, black, white, gold.
- Admin should feel like ServiceNow.
- Hospital dashboard should feel clinical and professional.
- Mobile app should feel like a real native app.

Architecture:
- Monorepo.
- Web and mobile share types, services and agents.
- Use small files.
- Every file must be under 250 lines.
- If a file approaches 250 lines, split it.

Use:
- Next.js for web.
- React Native / Expo for mobile.
- TypeScript everywhere.
- Tailwind or NativeWind where suitable.
- Supabase planned as backend.
- Mock data first.

Do not build one huge file.
Pages should compose small components.
Agents should contain business logic.
Services should connect apps to data.
