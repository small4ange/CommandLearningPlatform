export interface Quiz {
  id: string;
  question: string;
  options: string[];
  correctOption: number;
}

export interface Chapter {
  id: string;
  title: string;
  content: string;
  quiz: Quiz[];
  completed?: boolean;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  chapters: Chapter[];
  progress?: number;
  enrolled?: boolean;
  enrollmentCode?: string;
}

export interface QuizResult {
  score: number;
  passed: boolean;
  correctAnswers: number;
  totalQuestions: number;
}
