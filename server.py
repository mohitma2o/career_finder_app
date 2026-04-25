"""
server.py -- Career Finder AI REST API
FastAPI backend serving ML predictions, career data, and PDF exports.
"""

import os
import io
import datetime
from typing import Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, Query, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from fpdf import FPDF
import pandas as pd

from questionnaire import SECTIONS, get_total_questions
from ml_model import predict_careers, train_model, MODEL_PATH, ENCODER_PATH, SCALER_PATH


# ---------------------------------------------------------------------------
# Lifespan: ensure ML model exists before serving requests
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app):
    if not all(os.path.exists(p) for p in [MODEL_PATH, ENCODER_PATH, SCALER_PATH]):
        print("Training ML model (first run)...")
        train_model()
        print("Model ready.")
    yield


# ---------------------------------------------------------------------------
# App factory
# ---------------------------------------------------------------------------
app = FastAPI(title="Career Finder AI", version="2.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Request / Response schemas
# ---------------------------------------------------------------------------
class PredictRequest(BaseModel):
    responses: dict
    top_n: int = 5


class ExportPdfRequest(BaseModel):
    results: list
    responses: dict


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/questionnaire")
def get_questionnaire():
    """Return the full questionnaire structure."""
    return {
        "sections": SECTIONS,
        "total_questions": get_total_questions(),
    }


@app.post("/api/predict")
def run_prediction(body: PredictRequest):
    """Run ensemble ML prediction from user responses."""
    results = predict_careers(body.responses, top_n=body.top_n)
    return {"predictions": results}


@app.get("/api/careers")
def list_careers(
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    min_salary: int = Query(0),
    growth: Optional[str] = Query(None),
    sort: str = Query("salary_desc"),
):
    """Return filtered career database."""
    df = pd.read_csv("careers_data.csv")

    if search:
        df = df[df["career"].str.contains(search, case=False, na=False)]
    if category and category != "All":
        df = df[df["category"] == category]
    if min_salary > 0:
        df = df[df["avg_salary_inr"] >= min_salary]
    if growth:
        allowed = [g.strip() for g in growth.split(",")]
        df = df[df["growth_outlook"].isin(allowed)]

    if sort == "salary_desc":
        df = df.sort_values("avg_salary_inr", ascending=False)
    elif sort == "alpha":
        df = df.sort_values("career")
    elif sort == "growth":
        df = df.sort_values("growth_outlook")

    categories = pd.read_csv("careers_data.csv")["category"].unique().tolist()
    records = df.to_dict(orient="records")
    return {"careers": records, "categories": categories, "count": len(records)}


@app.post("/api/export/pdf")
def export_pdf(body: ExportPdfRequest):
    """Generate and stream a PDF career report."""

    def safe_text(text):
        if not text:
            return ""
        return str(text).encode("ascii", "ignore").decode("ascii")

    pdf = FPDF()
    pdf.add_page()

    pdf.set_font("Arial", "B", 24)
    pdf.set_text_color(30, 30, 30)
    pdf.cell(
        0, 15, safe_text("Career Finder AI Report"),
        new_x="LMARGIN", new_y="NEXT", align="C",
    )

    pdf.set_font("Arial", "I", 12)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(
        0, 10,
        safe_text(f"Generated on: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}"),
        new_x="LMARGIN", new_y="NEXT", align="C",
    )
    pdf.ln(10)

    pdf.set_font("Arial", "B", 16)
    pdf.set_text_color(20, 20, 20)
    pdf.cell(0, 10, safe_text("Your Top Recommendations"), new_x="LMARGIN", new_y="NEXT")
    pdf.ln(5)

    for i, r in enumerate(body.results, 1):
        pdf.set_font("Arial", "B", 14)
        pdf.set_text_color(21, 207, 147)
        career = r.get("career", "")
        confidence = r.get("confidence", 0)
        pdf.cell(
            0, 8, safe_text(f"{i}. {career} (Match: {confidence}%)"),
            new_x="LMARGIN", new_y="NEXT",
        )

        pdf.set_font("Arial", "", 11)
        pdf.set_text_color(50, 50, 50)
        pdf.multi_cell(0, 6, safe_text(f"Description: {r.get('description', '')}"), new_x="LMARGIN", new_y="NEXT")
        pdf.multi_cell(0, 6, safe_text(f"Why it fits you: {r.get('why', '')}"), new_x="LMARGIN", new_y="NEXT")

        salary_inr = r.get("salary_inr", 0)
        salary_usd = r.get("salary_usd", 0)
        pdf.cell(0, 6, safe_text(f"Average Salary: INR {salary_inr:,} | USD {salary_usd:,}"), new_x="LMARGIN", new_y="NEXT")

        skills = r.get("key_skills", [])
        if isinstance(skills, str):
            skills = [s.strip() for s in skills.split(",")]
        pdf.cell(0, 6, safe_text(f"Key Skills: {', '.join(skills[:5])}"), new_x="LMARGIN", new_y="NEXT")
        pdf.ln(5)

    buffer = io.BytesIO(bytes(pdf.output()))
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=career_report.pdf"},
    )


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="127.0.0.1", port=8000, reload=False)
