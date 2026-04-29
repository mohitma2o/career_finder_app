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

# CORS Configuration
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
origins = [
    frontend_url,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if os.getenv("ENV") == "production" else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    import time
    return {"status": "ok", "timestamp": time.time()}

# Include API routes
app.include_router(routes.api_router, prefix="/api")
