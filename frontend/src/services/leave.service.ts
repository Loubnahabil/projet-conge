export function calculerJoursOuvrables(
  dateDebut: string,
  dateFin: string,
  holidays: string[],
): number {
  const start = new Date(dateDebut);
  const end = new Date(dateFin);
  if (start > end) return 0;

  let days = 0;
  const current = new Date(start);

  while (current <= end) {
    const dayOfWeek = current.getDay();
    const dateStr = current.toISOString().split("T")[0];
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isHoliday = holidays.includes(dateStr);
    if (!isWeekend && !isHoliday) days++;
    current.setDate(current.getDate() + 1);
  }

  return days;
}
