import { useMemo, useState } from "react";
import { ArrowUpDown, LayoutGrid, List, Star } from "lucide-react";
import { Link } from "react-router-dom";
import Breadcrumbs from "../../components/student/Breadcrumbs";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import FilterSelect from "../../components/FilterSelect";
import { SearchInput } from "../../components/SearchInput";
import { offerings } from "../../mock/student";
import { teachers } from "../../mock/student";

const TABS = ["All", "In progress", "Future", "Past", "Starred", "Removed from view"];

function MyCourses() {
  const [tab, setTab] = useState("All");
  const [query, setQuery] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [starred, setStarred] = useState<string[]>([]);
  const [removed, setRemoved] = useState<string[]>([]);

  const courses = useMemo(() => {
    let list = offerings.filter((o) => {
      const matchesQuery = `${o.code} ${o.title} ${o.section}`.toLowerCase().includes(query.toLowerCase());
      if (!matchesQuery) return false;
      if (tab === "Starred") return starred.includes(o.offeringId);
      if (tab === "Removed from view") return removed.includes(o.offeringId);
      if (removed.includes(o.offeringId)) return false;
      if (tab === "Future") return false;
      if (tab === "Past") return false;
      return true;
    });
    list = [...list].sort((a, b) =>
      sortAsc ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title),
    );
    return list;
  }, [tab, query, sortAsc, starred, removed]);

  function toggleStar(id: string) {
    setStarred((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "My courses" }]} />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">My Courses</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortAsc((v) => !v)}
            title="Sort by course name"
          >
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
      ) : (
        <div className={layout === "grid" ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3" : "space-y-3"}>
          {courses.map((course) => {
            const teacher = teachers.find((t) => t.id === course.instructorId);
            return (
              <Card key={course.offeringId}>
                <CardHeader className="flex-row items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{course.department}</p>
                    <CardTitle className="mt-1">
                      {course.code}-{course.section}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{course.title}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => toggleStar(course.offeringId)}
                    title="Star course"
                  >
                    <Star className={`size-4 ${starred.includes(course.offeringId) ? "fill-yellow-400 text-yellow-500" : ""}`} />
                  </Button>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center justify-between gap-2">
                  <Link
                    to={`/student/teachers/${course.instructorId}`}
                    className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {teacher?.name ?? "Instructor"}
                  </Link>
                  <div className="flex gap-2">
                    <Link to={`/student/courses/${course.offeringId}`}>
                      <Button size="xs" variant="outline">View Course</Button>
                    </Link>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() =>
                        setRemoved((prev) =>
                          prev.includes(course.offeringId)
                            ? prev.filter((id) => id !== course.offeringId)
                            : [...prev, course.offeringId],
                        )
                      }
                    >
                      {removed.includes(course.offeringId) ? "Restore" : "Remove"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyCourses;
