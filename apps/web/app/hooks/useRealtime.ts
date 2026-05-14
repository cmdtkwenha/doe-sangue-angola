"use client";

import {
  listRealtimeEvents,
  optimisticUpdate,
  subscribeRealtime,
  type RealtimeEvent,
  type RealtimeEventName
} from "@doe-sangue-angola/shared-services";
import { useEffect, useMemo, useState } from "react";

export function useRealtime(filter?: RealtimeEventName[]) {
  const [events, setEvents] = useState<RealtimeEvent[]>(listRealtimeEvents());

  useEffect(() => {
    return subscribeRealtime((event) => {
      if (!filter || filter.includes(event.name)) {
        setEvents((current) => optimisticUpdate(current, event));
      }
    });
  }, [filter]);

  return useMemo(() => ({
    events,
    latest: events[0],
    count: events.length
  }), [events]);
}
