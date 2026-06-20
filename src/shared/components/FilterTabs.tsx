interface FilterTab {
  id: string | number;
  label: string;
  count?: number;
}

interface FilterTabsProps {
  tabs: FilterTab[];
  selected: string | number | null;
  onSelect: (id: string | number | null) => void;
}

export function FilterTabs({ tabs, selected, onSelect }: FilterTabsProps) {
  const total = tabs.reduce((sum, t) => sum + (t.count ?? 0), 0);
  const showCounts = tabs.some((t) => t.count !== undefined);

  return (
    <div>
      <label className="flex flex-col items-start gap-2">
        <p className="text-sm font-semibold text-foreground-dark tracking-wide">Filtro por Categoría</p>
        <select
          value={selected ?? ""}
          onChange={(e) => {
            const val = e.target.value;
            onSelect(val === "" ? null : (isNaN(Number(val)) ? val : Number(val)));
          }}
          className="border-2 rounded px-2 py-2 focus:outline-2 focus:outline-orange border-background bg-white text-sm font-medium text-foreground-dark cursor-pointer w-auto"
        >
          <option value="">Todos{showCounts ? ` (${total})` : ""}</option>
          {tabs.map((tab) => (
            <option key={tab.id} value={tab.id}>
              {tab.label}{tab.count !== undefined ? ` (${tab.count})` : ""}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
