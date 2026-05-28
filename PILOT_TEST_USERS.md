# Utilizadores de Teste do Piloto

Senha sugerida para todos: `Piloto@2026`

## Admin

| Nome | Email | Papel |
| --- | --- | --- |
| Admin Piloto | admin.piloto@sangueangola.ao | admin |

## Hospital

| Nome | Email | Papel | Nota |
| --- | --- | --- | --- |
| Hospital Piloto Luanda | hospital.piloto@sangueangola.ao | hospital | Ligar a um hospital aprovado em Luanda |

## Dadores

| Nome | Email | Tipo | Província | Município |
| --- | --- | --- | --- | --- |
| Dador Piloto 1 | dador.ana@sangueangola.ao | O- | Luanda | Luanda |
| Dador Piloto 2 | dador.maria@sangueangola.ao | O+ | Luanda | Viana |
| Dador Piloto 3 | dador.joao@sangueangola.ao | A+ | Luanda | Talatona |
| Dador Piloto 4 | dador.paulo@sangueangola.ao | B+ | Luanda | Cazenga |
| Dador Piloto 5 | dador.teresa@sangueangola.ao | AB+ | Luanda | Belas |

## Como Criar as Contas

1. Criar cada utilizador em Supabase Auth.
2. Confirmar email se o projeto exigir confirmação.
3. Criar ou confirmar linha em `users`/`profiles` com o papel correto.
4. Para hospital, guardar `linked_entity_id` com o hospital aprovado.
5. Para dadores, completar perfil em `/onboarding/donor`.

## Verificação Rápida

- Admin deve abrir `/admin`.
- Hospital deve abrir `/hospital`.
- Dador deve abrir `/mobile`.
- Nenhum utilizador deve cair num portal de outro papel.
