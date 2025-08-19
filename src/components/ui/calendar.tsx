"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, UI, SelectionState, DayFlag } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  // Improve accessibility/usability by default; can be overridden by props
  initialFocus = true,
  fixedWeeks = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      initialFocus={initialFocus}
      fixedWeeks={fixedWeeks}
      className={cn("p-3", className)}
      classNames={{
        [UI.Months]:
          "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        [UI.Month]: "space-y-4",
        [UI.MonthCaption]: "flex justify-center pt-1 relative items-center",
        [UI.CaptionLabel]: "text-sm font-medium",
        [UI.PreviousMonthButton]: cn(
          buttonVariants({ variant: "outline" }),
          "absolute left-1 top-0 h-8 w-8 bg-transparent p-0 opacity-70 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        ),
        [UI.NextMonthButton]: cn(
          buttonVariants({ variant: "outline" }),
          "absolute right-1 top-0 h-8 w-8 bg-transparent p-0 opacity-70 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        ),
        [UI.MonthGrid]: "w-full border-collapse space-y-1",
        [UI.Weekdays]: "flex",
        [UI.Weekday]:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.75rem]",
        [UI.Week]: "flex w-full mt-2",
        [UI.Day]:
          "h-9 w-9 text-center text-sm rounded-md p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        [UI.DayButton]: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 aria-selected:opacity-100"
        ),
        [SelectionState.range_end]: "day-range-end",
        [SelectionState.selected]:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        [DayFlag.today]: "ring-1 ring-primary text-foreground",
        [DayFlag.outside]:
          "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        [DayFlag.disabled]: "text-muted-foreground/60 opacity-50",
        [SelectionState.range_middle]:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        [DayFlag.hidden]: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ className, orientation, ...p }) => (
          <ChevronIcon className={cn("h-4 w-4", className)} orientation={orientation} {...p} />
        ),
      }}
      {...props}
    />
  )
}

function ChevronIcon({
  orientation = "left",
  className,
  ...props
}: {
  orientation?: "left" | "right" | "up" | "down"
  className?: string
}) {
  switch (orientation) {
    case "left":
      return <ChevronLeft className={cn("h-4 w-4", className)} {...props} />
    case "right":
      return <ChevronRight className={cn("h-4 w-4", className)} {...props} />
    default:
      return null
  }
}
Calendar.displayName = "Calendar"

export { Calendar }
