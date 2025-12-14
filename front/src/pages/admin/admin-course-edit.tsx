import React from "react";
import { useParams, useHistory } from "react-router-dom";
import { Card, CardBody, CardHeader, CardFooter, Button, Input, Textarea, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Layout } from "../../components/layout";
import { getCourseById, updateCourse as apiUpdateCourse } from "../../api/courses";
import { ChapterForm } from "../../components/chapter-form";
import { Course } from "../../types/course";

interface CourseParams {
  courseId: string;
}

interface ChapterFormData {
  id?: string;
  title: string;
  content: string;
  quiz: {
    id?: string;
    question: string;
    options: string[];
    correctOption: number;
  }[];
}

export const AdminCourseEdit: React.FC = () => {
  const { courseId } = useParams<CourseParams>();
  const history = useHistory();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [courseData, setCourseData] = React.useState({
    title: "",
    description: "",
    imageUrl: ""
  });
  const [chapters, setChapters] = React.useState<ChapterFormData[]>([]);

  React.useEffect(() => {
    const loadCourse = async () => {
      try {
        setIsLoading(true);
        const course = await getCourseById(courseId);
        
        if (course) {
          setCourseData({
            title: course.title,
            description: course.description,
            imageUrl: course.imageUrl
          });
          
          setChapters(course.chapters.map(chapter => ({
            id: chapter.id,
            title: chapter.title,
            content: chapter.content,
            quiz: chapter.quiz.map(q => ({
              id: q.id,
              question: q.question,
              options: q.options,
              correctOption: q.correctOption
            }))
          })));
        }
      } catch (err) {
        console.error("Failed to load course:", err);
        alert("Failed to load course data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCourse();
  }, [courseId]);

  const handleCourseInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCourseData({
      ...courseData,
      [name]: value
    });
  };

  const handleAddChapter = () => {
    setChapters([
      ...chapters,
      {
        title: "",
        content: "",
        quiz: [
          {
            question: "",
            options: ["", "", "", ""],
            correctOption: 0
          }
        ]
      }
    ]);
  };

  const handleChapterChange = (index: number, updatedChapter: ChapterFormData) => {
    const updatedChapters = [...chapters];
    updatedChapters[index] = updatedChapter;
    setChapters(updatedChapters);
  };

  const handleRemoveChapter = (index: number) => {
    if (chapters.length > 1) {
      const updatedChapters = [...chapters];
      updatedChapters.splice(index, 1);
      setChapters(updatedChapters);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form
      if (!courseData.title || !courseData.description) {
        alert("Please fill in all course fields");
        setIsSubmitting(false);
        return;
      }

      for (const chapter of chapters) {
        if (!chapter.title || !chapter.content) {
          alert("Please fill in all chapter fields");
          setIsSubmitting(false);
          return;
        }

        for (const quiz of chapter.quiz) {
          if (!quiz.question || quiz.options.some(option => !option)) {
            alert("Please fill in all quiz fields");
            setIsSubmitting(false);
            return;
          }
        }
      }

      // Update course
      await apiUpdateCourse(courseId, {
        ...courseData,
        chapters: chapters.map((chapter, index) => ({
          ...chapter,
          id: chapter.id || `${courseId}-${index + 1}`,
          quiz: chapter.quiz.map((quiz, qIndex) => ({
            ...quiz,
            id: quiz.id || `${courseId}-${index + 1}-${qIndex + 1}`
          }))
        }))
      });

      history.push("/admin");
    } catch (error) {
      console.error("Error updating course:", error);
      alert("An error occurred while updating the course");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p>Loading course data...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Button 
            as="a" 
            href="/admin" 
            variant="light" 
            startContent={<Icon icon="lucide:arrow-left" />}
          >
            Back to Admin Dashboard
          </Button>
        </div>
        <h1 className="text-3xl font-bold mb-2">Edit Course</h1>
        <p className="text-default-500">Update course details and content</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="mb-8" disableRipple>
          <CardHeader>
            <h2 className="text-xl font-semibold">Course Information</h2>
          </CardHeader>
          <Divider />
          <CardBody className="space-y-6">
            <Input
              label="Course Title"
              name="title"
              value={courseData.title}
              onChange={handleCourseInputChange}
              placeholder="Enter course title"
              isRequired
            />
            <Textarea
              label="Course Description"
              name="description"
              value={courseData.description}
              onChange={handleCourseInputChange}
              placeholder="Enter course description"
              minRows={3}
              isRequired
            />
            <Input
              label="Course Image URL"
              name="imageUrl"
              value={courseData.imageUrl}
              onChange={handleCourseInputChange}
              placeholder="Enter image URL"
              isRequired
            />
            {courseData.imageUrl && (
              <div className="mt-2">
                <p className="text-small text-default-500 mb-2">Preview:</p>
                <img
                  src={courseData.imageUrl}
                  alt="Course preview"
                  className="w-full max-w-md h-48 object-cover rounded-medium"
                />
              </div>
            )}
          </CardBody>
        </Card>

        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Chapters</h2>
          <Button
            color="primary"
            variant="flat"
            startContent={<Icon icon="lucide:plus" />}
            onPress={handleAddChapter}
          >
            Add Chapter
          </Button>
        </div>

        {chapters.map((chapter, index) => (
          <ChapterForm
            key={index}
            chapter={chapter}
            index={index}
            onChange={handleChapterChange}
            onRemove={handleRemoveChapter}
            showRemoveButton={chapters.length > 1}
          />
        ))}

        <div className="mt-8 flex justify-end gap-3">
          <Button
            variant="flat"
            color="danger"
            onPress={() => history.push("/admin")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            color="primary"
            isLoading={isSubmitting}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </Layout>
  );
};