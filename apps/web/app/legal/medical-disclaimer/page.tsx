import { LegalPage, LegalSection, legalStyles } from "../shared";

export default function MedicalDisclaimerPage() {
  return (
    <LegalPage title="Aviso Médico">
      <div className={legalStyles.notice}>
        Doe Sangue Angola não substitui avaliação médica, triagem clínica ou protocolos hospitalares.
      </div>
      <LegalSection
        title="Limites da plataforma"
        items={[
          "A compatibilidade digital é uma pré-seleção operacional, não uma autorização clínica final.",
          "O hospital deve confirmar identidade, elegibilidade, sinais vitais e requisitos legais.",
          "Dadores devem informar sintomas, medicação, viagens recentes ou condições de saúde."
        ]}
      />
      <LegalSection
        title="Emergências"
        items={[
          "Em emergência médica, contacte diretamente serviços clínicos ou autoridades locais.",
          "Pedidos críticos devem ser validados pelo hospital antes de mobilizar dadores.",
          "O PIN confirma compromisso digital, não substitui documentos de identificação."
        ]}
      />
    </LegalPage>
  );
}
