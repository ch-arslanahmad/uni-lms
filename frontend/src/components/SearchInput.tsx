// Controlled search input — the state lives in the PARENT (SimpleTable),
// this component only renders the input and reports changes upward.

import { Input } from "./ui/input";

export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="max-w-sm"
      />
    </>
  );
}
