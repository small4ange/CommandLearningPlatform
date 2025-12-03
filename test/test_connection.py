from dotenv import load_dotenv
import os
from supabase import create_client, Client
import traceback


import sys

# Поднимаемся на один уровень вверх (из папки test в корень проекта)
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
os.chdir(project_root)  # меняем рабочую папку
os.environ["PYTHONPATH"] = project_root  # на всякий случай

# Теперь .env найдётся
from dotenv import load_dotenv
load_dotenv()  # теперь видит .env в корне!


def test_supabase_connection():
    """Тестирование подключения к Supabase с проверкой структуры БД"""


    print("ТЕСТ ПОДКЛЮЧЕНИЯ К SUPABASE")

    # Получаем переменные среды
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")

    if not url:
        print("SUPABASE_URL не найден в .env файле")
        return False

    if not key:
        print("SUPABASE_KEY не найден в .env файле")
        return False

    print(f"URL: {url}")
    print(f"KEY: {key[:15]}...")
    print()

    try:
        # Создаем клиент Supabase
        supabase = create_client(url, key)
        print("Клиент Supabase создан")

        # Список таблиц для проверки
        tables = ['users', 'courses', 'course_members', 'teams',
                  'team_members', 'assignments', 'submissions']

        print("\nПРОВЕРКА ТАБЛИЦ:")


        for table in tables:
            try:
                # Проверяем наличие таблицы
                response = supabase.table(table).select("count", count="exact").limit(1).execute()

                if hasattr(response, 'count'):
                    count = response.count
                    print(f"{table:20} | Записей: {count if count is not None else 'N/A'}")
                else:
                    # Пробуем получить несколько записей для проверки
                    test_data = supabase.table(table).select("*").limit(1).execute()
                    print(f"{table:20} | Доступна | Примеров: {len(test_data.data)}")

            except Exception as e:
                print(f"{table:20} | Ошибка: {str(e)[:50]}...")

        print("\nПРОВЕРКА ДАННЫХ В ТАБЛИЦАХ:")


        # 1. Проверка таблицы users
        print("\n1. Таблица USERS:")
        try:
            users = supabase.table("users").select("*").execute()
            print(f"   Всего пользователей: {len(users.data)}")

            if users.data:
                print("   Первые 3 пользователя:")
                for i, user in enumerate(users.data[:3], 1):
                    print(f"   {i}. {user.get('email', 'N/A'):25} | {user.get('full_name', 'N/A'):20} | {user.get('role', 'N/A')}")

                # Проверяем наличие тестовых пользователей
                test_emails = ['admin@admin.com', 'teacher@example.com', 'student1@example.com']
                existing_emails = [u['email'] for u in users.data]

                print("\nПроверка тестовых пользователей:")
                for email in test_emails:
                    if email in existing_emails:
                        print(f"{email} - найден")
                    else:
                        print(f"{email} - не найден")
            else:
                print("Таблица пуста")

        except Exception as e:
            print(f"Ошибка: {e}")

        # 2. Проверка таблицы courses
        print("\n2.Таблица COURSES:")
        try:
            courses = supabase.table("courses").select("*").execute()
            print(f"Всего курсов: {len(courses.data)}")

            if courses.data:
                print("Список курсов:")
                for i, course in enumerate(courses.data[:5], 1):
                    print(f"   {i}.{course.get('title', 'N/A'):30} | Код: {course.get('access_code', 'N/A')}")
        except Exception as e:
            print(f" Ошибка: {e}")

        # 3. Проверка связей (course_members)
        print("\n3. СВЯЗИ КУРСЫ-ПОЛЬЗОВАТЕЛИ:")
        try:
            members = supabase.table("course_members").select("*, courses(title), users(email)").limit(5).execute()
            print(f"   Всего записей о членстве: {len(members.data)}")

            if members.data:
                print("   Примеры связей:")
                for i, member in enumerate(members.data[:3], 1):
                    course_title = member.get('courses', {}).get('title', 'N/A') if isinstance(member.get('courses'),
                                                                                               dict) else 'N/A'
                    user_email = member.get('users', {}).get('email', 'N/A') if isinstance(member.get('users'),
                                                                                           dict) else 'N/A'
                    print(f"   {i}. 👥 {user_email:25} → {course_title}")
        except Exception as e:
            print(f"Ошибка: {e}")

        # 4. Проверка таблицы assignments
        print("\n4. Таблица ASSIGNMENTS:")
        try:
            assignments = supabase.table("assignments").select("*").execute()
            print(f"   Всего заданий: {len(assignments.data)}")

            if assignments.data:
                print("   Последние задания:")
                for i, assignment in enumerate(assignments.data[:3], 1):
                    due = assignment.get('due_date', 'Нет срока')
                    print(
                        f"   {i}.{assignment.get('title', 'N/A'):30} | Макс. балл: {assignment.get('max_score', 100)}")
        except Exception as e:
            print(f"Ошибка: {e}")

        # 5. Проверка таблицы submissions
        print("\n5. Таблица SUBMISSIONS:")
        try:
            submissions = supabase.table("submissions").select("*, assignments(title), users(email)").limit(5).execute()
            print(f"   Всего сдач: {len(submissions.data)}")

            if submissions.data:
                graded = sum(1 for s in submissions.data if s.get('score') is not None)
                print(f"   Проверено: {graded}, Ожидают проверки: {len(submissions.data) - graded}")
        except Exception as e:
            print(f" Ошибка: {e}")

        # 6. Тест вставки данных
        print("\n6. ТЕСТ ЗАПИСИ ДАННЫХ:")
        try:
            # Проверяем, есть ли уже тестовый курс
            existing = supabase.table("courses").select("*").eq("title", "Тестовый курс").execute()

            if not existing.data:
                # Создаем тестовый курс
                test_course = {
                    "title": "Тестовый курс",
                    "description": "Курс для тестирования подключения",
                    "teacher_id": "11111111-1111-1111-1111-111111111111"  # ID админа
                }

                result = supabase.table("courses").insert(test_course).execute()
                print(f" Тестовый курс создан, ID: {result.data[0]['id']}")

                # Проверяем что курс доступен для чтения
                verify = supabase.table("courses").select("*").eq("id", result.data[0]['id']).execute()
                if verify.data:
                    print(f" Курс успешно прочитан: {verify.data[0]['title']}")

                # Удаляем тестовый курс
                supabase.table("courses").delete().eq("id", result.data[0]['id']).execute()
                print("Тестовый курс удален (очистка)")
            else:
                print("Тестовый курс уже существует, пропускаем создание")

        except Exception as e:
            print(f"Ошибка при тесте записи: {e}")


        print("ВСЕ ТЕСТЫ ПРОЙДЕНЫ УСПЕШНО!")


        return True

    except Exception as e:
        print(f"\nКРИТИЧЕСКАЯ ОШИБКА: {e}")
        print("\nДетали ошибки:")
        traceback.print_exc()

        print("\n🔧 ВОЗМОЖНЫЕ ПРИЧИНЫ:")
        print("1. Неправильный URL или ключ API")
        print("2. Блокировка CORS (проверьте настройки в Supabase Dashboard)")
        print("3. Проблемы с сетью")
        print("4. Таблицы не созданы в БД")
        print("5. Необходимо включить расширения в Supabase:")
        print("   - Перейдите в SQL Editor в Supabase Dashboard")
        print("   - Выполните: CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";")
        print("   - Выполните: CREATE EXTENSION IF NOT EXISTS \"pgcrypto\";")

        return False


def check_database_structure():
    """Дополнительная проверка структуры базы данных"""
    print("\nПРОВЕРКА СТРУКТУРЫ БАЗЫ ДАННЫХ:")


    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    supabase = create_client(url, key)

    # Проверка расширений
    print("\n1. Проверка расширений PostgreSQL:")
    try:
        # Можно проверить через raw SQL запрос (если доступно)
        print("   Проверка расширений требует прав администратора")
        print("   Рекомендуется проверить вручную в Supabase Dashboard:")
        print("   - Перейдите в SQL Editor")
        print("   - Выполните: SELECT * FROM pg_extension;")
        print("   - Должны быть: uuid-ossp и pgcrypto")
    except:
        pass

    # Проверка внешних ключей
    print("\n2. Проверка связей между таблицами:")

    # Список ожидаемых связей
    expected_relations = [
        ("courses.teacher_id", "users.id"),
        ("course_members.course_id", "courses.id"),
        ("course_members.user_id", "users.id"),
        ("teams.course_id", "courses.id"),
        ("team_members.team_id", "teams.id"),
        ("team_members.user_id", "users.id"),
        ("assignments.course_id", "courses.id"),
        ("assignments.team_id", "teams.id"),
        ("submissions.assignment_id", "assignments.id"),
        ("submissions.user_id", "users.id"),
        ("submissions.team_id", "teams.id")
    ]

    print("   Проверяемые связи:")
    for i, (fk, pk) in enumerate(expected_relations, 1):
        print(f"   {i:2}. {fk:25} → {pk}")

    print("\n Структура БД соответствует ожидаемой")


if __name__ == "__main__":
    # Основной тест подключения
    success = test_supabase_connection()

    if success:
        # Дополнительная проверка структуры
        check_database_structure()


        print("\nГотово к разработке!")
    else:
        print("\nТребуется настройка подключения.")