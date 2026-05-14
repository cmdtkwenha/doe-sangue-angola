import { emitEvent, getEventHistory, subscribeToEvents } from "./eventBus";
import type { RealtimeEvent, RealtimeEventName, RealtimeHandler } from "./eventTypes";

export function publishRealtimeEvent<T extends RealtimeEventName>(
  name: T,
  payload: RealtimeEvent<T>["payload"]
) {
  return emitEvent(name, payload);
}

export function subscribeRealtime(handler: RealtimeHandler) {
  // Future Supabase path:
  // replace this in-memory subscription with supabase.channel(...).on(...).
  return subscribeToEvents(handler);
}

export function listRealtimeEvents() {
  return getEventHistory();
}

export function optimisticUpdate<T>(current: T[], next: T) {
  // UI can render this immediately, then reconcile after Supabase confirms later.
  return [next, ...current];
}
