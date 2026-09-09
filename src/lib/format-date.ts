export function formatDate(value: string | null | undefined): string {
  if (!value) return ""
  // El backend manda ISO completo (con hora). Una fecha suelta (YYYY-MM-DD) se
  // interpretaría como UTC y podría mostrar el día anterior, así que se le
  // agrega la hora local.
  const date =
    value.length === 10 ? new Date(`${value}T00:00:00`) : new Date(value)

  return date.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}
