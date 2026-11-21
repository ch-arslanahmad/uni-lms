import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

function formatOption(option: string) {
  return option === "all"
    ? "All"
    : option.charAt(0).toUpperCase() + option.slice(1);
}

function FilterDropdown({
  filters,
  value,
  onChange,
}: {
  filters: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Select
      value={value}
      onValueChange={(next) => {
        if (next != null) onChange(String(next));
      }}
    >
      <SelectTrigger size="sm" className="min-w-28">
        <SelectValue>
          {(current) => formatOption(String(current ?? "all"))}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {filters.map((option) => (
          <SelectItem key={option} value={option}>
            {formatOption(option)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default FilterDropdown;
