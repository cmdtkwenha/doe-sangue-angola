# Contas Para Teste Piloto

Use contas reais criadas no Supabase Auth. Não partilhe palavras-passe fora da equipa de teste.

## Administrador

| Nome | Email | Papel | Destino |
| --- | --- | --- | --- |
| Admin Piloto | admin.piloto@sangueangola.ao | admin | `/admin` |

## Hospitais

| Nome | Email | Papel | Estado esperado |
| --- | --- | --- | --- |
| Hospital Piloto Luanda | hospital.luanda.piloto@sangueangola.ao | hospital | Verificado |
| Hospital Piloto Benguela | hospital.benguela.piloto@sangueangola.ao | hospital | Verificado |

## Dadores

| Nome | Email | Tipo sanguíneo | Província | Município |
| --- | --- | --- | --- | --- |
| Ana Piloto | dador.ana@sangueangola.ao | O- | Luanda | Luanda |
| Maria Piloto | dador.maria@sangueangola.ao | O+ | Luanda | Viana |
| João Piloto | dador.joao@sangueangola.ao | A+ | Luanda | Talatona |
| Paulo Piloto | dador.paulo@sangueangola.ao | B+ | Luanda | Cazenga |
| Teresa Piloto | dador.teresa@sangueangola.ao | AB+ | Luanda | Belas |
| Adão Piloto | dador.adao@sangueangola.ao | A- | Benguela | Benguela |
| Helena Piloto | dador.helena@sangueangola.ao | B- | Benguela | Lobito |
| Carlos Piloto | dador.carlos@sangueangola.ao | AB- | Benguela | Catumbela |

## Preparação das Contas

1. Criar utilizadores em Supabase Auth.
2. Confirmar que cada utilizador existe em `public.users`.
3. Definir `role` correto: admin, hospital ou donor.
4. Para hospitais, ligar `linked_entity_id` ao hospital verificado.
5. Para dadores, completar perfil e verificar em Admin > Verificação.

## Verificação Rápida

- Admin abre `/admin`.
- Hospital abre `/hospital`.
- Dador abre `/mobile`.
- Utilizador sem verificação vê mensagem de pendência.
- Nenhum papel abre área indevida.
