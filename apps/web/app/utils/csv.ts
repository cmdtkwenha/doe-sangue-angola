export function rowsToCsv(rows: Record<string, string>[]) {
  const headers = Object.keys(rows[0] ?? {});
  const body = rows.map((row) =>
    headers.map((key) => `"${escapeCsv(row[key] ?? "")}"`).join(",")
  );

  return [headers.join(","), ...body].join("\n");
}

function escapeCsv(value: string) {
  return value.replaceAll('"', '""');
}
