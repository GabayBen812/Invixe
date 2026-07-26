const DEFAULT_GREETING_NAME = "חבר/ה";

export function hasRealFirstName(
  firstName: string | null | undefined,
): boolean {
  return Boolean(firstName?.trim());
}

export function getDisplayFirstName(
  firstName: string | null | undefined,
): string {
  const trimmed = firstName?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : DEFAULT_GREETING_NAME;
}

export function getDisplayFullName(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
): string {
  const first = firstName?.trim();
  const last = lastName?.trim();
  if (first && last) return `${first} ${last}`;
  if (first) return first;
  return DEFAULT_GREETING_NAME;
}
