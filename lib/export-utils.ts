export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  columns: { key: keyof T; label: string }[],
): void {
  const headers = columns.map((col) => col.label).join(",")
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const value = row[col.key]
        if (value === null || value === undefined) return ""
        if (typeof value === "string" && value.includes(",")) {
          return `"${value}"`
        }
        return String(value)
      })
      .join(","),
  )
  const csv = [headers, ...rows].join("\n")
  downloadFile(csv, `${filename}.csv`, "text/csv")
}

export function exportToJSON<T>(data: T, filename: string): void {
  const json = JSON.stringify(data, null, 2)
  downloadFile(json, `${filename}.json`, "application/json")
}

export function exportToPDF(): void {
  window.print()
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
