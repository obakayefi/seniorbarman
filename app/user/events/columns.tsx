"use client"

// import { CheckInIcon, TrashIcon } from "@/components/ui/icons"
import { ColumnDef } from "@tanstack/react-table"
import { redirect } from "next/navigation"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type SportsCols = {
    id: string
    teamA: string
    teamB: string
    date: Date
    time: string
    status: "upcoming" | "ongoing"
    type: "soccer" | "regular"
}

// Based on the type of event selected there would be different columns

export const sportsColumns: ColumnDef<SportsCols>[] = [
    {
        accessorKey: "eventName",
        header: "Teams",
        cell: ({ row }) => (
            <div 
            onClick={() => redirect(`/org/events/${row.original.id}`)}
            className="flex cursor-pointer hover:opacity-80 justify-center items-center flex-col">
                <span className="font-medium">{row.original.teamA} </span>
                <span className="text-center">vs</span>
                <span className="font-medium">{row.original.teamB}</span>
            </div>
        ),
    },
    {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => {
            const type = row.original.type;
            const typeIcon = type === "soccer" ? "⚽" : type === "regular" ? "🎉" : "wrong type";
            return (
                <div className="inline-flex gap-2 bg-neutral-100 text-neutral-800 min-w-content rounded-md p-2">
                    <span className="">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                    <span className="mr-2">{typeIcon}</span>
                </div>
            );
        }
    },
    {
        accessorKey: "date",
        header: "Date",
    },
    {
        accessorKey: "time",
        header: "Time",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.status;
            const statusClasses = status === "ongoing" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800";
            return (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses}`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
            );
        }
    },
    {
        accessorKey: "action",
        header: "Action",
        cell: ({ row }) => {
            const status = row.original.status;

            if (status === "upcoming") {
                return (
                    <button
                        onClick={() => {
                            confirm(`Delete Event of ID ${row.original.id}`)
                        }}
                        className="text-red-600 opacity-80 hover:opacity-100 duration-100 cursor-pointer text-center justify-center items-center flex flex-col hover:underline">
                        <span>
                            {/* <TrashIcon /> */}
                            Trash
                        </span>
                        <span className="text-[#FF6600]">
                            Delete
                        </span>
                    </button>
                );
            }

            if (status === "ongoing") {
                return (
                    <button 
                        onClick={() => redirect(`/org/events/${row.original.id}/check-in`)}
                        className="text-[#FF6600] flex opacity-80 hover:opacity-100 duration-100 justify-center ml-2 items-center hover:underline flex-col cursor-pointer">
                        <span>
                            {/* <CheckInIcon /> */}
                            Check In
                        </span>
                        <span className="text-[#FF6600]">
                            LiVE
                        </span>
                    </button>
                );
            }
        }
    },
]