from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import routes

app = FastAPI(title="Career Finder API", version="0.1.0")

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
    return {"status": "ok"}

# Include API routes
app.include_router(routes.api_router, prefix="/api")
