"use client";

import { useState } from "react";
import { useApiData } from "../../hooks/useApiData";
import { useAuth } from "../auth/useAuth";
import { ConfirmationModal } from "../ui/ConfirmationModal";
import { EmptyState } from "../ui/EmptyState";
import { LoadingSkeleton } from "../ui/LoadingSkeleton";
import styles from "./hospitalSettings.module.css";

type HospitalRow = Record<string, string | boolean | number | null>;
type StaffRow = { created_at?: string; email: string; id: string; last_activity_at?: string | null; name: string; staff_role: string; status: string };
type Payload = { hospital: HospitalRow | null; preferences: Record<string, boolean | string>; staff: StaffRow[] };
type Form = { emergencyContact: string; mainContactPerson: string; operatingHours: string; operationalEmail: string; operationalPhone: string };

const initial: Payload = { hospital: null, preferences: {}, staff: [] };
const roles = ["gestor", "operador", "observador"];

export function HospitalSettingsEditor() {
  const { session } = useAuth();
  const [version, setVersion] = useState(0);
  const { data, error, loading } = useApiData<Payload>("/api/hospital/settings", initial, version);
  const [form, setForm] = useState<Form | null>(null);
  const [prefs, setPrefs] = useState<Record<string, boolean | string>>({});
  const [confirm, setConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  if (loading) return <LoadingSkeleton label="A carregar definições do hospital" />;
  if (error) return <EmptyState title="Não foi possível carregar definições" message={error} />;
  if (!data.hospital) return <EmptyState title="Hospital não encontrado" message="Ligue uma instituição aprovada antes de editar definições." />;
  const currentForm = form ?? formFromHospital(data.hospital);
  const currentPrefs = Object.keys(prefs).length ? prefs : data.preferences;

  async function save() {
    const missing = missingFields(currentForm);
    if (missing.length) {
      setMessage(`Preencha: ${missing.join(", ")}.`);
      return;
    }
    setSaving(true);
    const result = await post("/api/hospital/settings", { ...currentForm, preferences: currentPrefs }, "PATCH");
    setSaving(false);
    setConfirm(false);
    if (!result.ok) {
      setMessage(result.message ?? "Não foi possível guardar definições.");
      return;
    }
    setMessage("Definições guardadas com sucesso.");
    setVersion((value) => value + 1);
  }

  return (
    <div className={styles.stack}>
      <InstitutionCard hospital={data.hospital} />
      <section className={styles.panel}>
        <h2>Contactos Operacionais</h2>
        <div className={styles.grid}>
          <Field label="Pessoa de contacto" value={currentForm.mainContactPerson} onChange={(mainContactPerson) => setForm({ ...currentForm, mainContactPerson })} />
          <Field label="Telefone operacional" value={currentForm.operationalPhone} onChange={(operationalPhone) => setForm({ ...currentForm, operationalPhone })} />
          <Field label="Email operacional" value={currentForm.operationalEmail} onChange={(operationalEmail) => setForm({ ...currentForm, operationalEmail })} />
          <Field label="Contacto de emergência" value={currentForm.emergencyContact} onChange={(emergencyContact) => setForm({ ...currentForm, emergencyContact })} />
          <Field label="Horário de funcionamento" value={currentForm.operatingHours} onChange={(operatingHours) => setForm({ ...currentForm, operatingHours })} />
        </div>
        <button className={styles.primary} disabled={saving} onClick={() => setConfirm(true)} type="button">
          {saving ? "A guardar..." : "Guardar contactos"}
        </button>
        <p className="muted" role="status">{message}</p>
      </section>
      <AccountCard
        email={session?.user.email ?? ""}
        preferences={currentPrefs}
        setPreferences={setPrefs}
        setVersion={setVersion}
        status={String(data.hospital.verification_status ?? "pending")}
      />
      <StaffCard staff={data.staff} setVersion={setVersion} />
      <ConfirmationModal
        confirmLabel="Confirmar e guardar"
        loading={saving}
        message="Confirma que os contactos operacionais e preferências estão corretos?"
        onClose={() => setConfirm(false)}
        onConfirm={() => void save()}
        open={confirm}
        title="Confirmar definições"
      />
    </div>
  );
}

function InstitutionCard({ hospital }: { hospital: HospitalRow }) {
  return (
    <section className={styles.panel}>
      <h2>Perfil da Instituição</h2>
      <div className={styles.grid}>
        <Read label="Nome" value={hospital.name} />
        <Read label="Tipo" value={hospital.facility_type} />
        <Read label="Província" value={hospital.province} />
        <Read label="Município" value={hospital.municipality} />
        <Read label="Endereço" value={hospital.address} />
        <Read label="Telefone" value={hospital.phone} />
        <Read label="Email" value={hospital.email} />
        <Read label="Licença" value={hospital.license_number} />
        <Read label="Verificação" value={statusLabel(String(hospital.verification_status ?? "pending"))} />
      </div>
    </section>
  );
}

function AccountCard({ email, preferences, setPreferences, setVersion, status }: {
  email: string; preferences: Record<string, boolean | string>; setPreferences: (prefs: Record<string, boolean | string>) => void; setVersion: (fn: (value: number) => number) => void; status: string;
}) {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  async function changePassword() {
    if (password.length < 8) {
      setMessage("A palavra-passe deve ter pelo menos 8 caracteres.");
      return;
    }
    const result = await post("/api/auth/password", { password });
    setMessage(result.ok ? "Palavra-passe atualizada." : result.message ?? "Não foi possível alterar a palavra-passe.");
    if (result.ok) setPassword("");
  }
  return (
    <section className={styles.panel}>
      <h2>Conta e Segurança</h2>
      <Read label="Email do utilizador" value={email} />
      <Read label="Estado da conta" value={statusLabel(status)} />
      <div className={styles.inline}>
        <Field label="Nova palavra-passe" type="password" value={password} onChange={setPassword} />
        <button className={styles.secondary} onClick={() => void changePassword()} type="button">Alterar</button>
      </div>
      <div className={styles.toggles}>
        {prefLabels.map(([key, label]) => (
          <label key={key} className={styles.toggle}>
            <input checked={Boolean(preferences[key])} onChange={(event) => setPreferences({ ...preferences, [key]: event.target.checked })} type="checkbox" />
            <span>{label}</span>
          </label>
        ))}
      </div>
      <button className={styles.secondary} onClick={() => setVersion((value) => value + 1)} type="button">Recarregar conta</button>
      <p className="muted">{message}</p>
    </section>
  );
}

function StaffCard({ setVersion, staff }: { setVersion: (fn: (value: number) => number) => void; staff: StaffRow[] }) {
  const [invite, setInvite] = useState({ email: "", name: "", role: "operador" });
  const [message, setMessage] = useState("");
  async function submitInvite() {
    const result = await post("/api/hospital/staff", invite);
    setMessage(result.ok ? "Convite registado com sucesso." : result.message ?? "Não foi possível convidar membro.");
    if (result.ok) {
      setInvite({ email: "", name: "", role: "operador" });
      setVersion((value) => value + 1);
    }
  }
  async function setStatus(staffId: string, status: string) {
    const result = await post("/api/hospital/staff", { staffId, status }, "PATCH");
    setMessage(result.ok ? "Equipa atualizada." : result.message ?? "Não foi possível atualizar equipa.");
    if (result.ok) setVersion((value) => value + 1);
  }
  return (
    <section className={styles.panel}>
      <h2>Gestão de Staff</h2>
      <div className={styles.invite}>
        <Field label="Nome" value={invite.name} onChange={(name) => setInvite({ ...invite, name })} />
        <Field label="Email" value={invite.email} onChange={(email) => setInvite({ ...invite, email })} />
        <label className={styles.field}><span>Função</span><select value={invite.role} onChange={(event) => setInvite({ ...invite, role: event.target.value })}>{roles.map((role) => <option key={role}>{role}</option>)}</select></label>
        <button className={styles.primary} onClick={() => void submitInvite()} type="button">Convidar staff</button>
      </div>
      {staff.length ? staff.map((member) => (
        <article className={styles.staff} key={member.id}>
          <span><strong>{member.name}</strong><small>{member.email} · {member.staff_role} · {statusLabel(member.status)}</small></span>
          <small>Atividade: {formatDate(member.last_activity_at ?? member.created_at)}</small>
          <button className={styles.secondary} disabled={member.status === "inactive"} onClick={() => void setStatus(member.id, "inactive")} type="button">Desativar</button>
        </article>
      )) : <EmptyState title="Sem staff registado" message="Convide operadores para apoiar o fluxo do hospital." />}
      <p className="muted">{message}</p>
    </section>
  );
}

const prefLabels = [["donor_arrival", "Chegada de dadores"], ["pin_updates", "Atualizações de PIN"], ["emergency_requests", "Pedidos urgentes"], ["inventory_alerts", "Alertas de inventário"]] as const;

function Field({ label, onChange, type = "text", value }: { label: string; onChange: (value: string) => void; type?: string; value: string }) {
  return <label className={styles.field}><span>{label}</span><input onChange={(event) => onChange(event.target.value)} type={type} value={value} /></label>;
}

function Read({ label, value }: { label: string; value: unknown }) {
  return <span className={styles.read}><small>{label}</small><strong>{String(value || "Não definido")}</strong></span>;
}

function formFromHospital(hospital: HospitalRow): Form {
  return {
    emergencyContact: String(hospital.emergency_contact ?? ""),
    mainContactPerson: String(hospital.main_contact_person ?? hospital.contact ?? ""),
    operatingHours: String(hospital.operating_hours ?? ""),
    operationalEmail: String(hospital.operational_email ?? hospital.email ?? ""),
    operationalPhone: String(hospital.operational_phone ?? hospital.phone ?? "")
  };
}

function missingFields(form: Form) {
  return Object.entries({ "Pessoa de contacto": form.mainContactPerson, "Telefone operacional": form.operationalPhone, "Email operacional": form.operationalEmail })
    .filter(([, value]) => !value.trim()).map(([label]) => label);
}

function statusLabel(status: string) {
  return ({ active: "Ativo", inactive: "Inativo", invited: "Convidado", pending: "Em revisão", rejected: "Rejeitado", suspended: "Suspenso", verified: "Verificado" } as Record<string, string>)[status] ?? status;
}

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleString("pt-AO", { dateStyle: "short", timeStyle: "short" }) : "Sem registo";
}

async function post(path: string, body: unknown, method = "POST") {
  const response = await fetch(path, { body: JSON.stringify(body), headers: { "Content-Type": "application/json" }, method });
  return await response.json() as { message?: string; ok: boolean };
}
