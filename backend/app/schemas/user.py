from pydantic import BaseModel, EmailStr # BaseModel для создания моделей, EmailStr для валидации email
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: str
    role: str

    class Config:
        from_attributes = True

# Класс для JWT токена
class Token(BaseModel):
    access_token: str  # Сам JWT токен для доступа к защищенным эндпоинтам
    token_type: str  # Тип токена (обычно "bearer")
    user: UserResponse  # Данные пользователя, которые возвращаются вместе с токеном
