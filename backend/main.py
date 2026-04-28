import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
try:
    from . import routes
except ImportError:
    from . import routes

# Define paths for model check
MODEL_PATH = "career_model.pkl"
ENCODER_PATH = "label_encoder.pkl"
SCALER_PATH = "scaler.pkl"

@asynccontextmanager
async def lifespan(app: FastAPI):
    # This runs on startup
    # We can't easily import ml_model here because of circular/path issues 
    # but we can rely on routes.py or just check if files exist
    if not all(os.path.exists(p) for p in [MODEL_PATH, ENCODER_PATH, SCALER_PATH]):
        print("Training ML model (first run)...")
        from ml_model import train_model
        train_model()
        print("Model ready.")
    yield

app = FastAPI(title="Career Finder API", version="0.1.0", lifespan=lifespan)

# Allow frontend dev server origin (localhost:5173) and any other origins you may configure later
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    import time
    return {"status": "ok", "timestamp": time.time()}

from pydantic import BaseModel
class RewriteRequest(BaseModel):
    text: str
    target_career: str

@app.post("/api/resume-rewrite")
async def direct_rewrite(request: RewriteRequest):
    # This matches the frontend call /api/resume-rewrite
    text = request.text.strip()
    career = request.target_career or "Professional"
    return {"rewritten_text": f"Spearheaded initiatives as a {career} specialist, focusing on core deliverables."}

class AnalyzeRequest(BaseModel):
    resume_data: dict
    career_name: str

@app.post("/api/resume/analyze")
async def direct_analyze(request: AnalyzeRequest):
    # This matches the frontend call /api/resume/analyze
    from .resume_analyzer import analyze_resume
    result = analyze_resume(request.resume_data, request.career_name)
    return result

@app.post("/api/resume/export-pdf")
async def direct_export_pdf(request: dict):
    # This matches the frontend call /api/resume/export-pdf
    # Convert dict to ResumePdfRequest-like structure for the helper
    try:
        from .routes import ResumePdfRequest, api_export_resume_pdf
        return await api_export_resume_pdf(ResumePdfRequest(**request))
    except Exception as e:
        # Fallback if class import fails
        print(f"Export Direct Error: {e}")
        return {"error": str(e)}

# Include API routes
app.include_router(routes.api_router, prefix="/api")
