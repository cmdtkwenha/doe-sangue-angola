"use client";

import { getWorkflowSnapshot, subscribeRealtime } from "@doe-sangue-angola/shared-services";
import { useEffect, useState } from "react";

export function useWorkflowSnapshot() {
  const [version, setVersion] = useState(0);
  const snapshot = getWorkflowSnapshot();

  useEffect(() => {
    return subscribeRealtime(() => setVersion((item) => item + 1));
  }, []);

  return {
    ...snapshot,
    refresh: () => setVersion(version + 1)
  };
}
