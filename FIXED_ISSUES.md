# Fixed Issues

Data: 19 Maio 2026

## Fluxo Supabase

1. **Dador aceite não aparecia corretamente no hospital**

   O painel de dadores a caminho usava dados estáticos. Agora lê `/api/appointments?hospitalId=h1` e cruza com `/api/donors`.

2. **Aceitação podia usar o alias demo em modo Supabase**

   O componente de aceitação agora usa o ID real do dador compatível calculado pelo `matchingAgent`.

3. **Agendamentos duplicados ao aceitar o mesmo pedido**

   `requestRepository.acceptRequest` reutiliza um agendamento existente para o mesmo dador e pedido.

4. **Status ficava menos claro depois do aceite**

   Ao aceitar, o pedido passa para `Doador a Caminho`, refletindo o estado esperado no hospital.

5. **Validação de PIN podia atingir outro pedido com o mesmo PIN**

   A validação agora aceita `requestId` e filtra por `blood_request_id` quando disponível.

6. **Notificação de um dador podia quebrar criação do pedido**

   Criação de notificações usa `Promise.allSettled`; falhas individuais não impedem o pedido, auditoria e matches.

7. **Hospital podia não ver o agendamento mais recente**

   Listas de agendamentos agora ordenam por `created_at` descendente.

8. **Recompensas no mobile continuavam presas ao mock**

   O painel de pontos agora lê dadores via API em modo Supabase.

## Limitação Encontrada

O workspace local não tem variáveis Supabase configuradas, por isso o teste live real permanece pendente. O código compila e o fluxo real está ligado às rotas API e repositórios Supabase.
