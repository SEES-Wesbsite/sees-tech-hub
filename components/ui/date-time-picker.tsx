"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Clock } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { CalendarGrid } from "./calendar-grid"

interface DateTimePickerProps {
  value?: string // Expecting ISO string or valid date string like YYYY-MM-DDTHH:mm
  onChange: (dateStr: string) => void
  disabled?: boolean
}

export function DateTimePicker({ value, onChange, disabled }: DateTimePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(value ? new Date(value) : undefined)
  const [time, setTime] = React.useState<string>(
    value ? format(new Date(value), "HH:mm") : ""
  )
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    if (value) {
      setDate(new Date(value))
      setTime(format(new Date(value), "HH:mm"))
    }
  }, [value])

  const triggerChange = (newDate: Date, newTime: string) => {
    if (!newDate) return
    const d = new Date(newDate)
    if (newTime) {
      const [hours, minutes] = newTime.split(":").map(Number)
      d.setHours(hours)
      d.setMinutes(minutes)
    } else {
      d.setHours(0, 0, 0, 0)
    }
    // Convert to local datetime string format expected by inputs (YYYY-MM-DDTHH:mm)
    const formatted = `${format(d, "yyyy-MM-dd")}T${newTime || "00:00"}`
    onChange(formatted)
  }

  const handleDateSelect = (selectedDate: Date) => {
    setDate(selectedDate)
    triggerChange(selectedDate, time)
    setOpen(false)
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value
    setTime(newTime)
    if (date) {
      triggerChange(date, newTime)
    }
  }

  const dateRange = React.useMemo(() => ({
    from: date || null,
    to: date || null
  }), [date])

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            disabled={disabled}
            className={cn(
              "flex-1 justify-start text-left font-normal border-border rounded-xl h-10",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="start">
          <CalendarGrid
            value={dateRange}
            onSelect={handleDateSelect}
          />
        </PopoverContent>
      </Popover>

      <div className="relative w-32">
        <Input
          type="time"
          value={time}
          onChange={handleTimeChange}
          disabled={disabled || !date}
          className="w-full pl-8 h-10 rounded-xl border-border"
        />
        <Clock className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      </div>
    </div>
  )
}
