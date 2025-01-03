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
import { getItemsByItemNameAction } from "@/actions/realtime/realtime-user-item-action";

interface ItemComboBoxProps {
  value?: string;
  onChange?: (value: { id: string; name: string }) => void;
  placeholder?: string;
  className?: string;
}

export function ItemComboBox({
  value,
  onChange,
  placeholder,
  className,
}: ItemComboBoxProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const [items, setItems] = React.useState<
    { itemId: string; itemName: string }[]
  >([]);
  const [loading, setLoading] = React.useState(false);

  const debouncedSearch = useDebounce(inputValue);

  React.useEffect(() => {
    async function fetchItems() {
      if (!debouncedSearch) {
        setItems([]);
        return;
      }

      setLoading(true);
      try {
        const result = await getItemsByItemNameAction(debouncedSearch);
        if (result.success) {
          setItems(result.data);
        }
      } catch (error) {
        console.error("Error fetching items:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchItems();
  }, [debouncedSearch]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          <span className="text-ellipsis overflow-hidden whitespace-nowrap">
            {value
              ? items.find((item) => item.itemId.toString() === value)
                  ?.itemName || value
              : placeholder || "아이템 선택..."}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        sideOffset={4}
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="아이템 이름 검색..."
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList>
            <CommandEmpty>
              {loading ? "검색 중..." : "검색 결과가 없습니다."}
            </CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.itemId}
                  value={item.itemId.toString()}
                  onSelect={() => {
                    onChange?.({
                      id: item.itemId.toString(),
                      name: item.itemName,
                    });
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === item.itemId.toString()
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {item.itemName}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
