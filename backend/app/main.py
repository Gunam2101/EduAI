import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.database.connection import engine, Base, SessionLocal
from app.services.data_loader import load_and_initialize_dataset
from app.api import (
    auth, students, faculty, assessments, attendance,
    analytics, curriculum, study_plans, progress, alerts,
    reports, settings as settings_api, recommendations, roadmaps,
    student_portal, interventions, insights, predictions
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("EduAI.Main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables and load CSV dataset
    logger.info("Initializing EduAI Database and loading student dataset...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        load_and_initialize_dataset(db)
    except Exception as e:
        logger.error(f"Error loading student dataset: {e}", exc_info=True)
    finally:
        db.close()
    yield
    logger.info("EduAI Backend shutdown.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Smart Education & Student Analytics Platform for Problem Statement PS52",
    version=settings.VERSION,
    lifespan=lifespan
)

# Enable CORS with configured origins (no allow_origins=["*"] when credentials used)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth.router)
app.include_router(students.router)
app.include_router(faculty.router)
app.include_router(assessments.router)
app.include_router(attendance.router)
app.include_router(analytics.router)
app.include_router(curriculum.router)
app.include_router(study_plans.router)
app.include_router(progress.router)
app.include_router(recommendations.router)
app.include_router(alerts.router)
app.include_router(reports.router)
app.include_router(settings_api.router)
app.include_router(roadmaps.router)
app.include_router(student_portal.router)
app.include_router(interventions.router)
app.include_router(insights.router)
app.include_router(predictions.router)

@app.get("/")
@app.get("/api")
@app.get("/api/")
def root():
    return {
        "system": settings.PROJECT_NAME,
        "status": "online",
        "docs_url": "/docs",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=(settings.ENVIRONMENT == "development")
    )
