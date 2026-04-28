import pandas as pd
import re
from typing import Dict, List, Any

def analyze_resume(resume_data: Dict[str, Any], career_info: Dict[str, Any]) -> Dict[str, Any]:
    """
    Analyzes resume data against a specific career profile.
    Returns a score, identified gaps, and suggestions for improvement.
    """
    score = 0
    suggestions = []
    skills_to_learn = []
    strengths = []
    
    # 1. Personal Info Check
    personal = resume_data.get("personal", {})
    if personal.get("name") and personal.get("email") and personal.get("phone"):
        score += 10
        strengths.append("Complete contact information provided.")
    else:
        suggestions.append("Ensure your contact details (Email, Phone) are clearly listed.")

    if personal.get("linkedin"):
        score += 5
    else:
        suggestions.append("Add a LinkedIn profile to increase professional credibility.")

    # 2. Summary Analysis
    summary = resume_data.get("summary", "")
    if len(summary) > 50:
        score += 10
        # Check if career title is in summary
        if career_info.get("career", "").lower() in summary.lower():
            score += 5
            strengths.append(f"Strong summary tailored to the {career_info.get('career')} role.")
        else:
            suggestions.append(f"Mention the specific role '{career_info.get('career')}' in your summary to pass ATS filters.")
    else:
        suggestions.append("Expand your professional summary to highlight your unique value proposition.")

    # 3. Experience Analysis
    experience = resume_data.get("experience", [])
    if len(experience) > 0:
        score += 20
        # Check for quantified results
        has_metrics = any(re.search(r'\d+%|\$\d+|[0-9]+ ', exp.get("description", "")) for exp in experience)
        if has_metrics:
            score += 10
            strengths.append("Quantified achievements detected in your experience section.")
        else:
            suggestions.append("Use numbers (%, $, #) to quantify your impact in your previous roles.")
    else:
        suggestions.append("Add relevant work experience or projects to demonstrate hands-on skills.")

    # 4. Education Analysis
    education = resume_data.get("education", [])
    if len(education) > 0:
        score += 10
    else:
        suggestions.append("Include your educational background or relevant certifications.")

    # 5. Skills Analysis (The most important part)
    user_skills_raw = resume_data.get("skills", "")
    if not isinstance(user_skills_raw, str): user_skills_raw = ""
    user_skills = [s.strip().lower() for s in user_skills_raw.split(",") if s.strip()]
    
    # Required skills from career info
    required_skills_raw = career_info.get("key_skills", [])
    required_skills = []
    
    if isinstance(required_skills_raw, str):
        required_skills = [s.strip().lower() for s in required_skills_raw.split(",") if s.strip()]
    elif isinstance(required_skills_raw, list):
        required_skills = [str(s).lower() for s in required_skills_raw]
    
    # Handle the case where required_skills might be NaN from pandas
    if not required_skills:
        # Fallback to description-based skill extraction or just ignore
        required_skills = []

    matched_skills = [s for s in required_skills if any(s in us for us in user_skills)]
    missing_skills = [s for s in required_skills if s not in matched_skills]

    if required_skills:
        skill_score = (len(matched_skills) / len(required_skills)) * 30
    else:
        skill_score = 30 # No skills required? Full points or neutral
    
    score += skill_score

    if matched_skills:
        strengths.append(f"Strong alignment with key skills: {', '.join(matched_skills[:3])}.")
    
    if missing_skills:
        skills_to_learn = missing_skills
        suggestions.append(f"Your resume is missing {len(missing_skills)} critical skills for this role.")
    
    # Final chance of shortlisting
    total_score = min(int(score), 100)
    
    chance = "Low"
    if total_score > 80: chance = "Very High"
    elif total_score > 65: chance = "High"
    elif total_score > 45: chance = "Moderate"
    
    return {
        "score": total_score,
        "chance": chance,
        "strengths": strengths,
        "suggestions": suggestions,
        "skills_to_learn": [s.title() for s in skills_to_learn],
        "ats_status": "Optimized" if total_score > 70 else "Needs Optimization"
    }
