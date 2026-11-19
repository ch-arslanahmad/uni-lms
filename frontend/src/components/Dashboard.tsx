import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { DataTable } from "./data-table/data-table";
import { departmentColumns } from "./data-table/department-columns";
import { departments } from "../models";
import { Button } from "./ui/button";
import { UserPlus, Building2, BookOpen } from "lucide-react";

// Stat cards (top row) — hard-coded for now, computed from data later
interface CardsInfo {
  num: number;
  title: string;
}

const cards: CardsInfo[] = [
  { num: 5, title: "Total Teachers" },
  { num: 3, title: "Total Courses" },
  { num: 10, title: "Total Students" },
];

// Page, greeting → cards → departments table
function Dashboard({ name }: { name: string }) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      {/* --- Greeting --- */}
      <div className="flex flex-row items-baseline justify-between">
        <h1 className="text-2xl font-bold">
          Hello <span className="text-blue-500">{name}</span>
        </h1>
        <span className="text-sm text-muted-foreground">Fall 2022</span>
      </div>
      <p className="text-sm text-muted-foreground">Welcome to the Dashboard</p>

      {/* --- Stat cards --- */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <Card
            key={card.title + card.num}
            className="p-6 transition-shadow hover:shadow-md"
          >
            <p className="text-3xl font-bold tabular-nums text-blue-500">
              {card.num}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{card.title}</p>
          </Card>
        ))}
      </div>

      {/* --- Departments table (reusable DataTable) --- */}
      <div className="mt-10 flex flex-col gap-4 lg:flex-row">
        <div className="min-w-0 lg:basis-3/4">
          <h2 className="text-xl font-bold">Departments</h2>

          <DataTable
            columns={departmentColumns}
            data={departments}
            searchColumn="name"
            searchPlaceholder="Filter departments..."
          />
        </div>

        {/*Quick Options*/}
        <Card className="w-72">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button variant="outline">
              <UserPlus size={16} /> Add Account
            </Button>

            <Button variant="outline">
              <Building2 size={16} /> New Department
            </Button>
            <Button variant="outline">
              <BookOpen size={16} /> New Course
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;
