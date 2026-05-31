"use client";

import { useMemo, useState } from "react";
import { useApiData } from "../../../hooks/useApiData";
import { ConfirmationModal } from "../../ui/ConfirmationModal";
import { EmptyState } from "../../ui/EmptyState";
import { LoadingSkeleton } from "../../ui/LoadingSkeleton";
import styles from "./adminUsers.module.css";

type UserRow = {
  account_status?: string;
  created_at?: string;
  email?: string;
  id: string;
  last_activity_at?: string | null;
  linked_entity_id?: string | null;
  linkedName?: string;
  name?: string;
  role: string;
};
type HospitalRow = { id: string; name: string; province?: string; verification_status?: string };
type DonorRow = { available?: boolean; blood_type?: string; eligibility_status?: string; id: string; province?: string };
type Payload = { donors: DonorRow[]; hospitals: HospitalRow[]; users: UserRow[] };
type Pending = { action: string; donorId?: string; hospitalId?: string; profileId: string; role?: string; title: string } | null;

const roleOptions = ["admin", "hospital", "donor", "support", "viewer"];
const initial: Payload = { donors: [], hospitals: [], users: [] };

export function AdminUserManagement() {
  const [version, setVersion] = useState(0);
  const { data, error, loading } = useApiData<Payload>("/api/admin/users", initial, version);
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState<Pending>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const users = useMemo(() => filterUsers(data.users, query), [data.users, query]);

  if (loading) return <LoadingSkeleton label="A carregar utilizadores" />;
  if (error) return <EmptyState title="Não foi possível carregar utilizadores" message={error} />;

  async function runAction() {
    if (!pending) return;
    setSaving(true);
    const result = await post("/api/admin/users", pending);
    setSaving(false);
    setPending(null);
    setMessage(result.ok ? "Ação administrativa concluída." : result.message ?? "Não foi possível concluir ação.");
    if (result.ok) setVersion((value) => value + 1);
  }

  return (
    <div className={styles.stack}>
      <section className={styles.toolbar}>
        <div>
          <p className="eyebrow">Controlo de acesso</p>
          <h2>{data.users.length} utilizadores</h2>
        </div>
        <input aria-label="Pesquisar utilizadores" onChange={(event) => setQuery(event.target.value)} placeholder="Pesquisar por nome, email ou função" value={query} />
      </section>
      {users.length ? users.map((user) => (
        <UserCard
          donors={data.donors}
          hospitals={data.hospitals}
          key={user.id}
          onAction={setPending}
          user={user}
        />
      )) : <EmptyState title="Sem utilizadores" message="Nenhuma conta corresponde aos filtros." />}
      <p className="muted" role="status">{message}</p>
      <ConfirmationModal
        confirmLabel="Confirmar ação"
        loading={saving}
        message="Esta ação altera permissões ou estado da conta. Confirme antes de continuar."
        onClose={() => setPending(null)}
        onConfirm={() => void runAction()}
        open={Boolean(pending)}
        title={pending?.title ?? "Confirmar ação administrativa"}
        tone="danger"
      />
    </div>
  );
}

