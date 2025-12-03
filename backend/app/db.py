from dotenv import load_dotenv
import os

# Загружаем переменные из .env файла
load_dotenv()

# Теперь можно получить доступ к переменным
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
supabase_secret = os.getenv("SUPABASE_SECRET_KEY")