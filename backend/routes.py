from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import pandas as pd
import os
import sys
from pathlib import Path
import os
try:
    import google.generativeai as genai
    from dotenv import load_dotenv
    load_dotenv()
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    if GEMINI_API_KEY:
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-pro')
    else:
        model = None
except ImportError:
    model = None
from fpdf import FPDF
import datetime
import io

# Ensure project root is in path for importing questionnaire and ml_model
PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.append(str(PROJECT_ROOT))

from questionnaire import SECTIONS
from ml_model import predict_careers
from .skill_questions import get_questions_for_career
from .resume_analyzer import analyze_resume

router = APIRouter()

# Models
class Career(BaseModel):
    career: str
    category: Optional[str] = None
    avg_salary_inr: Optional[int] = None
    avg_salary_usd: Optional[int] = None
    growth_outlook: Optional[str] = None
    description: Optional[str] = None
    roadmap: Optional[str] = None
    free_resources: Optional[str] = None
    key_skills: Optional[List[str]] = None
    top_certifications: Optional[List[str]] = None
    work_environment: Optional[str] = None

class CareersResponse(BaseModel):
    careers: List[Career]
    categories: List[str]
    count: int

class PredictRequest(BaseModel):
    responses: Dict[str, Any]
    top_n: Optional[int] = 5

class ChatRequest(BaseModel):
    message: str
    career_context: Optional[str] = None

class ExportRequest(BaseModel):
    results: List[Dict[str, Any]]
    responses: Dict[str, Any]

class AnalyzeResumeRequest(BaseModel):
    resume_data: Dict[str, Any]
    career_name: str

class ResumePdfRequest(BaseModel):
    resume_data: Dict[str, Any]
    career_name: str

# Data Loading
DATA_PATH = PROJECT_ROOT / "careers_data.csv"

def load_careers_df():
    if not DATA_PATH.exists():
        raise HTTPException(
            status_code=404,
            detail="Careers data not found. Ensure careers_data.csv exists in the project root."
        )
    return pd.read_csv(DATA_PATH)

# Endpoints
@router.get("/questionnaire")
async def get_questionnaire():
    return SECTIONS

@router.post("/predict")
async def predict(request: PredictRequest):
    try:
        results = predict_careers(request.responses, top_n=request.top_n)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/careers", response_model=CareersResponse)
async def get_careers(
    search: Optional[str] = None,
    category: Optional[str] = None,
    min_salary: Optional[int] = 0,
    growth: Optional[str] = None,
    sort: Optional[str] = "salary_desc"
):
    df = load_careers_df()
    
    # Filtering
    if search:
        df = df[df["career"].str.contains(search, case=False, na=False)]
    
    if category and category != "All":
        df = df[df["category"] == category]
    
    if min_salary:
        df = df[df["avg_salary_inr"] >= min_salary]
        
    if growth:
        growth_list = growth.split(",")
        df = df[df["growth_outlook"].isin(growth_list)]
    
    # Sorting
    if sort == "salary_desc":
        df = df.sort_values(by="avg_salary_inr", ascending=False)
    elif sort == "alpha":
        df = df.sort_values(by="career")
    elif sort == "growth":
        df = df.sort_values(by="growth_outlook")

    categories = sorted(df["category"].dropna().unique().tolist())
    
    # Process records to convert comma-separated strings to lists
    records = []
    for _, row in df.iterrows():
        record = row.to_dict()
        # Handle key_skills
        if isinstance(record.get("key_skills"), str):
            record["key_skills"] = [s.strip() for s in record["key_skills"].split(",") if s.strip()]
        else:
            record["key_skills"] = []
            
        # Handle top_certifications
        if isinstance(record.get("top_certifications"), str):
            record["top_certifications"] = [s.strip() for s in record["top_certifications"].split(",") if s.strip()]
        else:
            record["top_certifications"] = []
            
        records.append(record)
    
    return {
        "careers": records,
        "categories": categories,
        "count": len(records)
    }


