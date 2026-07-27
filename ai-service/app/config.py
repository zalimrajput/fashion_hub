from dotenv import load_dotenv
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = BASE_DIR / ".env"

load_dotenv(ENV_PATH)


class Settings:

    MONGO_URI = os.getenv("MONGO_URI")

    DATABASE_NAME = os.getenv("DATABASE_NAME")

    OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

    MODEL_NAME = os.getenv("MODEL_NAME")

    HOST = os.getenv("HOST", "127.0.0.1")

    PORT = int(os.getenv("PORT", 8000))

    DEBUG = os.getenv("DEBUG", "False") == "True"
    
    # ADD THIS
    PUBLIC_URL = os.getenv(
        "PUBLIC_URL",
        "http://localhost:5000"
    )

settings = Settings()

print("ENV PATH:", ENV_PATH)
print("MODEL:", settings.MODEL_NAME)
print("PUBLIC URL:", settings.PUBLIC_URL)
