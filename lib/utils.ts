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


export const CLUBS = [
    {
        name: "Awka United FC",
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