import type { RealtimeEvent, RealtimeEventName, RealtimeHandler } from "./eventTypes";

const handlers = new Set<RealtimeHandler>();
const history: RealtimeEvent[] = [];

export function emitEvent<T extends RealtimeEventName>(
  name: T,
  payload: RealtimeEvent<T>["payload"]
) {
  const event: RealtimeEvent<T> = {
    id: `evt-${Date.now()}-${history.length + 1}`,
    name,
    payload,
    timestamp: new Date().toISOString()
  };

  history.unshift(event);
  handlers.forEach((handler) => handler(event));

  return event;
}

export function subscribeToEvents(handler: RealtimeHandler) {
  handlers.add(handler);

  return () => {
    handlers.delete(handler);
  };
}

export function getEventHistory() {
  return history;
}

export function clearEventHistory() {
  history.length = 0;
}
