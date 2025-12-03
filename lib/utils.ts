import {clsx, type ClassValue} from "clsx"
import {twMerge} from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const STAND_TYPE = {
    POPULAR_STAND: "Popular Stand",
    COVER_STAND_REGULAR: "Cover Stand Regular",
    COVER_STAND_EXECUTIVE: "Cover Stand Executive"
}

export const sanitizeTicketValue = (value: any, max: number) => {
    if (isNaN(value)) return 0;

    let cleaned = String(value)
    if (cleaned.startsWith("0") && cleaned.length > 1) {
        cleaned = cleaned.replace(/^0+/, "");
    }

    const num = Number(cleaned)
    return Math.max(0, Math.min(num, max))
}

export function getInitials(fullName: string): string {
    if (!fullName) return '';
    return fullName
        .trim()
        .split(/\s+/)
        .map(name => name[0]?.toUpperCase())
        .join('')
        .slice(0, 2); // Optional: limit to 2 letters (e.g. JD)
}

export function giveTeamLogo(teamName: string) {
    const teamLogo = CLUBS.filter(club => (club.name === teamName))[0]?.icon
    console.log({teamLogo, teamName})
    return teamLogo ?? "https://placehold.co/600x400?font=roboto"
}

export function formatEvent(event: EventType) {
    const {day, month, year} = formatDate(event.date)
    const homeLogo = CLUBS.filter(club => (club.name === event.homeTeam))[0].icon
    const awayLogo = CLUBS.filter(club => (club.name === event.awayTeam))[0].icon

    return {
        day,
        month,
        year,
        awayLogo,
        homeLogo,
        awayTeam: event.awayTeam,
        homeTeam: event.homeTeam,
        venue: event.venue,
        time: event.time
    }
}

export function formatDate(date: Date) {
    const _date = new Date(date);
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

    return {
        month: months[_date.getMonth()],
        day: String(_date.getDate()).padStart(2, "0"),
        year: String(_date.getFullYear())
    };
}

export const CLUBS = [
    {
        name: "Akwa United FC",
        icon: "/clubs/awka.png"
    },
    {
        name: "Bayelsa United FC",
        icon: "/clubs/bayelsa-logo.png"
    },
    {
        name: "Bendel Insurance FC",
        icon: "/clubs/bendel.png"
    },
    {
        name: "Doma United FC",
        icon: "/clubs/doma.jpg"
    },
    {
        name: "El-Kanemi Warriors FC",
        icon: "/clubs/el-kanemi.png"
    },
    {
        name: "Enyimba FC",
        icon: "/clubs/enyimba-logo.png"
    },
    {
        name: "Gombe United FC",
        icon: "/clubs/gombe.png"
    },
    {
        name: "Heartland FC",
        icon: "/clubs/heartland.png"
    },
    {
        name: "Ikorodu City FC",
        icon: "/clubs/ikorodu-city-logo.png"
    },
    {
        name: "Kano Pillars FC",
        icon: "/clubs/kano-pillars.png"
    },
    {
        name: "Katsina United FC",
        icon: "/clubs/katsina.png"
    },
    {
        name: "Kwara State United",
        icon: "/clubs/kwara.png"
    },
    {
        name: "Lobi Stars FC",
        icon: "/clubs/lobi-stars.png"
    },
    {
        name: "Nasarawa United FC",
        icon: "/clubs/nasarawa.png"
    },
    {
        name: "Niger Tornadoes FC",
        icon: "/clubs/niger-tornadoes.png"
    },
    {
        name: "Plateau United FC",
        icon: "/clubs/plateau.png"
    },
    {
        name: "Rangers International FC",
        icon: "/clubs/rangers-logo.png"
    },
    {
        name: "Remo Stars FC",
        icon: "/clubs/remo-stars-logo.png"
    },
    {
        name: "Rivers United FC",
        icon: "/clubs/rivers.png"
    },
    {
        name: "Shooting Stars SC",
        icon: "/clubs/shooting-stars.png"
    },
    {
        name: "Sporting Lagos FC",
        icon: "/clubs/sporting-lagos.png"
    },
    {
        name: "Sunshine Stars FC",
        icon: "/clubs/sunshine-stars.png"
    },
]

export const STADIUMS = [
    {
        name: "Nnamdi Azikiwe Stadium",
        state: "Enugu"
    },
    {
        name: "Umuahia Township Stadium",
        state: "Abia"
    },
    {
        name: "Samson Siasia Stadium",
        state: "Bayela"
    },
    {
        name: "Sani Abacha Stadium",
        state: "Kano"
    },
    {
        name: "Samuel Ogbemudia Stadium",
        state: "Benin"
    },
    {
        name: "El-Kanemi Warrios Stadium",
        state: "Borno"
    },
    {
        name: "Enyimba Stadium",
        state: "Aba"
    },
    {
        name: "Dan Anyiam",
        state: "Imo"
    },
    {
        name: "Rashidi Yekini Mainbowl, George Innih Stadium",
        state: "Kwara"
    },
    {
        name: "Lafia City Stadium",
        state: "Nasarawa"
    },
    {
        name: "Bako Kontagora Stadium",
        state: "Niger"
    },
    {
        name: "New Jos Stadium",
        state: "Plateau"
    },
    {
        name: "MKO Abiola Stadium",
        state: "Ogun"
    },
    {
        name: "Adokiye Amiesimaka Stadium",
        state: "Rivers"
    },
    {
        name: "Lekan Salami Stadium",
        state: "Oyo"
    },
    {
        name: "Southern Delta Unity Stadium",
        state: "Delta"
    },
    {
        name: "Abubakar Tafawa Balewa Stadium",
        state: "Bauchi"
    },
]


export function giveLogo(clubName: string) {
    const _club = CLUBS.filter(club => club.name === clubName)[0]
    const data = _club ? _club.icon : '/club/rangers-logo.png'
    return data
}

export const STATUS_TEXT = ["Checked In", "Checked Out", "Not Checked In"]
export function extractTicketStatus (checkInLogs: []) {    
    let result;
    
    if (checkInLogs && checkInLogs.length === 0) {
        //console.log('Not Checked In!!!')
        return STATUS_TEXT[2]
    }
    
    const lastGateAction = checkInLogs?.[checkInLogs?.length - 1]
    // console.log({extractorLogs: checkInLogs, lastGateAction})
    
    if (lastGateAction?.action?.toLowerCase() === "entry") {
        result = STATUS_TEXT[0]
    }  else if (lastGateAction?.action?.toLowerCase() === "exit") {
        result = STATUS_TEXT[1]
    }
    
    // console.log({resultfromExtractor: result, lastGateAction})
    
    return result;
} 

export const sitemap = {
    user: {
        dashboard: "/u/events",
        tickets: "/u/tickets",
    },
    bouncer: {
        scanner: "/u/a/scanner",
    },
    admin: {
        createAdmin: "/u/a/staff/create",
        users: "/u/a/accounts",
        createEvent: "/u/a/events/create"
    },
}