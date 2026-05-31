import { FamilyEmergencyForm } from "../components/mobile/FamilyEmergencyForm";

export default function FamilyRequestPage() {
  return (
    <main style={{ margin: "0 auto", maxWidth: 620, padding: 24 }}>
      <p className="eyebrow">Pedido público</p>
      <h1>Pedido familiar de sangue</h1>
      <p className="muted">
        Para familiares ou cidadãos que precisam pedir sangue quando o hospital ainda não criou o pedido.
      </p>
      <FamilyEmergencyForm />
    </main>
  );
}
