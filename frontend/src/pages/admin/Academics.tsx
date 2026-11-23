import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  type DepartmentRow,
  type SubjectRow,
  type AcademicTermRow,
  type SectionRow,
} from "../../models";
import {
  useAdminStore,
  departmentRowsWithCounts,
  saveDepartment,
  saveSubject,
  saveTerm,
  saveSection,
  deleteDepartment,
  deleteSubject,
  deleteTerm,
  deleteSection,
} from "../../lib/adminStore";
import { SimpleTable, type Column } from "../../components/SimpleTable";
import { Button } from "../../components/ui/button";
import { SearchInput } from "../../components/SearchInput";
import FilterDropdown from "../../components/FilterDropdown";
import Tabs from "../../components/Tabs";
import { CurriculumRoadmap } from "../../components/CurriculumRoadmap";
import { FormDialog, type FormField } from "../../components/FormDialog";
import { Pencil } from "lucide-react";

type TabId = "roadmap" | "departments" | "courses" | "terms" | "sections";
type DialogState =
  | { kind: "department"; row?: DepartmentRow }
  | { kind: "subject"; row?: SubjectRow }
  | { kind: "term"; row?: AcademicTermRow }
  | { kind: "section"; row?: SectionRow };

function editColumn<T>(onEdit: (row: T) => void, key: keyof T & string): Column<T> {
  return {
    key,
    id: "actions",
    label: "",
    render: (row) => (
      <Button
        variant="ghost"
        size="sm"
        aria-label="Edit row"
        onClick={(e) => {
          e.stopPropagation();
          onEdit(row);
        }}
      >
        <Pencil size={14} />
      </Button>
    ),
  };
}

