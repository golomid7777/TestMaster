from fastapi import FastAPI
from pathlib import Path
from dotenv import load_dotenv

ENV_PATH = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(ENV_PATH)
from services.router import router as services_router
from questions.router import router as questions_router
from users.router import router as users_router
from fastapi.middleware.cors import CORSMiddleware
from admin.router import router as admin_router
from payments.router import router as payments_router

app = FastAPI(
    title="TestMaster API"
)


from fastapi.middleware.cors import CORSMiddleware


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(
    services_router
)

app.include_router(
    questions_router
)

app.include_router(
    users_router
)

app.include_router(payments_router)

@app.get("/")
def home():

    return {
        "status": "ok",
        "app": "TestMaster"
    }

app.include_router(admin_router)