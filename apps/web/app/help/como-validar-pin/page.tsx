import { HelpArticle } from "../shared";

export default function PinHelpPage() {
  return (
    <HelpArticle
      title="Como validar PIN"
      steps={[
        "Abra o painel do hospital.",
        "Confirme que o dador aparece em Dadores a Caminho.",
        "Marque o dador como Chegou.",
        "Peça o PIN de 4 dígitos mostrado na app do dador.",
        "Insira o PIN e confirme a validação antes de concluir a doação."
      ]}
    />
  );
}
