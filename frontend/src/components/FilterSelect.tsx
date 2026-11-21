function FilterSelect({
  filters,
  value,
  onChange,
}: {
  filters: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <>
      <div className="flex gap-2">
        {filters.map((t) => (
          <button
            key={t}
            onClick={() => onChange(t)}
            className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${
              value === t
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
    </>
  );
}

export default FilterSelect;
