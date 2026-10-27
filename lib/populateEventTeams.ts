import mongoose from "mongoose";
import Team from "@/models/Team";

/**
 * Safely resolves and populates homeTeam and awayTeam on event objects.
 * Handles:
 * - valid ObjectIds (looks up Team by _id)
 * - team names stored as plain strings (e.g. "Rangers FC" - looks up Team by name, or falls back to { name: "Rangers FC" })
 * - already populated team objects
 * - works on single event object or array of event objects
 */
export async function populateTeamsForEvents<T = any>(events: T): Promise<T> {
    if (!events) return events;

    Team.init();

    const isArray = Array.isArray(events);
    const eventList: any[] = isArray ? events : [events];

    const objectIdsToFetch = new Set<string>();
    const namesToFetch = new Set<string>();

    for (const evt of eventList) {
        if (!evt || evt.type !== "sports") continue;

        const checkField = (field: any) => {
            if (!field) return;
            if (typeof field === "object") {
                if (field._id && typeof field._id.toString === "function") {
                    objectIdsToFetch.add(field._id.toString());
                } else if (field.name) {
                    return;
                }
            } else if (typeof field === "string") {
                const str = field.trim();
                if (mongoose.Types.ObjectId.isValid(str) && /^[0-9a-fA-F]{24}$/.test(str)) {
                    objectIdsToFetch.add(str);
                } else if (str.length > 0) {
                    namesToFetch.add(str);
                }
            }
        };

        checkField(evt.homeTeam);
        checkField(evt.awayTeam);
    }

    const teamMapById = new Map<string, any>();
    const teamMapByName = new Map<string, any>();

    const queries: Promise<any>[] = [];
    if (objectIdsToFetch.size > 0) {
        queries.push(
            Team.find({ _id: { $in: Array.from(objectIdsToFetch) } })
                .select("name logo")
                .lean()
        );
    }
    if (namesToFetch.size > 0) {
        queries.push(
            Team.find({ name: { $in: Array.from(namesToFetch) } })
                .select("name logo")
                .lean()
        );
    }

    if (queries.length > 0) {
        try {
            const results = await Promise.all(queries);
            for (const teamList of results) {
                for (const team of teamList) {
                    if (team._id) teamMapById.set(team._id.toString(), team);
                    if (team.name) teamMapByName.set(team.name.toLowerCase(), team);
                }
            }
        } catch (err) {
            console.error("Error fetching teams in populateTeamsForEvents:", err);
        }
    }

    const resolveTeam = (field: any) => {
        if (!field) return field;
        if (typeof field === "object") {
            if (field.name) return field;
            if (field._id) {
                const found = teamMapById.get(field._id.toString());
                return found || field;
            }
            return field;
        }
        if (typeof field === "string") {
            const trimmed = field.trim();
            if (mongoose.Types.ObjectId.isValid(trimmed) && /^[0-9a-fA-F]{24}$/.test(trimmed)) {
                const found = teamMapById.get(trimmed);
                return found || { _id: trimmed, name: trimmed };
            }
            const foundByName = teamMapByName.get(trimmed.toLowerCase());
            return foundByName || { _id: trimmed, name: trimmed };
        }
        return field;
    };

    for (const evt of eventList) {
        if (!evt || evt.type !== "sports") continue;
        evt.homeTeam = resolveTeam(evt.homeTeam);
        evt.awayTeam = resolveTeam(evt.awayTeam);
    }

    return isArray ? (eventList as any) : (eventList[0] as any);
}

/**
 * Safely populates event.homeTeam and event.awayTeam for application objects
 */
export async function populateTeamsForApplications<T = any>(applications: T): Promise<T> {
    if (!applications) return applications;
    const isArray = Array.isArray(applications);
    const appList: any[] = isArray ? applications : [applications];
    const events = appList.map(a => a?.event).filter(Boolean);
    if (events.length > 0) {
        await populateTeamsForEvents(events);
    }
    return applications;
}
