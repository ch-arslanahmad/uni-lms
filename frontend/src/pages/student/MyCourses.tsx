import { useMemo, useState } from "react";
import { ArrowUpDown, LayoutGrid, List, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Breadcrumbs from "../../components/student/Breadcrumbs";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import FilterSelect from "../../components/FilterSelect";
import { SearchInput } from "../../components/SearchInput";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { offerings, teachers } from "../../mock/student";

const TABS = ["All", "In progress", "Future", "Past", "Starred"];

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
          {courses.map((course) => {
            const teacher = teachers.find((t) => t.id === course.instructorId);
            return (
              <Card key={course.offeringId}>
                <CardHeader className="flex-row items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{course.department}</p>
                    <CardTitle className="mt-1">{course.code}-{course.section}</CardTitle>
                    <p className="text-sm text-muted-foreground">{course.title}</p>
                    <p className="text-xs text-muted-foreground">{course.term}</p>
                  </div>
                  <Button variant="ghost" size="icon-sm" onClick={() => toggleStar(course.offeringId)} title="Star course">
                    <Star className={`size-4 ${starred.includes(course.offeringId) ? "fill-yellow-400 text-yellow-500" : ""}`} />
                  </Button>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center justify-between gap-2">
                  <Link to={`/student/teachers/${course.instructorId}`} className="text-sm text-blue-600 hover:underline">
                    {teacher?.name ?? "Instructor"}
                  </Link>
                  <Link to={`/student/courses/${course.offeringId}`}>
                    <Button size="xs" variant="outline">View Course</Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Term</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => {
                  const teacher = teachers.find((t) => t.id === course.instructorId);
                  return (
                    <TableRow
                      key={course.offeringId}
                      className="cursor-pointer"
                      onClick={() => navigate(`/student/courses/${course.offeringId}`)}
                    >
                      <TableCell>
                        <p className="font-medium">{course.code} - {course.title}</p>
                        <p className="text-xs text-muted-foreground">{course.department}</p>
                      </TableCell>
                      <TableCell>{course.section}</TableCell>
                      <TableCell>{course.term}</TableCell>
                      <TableCell>
                        <Link
                          to={`/student/teachers/${course.instructorId}`}
                          className="text-blue-600 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {teacher?.name ?? "Instructor"}
                        </Link>
                      </TableCell>
                      <TableCell className="capitalize">{course.status.replace("-", " ")}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          title="Star course"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStar(course.offeringId);
                          }}
                        >
                          <Star className={`size-4 ${starred.includes(course.offeringId) ? "fill-yellow-400 text-yellow-500" : ""}`} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default MyCourses;
