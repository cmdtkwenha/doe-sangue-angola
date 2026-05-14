"use client";

import { subscribeRealtime } from "@doe-sangue-angola/shared-services";
import { useEffect, useState } from "react";

export function useRealtimeVersion() {
  const [version, setVersion] = useState(0);

  useEffect(() => subscribeRealtime(() => setVersion((item) => item + 1)), []);

  return version;
}
