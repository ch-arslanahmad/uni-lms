import type { ReactNode } from "react";

import {
  Tabs as TabsRoot,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

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
  return (
    <TabsRoot
      value={activeTab}
      onValueChange={(value) => onChange(value as T)}
      className="gap-4"
    >
      <TabsList
        variant="line"
        className="w-full justify-start gap-1 rounded-none border-b p-0"
      >
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className="rounded-none px-3 py-1.5"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className="mt-0">
          {tab.content}
        </TabsContent>
      ))}
    </TabsRoot>
  );
}

export default Tabs;
