"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { reasonOptions } from "@/constant/constant";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface IncidentReasonComboboxProps {
  value: string;
  onChange: (value: string) => void;
}

export function IncidentReasonCombobox({
  value,
  onChange,
}: IncidentReasonComboboxProps) {
  const [inputValue, setInputValue] = React.useState(value);
  const [isFocused, setIsFocused] = React.useState(false);
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setInputValue(value);
  }, [value]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getFilteredOptions = (input: string) => {
    const normalizedInput = input?.toLowerCase() ?? "";
    return reasonOptions.filter((option) =>
      option.toLowerCase().includes(normalizedInput)
    );
  };

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    onChange(newValue);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="사유를 입력하거나 선택하세요"
          className="w-full"
        />
        {inputValue && (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setInputValue("");
              onChange("");
            }}
          >
            초기화
          </Button>
        )}
      </div>

      {isFocused && (
        <div className="absolute w-full mt-1 py-1 bg-popover border rounded-md shadow-md z-50">
          {getFilteredOptions(inputValue).length === 0 ? (
            <div className="px-2 py-1.5 w-full text-center text-sm text-muted-foreground">
              일치하는 사유가 없습니다.
            </div>
          ) : (
            <div className="max-h-[200px] overflow-y-auto">
              {getFilteredOptions(inputValue).map((option) => (
                <div
                  key={option}
                  className={cn(
                    "flex items-center px-2 py-1.5 text-sm cursor-pointer",
                    "hover:bg-accent hover:text-accent-foreground",
                    inputValue === option && "bg-accent"
                  )}
                  onClick={() => {
                    handleInputChange(option);
                    setIsFocused(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      inputValue === option ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
