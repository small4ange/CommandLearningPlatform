import React from "react";
import { Card, CardBody, CardHeader, CardFooter, Button, Input, Textarea, Divider, Accordion, AccordionItem } from "@heroui/react";
import { Icon } from "@iconify/react";

interface QuizQuestion {
  id?: string;
  question: string;
  options: string[];
  correctOption: number;
}

interface ChapterData {
  id?: string;
  title: string;
  content: string;
  quiz: QuizQuestion[];
}

interface ChapterFormProps {
  chapter: ChapterData;
  index: number;
  onChange: (index: number, chapter: ChapterData) => void;
  onRemove: (index: number) => void;
  showRemoveButton: boolean;
}

export const ChapterForm: React.FC<ChapterFormProps> = ({
  chapter,
  index,
  onChange,
  onRemove,
  showRemoveButton
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onChange(index, {
      ...chapter,
      [name]: value
    });
  };

  const handleQuizQuestionChange = (qIndex: number, field: string, value: string) => {
    const updatedQuiz = [...chapter.quiz];
    updatedQuiz[qIndex] = {
      ...updatedQuiz[qIndex],
      [field]: value
    };
    onChange(index, {
      ...chapter,
      quiz: updatedQuiz
    });
  };

  const handleQuizOptionChange = (qIndex: number, optionIndex: number, value: string) => {
    const updatedQuiz = [...chapter.quiz];
    const updatedOptions = [...updatedQuiz[qIndex].options];
    updatedOptions[optionIndex] = value;
    updatedQuiz[qIndex] = {
      ...updatedQuiz[qIndex],
      options: updatedOptions
    };
    onChange(index, {
      ...chapter,
      quiz: updatedQuiz
    });
  };

  const handleCorrectOptionChange = (qIndex: number, value: number) => {
    const updatedQuiz = [...chapter.quiz];
    updatedQuiz[qIndex] = {
      ...updatedQuiz[qIndex],
      correctOption: value
    };
    onChange(index, {
      ...chapter,
      quiz: updatedQuiz
    });
  };

  const addQuizQuestion = () => {
    onChange(index, {
      ...chapter,
      quiz: [
        ...chapter.quiz,
        {
          question: "",
          options: ["", "", "", ""],
          correctOption: 0
        }
      ]
    });
  };

  const removeQuizQuestion = (qIndex: number) => {
    if (chapter.quiz.length > 1) {
      const updatedQuiz = [...chapter.quiz];
      updatedQuiz.splice(qIndex, 1);
      onChange(index, {
        ...chapter,
        quiz: updatedQuiz
      });
    }
  };

  return (
    <Card className="mb-6" disableRipple>
      <CardHeader className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Chapter {index + 1}</h3>
        {showRemoveButton && (
          <Button
            size="sm"
            color="danger"
            variant="light"
            isIconOnly
            onPress={() => onRemove(index)}
          >
            <Icon icon="lucide:trash" />
          </Button>
        )}
      </CardHeader>
      <Divider />
      <CardBody className="space-y-6">
        <Input
          label="Chapter Title"
          name="title"
          value={chapter.title}
          onChange={handleInputChange}
          placeholder="Enter chapter title"
          isRequired
        />
        <Textarea
          label="Chapter Content (HTML)"
          name="content"
          value={chapter.content}
          onChange={handleInputChange}
          placeholder="Enter chapter content (HTML supported)"
          minRows={5}
          isRequired
        />

        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-md font-semibold">Quiz Questions</h4>
            <Button
              size="sm"
              color="primary"
              variant="flat"
              startContent={<Icon icon="lucide:plus" />}
              onPress={addQuizQuestion}
            >
              Add Question
            </Button>
          </div>

          <Accordion className="px-0" selectionMode="multiple" defaultSelectedKeys={["0"]}>
            {chapter.quiz.map((question, qIndex) => (
              <AccordionItem
                key={qIndex}
                title={
                  <div className="flex justify-between items-center w-full">
                    <span>Question {qIndex + 1}</span>
                    {chapter.quiz.length > 1 && (
                      <Button
                        size="sm"
                        color="danger"
                        variant="light"
                        isIconOnly
                        onPress={(e) => {
                          e.stopPropagation();
                          removeQuizQuestion(qIndex);
                        }}
                      >
                        <Icon icon="lucide:trash" size={16} />
                      </Button>
                    )}
                  </div>
                }
              >
                <div className="space-y-4 py-2">
                  <Input
                    label="Question"
                    value={question.question}
                    onChange={(e) => handleQuizQuestionChange(qIndex, "question", e.target.value)}
                    placeholder="Enter quiz question"
                    isRequired
                  />
                  
                  <div className="space-y-3">
                    <p className="text-small font-medium">Options (select the correct one)</p>
                    {question.options.map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-option-${index}-${qIndex}`}
                          checked={question.correctOption === optIndex}
                          onChange={() => handleCorrectOptionChange(qIndex, optIndex)}
                          className="w-4 h-4 text-primary"
                        />
                        <Input
                          value={option}
                          onChange={(e) => handleQuizOptionChange(qIndex, optIndex, e.target.value)}
                          placeholder={`Option ${optIndex + 1}`}
                          className="flex-1"
                          isRequired
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </CardBody>
    </Card>
  );
};