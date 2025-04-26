from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
import pandas as pd

app = FastAPI()

# Allow frontend to access backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load your dataset (your CSV file should be in the same folder)
data = pd.read_csv("EnglishData.csv")  # <-- make sure this file exists

# Create the knowledge base
knowledge_base = ""
for _, row in data.iterrows():
    knowledge_base += f"Level: {row['Level']}\n"
    knowledge_base += f"Topic: {row['Topic']}\n"
    knowledge_base += f"Explanation: {row['Explanation']}\n"
    knowledge_base += f"Example: {row['Example']}\n"
    knowledge_base += f"Practice Question: {row['Practice Question']}\n"
    knowledge_base += f"Common Mistakes: {row['Common Mistakes']}\n\n"

# Setup Gemini
genai.configure(api_key="AIzaSyCKi7OBhlpyzOJuWHcd_Hn3PPNNaU61Czs")  # Put your real Gemini API key here
model = genai.GenerativeModel("gemini-2.0-flash")

# Start chat
chat = model.start_chat(history=[
    {
        "role": "user",
        "parts": [
            "This is my dataset that has the information of which topics are in which level:\n"
            + knowledge_base +
            "\nBased on this, your job is to ask questions to know what level the student is in, then teach them accordingly,"
            " and check their understanding often by asking questions. Make sure the answers are strictly correct and follows correct grammar rules and you are not being nice."
        ]
    },
    {
        "role": "model",
        "parts": ["Got it! I'm ready to help the student based on your dataset."]
    }
])

@app.get("/", response_class=HTMLResponse)
async def read_root():
    return "Backend is running."

@app.post("/chat")
async def chat_with_bot(request: Request):
    data = await request.json()
    user_message = data.get("message")
    response = chat.send_message(user_message)
    return {"reply": response.text}
