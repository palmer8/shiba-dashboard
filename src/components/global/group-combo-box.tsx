"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDebounce } from "@/hooks/use-debounce";
import { getGroupsByGroupIdAction } from "@/actions/realtime/realtime-group-action";

interface GroupComboBoxProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  modal?: boolean;
}

export function GroupComboBox({
  value,
  onChange,
  placeholder,
  modal = true,
}: GroupComboBoxProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const [groups, setGroups] = React.useState<
    { groupId: string; groupBoolean: boolean }[]
  >([]);
  const [loading, setLoading] = React.useState(false);

  const debouncedSearch = useDebounce(inputValue);

  React.useEffect(() => {
    async function fetchGroups() {
      if (!debouncedSearch) {
        setGroups([]);
        return;
      }
      setLoading(true);
      try {
        const result = await getGroupsByGroupIdAction(debouncedSearch);
        if (result.success) {
          setGroups(result.data ?? []);
        }
      } catch (error) {
        console.error("Error fetching groups:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchGroups();
  }, [debouncedSearch]);

  return (
    <Popover modal={modal} open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value
            ? groups.find((g) => g.groupId === value)?.groupId || value
            : placeholder || "그룹 선택..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="그룹 ID 검색..."
            autoFocus
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList>
            <CommandEmpty>
              {loading ? "검색 중..." : "검색 결과가 없습니다."}
            </CommandEmpty>
            <CommandGroup>
              {groups.map((group) => (
                <CommandItem
                  key={group.groupId}
                  value={group.groupId}
                  onSelect={(currentValue) => {
                    onChange?.(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === group.groupId ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span>{group.groupId}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
