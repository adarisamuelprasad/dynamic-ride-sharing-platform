import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

function Calendar({ className, classNames, showOutsideDays = true, ...props }) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0", month, caption, caption_label, nav, nav_button), "h-7 w-7 bg-transparent p-0 opacity-50 hover,
        ), nav_button_previous, nav_button_next, table, head_row, head_cell, row, cell)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20", day), "h-9 w-9 p-0 font-normal aria-selected), day_range_end, day_selected, day_today, day_outside, day_disabled, day_range_middle, day_hidden, ...classNames,
      }}
      components={{
        IconLeft) => <ChevronLeft className="h-4 w-4" />, IconRight) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
