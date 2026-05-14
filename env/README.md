# Environment Files

Doe Sangue Angola has three environment modes.

| Mode | Use It For | Safe Default |
| --- | --- | --- |
| Development | Running locally on a laptop. | Mock data |
| Staging | Private testing before launch. | Mock or test Supabase data |
| Production | Public launch. | Mock until security is approved |

## Which File To Use

- `.env.development.example`: local development.
- `.env.staging.example`: private staging deployment.
- `.env.production.example`: public production deployment.

Copy the example you need into the hosting provider or into `.env.local`.

## Founder Rule

Keep `NEXT_PUBLIC_DATA_MODE=mock` until the technical team confirms Supabase security and pilot data are ready.

## Important Safety Note

Never publish real secret keys in GitHub. Server-only keys such as `SUPABASE_SERVICE_ROLE_KEY` belong only in secure hosting dashboards.
