/**
 * Single source of truth for all user role strings.
 * Import `ROLES`, `ROLE_GROUPS`, and `Role` from here instead of
 * using raw string literals anywhere in the codebase.
 */

export const ROLES = {
    USER:         "user",
    ORGANIZER:    "organizer",
    TEAM_MANAGER: "team_manager",
    BOUNCER:      "bouncer",
    ADMIN:        "admin",
    DEV:          "dev",
} as const;

/** Union type of all valid role strings: "user" | "organizer" | "team_manager" | ... */
export type Role = typeof ROLES[keyof typeof ROLES];

/**
 * Pre-built role groups for use in `requireRole(...)` and conditional rendering.
 * Use these to avoid repeating the same role arrays in multiple places.
 */
export const ROLE_GROUPS = {
    /** admin + dev: full system access */
    ELEVATED:       [ROLES.ADMIN, ROLES.DEV] as Role[],
    /** admin + dev + organizer: can create and manage events */
    EVENT_CREATORS: [ROLES.ADMIN, ROLES.DEV, ROLES.ORGANIZER] as Role[],
    /** admin + dev + bouncer: staff-level access */
    STAFF:          [ROLES.ADMIN, ROLES.DEV, ROLES.BOUNCER] as Role[],
    /** organizer + team_manager: provider account types that require approval */
    PROVIDERS:      [ROLES.ORGANIZER, ROLES.TEAM_MANAGER] as Role[],
    /** All roles that can access the organizer dashboard */
    ORGANIZER_ACCESS: [ROLES.ORGANIZER, ROLES.ADMIN, ROLES.DEV] as Role[],
    /** Roles that can create events */
    CAN_CREATE_EVENT: [ROLES.ORGANIZER, ROLES.TEAM_MANAGER, ROLES.ADMIN, ROLES.DEV] as Role[],
} as const;
