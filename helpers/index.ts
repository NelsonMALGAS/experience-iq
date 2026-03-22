import { PERMISSION_LABELS } from "@/constants";
import { AdminPermissions } from "@/types";

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getActivePermissionLabels(
  permissions: AdminPermissions,
): string[] {
  return (Object.keys(permissions) as (keyof AdminPermissions)[])
    .filter((k) => permissions[k])
    .map((k) => PERMISSION_LABELS[k]);
}
