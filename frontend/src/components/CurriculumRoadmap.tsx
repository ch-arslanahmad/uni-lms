import { useMemo, useState } from "react";
import {
  departments,
  programs,
  subjects,
  programCurriculums,
  type ProgramRow,
} from "../models";
import { SearchInput } from "./SearchInput";
import FilterDropdown from "./FilterDropdown";
import { StatMetric } from "./StatMetric";
import { Button } from "./ui/button";
import { ChevronDown, ChevronRight, BookOpen } from "lucide-react";

interface SubjectDetail {
  id: number;
  code: string;
  title: string;
  creditHours: number;
}

export interface CurriculumRoadmapProps {
  /** If provided, locks the roadmap to this program; otherwise shows dropdown selector */
  initialProgramCode?: string;
  initialDeptCode?: string;
  /** Whether the user can edit/add subjects (Admin mode vs Read-only Student/Teacher mode) */
  readOnly?: boolean;
}

export function CurriculumRoadmap({
  initialProgramCode,
  initialDeptCode,
  readOnly = false,
}: CurriculumRoadmapProps) {
  const [dept, setDept] = useState(initialDeptCode ?? departments[0]?.code ?? "CS");
  const filteredPrograms = useMemo(
    () => programs.filter((p) => p.departmentCode === dept),
    [dept],
  );
  const [prog, setProg] = useState(
    initialProgramCode ?? filteredPrograms[0]?.code ?? "BSCS",
  );
  const [search, setSearch] = useState("");

  const currentProgObj: ProgramRow | undefined = programs.find((p) => p.code === prog);

  // Active / current semester (Sem 5 default)
  const currentSemesterNum = 5;

  const [expandedSems, setExpandedSems] = useState<Record<number, boolean>>({
    [currentSemesterNum]: true,
  });

  const toggleSem = (sem: number) => {
    setExpandedSems((prev) => ({ ...prev, [sem]: !prev[sem] }));
  };

  // Group subjects by Semester (1 through totalSemesters)
  const semesterGroups = useMemo(() => {
    const programSubs = programCurriculums.filter((pc) => pc.programCode === prog);
    const totalSems = currentProgObj?.totalSemesters ?? 8;

    const list: { semester: number; subjects: SubjectDetail[]; totalCredits: number }[] = [];

    for (let s = 1; s <= totalSems; s++) {
      const semCurriculums = programSubs.filter((pc) => pc.semesterNumber === s);
      const semSubjects: SubjectDetail[] = semCurriculums
        .map((pc) => {
          const sub = subjects.find((item) => item.code === pc.subjectCode);
          return {
            id: pc.id,
            code: pc.subjectCode,
            title: sub?.title ?? "",
            creditHours: sub?.creditHours ?? 0,
          };
        })
        .filter(
          (sub) =>
            sub.code.toLowerCase().includes(search.toLowerCase()) ||
            sub.title.toLowerCase().includes(search.toLowerCase()),
        );

      if (semSubjects.length > 0 || search === "") {
        list.push({
          semester: s,
          subjects: semSubjects,
          totalCredits: semSubjects.reduce((acc, curr) => acc + curr.creditHours, 0),
        });
      }
    }

    return list;
  }, [prog, search, currentProgObj]);

  // Overall Program Stats
  const programSummary = useMemo(() => {
    const currs = programCurriculums.filter((pc) => pc.programCode === prog);
    const subCodes = [...new Set(currs.map((c) => c.subjectCode))];
    const matchingSubs = subjects.filter((s) => subCodes.includes(s.code));
    const totalCredits = matchingSubs.reduce((acc, curr) => acc + curr.creditHours, 0);

    return {
      totalSubjects: subCodes.length,
      totalCredits,
      totalSemesters: currentProgObj?.totalSemesters ?? 8,
      durationYears: currentProgObj?.durationYears ?? 4,
    };
  }, [prog, currentProgObj]);

  return (
    <div className="flex flex-col gap-4">
      {/* Program Selectors (if not locked to a fixed program) */}
      {!initialProgramCode && (
        <div className="flex flex-wrap items-center gap-3 text-sm pb-2 border-b">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="text-muted-foreground">Dept:</span>
            <FilterDropdown
              filters={departments.map((d) => d.code)}
              value={dept}
              onChange={(next) => {
                setDept(next);
                const nextProg = programs.find((p) => p.departmentCode === next);
                if (nextProg) setProg(nextProg.code);
              }}
            />
          </div>

          <div className="flex items-center gap-1.5 font-medium">
            <span className="text-muted-foreground">Program:</span>
            <FilterDropdown
              filters={filteredPrograms.map((p) => p.code)}
              value={prog}
              onChange={setProg}
            />
          </div>
        </div>
      )}

      {/* Program Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <StatMetric
          highlight
          label="Active Program"
          value={prog}
          description={`${currentProgObj?.durationYears}Y (${programSummary.totalSemesters} Sem)`}
        />
        <StatMetric
          label="Subjects"
          value={programSummary.totalSubjects}
          description="Curriculum"
        />
        <StatMetric
          label="Credits"
          value={`${programSummary.totalCredits} CH`}
          description="Requirement"
        />
        <StatMetric
          label="Departments"
          value={departments.length}
          description="Total faculties"
        />
      </div>

      {/* Search and Action Bar */}
      <div className="flex flex-wrap items-center gap-4">
        <SearchInput value={search} onChange={setSearch} />
        {!readOnly && (
          <Button size="sm" className="ml-auto">
            + Add Subject to Semester
          </Button>
        )}
      </div>

      {/* Semesters Collapsible List */}
      <div className="flex flex-col gap-3">
        {semesterGroups.map(({ semester, subjects: semSubs, totalCredits }) => {
          const isExpanded = expandedSems[semester] ?? false;
          const isCurrentSem = semester === currentSemesterNum;
          return (
            <div
              key={semester}
              className={`border rounded-lg overflow-hidden bg-card text-card-foreground shadow-sm transition-all ${
                isCurrentSem ? "border-primary/50 ring-1 ring-primary/20" : ""
              }`}
            >
              <button
                type="button"
                onClick={() => toggleSem(semester)}
                className={`w-full flex items-center justify-between p-2.5 px-3 transition-colors text-left ${
                  isCurrentSem ? "bg-primary/10 hover:bg-primary/15" : "bg-muted/40 hover:bg-muted/70"
                }`}
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronDown size={15} className={isCurrentSem ? "text-primary" : "text-muted-foreground"} />
                  ) : (
                    <ChevronRight size={15} className={isCurrentSem ? "text-primary" : "text-muted-foreground"} />
                  )}
                  <span className={`font-semibold text-sm ${isCurrentSem ? "text-primary" : ""}`}>
                    Semester {semester}
                  </span>
                  {isCurrentSem && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary text-primary-foreground">
                      Current
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground ml-1.5">
                    ({semSubs.length} {semSubs.length === 1 ? "subject" : "subjects"} • {totalCredits} Cr. Hrs)
                  </span>
                </div>
              </button>

              {isExpanded && (
                <div className="p-0 border-t">
                  {semSubs.length === 0 ? (
                    <div className="p-3 text-xs text-muted-foreground italic">
                      No subjects assigned to Semester {semester} yet.
                    </div>
                  ) : (
                    <div className="divide-y">
                      {semSubs.map((sub) => (
                        <div
                          key={sub.code}
                          className="flex items-center justify-between py-2 px-3 hover:bg-muted/20 transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <BookOpen size={14} className="text-primary" />
                            <div>
                              <span className="font-medium text-xs mr-2">{sub.code}</span>
                              <span className="text-xs text-foreground">{sub.title}</span>
                            </div>
                          </div>
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                            {sub.creditHours} CH
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
