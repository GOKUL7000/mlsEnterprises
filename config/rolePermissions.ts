export type Role = "SUPER_ADMIN" | "ADMIN" | "INSIDESALE" | "SUPERVISOR" | "DRIVER"

export const rolePermissions: Record<Role, string[]> = {
  SUPER_ADMIN: [
    "dashboard",
    "company",
    "users",
    "logout",
  ],

  ADMIN: [
    "dashboard",
    "users",
    "parties",
    "suppliers",
    "drivers",
    "trucks",
    "trips",
    
    // "admin_settings",
    "logout",
  ],

  INSIDESALE: [
    "dashboard",
    "leads",
    "logout",
  ],

  SUPERVISOR: [
    "dashboard",
    "upload_leads",
    "leads",
    "breakreport",
    "logout",
  ],

  DRIVER: [
    "dashboard",
    "trips",
    "logout",
  ],
}




