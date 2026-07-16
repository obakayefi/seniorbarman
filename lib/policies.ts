import { hasManagerAccessToTeams } from "@/services/teamService";
import { ROLES, ROLE_GROUPS } from "./roles";

export async function canCreateEvent(user: { id: string; email: string; role: string }, eventPayload: any) {
    if (ROLE_GROUPS.ELEVATED.includes(user.role as any)) {
        return true;
    }

    if (user.role === ROLES.ORGANIZER) {
        return eventPayload.type !== "sports";
    }

    if (user.role === ROLES.TEAM_MANAGER) {
        if (eventPayload.type !== "sports") {
            return false; // Team managers can only create sports events
        }

        const { homeTeam, awayTeam } = eventPayload;
        if (!homeTeam && !awayTeam) return false;

        // Check if user manages either the homeTeam or awayTeam
        return await hasManagerAccessToTeams(user.id, [homeTeam, awayTeam]);
    }

    return false;
}

export async function canViewEventStats(user: { id: string; email: string; role: string }, event: any) {
    if (ROLE_GROUPS.ORGANIZER_ACCESS.includes(user.role as any)) {
        return true;
    }

    if (user.role === ROLES.TEAM_MANAGER) {
        // Team managers can view stats if they manage either the homeTeam or awayTeam
        return await hasManagerAccessToTeams(user.id, [event.homeTeam, event.awayTeam]);
    }

    return false;
}
