export const ROLE_NAMES = [
  "owner",
  "admin",
  "project_manager",
  "designer",
  "purchasing",
  "sales",
  "marketing",
] as const;

export type RoleName = (typeof ROLE_NAMES)[number];
