const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);

export function isDoctorAnalyticsEnabled() {
  const raw = process.env.NEXT_PUBLIC_DOCTOR_ANALYTICS_ENABLED;
  if (!raw) return false;
  return TRUE_VALUES.has(raw.toLowerCase());
}
