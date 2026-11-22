import { Link, useParams } from "react-router-dom";
import Breadcrumbs from "../../components/student/Breadcrumbs";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { offerings, teachers } from "../../mock/student";

function TeacherProfilePage() {
  const { teacherId } = useParams();
  const teacher = teachers.find((t) => String(t.id) === teacherId);
  if (!teacher) return <div className="mx-auto max-w-5xl px-4 py-8">Teacher not found.</div>;
  const courses = offerings.filter((o) => teacher.courseIds.includes(o.offeringId));

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "Teacher profile" }]} />
      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 py-6">
          <div className="flex size-16 items-center justify-center rounded-full bg-blue-500 text-2xl font-bold text-white">
            {teacher.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold">{teacher.name}</h1>
            <p className="text-sm text-muted-foreground">{teacher.department} · {teacher.location}</p>
            <p className="text-sm text-muted-foreground">{teacher.email}</p>
            <p className="text-xs text-muted-foreground">Last access: {teacher.lastAccess}</p>
          </div>
          <a href={`mailto:${teacher.email}`} className="ml-auto">
            <Button size="sm">Message</Button>
          </a>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Courses</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {courses.length === 0 ? (
            <p className="text-sm text-muted-foreground">No assigned courses.</p>
          ) : courses.map((course) => (
            <Link
              key={course.offeringId}
              to={`/student/courses/${course.offeringId}`}
              className="flex items-center justify-between rounded-lg border px-4 py-3 text-sm hover:bg-muted"
            >
              <span><span className="font-medium">{course.code}-{course.section}</span> · {course.title}</span>
              <span className="text-muted-foreground">View</span>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default TeacherProfilePage;
