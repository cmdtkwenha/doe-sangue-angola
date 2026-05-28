import { LegalPage, LegalSection } from "../shared";

export default function TermsPage() {
  return (
    <LegalPage title="Termos de Uso">
      <LegalSection
        title="Uso permitido"
        items={[
          "A plataforma coordena pedidos de sangue entre hospitais verificados e dadores registados.",
          "O utilizador deve fornecer dados corretos e manter contacto atualizado.",
          "É proibido criar pedidos falsos, perfis falsos ou usar dados de terceiros sem autorização."
        ]}
      />
      <LegalSection
        title="Responsabilidades"
        items={[
          "Hospitais são responsáveis pela validação clínica, documental e presencial.",
          "Dadores devem confirmar disponibilidade e seguir orientação médica.",
          "A equipa Doe Sangue Angola pode suspender contas em caso de fraude ou risco operacional."
        ]}
      />
    </LegalPage>
  );
}
