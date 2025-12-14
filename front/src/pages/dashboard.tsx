import React from "react";
import { Card, CardBody, CardHeader, Divider, Tabs, Tab, Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Layout } from "../components/layout";
import { CourseCard } from "../components/course-card";
import { useAuth } from "../contexts/auth-context";
import { getUserCourses } from "../api/courses";
import { Course } from "../types/course";

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = React.useState("all");
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = React.useState<Course[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  
  React.useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const userCourses = await getUserCourses();
        setCourses(userCourses);
        setEnrolledCourses(userCourses.filter(course => course.enrolled));
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      fetchCourses();
    }
  }, [user]);

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome, {user?.name}!</h1>
        <p className="text-default-500">Continue learning or explore new courses.</p>
      </div>

      <Tabs 
        selectedKey={selectedTab} 
        onSelectionChange={setSelectedTab as any}
        aria-label="Course tabs"
        className="mb-6"
      >
        <Tab 
          key="all" 
          title={
            <div className="flex items-center gap-2">
              <Icon icon="lucide:layout-grid" />
              <span>All Courses</span>
            </div>
          }
        >
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" color="primary" />
            </div>
          ) : courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <Card>
              <CardBody className="flex flex-col items-center justify-center py-12">
                <Icon icon="lucide:book-x" className="text-default-400 mb-4" width={48} height={48} />
                <p className="text-default-500">No courses available at the moment.</p>
              </CardBody>
            </Card>
          )}
        </Tab>
        <Tab 
          key="enrolled" 
          title={
            <div className="flex items-center gap-2">
              <Icon icon="lucide:bookmark" />
              <span>My Courses</span>
            </div>
          }
        >
          {enrolledCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <Card>
              <CardBody className="flex flex-col items-center justify-center py-12">
                <Icon icon="lucide:book-marked" className="text-default-400 mb-4" width={48} height={48} />
                <p className="text-default-500">You haven't enrolled in any courses yet.</p>
              </CardBody>
            </Card>
          )}
        </Tab>
      </Tabs>

      <Card className="mt-8" disableRipple>
        <CardHeader className="flex gap-3">
          <div className="flex flex-col">
            <p className="text-md font-semibold">Learning Tips</p>
            <p className="text-small text-default-500">Make the most of your learning experience</p>
          </div>
        </CardHeader>
        <Divider />
        <CardBody>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <Icon icon="lucide:clock" className="text-primary mt-1" />
              <span>Set aside dedicated time for learning each day.</span>
            </li>
            <li className="flex items-start gap-2">
              <Icon icon="lucide:notebook-pen" className="text-primary mt-1" />
              <span>Take notes while going through the course material.</span>
            </li>
            <li className="flex items-start gap-2">
              <Icon icon="lucide:brain-circuit" className="text-primary mt-1" />
              <span>Practice what you learn with real-world projects.</span>
            </li>
            <li className="flex items-start gap-2">
              <Icon icon="lucide:milestone" className="text-primary mt-1" />
              <span>Set clear learning goals and track your progress.</span>
            </li>
          </ul>
        </CardBody>
      </Card>
    </Layout>
  );
};