import { Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Breadcrumbs from "../../components/student/Breadcrumbs";
import { SearchInput } from "../../components/SearchInput";
import FilterSelect from "../../components/FilterSelect";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { teacherSections } from "../../api";

function MyClasses() {
  const [query, setQuery] = useState("");
  const [term, setTerm] = useState("All");
  const terms = ["All", ...new Set(teacherSections.map((s) => s.term))];
  const filtered = useMemo(() => teacherSections.filter((s) => {
    const q = `${s.section.subjectCode} ${s.subjectTitle} ${s.section.code} ${s.section.programCode}`.toLowerCase();
    return q.includes(query.toLowerCase()) && (term === "All" || s.term === term);
  }), [query, term]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "My classes" }]} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">My Classes</h1>
          <p className="text-sm text-muted-foreground">Assigned sections only. Section structure and enrolments are admin-managed.</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <FilterSelect filters={terms} value={term} onChange={setTerm} />
        <SearchInput value={query} onChange={setQuery} placeholder="Search classes" />
      </div>
      {filtered.length === 0 ? <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">No assigned classes found.</CardContent></Card> : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <Card key={c.id} className="h-full">
              <CardHeader>
                <CardDescription className="text-xs uppercase tracking-wide">{c.section.programCode} · {c.term}</CardDescription>
                <CardTitle>{c.section.subjectCode} - Section {c.section.code}</CardTitle>
                <CardDescription>{c.subjectTitle}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1 text-sm text-muted-foreground">
                <p>{c.schedule}</p>
                <p className="inline-flex items-center gap-1.5"><Users className="size-4" />{c.section.enrolledCount} enrolled students</p>
              </CardContent>
              <CardFooter className="mt-auto">
                <Link to={`/teacher/classes/${c.id}`} className="w-full"><Button variant="outline" size="sm" className="w-full">Open class</Button></Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyClasses;