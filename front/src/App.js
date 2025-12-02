import React, { useState, useEffect } from "react";

function App() {
  const [message, setMessage] = useState("");
  const [input, setInput] = useState("");

// подключение к бэкенду и пример запроса
  useEffect(() => {
    fetch("http://localhost:8000/api/message")
      .then(res => res.json())
      .then(data => setMessage(data.message));
  }, []);

  const sendData = async () => {
    const response = await fetch("http://localhost:8000/api/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: input })
    });
    const data = await response.json();
    alert(data.response);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>{message}</h1>
      <input value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={sendData}>Отправить</button>
    </div>
  );
}

export default App;