@router.post("/chat")
async def career_mentor_chat(request: ChatRequest):
    msg = request.message.lower()
    df = load_careers_df()
    
    # Search context
    context_career = None
    if request.career_context:
        match = df[df["career"].str.lower() == request.career_context.lower()]
        if not match.empty:
            context_career = match.iloc[0].to_dict()

    if "hello" in msg or "hi" in msg:
        response = "Greetings! I am your AI Career Mentor. I've analyzed your potential. What would you like to know about your future path?"
    
    elif "salary" in msg or "pay" in msg:
        if context_career:
            sal = context_career.get("avg_salary_inr", 0)
            response = f"As an {context_career['career']}, you can expect an average salary of around INR {sal:,}. Does that align with your goals?"
        else:
            response = "Salaries vary greatly by role. For example, Tech roles often start at 12L+ while Finance roles can go much higher. Which career interests you?"

    elif "roadmap" in msg or "how to" in msg or "steps" in msg:
        if context_career:
            steps = context_career.get("roadmap", "Follow a specialized degree path and build projects.")
            response = f"To become an {context_career['career']}, here is your path: {steps}. Would you like to see specific free resources for this?"
        else:
            response = "Most paths start with a relevant degree followed by certifications. Tell me which career you're looking at!"

    elif "skill" in msg or "learn" in msg:
        if context_career:
            skills = context_career.get("key_skills", "Various technical skills")
            response = f"Focus on mastering: {skills}. These are high-demand competencies for an {context_career['career']}."
        else:
            response = "I recommend focusing on 'Power Skills': Analytics, Communication, and specialized technical tools. What's your background?"

    else:
        response = "That's an interesting question. In our database, I see growing demand for roles that blend creativity and technology. Tell me more about your interests!"

    return {"response": response}

@router.get("/skill-test-questions")
async def get_skill_test_questions(career: str):
    df = load_careers_df()
    match = df[df["career"].str.lower() == career.lower()]
    category = None
    if not match.empty:
        category = match.iloc[0]["category"]
    
    questions = get_questions_for_career(career, category)
    return {"questions": questions}

class RewriteRequest(BaseModel):
    text: str
    target_career: str

@router.post("/resume-rewrite")
async def api_rewrite_resume_text(request: RewriteRequest):
    text = request.text.strip()
    target_career = request.target_career.strip() or "Professional"
    
    # Attempt to use Gemini for premium rewriting
    if model and GEMINI_API_KEY:
        try:
            prompt = f"""
            As a world-class professional resume writer, rewrite the following job description/summary to be high-impact, results-oriented, and tailored for a {target_career} role.
            Use strong action verbs, quantify achievements where possible, and ensure it sounds sophisticated but authentic.
            Return ONLY the rewritten text, formatted as a few professional bullet points or a concise paragraph.
            
            Original Text: "{text}"
            Target Career: {target_career}
            """
            response = model.generate_content(prompt)
            if response and response.text:
                return {"rewritten_text": response.text.strip()}
        except Exception as e:
            print(f"Gemini Error: {e}")
            # Fallback to local logic if Gemini fails
    
    # --- FALLBACK LOCAL LOGIC (Universal Matching) ---
    df = load_careers_df()
    text_lower = text.lower()
    active_role = target_career
    
    # Intelligent matching for fallback
    best_match = None
    max_score = 0
    for _, row in df.iterrows():
        role = row["career"]
        skills = str(row["key_skills"]).lower()
        score = 0
        if role.lower() in text_lower: score += 10
        if any(skill.strip().lower() in text_lower for skill in skills.split(",")): score += 5
        if score > max_score:
            max_score = score
            best_match = role
    if best_match and max_score >= 5: active_role = best_match

    if not text:
        return {"rewritten_text": f"Dedicated {active_role} professional with a commitment to excellence and strategic growth."}

    keywords = [word.strip(".,!") for word in text.split() if len(word) > 3]
    k = keywords[:3] if keywords else ["strategic", "excellence", "impact"]
    
    templates = [
        f"Spearheaded high-impact initiatives as a {active_role}, leveraging {k[0]} to drive core business objectives.",
        f"Optimized complex workflows through the strategic application of {k[1] if len(k)>1 else 'industry-leading methodologies'}.",
        f"Collaborated with cross-functional teams to deliver {active_role} excellence, focusing on performance metrics."
    ]
    
    return {"rewritten_text": "\n".join([f"• {t}" for t in templates])}

