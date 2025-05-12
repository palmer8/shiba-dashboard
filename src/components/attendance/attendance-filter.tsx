"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { DateRange } from "react-day-picker";

interface AttendanceFilterProps {
  date: DateRange | undefined;
  onDateChange: (date: DateRange | undefined) => void;
}

export function AttendanceFilter({
  date,
  onDateChange,
}: AttendanceFilterProps) {
  const handlePrevMonth = () => {
    const currentFrom = date?.from || new Date();
    const prevMonthStart = startOfMonth(subMonths(currentFrom, 1));
    const prevMonthEnd = endOfMonth(prevMonthStart);
    onDateChange({ from: prevMonthStart, to: prevMonthEnd });
  };

  const handleNextMonth = () => {
    const currentFrom = date?.from || new Date();
    const nextMonthStart = startOfMonth(addMonths(currentFrom, 1));
    const nextMonthEnd = endOfMonth(nextMonthStart);
    onDateChange({ from: nextMonthStart, to: nextMonthEnd });
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 md:gap-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevMonth}
          aria-label="이전 달"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full sm:w-[280px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "yyyy.MM.dd")} -{" "}
                    {format(date.to, "yyyy.MM.dd")}
                  </>
                ) : (
                  format(date.from, "yyyy.MM.dd")
                )
              ) : (
                <span>날짜 범위를 선택하세요</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={onDateChange}
              numberOfMonths={2}
              locale={ko}
            />
          </PopoverContent>
        </Popover>
        <Button
          variant="outline"
          size="icon"
          onClick={handleNextMonth}
          aria-label="다음 달"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
