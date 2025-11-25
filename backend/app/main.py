from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Разрешение фронтенду подключаться
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/message")
def get_message():
    return {"message": "Привет от FastAPI!"}

@app.post("/api/send")
def send_message(data: dict):
    text = data.get("text")
    return {"response": f"Сообщение '{text}' получено!"}
