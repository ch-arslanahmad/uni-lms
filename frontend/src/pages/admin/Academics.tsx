import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  departments,
  subjects,
  type DepartmentRow,
  type SubjectRow,
} from "../../models";
import { SimpleTable, type Column } from "../../components/SimpleTable";
import { Button } from "../../components/ui/button";
import { SearchInput } from "../../components/SearchInput";
import FilterDropdown from "../../components/FilterDropdown";
import Tabs from "../../components/Tabs";
import { CurriculumRoadmap } from "../../components/CurriculumRoadmap";

const deptCols: Column<DepartmentRow>[] = [
  { key: "code", label: "Code" },
  { key: "name", label: "Department Name" },
  { key: "courses", label: "Total Courses" },
  { key: "teachers", label: "Teachers" },
  { key: "students", label: "Students" },
];

const catalogCols: Column<SubjectRow>[] = [
  { key: "code", label: "Course Code" },
  { key: "title", label: "Course Title" },
  { key: "departmentCode", label: "Department" },
  { key: "creditHours", label: "Credit Hours" },
];

export default function Academics() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const initialTab =
    tabParam === "departments" || tabParam === "courses" ? tabParam : "roadmap";

  const [tab, setTab] = useState<"roadmap" | "departments" | "courses">(initialTab);
  const [search, setSearch] = useState("");
  const [courseDeptFilter, setCourseDeptFilter] = useState<string>("ALL");

  // Sync tab state when URL search param changes
  useEffect(() => {
    if (tabParam === "departments" || tabParam === "courses" || tabParam === "roadmap") {
      setTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (next: "roadmap" | "departments" | "courses") => {
    setTab(next);
    setSearchParams({ tab: next });
    setSearch("");
  };

  // Filtered Master Course Catalog
  const catalogData = useMemo(() => {
    return subjects
      .filter((s) => courseDeptFilter === "ALL" || s.departmentCode === courseDeptFilter)
      .filter(
        (s) =>
          s.code.toLowerCase().includes(search.toLowerCase()) ||
          s.title.toLowerCase().includes(search.toLowerCase()),
      );
  }, [courseDeptFilter, search]);

  // Filtered Departments Table
  const departmentsData = useMemo(() => {
    return departments.filter(
      (d) =>
        d.code.toLowerCase().includes(search.toLowerCase()) ||
        d.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search]);

  return (
    <div className="flex flex-col min-h-screen p-4 gap-4">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-3">
        <div>
          <h1 className="text-2xl font-bold">Academics</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {tab === "roadmap"
              ? "Program Curriculum & Semester Roadmaps"
              : tab === "departments"
              ? "Faculties & Academic Departments Directory"
              : "Master Course Directory & Subject Catalog"}
          </p>
        </div>
      </div>

      {/* Tabs with Encapsulated Content */}
      <Tabs
        activeTab={tab}
        onChange={handleTabChange}
        tabs={[
          {
            id: "roadmap",
            label: "Curriculum Roadmap",
            content: <CurriculumRoadmap />,
          },
          {
            id: "departments",
            label: "Departments",
            content: (
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <SearchInput value={search} onChange={setSearch} />
                  <Button size="sm" variant="outline">+ New Department</Button>
                </div>
                <SimpleTable columns={deptCols} data={departmentsData} paginated={false} />
              </div>
            ),
          },
          {
            id: "courses",
            label: "Courses",
            content: (
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <SearchInput value={search} onChange={setSearch} />
                    <div className="flex items-center gap-1.5 text-sm font-medium">
                      <span className="text-muted-foreground">Department:</span>
                      <FilterDropdown
                        filters={["ALL", ...departments.map((d) => d.code)]}
                        value={courseDeptFilter}
                        onChange={setCourseDeptFilter}
                      />
                    </div>
                  </div>
                  <Button size="sm">+ New Course</Button>
                </div>
                <SimpleTable columns={catalogCols} data={catalogData} paginated={true} />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
