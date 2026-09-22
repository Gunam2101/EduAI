import os
from typing import List

class Settings:
    PROJECT_NAME: str = "EduAI PS52 — Student Learning Difficulty Detection & Personalized Study Planning"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    SECRET_KEY: str = os.getenv("SECRET_KEY", "eduai_super_secret_jwt_key_ps52_academic_system")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./eduai.db")

    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))

    @property
    def cors_origins_list(self) -> List[str]:
        # Parse CORS_ORIGINS from env, comma-separated
        origins_env = os.getenv("CORS_ORIGINS", "")
        origins = []
        if origins_env:
            origins.extend([o.strip() for o in origins_env.split(",") if o.strip()])
        
        # Include FRONTEND_URL
        if self.FRONTEND_URL and self.FRONTEND_URL not in origins:
            origins.append(self.FRONTEND_URL.rstrip("/"))

        # Always include local development origins
        default_dev = [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:3000",
            "http://localhost:8000",
            "http://127.0.0.1:8000",
            "http://localhost:8001",
            "http://127.0.0.1:8001",
        ]
        for d in default_dev:
            if d not in origins:
                origins.append(d)

        return origins

settings = Settings()
