import React from "react";
import { useParams, Link, useHistory } from "react-router-dom";
import { Card, CardBody, CardHeader, Button, Progress, Divider, Chip, Accordion, AccordionItem } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Layout } from "../components/layout";
import { useAuth } from "../contexts/auth-context";
import { getCourseById, enrollInCourse } from "../api/courses";
import { Course } from "../types/course";
import { EnrollmentModal } from "../components/enrollment-modal";

interface CourseParams {
  courseId: string;
}

export const CourseDetails: React.FC = () => {
  const { courseId } = useParams<CourseParams>();
  const { user } = useAuth();
  const history = useHistory();
  const [course, setCourse] = React.useState<Course | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isEnrollmentModalOpen, setIsEnrollmentModalOpen] = React.useState(false);
  const [isEnrolling, setIsEnrolling] = React.useState(false);
  const [enrollmentError, setEnrollmentError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchCourse = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const courseData = await getCourseById(courseId);
        setCourse(courseData);
      } catch (err: any) {
        console.error("Failed to fetch course:", err);
        if (err?.response?.status === 403) {
          setError("You must be enrolled in this course to view it.");
        } else {
          setError("Failed to load course details. Please try again later.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  const handleStartCourse = () => {
    if (course?.enrolled) {
      // User is already enrolled, navigate to first chapter
      const firstChapter = course.chapters.find((ch: any) => !ch.completed) || course.chapters[0];
      if (firstChapter) {
        history.push(`/courses/${courseId}/chapters/${firstChapter.id}`);
      }
    } else {
      // User needs to enroll, show modal
      setIsEnrollmentModalOpen(true);
      setEnrollmentError(null);
    }
  };

  const handleEnroll = async (enrollmentCode: string) => {
    if (!courseId) return;
    
    try {
      setIsEnrolling(true);
      setEnrollmentError(null);
      await enrollInCourse(courseId, enrollmentCode);
      
      // Refresh course data
      const courseData = await getCourseById(courseId);
      setCourse(courseData);
      
      setIsEnrollmentModalOpen(false);
      
      // Navigate to first chapter
      const firstChapter = courseData.chapters[0];
      if (firstChapter) {
        history.push(`/courses/${courseId}/chapters/${firstChapter.id}`);
      }
    } catch (err: any) {
      console.error("Failed to enroll:", err);
      if (err?.response?.status === 400) {
        setEnrollmentError("Invalid enrollment code. Please check and try again.");
      } else {
        setEnrollmentError("Failed to enroll. Please try again later.");
      }
    } finally {
      setIsEnrolling(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p>Loading course details...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <Icon icon="lucide:alert-circle" className="text-danger mb-4" width={48} height={48} />
          <h2 className="text-2xl font-bold mb-2">Error Loading Course</h2>
          <p className="text-default-500 mb-6">{error}</p>
          <Button as={Link} to="/dashboard" color="primary">
            Back to Dashboard
          </Button>
        </div>
      </Layout>
    );
  }

  if (!course) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <Icon icon="lucide:alert-circle" className="text-danger mb-4" width={48} height={48} />
          <h2 className="text-2xl font-bold mb-2">Course Not Found</h2>
          <p className="text-default-500 mb-6">The course you're looking for doesn't exist or has been removed.</p>
          <Button as={Link} to="/dashboard" color="primary">
            Back to Dashboard
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
            <p className="text-default-500">{course.description}</p>
          </div>

          <Card className="mb-6" disableRipple>
            <CardHeader>
              <h2 className="text-xl font-semibold">Course Content</h2>
            </CardHeader>
            <Divider />
            <CardBody>
              <Accordion selectionMode="multiple" defaultSelectedKeys={["1"]}>
                {course.chapters.map((chapter: any, index: number) => (
                  <AccordionItem
                    key={chapter.id}
                    title={
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <span className="text-default-500">Chapter {index + 1}:</span>
                          <span>{chapter.title}</span>
                        </div>
                        {chapter.completed && (
                          <Chip color="success" variant="flat" size="sm">
                            Completed
                          </Chip>
                        )}
                      </div>
                    }
                  >
                    <div className="py-2">
                      <p className="text-default-500 mb-4">
                        This chapter covers {chapter.title.toLowerCase()} concepts and includes a quiz to test your knowledge.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {course.enrolled ? (
                          <>
                            <Button
                              as={Link}
                              to={`/courses/${courseId}/chapters/${chapter.id}`}
                              color="primary"
                              variant="flat"
                              size="sm"
                              startContent={<Icon icon="lucide:book-open" />}
                            >
                              Start Learning
                            </Button>
                            <Button
                              as={Link}
                              to={`/courses/${courseId}/chapters/${chapter.id}/quiz`}
                              color="secondary"
                              variant="flat"
                              size="sm"
                              startContent={<Icon icon="lucide:check-circle" />}
                            >
                              Take Quiz
                            </Button>
                          </>
                        ) : (
                          <p className="text-default-500 text-sm">
                            Please enroll in this course to access chapters.
                          </p>
                        )}
                      </div>
                    </div>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardBody>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-4" disableRipple>
            <CardBody>
              <div className="aspect-video mb-4 overflow-hidden rounded-medium">
                <img 
                  src={course.imageUrl} 
                  alt={course.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              {course.enrolled && typeof course.progress === 'number' && (
                <div className="mb-6">
                  <div className="flex justify-between text-small mb-1">
                    <p>Your Progress</p>
                    <p>{course.progress}%</p>
                  </div>
                  <Progress
                    aria-label="Course progress"
                    value={course.progress}
                    color="primary"
                    className="h-2"
                  />
                </div>
              )}
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:book" className="text-primary" />
                  <span>{course.chapters.length} Chapters</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:check-circle" className="text-primary" />
                  <span>{course.chapters.length} Quizzes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:clock" className="text-primary" />
                  <span>Approx. {course.chapters.length * 30} min</span>
                </div>
              </div>
              
              <Divider className="my-6" />
              
              <Button
                color="primary"
                fullWidth
                size="lg"
                onPress={handleStartCourse}
                startContent={<Icon icon={course.enrolled ? "lucide:play" : "lucide:book-open"} />}
              >
                {course.enrolled ? "Continue Learning" : "Start Course"}
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>

      <EnrollmentModal
        isOpen={isEnrollmentModalOpen}
        onClose={() => {
          setIsEnrollmentModalOpen(false);
          setEnrollmentError(null);
        }}
        onEnroll={handleEnroll}
        isLoading={isEnrolling}
        error={enrollmentError}
      />
    </Layout>
  );
};