@router.post("/export/pdf")
async def export_pdf(request: ExportRequest):
    def safe_text(text):
        if not text: return ""
        # Handle non-ascii characters by replacing them
        return str(text).encode('ascii', 'ignore').decode('ascii')

    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Helvetica", 'B', 24)
    pdf.set_text_color(30, 30, 30)
    pdf.cell(0, 15, safe_text("Career Finder AI Report"), new_x="LMARGIN", new_y="NEXT", align="C")
    
    pdf.set_font("Helvetica", 'I', 12)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 10, safe_text(f"Generated on: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}"), new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.ln(10)
    
    pdf.set_font("Helvetica", 'B', 16)
    pdf.set_text_color(20, 20, 20)
    pdf.cell(0, 10, safe_text("Your Top Recommendations"), new_x="LMARGIN", new_y="NEXT")
    pdf.ln(5)
    
    for i, r in enumerate(request.results, 1):
        pdf.set_font("Helvetica", 'B', 14)
        pdf.set_text_color(21, 207, 147) # Teal-ish
        pdf.cell(0, 8, safe_text(f"{i}. {r['career']} (Match: {r['confidence']}%)"), new_x="LMARGIN", new_y="NEXT")
        
        pdf.set_font("Helvetica", '', 11)
        pdf.set_text_color(50, 50, 50)
        pdf.multi_cell(0, 6, safe_text(f"Description: {r.get('description', 'N/A')}"), new_x="LMARGIN", new_y="NEXT")
        pdf.multi_cell(0, 6, safe_text(f"Why it fits you: {r.get('why', 'N/A')}"), new_x="LMARGIN", new_y="NEXT")
        pdf.cell(0, 6, safe_text(f"Average Salary: INR {r.get('salary_inr', 0):,}"), new_x="LMARGIN", new_y="NEXT")
        
        skills = r.get('key_skills', [])
        if isinstance(skills, str): skills = [s.strip() for s in skills.split(",")]
        pdf.cell(0, 6, safe_text(f"Key Skills: {', '.join(skills[:5])}"), new_x="LMARGIN", new_y="NEXT")
        pdf.ln(5)
    
    # Return as streaming response
    pdf_output = bytes(pdf.output())
    return Response(
        content=pdf_output,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=career_report.pdf"}
    )

@router.post("/resume/analyze")
async def api_analyze_resume(request: AnalyzeResumeRequest):
    try:
        if not request.career_name:
            raise HTTPException(status_code=400, detail="Career name is required for analysis")

        df = load_careers_df()
        # Clean the input and the data for matching
        search_name = request.career_name.strip().lower()
        match = df[df["career"].str.strip().str.lower() == search_name]
        
        if match.empty:
            # Fallback: check if the career name is contained in the string
            match = df[df["career"].str.lower().str.contains(search_name, na=False)]
            
        if match.empty:
            raise HTTPException(status_code=404, detail=f"Career '{request.career_name}' not found in our database")
        
        career_info = match.iloc[0].to_dict()
        analysis = analyze_resume(request.resume_data, career_info)
        return analysis
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"RESUME ANALYSIS ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal Analysis Error: {str(e)}")

