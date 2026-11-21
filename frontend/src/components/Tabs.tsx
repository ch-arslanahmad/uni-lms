import type { ReactNode } from "react";

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  content: ReactNode;
}

export function Tabs<T extends string>({
  tabs,
  activeTab,
  onChange,
}: {
  tabs: TabItem<T>[];
  activeTab: T;
  onChange: (id: T) => void;
}) {
  const current = tabs.find((t) => t.id === activeTab) ?? tabs[0];

  return (
    <div className="flex flex-col gap-4">
      {/* Tab Navigation Header */}
      <div className="flex gap-2 border-b">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`px-3 py-1.5 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Active Tab Panel Content */}
      <div>{current?.content}</div>
    </div>
  );
}

export default Tabs;
