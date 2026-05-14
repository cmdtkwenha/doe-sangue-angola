import { LoadingState } from "./components/ui/LoadingState";

export default function Loading() {
  return (
    <main style={{ padding: 24 }}>
      <LoadingState label="A carregar a plataforma Doe Sangue Angola" rows={4} />
    </main>
  );
}
