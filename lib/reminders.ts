export type ReminderOffsetMinutes = 0 | 5 | 15 | 30 | 60 | 1440;

export type ReminderValue = ReminderOffsetMinutes | null;

export const reminderOptions: {
  label: string;
  value: ReminderValue;
}[] = [
  { label: "Ingen varsel", value: null },
  { label: "Ved tidspunkt", value: 0 },
  { label: "5 min før", value: 5 },
  { label: "15 min før", value: 15 },
  { label: "30 min før", value: 30 },
  { label: "1 time før", value: 60 },
  { label: "1 dag før", value: 1440 },
];

export function normalizeReminderOffset(
  value: number | string | null | undefined
): ReminderValue {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numericValue = Number(value);

  return reminderOptions.some((option) => option.value === numericValue)
    ? (numericValue as ReminderOffsetMinutes)
    : null;
}

export function formatReminderOffset(value: ReminderValue) {
  return (
    reminderOptions.find((option) => option.value === value)?.label ??
    reminderOptions[0].label
  );
}
