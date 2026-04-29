from fastapi import APIRouter, HTTPException, Response, responses as fastapi_responses
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
from .database import SessionLocal, User as DBUser, History as DBHistory, init_db
from .auth import create_access_token, verify_google_token, get_current_user, get_optional_current_user, is_admin, is_super_admin, ADMIN_EMAIL, SUPER_ADMIN_USER, SUPER_ADMIN_PASS, verify_password, get_password_hash
from sqlalchemy.orm import Session
from fastapi import Depends

# Initialize DB on import (or we could do it in main.py lifespan)
init_db()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

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
async def predict(request: PredictRequest, db: Session = Depends(get_db), current_user: Optional[dict] = Depends(get_optional_current_user)):
    try:
        # 1. Attempt ML Prediction
        try:
            results = predict_careers(request.responses, top_n=request.top_n)
        except Exception as ml_err:
            print(f"ML Prediction not ready, using fallback: {ml_err}")
            # 2. Fallback: Content-based matching if model is still training
            df = load_careers_df()
            results = _fallback_predict(request.responses, df, top_n=request.top_n)

        # Save to history if user is logged in
        if current_user:
            try:
                user_username = current_user.get("sub")
                user = db.query(DBUser).filter(DBUser.username == user_username).first()
                if user:
                    new_history = DBHistory(
                        results=results,
                        responses=request.responses,
                        user_id=user.id
                    )
                    db.add(new_history)
                    db.commit()
            except Exception as e:
                print(f"History Save Error: {e}")
        
        return results
    except Exception as e:
        print(f"PREDICT ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def _fallback_predict(responses: dict, df: pd.DataFrame, top_n: int = 5):
    """Simple keyword/score based fallback when ML model is unavailable."""
    from ml_model import FEATURE_COLS, _compute_skill_gaps, _generate_why
    
    scores = []
    for _, row in df.iterrows():
        score = 0
        # Basic matching logic (check if user inputs match category or skills)
        resp_vals = str(responses.values()).lower()
        if str(row.get("category")).lower() in resp_vals: score += 20
        
        # Skill matching
        skills = str(row.get("key_skills", "")).lower().split(",")
        for s in skills:
            if s.strip() and s.strip() in resp_vals: score += 5
            
        scores.append((score, row))
    
    # Sort and take top_n
    scores.sort(key=lambda x: x[0], reverse=True)
    top_rows = [s[1] for s in scores[:top_n]]
    
    results = []
    for row in top_rows:
        career_name = row["career"]
        results.append({
            "career": career_name,
            "confidence": 85.0, # Static confidence for fallback
            "category": row.get("category", ""),
            "salary_inr": int(row.get("avg_salary_inr", 0)),
            "salary_usd": int(row.get("avg_salary_usd", 0)),
            "growth": row.get("growth_outlook", ""),
            "description": row.get("description", ""),
            "key_skills": [s.strip() for s in row.get("key_skills", "").split(",") if s.strip()],
            "why": _generate_why(responses, career_name, row),
            "skill_gaps": _compute_skill_gaps(responses, career_name)
        })
    return results

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/auth/register")
async def register(request: LoginRequest, db: Session = Depends(get_db)):
    existing = db.query(DBUser).filter(DBUser.username == request.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    new_user = DBUser(
        username=request.username,
        hashed_password=get_password_hash(request.password),
        role="user"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {"message": "User registered successfully"}

@router.post("/auth/login")
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    # 1. Primary Authorization: Super Admin (Mohit) Bypass
    if request.username == SUPER_ADMIN_USER and request.password == SUPER_ADMIN_PASS:
        user = db.query(DBUser).filter(DBUser.username == SUPER_ADMIN_USER).first()
        if not user:
            # Auto-provision the Super Admin on first successful hit
            user = DBUser(
                username=SUPER_ADMIN_USER,
                hashed_password=get_password_hash(SUPER_ADMIN_PASS),
                role="super_admin"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            # Ensure role is correct
            if user.role != "super_admin":
                user.role = "super_admin"
                db.commit()
        
        return generate_auth_response(user)

    # 2. Secondary Authorization: Database Credential Verification
    user = db.query(DBUser).filter(DBUser.username == request.username).first()
    
    if not user or not verify_password(request.password, user.hashed_password):
        # Log failure for debugging but don't leak info to client
        print(f"Login failed for user: {request.username}")
        raise HTTPException(
            status_code=401,
            detail="Authentication failed. Please check your credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return generate_auth_response(user)

def generate_auth_response(user):
    # Standardized response generator for consistency
    access_token = create_access_token(data={
        "sub": user.username, 
        "role": user.role,
        "id": user.id
    })
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "username": user.username,
            "role": user.role
        }
    }

@router.post("/auth/google")
async def google_login(request: Dict[str, str], db: Session = Depends(get_db)):
    # ... (Keep this for future if they want it back, but focus on the new one)
    pass

@router.get("/history")
async def get_history(userId: Optional[int] = None, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    # Admins/Super Admins see everything, Users see only their own
    if current_user.get("role") in ["admin", "super_admin"]:
        if userId:
            histories = db.query(DBHistory).filter(DBHistory.user_id == userId).order_by(DBHistory.timestamp.desc()).all()
        else:
            histories = db.query(DBHistory).order_by(DBHistory.timestamp.desc()).all()
    else:
        histories = db.query(DBHistory).filter(DBHistory.user_id == current_user.get("id")).order_by(DBHistory.timestamp.desc()).all()
    
    results = []
    for h in histories:
        owner = db.query(DBUser).filter(DBUser.id == h.user_id).first()
        h_dict = {
            "id": h.id,
            "timestamp": h.timestamp,
            "results": h.results,
            "responses": h.responses,
            "user_username": owner.username if owner else "Anonymous",
            "user_name": owner.username if owner else "Anonymous"
        }
        results.append(h_dict)
    return results

# --- ADMIN MANAGEMENT ---

class RoleUpdateRequest(BaseModel):
    username: str
    role: str

class UserCreateRequest(BaseModel):
    username: str
    password: str
    role: Optional[str] = "admin"

@router.get("/admin/users")
async def list_users(db: Session = Depends(get_db), _ = Depends(is_super_admin)):
    users = db.query(DBUser).all()
    return users

@router.post("/admin/create-admin")
async def create_admin(request: UserCreateRequest, db: Session = Depends(get_db), _ = Depends(is_super_admin)):
    existing = db.query(DBUser).filter(DBUser.username == request.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    new_user = DBUser(
        username=request.username,
        hashed_password=get_password_hash(request.password),
        role=request.role
    )
    db.add(new_user)
    db.commit()
    return {"message": f"Admin {request.username} created"}

@router.post("/admin/update-role")
async def update_user_role(request: RoleUpdateRequest, db: Session = Depends(get_db), _ = Depends(is_super_admin)):
    if request.role not in ["admin", "user"]:
        raise HTTPException(status_code=400, detail="Invalid role. Must be 'admin' or 'user'")
    
    user = db.query(DBUser).filter(DBUser.username == request.username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.username == SUPER_ADMIN_USER:
        raise HTTPException(status_code=400, detail="Cannot change role of Super Admin")
        
    user.role = request.role
    db.commit()
    return {"message": f"User {request.username} role updated to {request.role}"}

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
    
    # 1. Identify Career Focus (Message takes precedence over context)
    career_focus = None
    
    # Try to find a career mentioned in the message (simple keyword match first)
    for _, row in df.iterrows():
        c_name = str(row["career"]).lower()
        if c_name in msg:
            career_focus = row.to_dict()
            break
            
    # If not in message, use context
    if not career_focus and request.career_context:
        match = df[df["career"].str.lower() == request.career_context.lower()]
        if not match.empty:
            career_focus = match.iloc[0].to_dict()

    # 2. Try Gemini AI for premium response
    if model and GEMINI_API_KEY and "your_actual_key_here" not in GEMINI_API_KEY:
        try:
            # Provide specific context if we have a career focus
            context_str = ""
            if career_focus:
                context_str = f"""
                You are talking about the career: {career_focus['career']}.
                Details from our database:
                - Category: {career_focus.get('category', 'N/A')}
                - Description: {career_focus.get('description', 'N/A')}
                - Average Salary (INR): {career_focus.get('avg_salary_inr', 'N/A')}
                - Roadmap: {career_focus.get('roadmap', 'N/A')}
                - Key Skills: {career_focus.get('key_skills', 'N/A')}
                - Resources: {career_focus.get('free_resources', 'N/A')}
                """
            
            prompt = f"""
            You are a world-class AI Career Mentor. 
            User message: "{request.message}"
            {context_str}
            
            Guidelines:
            - If the user asks for salary, use the database values provided above if available.
            - If they ask for a roadmap, provide a detailed, encouraging explanation based on the database 'Roadmap' field.
            - If they ask about a different career than the context, and it's in our list, switch focus gracefully.
            - Keep responses professional, highly encouraging, and insightful.
            - Use markdown formatting for readability (bolding, lists).
            - If the career is not in our database, answer generally based on your knowledge but mention our database covers 250+ roles.
            """
            
            response = model.generate_content(prompt)
            if response and response.text:
                return {"response": response.text.strip()}
        except Exception as e:
            print(f"Chat Gemini Error: {e}")

    # 3. Fallback Logic (Improved)
    if "hello" in msg or "hi" in msg:
        return {"response": "Greetings! I am your AI Career Mentor. I've analyzed your potential. What would you like to know about your future path?"}
    
    if "salary" in msg or "pay" in msg:
        if career_focus:
            sal = career_focus.get("avg_salary_inr", 0)
            return {"response": f"As a **{career_focus['career']}**, you can expect an average salary of around **INR {sal:,}**. Does this align with your financial goals?"}
        return {"response": "Salaries vary by role. Tech roles often start at 12L+ while Finance can go higher. Which specific career are you curious about?"}

    if "resource" in msg or "link" in msg or "where to" in msg or (msg in ["yes", "yep", "sure", "ok", "please", "yes please", "yeah"]):
        if career_focus:
            resources = career_focus.get("free_resources", "Coursera, edX, and YouTube specialized channels.")
            return {"response": f"Excellent! For **{career_focus['career']}**, I recommend these top free resources: **{resources}**. \n\nWould you like to know more about the salary or the skills required?"}
        return {"response": "I can definitely find you resources! Which career path are we looking at right now?"}

    if "roadmap" in msg or "how to" in msg or "steps" in msg:
        if career_focus:
            steps = career_focus.get("roadmap", "Follow a specialized degree path and build projects.")
            return {"response": f"To become a **{career_focus['career']}**, here is your proven path: {steps}. \n\nWould you like to see specific free resources to start today?"}
        return {"response": "Most professional paths start with a relevant degree followed by specialized certifications. Tell me which career interests you!"}

    if "skill" in msg or "learn" in msg:
        if career_focus:
            skills = career_focus.get("key_skills", "relevant technical skills")
            return {"response": f"Mastering **{skills}** will make you highly competitive as a **{career_focus['career']}**. Should I suggest some resources for these?"}
        return {"response": "I recommend focusing on high-demand skills like Data Analysis, Project Management, or specialized technical tools. What is your current background?"}

    return {"response": "That's an interesting question! Based on my data, there's growing demand for roles that blend specialized knowledge with digital tools. Tell me more about your interests so I can guide you better."}

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
    
    try:
        # Return as streaming response
        pdf_output = pdf.output()
        return fastapi_responses.StreamingResponse(
            io.BytesIO(pdf_output),
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=career_report.pdf"}
        )
    except Exception as e:
        print(f"PDF EXPORT ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF: {str(e)}")

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

    try:
        pdf_output = pdf.output()
        
        safe_name = personal.get("name") or "Resume"
        filename = f"{str(safe_name).replace(' ', '_')}_Resume.pdf"
            
        return fastapi_responses.StreamingResponse(
            io.BytesIO(pdf_output),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        print(f"RESUME PDF EXPORT ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate Resume PDF: {str(e)}")


api_router = router
