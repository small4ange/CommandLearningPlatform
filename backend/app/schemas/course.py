from pydantic import BaseModel # Основной класс для создания моделей данных с валидацией
from typing import List, Optional, Dict, Any
from datetime import datetime

# Базовый класс для викторины/теста
class QuizBase(BaseModel):
    id: str
    question: str
    options: List[str]
    correctOption: int

class QuizCreate(QuizBase):
    pass

# Класс для ответа с данными викторины (используется при возврате данных из API)
class QuizResponse(QuizBase):
    id: str

#Класс Config внутри Pydantic моделей — это конфигурационный класс, который позволяет настраивать поведение модели
    class Config:
        from_attributes = True # Разрешает создание экземпляров из ORM-объектов


# Базовый класс для главы курса
class ChapterBase(BaseModel):
    id: str
    title: str
    content: str

class ChapterCreate(ChapterBase):
    quiz: List[QuizCreate]

class ChapterResponse(ChapterBase):
    id: str
    quiz: List[QuizResponse]
    completed: Optional[bool] = False

    class Config:
        from_attributes = True

# Базовый класс для курса
class CourseBase(BaseModel):
    title: str
    description: str
    imageUrl: str

class CourseCreate(CourseBase):
    chapters: List[ChapterCreate]

class CourseUpdate(CourseBase):
    chapters: List[ChapterCreate]

class CourseResponse(CourseBase):
    id: str
    chapters: List[ChapterResponse]
    progress: Optional[int] = 0
    enrolled: Optional[bool] = False
    enrollmentCode: Optional[str] = None

    class Config:
        from_attributes = True

# Класс для отправки ответов на викторину
class QuizSubmission(BaseModel):
    answers: Dict[str, int]  # Словарь, где ключ - id викторины, значение - выбранный вариант ответа


# Класс для результата прохождения викторины
class QuizResult(BaseModel):
    score: int  # Количество баллов
    passed: bool  # Прошел ли пользователь тест
    correctAnswers: int  # Количество правильных ответов
    totalQuestions: int  # Общее количество вопросов

# Класс для запроса записи на курс с использованием кода
class EnrollmentCodeRequest(BaseModel):
    enrollmentCode: str

# Класс для ответа на запрос записи на курс
class EnrollmentResponse(BaseModel):
    success: bool
    message: str
