from fastapi.testclient import TestClient
from backend.app.main import app 

client = TestClient(app)

def test_get_message():
    response = client.get("/api/message")
    assert response.status_code == 200
    assert "message" in response.json()
