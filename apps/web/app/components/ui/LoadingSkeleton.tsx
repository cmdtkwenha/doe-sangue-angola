import { LoadingState } from "./LoadingState";

export function LoadingSkeleton({ label = "A carregar dados" }: { label?: string }) {
  return <LoadingState label={label} rows={2} />;
}
