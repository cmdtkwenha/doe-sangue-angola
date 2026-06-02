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
  name?: string;
  role: string;
};
type Payload = { users: UserRow[] };
type Pending = { action: string; profileId: string; role?: string; title: string } | null;

const roleOptions = ["admin", "hospital", "donor", "support", "viewer"];
const initial: Payload = { users: [] };

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

function UserCard({ onAction, user }: {
  onAction: (pending: Pending) => void;
  user: UserRow;
}) {
  const [role, setRole] = useState(user.role);
  return (
    <article className={styles.card}>
      <div className={styles.identity}>
        <span>
          <strong>{user.name || "Utilizador sem nome"}</strong>
          <small>{user.email || "Sem email"}</small>
        </span>
        <Badge label={roleLabel(user.role)} tone={user.role === "admin" ? "danger" : "neutral"} />
        <Badge label={statusLabel(user.account_status)} tone={isSuspended(user.account_status) ? "danger" : "success"} />
      </div>
      <div className={styles.meta}>
        <Read label="Criado" value={formatDate(user.created_at)} />
        <Read label="Última atividade" value={formatDate(user.last_activity_at)} />
        <Read label="Email" value={user.email || "Sem email"} />
        <Read label="Estado" value={statusLabel(user.account_status)} />
      </div>
      <div className={styles.controls}>
        <label><span>Função</span><select onChange={(event) => setRole(event.target.value)} value={role}>{roleOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
        <button onClick={() => onAction({ action: "change_role", profileId: user.id, role, title: "Alterar função" })} type="button">Guardar função</button>
        <button onClick={() => onAction({ action: "suspend_user", profileId: user.id, title: "Suspender utilizador" })} type="button">Suspender</button>
        <button onClick={() => onAction({ action: "reactivate_user", profileId: user.id, title: "Reativar utilizador" })} type="button">Reativar</button>
        <button onClick={() => onAction({ action: "force_password_reset", profileId: user.id, title: "Pedir redefinição de palavra-passe" })} type="button">Reset password</button>
        <button onClick={() => onAction({ action: "reset_role", profileId: user.id, title: "Repor função" })} type="button">Repor função</button>
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
  return users.filter((user) => [user.name, user.email, user.role, user.account_status].some((value) => String(value ?? "").toLowerCase().includes(term)));
}

function statusLabel(value?: string) {
  return isSuspended(value) ? "Suspenso" : "Ativo";
}

function isSuspended(value?: string) {
  return value === "Suspenso" || value === "suspended";
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
