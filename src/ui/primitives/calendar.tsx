"use client";

import type * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "~/lib/cn";
import { buttonVariants } from "~/ui/primitives/button";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      className={cn("p-3", className)}
      classNames={{
        caption: "text-center pt-1 relative w-full",
        caption_label: "text-sm font-medium",
        cell: "relative p-0 text-center text-sm",
        day: "w-8 h-8 p-0 font-normal text-slate-700 hover:bg-slate-100 rounded",
        day_disabled: "text-slate-300 opacity-50",
        day_hidden: "invisible",
        day_outside: "text-slate-300",
        day_range_end: "rounded-r",
        day_range_middle: "rounded-none",
        day_range_start: "rounded-l",
        day_selected: "bg-blue-600 text-white rounded",
        day_today: "border-2 border-blue-500 text-blue-600 font-bold",
        head_cell: "text-slate-600 w-8 font-semibold text-xs uppercase",
        head_row: "",
        month: "gap-2",
        months: "gap-4",
        nav: "flex items-center gap-1",
        nav_button: "bg-white border border-slate-300 p-0 w-7 h-7 hover:bg-slate-100 opacity-50 hover:opacity-100",
        nav_button_next: "absolute right-1",
        nav_button_previous: "absolute left-1",
        row: "",
        table: "w-full border-collapse",
        ...classNames,
      }}
      components={{
        Chevron: CalendarChevron,
      }}
      showOutsideDays={showOutsideDays}
      {...props}
    />
  );
}

function CalendarChevron({
  className,
  orientation = "right",
}: {
  className?: string;
  disabled?: boolean;
  orientation?: "down" | "left" | "right" | "up";
  size?: number;
}) {
  const Icon = orientation === "left" ? ChevronLeft : ChevronRight;
  return <Icon className={cn("size-4", className)} />;
}

export { Calendar };
