import { createHash } from "node:crypto";

import type { RoleName } from "@/src/lib/auth/role-constants";

export function hashInviteToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function formatRoleLabel(role: RoleName) {
  return role
    .split("_")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}
