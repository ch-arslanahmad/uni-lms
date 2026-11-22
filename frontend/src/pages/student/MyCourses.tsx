import { useMemo, useState } from "react";
import { ArrowUpDown, LayoutGrid, List, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Breadcrumbs from "../../components/student/Breadcrumbs";
import { Button } from "../../components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import FilterSelect from "../../components/FilterSelect";
import { SearchInput } from "../../components/SearchInput";
import { SimpleTable, type Column } from "../../components/SimpleTable";
import { offerings, teachers, type CourseOffering } from "../../mock/student";

const TABS = ["All", "In progress", "Future", "Past", "Starred"];

function TeacherBadge({ teacherId }: { teacherId: number }) {
  const teacher = teachers.find((t) => t.id === teacherId);
  const initials = (teacher?.name ?? "T").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  return (
    <span className="inline-flex items-center gap-2">
      <span className="inline-flex size-7 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white">
        {initials}
      </span>
      <span>{teacher?.name ?? "Instructor"}</span>
    </span>
  );
}

function MyCourses() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("All");
  const [query, setQuery] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [starred, setStarred] = useState<string[]>([]);

  const courses = useMemo(() => {
    let list = offerings.filter((o) => {
      const matchesQuery = `${o.code} ${o.title} ${o.section} ${o.term}`
        .toLowerCase()
        .includes(query.toLowerCase());
      if (!matchesQuery) return false;
      if (tab === "Starred") return starred.includes(o.offeringId);
      if (tab === "In progress") return o.status === "in-progress";
      if (tab === "Past") return o.status === "past";
      if (tab === "Future") return o.status === "future";
      return true;
    });
    list = [...list].sort((a, b) =>
      sortAsc ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title),
    );
    return list;
  }, [tab, query, sortAsc, starred]);

  function toggleStar(id: string) {
    setStarred((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  const columns: Column<CourseOffering>[] = [
    {
      key: "title",
      label: "Course",
      render: (c) => (
        <div>
          <p className="font-medium">{c.code} - {c.title}</p>
          <p className="text-xs text-muted-foreground">{c.department}</p>
        </div>
      ),
    },
    { key: "section", label: "Section" },
    { key: "term", label: "Term" },
    {
      key: "instructorId",
      label: "Instructor",
      render: (c) => (
        <Link
          to={`/student/teachers/${c.instructorId}`}
          className="text-blue-600 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          <TeacherBadge teacherId={c.instructorId} />
        </Link>
      ),
    },
    { key: "status", label: "Status", render: (c) => <span className="capitalize">{c.status.replace("-", " ")}</span> },
    {
      key: "offeringId",
      label: "Star",
      render: (c) => (
        <Button
          variant="ghost"
          size="icon-sm"
          title="Star course"
          onClick={(e) => {
            e.stopPropagation();
            toggleStar(c.offeringId);
          }}
        >
          <Star className={`size-4 ${starred.includes(c.offeringId) ? "fill-yellow-400 text-yellow-500" : ""}`} />
        </Button>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "My courses" }]} />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">My Courses</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setSortAsc((v) => !v)} title="Sort by course name">
            <ArrowUpDown className="size-4" /> Name {sortAsc ? "A-Z" : "Z-A"}
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setLayout(layout === "grid" ? "list" : "grid")}
            title="Switch layout"
          >
            {layout === "grid" ? <List className="size-4" /> : <LayoutGrid className="size-4" />}
          </Button>
        </div>
      </div>

      <FilterSelect filters={TABS} value={tab} onChange={setTab} />
      <SearchInput value={query} onChange={setQuery} placeholder="Search courses" />

      {courses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No courses in this view.
          </CardContent>
        </Card>
      ) : layout === "grid" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.offeringId} className="h-full">
              <CardHeader>
                <CardDescription className="text-xs uppercase tracking-wide">{course.department}</CardDescription>
                <CardTitle>{course.code}-{course.section}</CardTitle>
                <CardDescription>{course.title}</CardDescription>
                <CardAction>
                  <Button variant="ghost" size="icon-sm" onClick={() => toggleStar(course.offeringId)} title="Star course">
                    <Star className={`size-4 ${starred.includes(course.offeringId) ? "fill-yellow-400 text-yellow-500" : ""}`} />
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">{course.term} - <span className="capitalize">{course.status.replace("-", " ")}</span></p>
                <Link to={`/student/teachers/${course.instructorId}`} className="text-sm text-blue-600 hover:underline">
                  <TeacherBadge teacherId={course.instructorId} />
                </Link>
              </CardContent>
              <CardFooter className="mt-auto">
                <Link to={`/student/courses/${course.offeringId}`} className="w-full">
                  <Button size="sm" variant="outline" className="w-full">View Course</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <SimpleTable
          columns={columns}
          data={courses}
          searchable={false}
          searchKeys={["title", "code"]}
          onRowClick={(c) => navigate(`/student/courses/${c.offeringId}`)}
        />
      )}
    </div>
  );
}

export default MyCourses;
