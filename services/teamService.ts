import Team from "@/models/Team";

export async function hasManagerAccessToTeams(userId: string, teamIds: string[]): Promise<boolean> {
    const validTeamIds = teamIds.filter(Boolean);
    
    if (validTeamIds.length === 0) return false;

    const teams = await Team.find({
        _id: { $in: validTeamIds },
        managers: userId
    });

    return teams.length > 0;
}
