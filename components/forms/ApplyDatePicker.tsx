"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

function formatDate(date: Date | undefined) {
  if (!date || isNaN(date.getTime())) {
    return ""
  }

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).replace(/,/g, '') // remove commas to match exactly "Sun March 15 2026"
}

function isValidDate(date: Date | undefined) {
  if (!date) {
    return false
  }
  return !isNaN(date.getTime())
}

type Props = {
  month: Date | undefined;
  dateValue: Date | undefined;
  eventDate: Date | undefined;
  setEventDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  setMonth: (e: any) => void;
  setDateValue: React.Dispatch<React.SetStateAction<Date | undefined>>;
}

export function ApplyDatePicker({ setDateValue, dateValue, eventDate, month, setEventDate, setMonth }: Props) {
  const [open, setOpen] = React.useState(false)

  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor="date" className="text-muted-foreground text-xs font-black uppercase tracking-widest">
        Event Date
      </Label>
      <div className="relative flex gap-2">
        <Input
          id="date"
          value={formatDate(dateValue)}
          readOnly
          placeholder="Sun March 15 2026"
          className="border-border bg-card text-foreground pr-10 cursor-pointer rounded-sm"
          onClick={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown" || e.key === "Enter") {
              e.preventDefault()
              setOpen(true)
            }
          }}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id="date-picker"
              variant="ghost"
              className="absolute top-1/2 right-2 size-6 -translate-y-1/2 text-muted-foreground hover:bg-transparent hover:text-foreground"
            >
              <CalendarIcon className="size-4" />
              <span className="sr-only">Select date</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto overflow-hidden p-0"
            align="end"
            alignOffset={-8}
            sideOffset={10}
          >
            <Calendar
              mode="single"
              selected={dateValue}
              captionLayout="dropdown"
              month={month}
              onMonthChange={setMonth}
              onSelect={(date) => {
                // setDate(date)
                setEventDate(date)
                // onDateChange(date)
                setDateValue(date)
                setOpen(false)
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
