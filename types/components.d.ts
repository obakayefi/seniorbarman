import { StaticImport } from "next/dist/shared/lib/get-img-props";

export type StandType = "Popular Stand" | "Cover Stand Executive" | "Cover Stand Regular"

export interface IEvent {
  id: string;
  day: string;
  month: string;
  day: string;
  year: string;
  // date: { month: string; year: string; day: string };
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
}


export interface IUser {
  avatar?: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  id: string;
  role: "admin" | "user" | "bouncer";
}