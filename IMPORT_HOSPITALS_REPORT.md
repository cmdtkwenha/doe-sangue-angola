# Import Hospitals Report

Data: 19 Maio 2026

## Ficheiro

- Origem no repositório: `data/imports/angola_hospitals.csv`
- Colunas esperadas: `name`, `type`, `province`, `municipality`, `address`, `phone`, `email`, `license_number`, `verified`
- Linhas no ficheiro: 26
- Linhas de dados lidas: 25

## Validação Local

| Verificação | Resultado |
| --- | --- |
| Ficheiro existe | Sim |
| Cabeçalhos obrigatórios | OK |
| Linhas de hospitais/clínicas | 25 |
| Chave única local | `name + province + municipality` |
| Duplicados locais | 0 |
| Linhas únicas | 25 |

## Importação Supabase

Comando executado:

```bash
npm exec -- tsx scripts/import-hospitals.ts
```

Resultado:

- Total lido: 25
- Total importado: 0
- Duplicados ignorados: 0
- Erro: `Variável em falta: NEXT_PUBLIC_SUPABASE_URL`

O importador não tocou na base de dados porque este ambiente local não tem:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Confirmações de Código

| Item | Estado |
| --- | --- |
| Duplicados prevenidos no script | OK, `onConflict: name,province,municipality` |
| Duplicados prevenidos na migração | OK, índice único por `name, province, municipality` |
| Admin lê hospitais por API | OK, `/api/hospitals` |
| Gestão Admin lista hospitais reais | OK, `HospitalsTable` usa `/api/hospitals` |
| Top hospitais usa dados reais | OK, `TopHospitalsPanel` usa `/api/hospitals` |
| Registo hospitalar sem texto livre | OK, `HospitalOnboarding` usa lista aprovada |
| Mock fallback só em desenvolvimento | OK, fallback condicionado por `NODE_ENV === "development"` |

## Para Completar a Importação Real

Executar num terminal com Supabase configurado:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://SEU-PROJETO.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="SUA_SERVICE_ROLE_KEY" \
npm exec -- tsx scripts/import-hospitals.ts
```

Resultado esperado quando as variáveis estiverem presentes:

- Total lido: 25
- Total importado/atualizado: 25
- Duplicados ignorados: 0
- Erros: nenhum
