import { LegalPage, LegalSection } from "../shared";

export default function PrivacyPage() {
  return (
    <LegalPage title="Política de Privacidade">
      <LegalSection
        title="Dados usados"
        items={[
          "Dados de perfil: nome, contacto, província, município e papel de acesso.",
          "Tipo sanguíneo: usado para encontrar pedidos compatíveis.",
          "Localização: usada para ordenar pedidos próximos quando o utilizador autoriza.",
          "Notificações: usadas para pedidos urgentes, agendamentos, PIN e estado da doação."
        ]}
      />
      <LegalSection
        title="Direitos do utilizador"
        items={[
          "Pode pedir correção dos dados de perfil.",
          "Pode pedir eliminação da conta pelo suporte.",
          "Pode desativar notificações, sujeito a limitações operacionais do piloto."
        ]}
      />
      <p className="muted">
        Pedido de eliminação: contacte suporte com o email da conta e o motivo. A equipa confirmará
        identidade antes de apagar ou anonimizar dados.
      </p>
    </LegalPage>
  );
}
