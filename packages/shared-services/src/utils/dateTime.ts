export function formatTimePt(date = new Date()) {
  return new Intl.DateTimeFormat("pt-PT", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

export function formatDateTimePt(value: string | Date) {
  return new Intl.DateTimeFormat("pt-PT", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}
