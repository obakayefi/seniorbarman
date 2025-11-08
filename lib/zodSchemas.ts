import { z } from 'zod'

export const eventSchema = z.discriminatedUnion("type", [
    z.object({
        type: z.literal("regular"),
        title: z.string().min(1, "Title is required"),
        date: z.string().min(1, "Date is required"),
        time: z.string().min(1, "Time is required"),
        venue: z.string().min(1, "Venue is required"),
        redirectUrl: z.string().url().optional(),
    }),

    z.object({
        type: z.literal("sports"),
        homeTeam: z.string().min(1, "Home team is required"),
        awayTeam: z.string().min(1, "Away team is required"),
        date: z.string().min(1, "Date is required"),
        time: z.string().min(1, "Time is required"),
        venue: z.string().min(1, "Venue is required"),
        redirectUrl: z.string().url().optional(),
    }),
]);

export type EventFormData = z.infer<typeof eventSchema>;