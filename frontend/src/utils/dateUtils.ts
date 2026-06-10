export function formatDateFR(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return (
    d.toLocaleDateString("fr-MA", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }) +
    " " +
    d.toLocaleTimeString("fr-MA", {
      hour: "2-digit",
      minute: "2-digit",
    })
  );
}

export function formatDateOnlyFR(date?: Date): string {
  return (date ?? new Date()).toLocaleDateString("fr-FR");
}

export function getCurrentYear(): number {
  return new Date().getFullYear();
}
