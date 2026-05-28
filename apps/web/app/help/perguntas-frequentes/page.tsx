import { HelpArticle } from "../shared";

export default function FaqHelpPage() {
  return (
    <HelpArticle
      title="Perguntas Frequentes"
      steps={[
        "Quem pode doar? Dadores elegíveis com perfil completo e sem bloqueios clínicos.",
        "O PIN substitui documentos? Não. O hospital deve confirmar identidade conforme protocolo.",
        "E se o PIN falhar? Registe o erro e contacte suporte antes de concluir.",
        "Posso cancelar? Sim, antes de uma doação concluída.",
        "O piloto usa dados reais? Sim, quando Supabase está configurado em produção."
      ]}
    />
  );
}