function UserCard({ donors, hospitals, onAction, user }: {
  donors: DonorRow[];
  hospitals: HospitalRow[];
  onAction: (pending: Pending) => void;
  user: UserRow;
}) {
  const [role, setRole] = useState(user.role);
  const [hospitalId, setHospitalId] = useState(user.linked_entity_id ?? hospitals[0]?.id ?? "");
  const donor = donors.find((item) => item.id === user.linked_entity_id);
  const hospital = hospitals.find((item) => item.id === user.linked_entity_id);
  return (
    <article className={styles.card}>
      <div className={styles.identity}>
        <span>
          <strong>{user.name || "Utilizador sem nome"}</strong>
          <small>{user.email || "Sem email"}</small>
        </span>
        <Badge label={roleLabel(user.role)} tone={user.role === "admin" ? "danger" : "neutral"} />
        <Badge label={statusLabel(user.account_status)} tone={user.account_status === "suspended" ? "danger" : "success"} />
      </div>
      <div className={styles.meta}>
        <Read label="Criado" value={formatDate(user.created_at)} />
        <Read label="Última atividade" value={formatDate(user.last_activity_at)} />
        <Read label="Ligação" value={hospital?.name ?? donor?.blood_type ?? user.linkedName ?? "Sem ligação"} />
        <Read label="Estado dador" value={donor ? donorStatus(donor) : "Não aplicável"} />
      </div>
      <div className={styles.controls}>
        <label><span>Função</span><select onChange={(event) => setRole(event.target.value)} value={role}>{roleOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
        <button onClick={() => onAction({ action: "change_role", profileId: user.id, role, title: "Alterar função" })} type="button">Guardar função</button>
        <button onClick={() => onAction({ action: "suspend_user", profileId: user.id, title: "Suspender utilizador" })} type="button">Suspender</button>
        <button onClick={() => onAction({ action: "reactivate_user", profileId: user.id, title: "Reativar utilizador" })} type="button">Reativar</button>
        <button onClick={() => onAction({ action: "force_password_reset", profileId: user.id, title: "Pedir redefinição de palavra-passe" })} type="button">Reset password</button>
        <button onClick={() => onAction({ action: "reset_role", profileId: user.id, title: "Repor função" })} type="button">Repor função</button>
      </div>
      <div className={styles.controls}>
        <label><span>Hospital</span><select onChange={(event) => setHospitalId(event.target.value)} value={hospitalId}>{hospitals.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <button onClick={() => onAction({ action: "link_hospital", hospitalId, profileId: user.id, title: "Ligar hospital" })} type="button">Ligar hospital</button>
        <button onClick={() => onAction({ action: "approve_hospital", hospitalId: hospitalId || user.linked_entity_id || undefined, profileId: user.id, title: "Aprovar hospital" })} type="button">Aprovar hospital</button>
        <button onClick={() => onAction({ action: "suspend_hospital", hospitalId: hospitalId || user.linked_entity_id || undefined, profileId: user.id, title: "Suspender hospital" })} type="button">Suspender hospital</button>
        <button onClick={() => onAction({ action: "unlink_hospital", profileId: user.id, title: "Desligar hospital" })} type="button">Desligar hospital</button>
      </div>
      <div className={styles.controls}>
        <button disabled={!donor} onClick={() => onAction({ action: "verify_donor", donorId: donor?.id, profileId: user.id, title: "Verificar dador" })} type="button">Verificar dador</button>
        <button disabled={!donor} onClick={() => onAction({ action: "review_donor", donorId: donor?.id, profileId: user.id, title: "Marcar dador para revisão" })} type="button">Necessita revisão</button>
        <button disabled={!donor} onClick={() => onAction({ action: "suspend_donor", donorId: donor?.id, profileId: user.id, title: "Suspender dador" })} type="button">Suspender dador</button>
        <button onClick={() => onAction({ action: "unlink_donor", profileId: user.id, title: "Desligar perfil de dador" })} type="button">Desligar dador</button>
      </div>
    </article>
  );
}

function Badge({ label, tone }: { label: string; tone: "danger" | "neutral" | "success" }) {
  return <span className={`${styles.badge} ${styles[tone]}`}>{label}</span>;
}

function Read({ label, value }: { label: string; value: string }) {
  return <span><small>{label}</small><strong>{value}</strong></span>;
}

function filterUsers(users: UserRow[], query: string) {
  const term = query.trim().toLowerCase();
  if (!term) return users;
  return users.filter((user) => [user.name, user.email, user.role, user.linkedName].some((value) => String(value ?? "").toLowerCase().includes(term)));
}

function donorStatus(donor: DonorRow) {
  return `${donor.blood_type ?? "?"} · ${donor.eligibility_status ?? "sem estado"} · ${donor.available ? "ativo" : "indisponível"}`;
}

function statusLabel(value?: string) {
  return value === "suspended" ? "Suspenso" : "Ativo";
}

function roleLabel(value: string) {
  return ({ admin: "Admin", donor: "Dador", hospital: "Hospital", support: "Suporte", viewer: "Observador" } as Record<string, string>)[value] ?? value;
}

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleString("pt-AO", { dateStyle: "short", timeStyle: "short" }) : "Sem registo";
}

async function post(path: string, body: unknown) {
  const response = await fetch(path, { body: JSON.stringify(body), headers: { "Content-Type": "application/json" }, method: "PATCH" });
  return await response.json() as { message?: string; ok: boolean };
}