@router.post("/resume/export-pdf")
async def api_export_resume_pdf(request: ResumePdfRequest):
    def safe_text(text):
        if not text: return ""
        return str(text).encode('ascii', 'ignore').decode('ascii')

    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()
    
    data = request.resume_data
    personal = data.get("personal", {})
    
    # 1. Header (Formal)
    pdf.set_font("Helvetica", 'B', 24)
    pdf.set_text_color(0, 0, 0)
    pdf.cell(0, 12, safe_text(personal.get("name", "RESUME")).upper(), ln=True, align="C")
    
    pdf.set_font("Helvetica", '', 9)
    pdf.set_text_color(80, 80, 80)
    contact_info = f"{personal.get('location', '')} | {personal.get('phone', '')} | {personal.get('email', '')}"
    pdf.cell(0, 6, safe_text(contact_info), ln=True, align="C")
    
    links = []
    if personal.get("linkedin"): links.append(personal["linkedin"])
    if personal.get("github"): links.append(personal["github"])
    if links:
        pdf.cell(0, 6, safe_text(" | ".join(links)), ln=True, align="C")
    
    pdf.ln(8)
    pdf.set_draw_color(79, 70, 229) # Accent color
    pdf.set_line_width(0.5)
    pdf.line(20, pdf.get_y(), 190, pdf.get_y())
    pdf.ln(5)

    # 2. Summary
    pdf.set_font("Helvetica", 'B', 11)
    pdf.set_text_color(79, 70, 229)
    pdf.cell(0, 8, "EXECUTIVE SUMMARY", ln=True)
    pdf.set_font("Helvetica", '', 10)
    pdf.set_text_color(40, 40, 40)
    pdf.multi_cell(0, 5, safe_text(data.get("summary", "")))
    pdf.ln(5)

    # 3. Experience
    pdf.set_font("Helvetica", 'B', 11)
    pdf.set_text_color(79, 70, 229)
    pdf.cell(0, 8, "PROFESSIONAL EXPERIENCE", ln=True)
    
    for exp in data.get("experience", []):
        pdf.set_font("Helvetica", 'B', 10)
        pdf.set_text_color(0, 0, 0)
        pdf.cell(100, 6, safe_text(exp.get("role", "")).upper(), ln=False)
        pdf.set_font("Helvetica", 'I', 10)
        pdf.cell(0, 6, safe_text(exp.get("period", "")), ln=True, align="R")
        
        pdf.set_font("Helvetica", 'B', 10)
        pdf.set_text_color(80, 80, 80)
        pdf.cell(0, 6, safe_text(exp.get("company", "")), ln=True)
        
        pdf.set_font("Helvetica", '', 10)
        pdf.set_text_color(40, 40, 40)
        pdf.multi_cell(0, 5, safe_text(exp.get("description", "")))
        pdf.ln(3)

    # 4. Education
    pdf.ln(2)
    pdf.set_font("Helvetica", 'B', 11)
    pdf.set_text_color(79, 70, 229)
    pdf.cell(0, 8, "EDUCATION", ln=True)
    
    for edu in data.get("education", []):
        pdf.set_font("Helvetica", 'B', 10)
        pdf.set_text_color(0, 0, 0)
        pdf.cell(100, 6, safe_text(edu.get("degree", "")), ln=False)
        pdf.set_font("Helvetica", '', 10)
        pdf.cell(0, 6, safe_text(edu.get("year", "")), ln=True, align="R")
        pdf.set_font("Helvetica", '', 10)
        pdf.set_text_color(80, 80, 80)
        pdf.cell(0, 5, safe_text(edu.get("school", "")), ln=True)
        pdf.ln(2)

    # 5. Skills
    pdf.ln(2)
    pdf.set_font("Helvetica", 'B', 11)
    pdf.set_text_color(79, 70, 229)
    pdf.cell(0, 8, "CORE COMPETENCIES", ln=True)
    pdf.set_font("Helvetica", '', 10)
    pdf.set_text_color(40, 40, 40)
    pdf.multi_cell(0, 6, safe_text(data.get("skills", "")))

    pdf.ln(10)
    pdf.set_font("Helvetica", 'I', 8)
    pdf.set_text_color(150, 150, 150)
    pdf.cell(0, 10, "Generated by Career Finder AI - Top 1% Industry Format", ln=True, align="C")

    pdf_output = bytes(pdf.output())
    return Response(
        content=pdf_output,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=resume.pdf"}
    )


api_router = router
