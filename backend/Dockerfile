FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

COPY alembic.ini .
COPY main.py .
COPY app/ ./app/
COPY alembic/ ./alembic/

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]