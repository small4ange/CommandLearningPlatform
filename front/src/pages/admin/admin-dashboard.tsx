import React from "react";
import { Link } from "react-router-dom";
import { Card, CardBody, CardHeader, CardFooter, Button, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Layout } from "../../components/layout";
import { getAllCourses, deleteCourse as apiDeleteCourse } from "../../api/courses";
import { Course } from "../../types/course";

export const AdminDashboard: React.FC = () => {
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const coursesData = await getAllCourses();
        setCourses(coursesData);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
        setError("Failed to load courses. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCourses();
  }, []);

  const handleDeleteCourse = async (courseId: string) => {
    if (window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      try {
        await apiDeleteCourse(courseId);
        setCourses(courses.filter(course => course.id !== courseId));
      } catch (err) {
        console.error("Failed to delete course:", err);
        alert("Failed to delete course. Please try again.");
      }
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-default-500">Manage courses and content</p>
        </div>
        <Button
          as={Link}
          to="/admin/courses/create"
          color="primary"
          startContent={<Icon icon="lucide:plus" />}
        >
          Create New Course
        </Button>
      </div>

      <Card disableRipple>
        <CardHeader>
          <h2 className="text-xl font-semibold">All Courses</h2>
        </CardHeader>
        <Divider />
        <CardBody>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <p>Loading courses...</p>
            </div>
          ) : courses.length > 0 ? (
            <Table removeWrapper aria-label="Courses table">
              <TableHeader>
                <TableColumn>TITLE</TableColumn>
                <TableColumn>ENROLLMENT CODE</TableColumn>
                <TableColumn>CHAPTERS</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded overflow-hidden">
                          <img 
                            src={course.imageUrl} 
                            alt={course.title} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium">{course.title}</p>
                          <p className="text-default-500 text-small line-clamp-1">
                            {course.description}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {course.enrollmentCode ? (
                        <div className="flex items-center gap-2">
                          <code className="px-2 py-1 bg-default-100 rounded text-sm font-mono font-semibold">
                            {course.enrollmentCode}
                          </code>
                          <Button
                            size="sm"
                            variant="light"
                            isIconOnly
                            onPress={() => {
                              navigator.clipboard.writeText(course.enrollmentCode || "");
                              alert("Enrollment code copied to clipboard!");
                            }}
                          >
                            <Icon icon="lucide:copy" size={16} />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-default-400 text-sm">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>{course.chapters.length}</TableCell>
                    <TableCell>
                      <Chip color="success" variant="flat" size="sm">
                        Active
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          as={Link}
                          to={`/admin/courses/${course.id}/edit`}
                          size="sm"
                          variant="flat"
                          color="primary"
                          startContent={<Icon icon="lucide:edit" size={16} />}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="flat"
                          color="danger"
                          startContent={<Icon icon="lucide:trash" size={16} />}
                          onPress={() => handleDeleteCourse(course.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Icon icon="lucide:book-x" className="text-default-400 mb-4" width={48} height={48} />
              <p className="text-default-500 mb-6">No courses available. Create your first course!</p>
              <Button
                as={Link}
                to="/admin/courses/create"
                color="primary"
                startContent={<Icon icon="lucide:plus" />}
              >
                Create New Course
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Card disableRipple>
          <CardHeader>
            <h2 className="text-lg font-semibold">Quick Stats</h2>
          </CardHeader>
          <Divider />
          <CardBody>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-primary-50 rounded-medium">
                <div className="text-3xl font-bold text-primary mb-1">{courses.length}</div>
                <div className="text-default-600">Total Courses</div>
              </div>
              <div className="p-4 bg-secondary-50 rounded-medium">
                <div className="text-3xl font-bold text-secondary mb-1">
                  {courses.reduce((total, course) => total + course.chapters.length, 0)}
                </div>
                <div className="text-default-600">Total Chapters</div>
              </div>
              <div className="p-4 bg-success-50 rounded-medium">
                <div className="text-3xl font-bold text-success mb-1">2</div>
                <div className="text-default-600">Active Users</div>
              </div>
              <div className="p-4 bg-warning-50 rounded-medium">
                <div className="text-3xl font-bold text-warning mb-1">
                  {courses.reduce((total, course) => {
                    return total + course.chapters.reduce((chTotal: number, ch: any) => chTotal + ch.quiz.length, 0);
                  }, 0)}
                </div>
                <div className="text-default-600">Total Quizzes</div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card disableRipple>
          <CardHeader>
            <h2 className="text-lg font-semibold">Admin Actions</h2>
          </CardHeader>
          <Divider />
          <CardBody className="space-y-4">
            <Button
              as={Link}
              to="/admin/courses/create"
              fullWidth
              color="primary"
              variant="flat"
              startContent={<Icon icon="lucide:plus-circle" />}
            >
              Create New Course
            </Button>
            <Button
              fullWidth
              color="secondary"
              variant="flat"
              startContent={<Icon icon="lucide:users" />}
            >
              Manage Users
            </Button>
            <Button
              fullWidth
              color="success"
              variant="flat"
              startContent={<Icon icon="lucide:bar-chart" />}
            >
              View Analytics
            </Button>
            <Button
              fullWidth
              color="warning"
              variant="flat"
              startContent={<Icon icon="lucide:settings" />}
            >
              System Settings
            </Button>
          </CardBody>
        </Card>
      </div>
    </Layout>
  );
};