export default function Academics() {
  const store = useAdminStore();
  const departments = useMemo(() => departmentRowsWithCounts(store), [store]);

  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const isTabId = (v: string | null): v is TabId =>
    v === "departments" || v === "courses" || v === "terms" || v === "sections" || v === "roadmap";
  const initialTab: TabId = isTabId(tabParam) ? tabParam : "roadmap";

  const [tab, setTab] = useState<TabId>(initialTab);
  const [search, setSearch] = useState("");
  const [courseDeptFilter, setCourseDeptFilter] = useState<string>("ALL");
  const [sectionTermFilter, setSectionTermFilter] = useState<string>("ALL");
  const [dialog, setDialog] = useState<DialogState | null>(null);

  // Sync tab state when URL search param changes
  useEffect(() => {
    if (isTabId(tabParam)) setTab(tabParam);
  }, [tabParam]);

  const handleTabChange = (next: TabId) => {
    setTab(next);
    setSearchParams({ tab: next });
    setSearch("");
  };

  const matchesSearch = (...values: string[]) =>
    values.some((v) => v.toLowerCase().includes(search.toLowerCase()));

  // Filtered Master Course Catalog
  const catalogData = useMemo(() => {
    return store.subjects
      .filter((s) => courseDeptFilter === "ALL" || s.departmentCode === courseDeptFilter)
      .filter((s) => matchesSearch(s.code, s.title));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.subjects, courseDeptFilter, search]);

  // Filtered Departments Table
  const departmentsData = useMemo(
    () => departments.filter((d) => matchesSearch(d.code, d.name)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [departments, search],
  );

  const termsData = useMemo(
    () => store.academicTerms.filter((t) => matchesSearch(t.name)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store.academicTerms, search],
  );

  const sectionsData = useMemo(
    () =>
      store.sections
        .filter((s) => sectionTermFilter === "ALL" || s.termName === sectionTermFilter)
        .filter((s) => matchesSearch(s.subjectCode, s.programCode, s.code, s.teacherName ?? "")),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store.sections, sectionTermFilter, search],
  );

  const deptCols: Column<DepartmentRow>[] = [
    { key: "code", label: "Code" },
    { key: "name", label: "Department Name" },
    { key: "courses", label: "Total Courses" },
    { key: "teachers", label: "Teachers" },
    { key: "students", label: "Students" },
    editColumn<DepartmentRow>((row) => setDialog({ kind: "department", row }), "code"),
  ];

  const catalogCols: Column<SubjectRow>[] = [
    { key: "code", label: "Course Code" },
    { key: "title", label: "Course Title" },
    { key: "departmentCode", label: "Department" },
    { key: "creditHours", label: "Credit Hours" },
    editColumn<SubjectRow>((row) => setDialog({ kind: "subject", row }), "code"),
  ];

  const termCols: Column<AcademicTermRow>[] = [
    { key: "name", label: "Term" },
    { key: "startDate", label: "Start Date" },
    { key: "endDate", label: "End Date" },
    {
      key: "isActive",
      label: "Status",
      render: (row) => (
        <span
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
            row.isActive
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
              : "bg-muted text-muted-foreground border"
          }`}
        >
          {row.isActive ? "Active" : "Archived"}
        </span>
      ),
    },
    editColumn<AcademicTermRow>((row) => setDialog({ kind: "term", row }), "name"),
  ];

  const sectionCols: Column<SectionRow>[] = [
    { key: "subjectCode", label: "Course" },
    { key: "programCode", label: "Program" },
    { key: "code", label: "Section" },
    { key: "termName", label: "Term" },
    { key: "teacherName", label: "Teacher", render: (row) => row.teacherName || "—" },
    { key: "enrolledCount", label: "Enrolled" },
    editColumn<SectionRow>((row) => setDialog({ kind: "section", row }), "code"),
  ];

  // Dialog field configs + submit handlers per entity kind
  interface DialogConfig {
    title: string;
    description: string;
    fields: FormField[];
    initialValues?: Record<string, string>;
    onSubmit: (values: Record<string, string>) => string | null;
    onDelete?: () => string | null;
  }
  const dialogConfig = useMemo<DialogConfig | null>((): DialogConfig | null => {
    if (!dialog) return null;
    const deptOptions = store.departments.map((d) => ({ value: d.code, label: `${d.code} — ${d.name}` }));
    const teacherOptions = [
      { value: "", label: "— Unassigned —" },
      ...store.users
        .filter((u) => u.role === "teacher")
        .map((u) => ({ value: u.name, label: `${u.name} (${u.department})` })),
    ];

    switch (dialog.kind) {
      case "department":
        return {
          title: dialog.row ? "Edit Department" : "New Department",
          description: "Department code is the unique key (e.g. CS).",
          fields: [
            { name: "code", label: "Code", placeholder: "CS", disabled: !!dialog.row },
            { name: "name", label: "Name", placeholder: "Computer Science" },
          ] as FormField[],
          initialValues: dialog.row
            ? { code: dialog.row.code, name: dialog.row.name }
            : undefined,
          onSubmit: (v: Record<string, string>) =>
            saveDepartment(v.name, v.code, dialog.row?.code),
          onDelete: dialog.row ? () => deleteDepartment(dialog.row!.code) : undefined,
        };
      case "subject":
        return {
          title: dialog.row ? "Edit Course" : "New Course",
          description: "Courses belong to one department and carry credit hours.",
          fields: [
            { name: "code", label: "Code", placeholder: "CS-301", disabled: !!dialog.row },
            { name: "title", label: "Title", placeholder: "Database Systems" },
            { name: "departmentCode", label: "Department", type: "select", options: deptOptions },
            { name: "creditHours", label: "Credit Hours", type: "number", placeholder: "3" },
          ] as FormField[],
          initialValues: dialog.row
            ? {
                code: dialog.row.code,
                title: dialog.row.title,
                departmentCode: dialog.row.departmentCode,
                creditHours: String(dialog.row.creditHours),
              }
            : undefined,
          onSubmit: (v: Record<string, string>) =>
            saveSubject(
              { code: v.code, title: v.title, departmentCode: v.departmentCode, creditHours: Number(v.creditHours) },
              dialog.row?.code,
            ),
          onDelete: dialog.row ? () => deleteSubject(dialog.row!.code) : undefined,
        };
      case "term":
        return {
          title: dialog.row ? "Edit Academic Term" : "New Academic Term",
          description: "Terms group section offerings (e.g. Fall 2026).",
          fields: [
            { name: "name", label: "Name", placeholder: "Fall 2026", disabled: !!dialog.row },
            { name: "startDate", label: "Start Date", type: "date" },
            { name: "endDate", label: "End Date", type: "date" },
            {
              name: "isActive",
              label: "Status",
              type: "select",
              options: [
                { value: "true", label: "Active" },
                { value: "false", label: "Archived" },
              ],
            },
          ] as FormField[],
          initialValues: dialog.row
            ? {
                name: dialog.row.name,
                startDate: dialog.row.startDate,
                endDate: dialog.row.endDate,
                isActive: String(dialog.row.isActive),
              }
            : { isActive: "false" },
          onSubmit: (v: Record<string, string>) =>
            saveTerm(
              { name: v.name, startDate: v.startDate, endDate: v.endDate, isActive: v.isActive === "true" },
              dialog.row?.name,
            ),
          onDelete: dialog.row ? () => deleteTerm(dialog.row!.name) : undefined,
        };
      case "section":
        return {
          title: dialog.row ? "Edit Section" : "New Section",
          description: "A section offers one course to one program in a term.",
          fields: [
            {
              name: "subjectCode",
              label: "Course",
              type: "select",
              options: store.subjects.map((s) => ({ value: s.code, label: `${s.code} — ${s.title}` })),
            },
            {
              name: "termName",
              label: "Term",
              type: "select",
              options: store.academicTerms.map((t) => ({ value: t.name, label: t.name })),
            },
            {
              name: "programCode",
              label: "Program",
              type: "select",
              options: store.programs.map((p) => ({ value: p.code, label: p.code })),
            },
            { name: "code", label: "Section", placeholder: "A" },
            { name: "teacherName", label: "Teacher", type: "select", options: teacherOptions, required: false },
          ] as FormField[],
          initialValues: dialog.row
            ? {
                subjectCode: dialog.row.subjectCode,
                termName: dialog.row.termName,
                programCode: dialog.row.programCode,
                code: dialog.row.code,
                teacherName: dialog.row.teacherName ?? "",
              }
            : undefined,
          onSubmit: (v: Record<string, string>) =>
            saveSection(
              {
                subjectCode: v.subjectCode,
                termName: v.termName,
                programCode: v.programCode,
                code: v.code,
                teacherName: v.teacherName || undefined,
              },
              dialog.row?.id,
            ),
          onDelete: dialog.row ? () => deleteSection(dialog.row!.id) : undefined,
        };
    }
  }, [dialog, store]);

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
              : tab === "courses"
              ? "Master Course Directory & Subject Catalog"
              : tab === "terms"
              ? "Academic Terms & Semester Calendar"
              : "Section Offerings per Course, Program & Term"}
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
                  <Button size="sm" variant="outline" onClick={() => setDialog({ kind: "department" })}>
                    + New Department
                  </Button>
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
                        filters={["ALL", ...store.departments.map((d) => d.code)]}
                        value={courseDeptFilter}
                        onChange={setCourseDeptFilter}
                      />
                    </div>
                  </div>
                  <Button size="sm" onClick={() => setDialog({ kind: "subject" })}>
                    + New Course
                  </Button>
                </div>
                <SimpleTable columns={catalogCols} data={catalogData} paginated={true} />
              </div>
            ),
          },
          {
            id: "terms",
            label: "Terms",
            content: (
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <SearchInput value={search} onChange={setSearch} />
                  <Button size="sm" onClick={() => setDialog({ kind: "term" })}>
                    + New Term
                  </Button>
                </div>
                <SimpleTable columns={termCols} data={termsData} paginated={false} />
              </div>
            ),
          },
          {
            id: "sections",
            label: "Sections",
            content: (
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <SearchInput value={search} onChange={setSearch} />
                    <div className="flex items-center gap-1.5 text-sm font-medium">
                      <span className="text-muted-foreground">Term:</span>
                      <FilterDropdown
                        filters={["ALL", ...store.academicTerms.map((t) => t.name)]}
                        value={sectionTermFilter}
                        onChange={setSectionTermFilter}
                      />
                    </div>
                  </div>
                  <Button size="sm" onClick={() => setDialog({ kind: "section" })}>
                    + New Section
                  </Button>
                </div>
                <SimpleTable columns={sectionCols} data={sectionsData} paginated={true} />
              </div>
            ),
          },
        ]}
      />

      {dialogConfig && (
        <FormDialog
          open={!!dialog}
          onOpenChange={(open) => !open && setDialog(null)}
          title={dialogConfig.title}
          description={dialogConfig.description}
          fields={dialogConfig.fields}
          initialValues={dialogConfig.initialValues}
          submitLabel={dialog && "row" in dialog && dialog.row ? "Save Changes" : "Create"}
          onSubmit={dialogConfig.onSubmit}
          onDelete={dialogConfig.onDelete}
        />
      )}
    </div>
  );
}
