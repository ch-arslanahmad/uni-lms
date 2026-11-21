import * as React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export interface GroupedDropdownOption {
  value: string;
  label: string;
}

export interface GroupedDropdownSection {
  groupLabel: string;
  options: GroupedDropdownOption[];
}

export function GroupedSelectDropdown({
  groups,
  value,
  onChange,
  placeholder = "Select...",
}: {
  groups: GroupedDropdownSection[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const selectedLabel = React.useMemo(() => {
    for (const g of groups) {
      const match = g.options.find((o) => o.value === value);
      if (match) return match.label;
    }
    return value || placeholder;
  }, [groups, value, placeholder]);

  return (
    <Select
      value={value}
      onValueChange={(next) => {
        if (next != null) onChange(String(next));
      }}
    >
      <SelectTrigger size="sm" className="min-w-44">
        <SelectValue>{selectedLabel}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {groups.map((group) => (
          <SelectGroup key={group.groupLabel}>
            <SelectLabel className="font-semibold text-xs text-muted-foreground uppercase px-2 py-1">
              {group.groupLabel}
            </SelectLabel>
            {group.options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}

export default GroupedSelectDropdown;
