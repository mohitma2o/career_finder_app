from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
import os

router = APIRouter()

# Simple Pydantic model for a career entry
class Career(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    confidence: Optional[float] = None

# Load CSV data (assuming careers_data.csv is in project root)
from pathlib import Path

# Compute absolute path to careers_data.csv located at project root
PROJECT_ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = PROJECT_ROOT / "careers_data.csv"

def load_careers():
    if not DATA_PATH.exists():
        # Detailed debug info
        raise HTTPException(
            status_code=404,
            detail=f"Careers data not found at {DATA_PATH}. Ensure the CSV exists in the project root."
        )
    df = pd.read_csv(DATA_PATH)
    # Ensure required columns exist; provide defaults if missing
    required_cols = {"id", "title", "description"}
    missing = required_cols - set(df.columns)
    if missing:
        # Fill missing columns with empty strings
        for col in missing:
            df[col] = ""
    return df.to_dict(orient="records")

@router.get("/jobs", response_model=List[Career])
async def get_all_jobs():
    records = load_careers()
    return [Career(**r) for r in records]

@router.get("/search", response_model=List[Career])
async def search_jobs(query: str):
    records = load_careers()
    matches = [r for r in records if query.lower() in r["title"].lower()]
    return [Career(**r) for r in matches]

# Expose router for inclusion
api_router = router
