import { RouteGuard } from "../components/auth/RouteGuard";
import { AdminDashboard } from "../components/admin/AdminDashboard";

export default function AdminPage() {
  return (
    <RouteGuard allowed={["admin"]}>
      <main id="conteudo-principal" tabIndex={-1}>
        <AdminDashboard />
      </main>
    </RouteGuard>
  );
}
