import { StaticImport } from "next/dist/shared/lib/get-img-props";
import type { Role } from "@/lib/roles";

export type StandType = "Popular Stand" | "Cover Stand Executive" | "Cover Stand Regular"

export interface IEvent {
  id: string;
  day: string;
  month: string;
  year: string;
  time: string;
  homeTeam: string;
  homeLogo?: string;
  awayTeam: string;
  awayLogo?: string;
  venue: string;
  type: string;
}

export interface EventType {
  _id: string;
  title?: string;
  day: string;
  month: string;
  year: string;
  date: Date;
  time?: string;
  venue: string;
  price: number;
  homeLogo: string | StaticImport;
  awayLogo: string | StaticImport;
  homeTeam?: string;
  awayTeam?: string;
  type: "event" | "sports";
  requiresApplication?: boolean;
}

export interface IUser {
  avatar?: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  id: string;
  role: Role;
}
