"""
ml_model.py — Career Finder AI
Ensemble ML model (RandomForest + XGBoost + SVM) with SHAP explainability.
Trains on a synthetic dataset derived from careers_data.csv.
"""

import os
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, VotingClassifier, GradientBoostingClassifier
from sklearn.svm import SVC
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
from sklearn.pipeline import Pipeline
import joblib
import warnings

warnings.filterwarnings("ignore")

# ── Paths ──────────────────────────────────────────────────────────────────────
MODEL_PATH = "career_model.pkl"
ENCODER_PATH = "label_encoder.pkl"
SCALER_PATH = "scaler.pkl"
DATA_PATH = "careers_data.csv"

# ── Feature columns (must match questionnaire.py get_all_feature_ids()) ────────
FEATURE_COLS = [
    "education_level", "stream", "cgpa", "math_comfort",
    "programming", "communication", "analytical", "creativity",
    "leadership", "technical_writing",
    "interest_technology", "interest_science", "interest_business",
    "interest_arts", "interest_social", "interest_nature",
    "work_env", "work_style", "salary_priority", "risk_tolerance", "impact_importance",
    "introvert_extrovert", "detail_oriented", "patience", "competitiveness",
]

# ── Encodings for categorical inputs ──────────────────────────────────────────
EDUCATION_MAP = {
    "High School (10th)": 1, "Senior Secondary (12th)": 2,
    "Bachelor's (ongoing)": 3, "Bachelor's (completed)": 4,
    "Master's (ongoing)": 5, "Master's (completed)": 6, "PhD": 7,
}
STREAM_MAP = {
    "Science (PCM)": 1, "Science (PCB)": 2, "Commerce": 3,
    "Arts / Humanities": 4, "Engineering": 5, "Medical": 6,
    "Computer Science": 7, "Management": 8, "Law": 9, "Other": 0,
}
WORK_ENV_MAP = {
    "Office (structured)": 1, "Remote (flexible)": 2, "Fieldwork / Outdoors": 3,
    "Lab / Research": 4, "Hospital / Clinic": 5, "Travel frequently": 6, "No preference": 0,
}
WORK_STYLE_MAP = {
    "Independently (solo focus)": 1, "Small team (2–5)": 2,
    "Large team / department": 3, "Client-facing roles": 4, "Mix of all": 0,
}


def encode_inputs(responses: dict) -> np.ndarray:
    """Convert raw questionnaire responses dict → numeric feature vector."""
    vec = []
    for feat in FEATURE_COLS:
        val = responses.get(feat, 5)
        if feat == "education_level":
            val = EDUCATION_MAP.get(val, 4)
        elif feat == "stream":
            val = STREAM_MAP.get(val, 0)
        elif feat == "work_env":
            val = WORK_ENV_MAP.get(val, 0)
        elif feat == "work_style":
            val = WORK_STYLE_MAP.get(val, 0)
        vec.append(float(val))
    return np.array(vec).reshape(1, -1)


# ── Career feature signatures (for data generation and explainability) ─────────
CAREER_SIGNATURES = {
    "Software Engineer":         dict(programming=9, analytical=8, math_comfort=7, interest_technology=9, creativity=5, communication=6, leadership=5, cgpa=72),
    "Data Scientist":            dict(programming=8, analytical=9, math_comfort=9, interest_technology=9, interest_science=8, cgpa=80),
    "Machine Learning Engineer": dict(programming=9, analytical=9, math_comfort=9, interest_technology=10, interest_science=8, cgpa=82),
    "Cybersecurity Analyst":     dict(programming=7, analytical=8, math_comfort=6, interest_technology=9, detail_oriented=8, cgpa=70),
    "Cloud Architect":           dict(programming=8, analytical=8, interest_technology=9, leadership=7, cgpa=75),
    "UI/UX Designer":            dict(creativity=9, interest_arts=9, communication=8, interest_technology=6, detail_oriented=7, cgpa=65),
    "Product Manager":           dict(leadership=9, communication=9, analytical=8, interest_business=9, cgpa=75),
    "DevOps Engineer":           dict(programming=8, analytical=7, interest_technology=9, detail_oriented=8, cgpa=72),
    "Business Analyst":          dict(analytical=8, communication=8, interest_business=8, math_comfort=6, cgpa=70),
    "Doctor (MBBS)":             dict(interest_science=9, interest_social=8, interest_nature=7, patience=9, detail_oriented=9, cgpa=85, stream=6),
    "Civil Engineer":            dict(math_comfort=8, analytical=8, interest_science=7, detail_oriented=8, cgpa=70, stream=5),
    "Mechanical Engineer":       dict(math_comfort=8, analytical=8, interest_science=8, creativity=6, cgpa=72, stream=5),
    "Electrical Engineer":       dict(math_comfort=9, analytical=8, interest_science=8, interest_technology=7, cgpa=74, stream=5),
    "Chartered Accountant":      dict(math_comfort=8, analytical=8, interest_business=8, detail_oriented=9, cgpa=75, stream=3),
    "Financial Analyst":         dict(math_comfort=8, analytical=9, interest_business=8, detail_oriented=8, cgpa=76),
    "Lawyer":                    dict(communication=9, analytical=8, interest_social=7, competitiveness=8, cgpa=72, stream=9),
    "Graphic Designer":          dict(creativity=10, interest_arts=10, communication=7, interest_technology=5, cgpa=60),
    "Content Writer":            dict(communication=9, creativity=8, interest_arts=7, analytical=5, cgpa=62),
    "Digital Marketer":          dict(communication=8, creativity=7, interest_business=8, analytical=7, cgpa=65),
    "Teacher / Educator":        dict(communication=9, interest_social=9, patience=9, leadership=7, impact_importance=9, cgpa=68),
    "Research Scientist":        dict(interest_science=10, analytical=9, math_comfort=9, patience=9, detail_oriented=9, cgpa=88),
    "Architect":                 dict(creativity=9, interest_arts=8, analytical=7, detail_oriented=9, math_comfort=7, cgpa=72),
    "Psychologist":              dict(interest_social=9, communication=9, patience=9, analytical=7, cgpa=72, stream=4),
    "Journalist":                dict(communication=10, creativity=8, interest_social=8, risk_tolerance=7, cgpa=65),
    "Entrepreneur":              dict(leadership=9, risk_tolerance=9, interest_business=10, communication=8, competitiveness=9, cgpa=65),
    "Game Developer":            dict(programming=9, creativity=9, interest_technology=9, interest_arts=6, cgpa=70),
    "Biomedical Engineer":       dict(interest_science=8, interest_nature=7, analytical=8, math_comfort=7, cgpa=78, stream=5),
    "Environmental Scientist":   dict(interest_nature=9, interest_science=8, analytical=7, impact_importance=8, cgpa=72),
    "HR Manager":                dict(communication=9, interest_social=8, leadership=8, patience=8, cgpa=68),
    "Operations Manager":        dict(leadership=9, analytical=8, interest_business=8, detail_oriented=7, cgpa=72),
    "Pharmacist":                dict(interest_science=8, interest_nature=7, detail_oriented=8, patience=7, cgpa=75, stream=6),
    "Nurse":                     dict(interest_social=9, patience=9, detail_oriented=8, interest_science=8, cgpa=70, stream=6),
    "Dentist":                   dict(interest_science=9, detail_oriented=9, patience=8, cgpa=80, stream=6),
    "Physiotherapist":           dict(interest_science=8, interest_social=8, patience=8, cgpa=72, stream=6),
    "Surgeon":                   dict(interest_science=10, detail_oriented=10, patience=8, analytical=9, cgpa=90, stream=6),
    "Pilot":                     dict(interest_technology=6, competitiveness=8, risk_tolerance=8, math_comfort=8, cgpa=75),
    "Air Traffic Controller":    dict(analytical=9, detail_oriented=9, patience=8, communication=8, cgpa=75),
    "Electrician":               dict(detail_oriented=8, math_comfort=7, interest_technology=6, cgpa=65, stream=5),
    "Plumber":                   dict(detail_oriented=8, patience=7, cgpa=60),
    "Carpenter":                 dict(creativity=7, detail_oriented=8, cgpa=60),
    "Chef":                      dict(creativity=8, patience=7, communication=6, cgpa=62),
    "Hotel Manager":             dict(leadership=8, communication=9, interest_business=7, cgpa=70),
    "Sales Manager":             dict(communication=9, leadership=8, competitiveness=8, interest_business=8, cgpa=68),
    "Investment Banker":         dict(analytical=9, math_comfort=9, leadership=7, competitiveness=9, cgpa=85, stream=3),
    "Marketing Manager":         dict(communication=9, creativity=8, interest_business=9, leadership=7, cgpa=72),
    "IAS Officer":               dict(leadership=9, analytical=8, communication=8, impact_importance=9, cgpa=80),
    "Police Officer":            dict(leadership=8, competitiveness=8, patience=7, physical=8, cgpa=70),
    "Software Tester":           dict(analytical=8, detail_oriented=9, programming=6, cgpa=70),
    "Blockchain Developer":      dict(programming=9, analytical=8, math_comfort=8, interest_technology=10, cgpa=78),
    "Mobile App Developer":      dict(programming=9, creativity=7, interest_technology=9, cgpa=72),
    "Fitness Trainer":           dict(interest_nature=7, communication=8, patience=8, leadership=6, cgpa=65),
    "Musician":                  dict(creativity=10, interest_arts=10, patience=8, cgpa=60),
    "Photographer":              dict(creativity=9, interest_arts=9, detail_oriented=7, cgpa=62),
    "Social Worker":             dict(interest_social=10, communication=9, patience=9, impact_importance=10, cgpa=70),
    "Veterinarian":              dict(interest_nature=10, interest_science=9, patience=9, detail_oriented=9, cgpa=85, stream=6),
    "Web Developer":             dict(programming=8, interest_technology=9, creativity=6, cgpa=68),
    "Accountant":                dict(analytical=8, math_comfort=8, detail_oriented=9, cgpa=75, stream=3),
    "Farmer/Agriculturist":      dict(interest_nature=9, patience=8, impact_importance=7, cgpa=65),
    "Mechanical Designer":       dict(analytical=8, creativity=7, math_comfort=7, detail_oriented=8, cgpa=70, stream=5),
    "Quality Assurance Manager": dict(analytical=8, detail_oriented=9, leadership=7, cgpa=75),
    "Data Analyst":              dict(analytical=9, math_comfort=7, programming=6, cgpa=72),
    "Project Manager":           dict(leadership=8, communication=8, analytical=7, cgpa=75),
    "AI Prompt Engineer":        dict(communication=9, analytical=8, creativity=9, interest_technology=10, programming=6, cgpa=70),
    "Web3 Security Auditor":     dict(programming=9, analytical=10, math_comfort=8, detail_oriented=10, interest_technology=10, cgpa=80),
    "Quantum Software Developer":dict(programming=9, analytical=10, math_comfort=10, interest_science=9, interest_technology=10, cgpa=88),
    "Generative AI Specialist":  dict(programming=9, analytical=9, creativity=8, interest_technology=10, math_comfort=8, cgpa=82),
    "No-Code/Low-Code Developer":dict(creativity=8, analytical=7, communication=8, interest_technology=9, programming=4, cgpa=65),
    "MLOps Engineer":            dict(programming=9, analytical=9, detail_oriented=9, interest_technology=10, math_comfort=8, cgpa=78),
    "Sustainable Tech Analyst":  dict(analytical=8, interest_nature=9, interest_technology=8, communication=8, cgpa=75),
    "Digital Twin Engineer":     dict(programming=8, analytical=9, math_comfort=8, interest_technology=9, detail_oriented=9, cgpa=76),
    "Synthography Artist (AI Art)":dict(creativity=10, interest_arts=10, interest_technology=8, detail_oriented=8, cgpa=60),
    "Cloud FinOps Practitioner": dict(analytical=9, math_comfort=8, interest_business=9, interest_technology=8, detail_oriented=9, cgpa=75),
}

def _generate_synthetic_data(careers_df: pd.DataFrame, n_samples: int = 3000) -> pd.DataFrame:
    """
    Generates synthetic training data based on career profiles.
    Each career has a 'signature' of preferred feature ranges.
    Samples are drawn with Gaussian noise around that signature.
    """
    np.random.seed(42)
    rows = []

    default_sig = {f: 5 for f in FEATURE_COLS}

    per_career = n_samples // len(CAREER_SIGNATURES)
    for career, sig in CAREER_SIGNATURES.items():
        base = {**default_sig, **sig}
        for _ in range(per_career):
            sample = {}
            for feat in FEATURE_COLS:
                mu = base.get(feat, 5)
                if feat == "cgpa":
                    val = np.clip(np.random.normal(mu, 6), 40, 100)
                elif feat in ("education_level", "stream", "work_env", "work_style"):
                    val = base.get(feat, 4)
                else:
                    val = np.clip(np.random.normal(mu, 1.2), 1, 10)
                sample[feat] = round(val, 2)
            sample["career"] = career
            rows.append(sample)

    return pd.DataFrame(rows)


def train_model():
    """Train ensemble model, save to disk, return (model, encoder, scaler, report)."""
    careers_df = pd.read_csv(DATA_PATH)
    df = _generate_synthetic_data(careers_df)

    X = df[FEATURE_COLS].values
    y = df["career"].values

    le = LabelEncoder()
    y_enc = le.fit_transform(y)

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y_enc, test_size=0.2, random_state=42, stratify=y_enc
    )

    # Ensemble: RandomForest + GradientBoosting + SVM
    rf = RandomForestClassifier(n_estimators=200, max_depth=15, random_state=42, n_jobs=-1)
    gb = GradientBoostingClassifier(n_estimators=100, max_depth=5, random_state=42)
    svm = SVC(kernel="rbf", probability=True, C=2.0, random_state=42)

    ensemble = VotingClassifier(
        estimators=[("rf", rf), ("gb", gb), ("svm", svm)],
        voting="soft",
        weights=[3, 2, 1],
    )
    ensemble.fit(X_train, y_train)

    y_pred = ensemble.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred, target_names=le.classes_)

    joblib.dump(ensemble, MODEL_PATH)
    joblib.dump(le, ENCODER_PATH)
    joblib.dump(scaler, SCALER_PATH)

    print(f"Model trained — accuracy: {acc:.2%}")
    return ensemble, le, scaler, acc, report


def load_model():
    """Load model from disk if exists, else raise error to trigger fallback."""
    if all(os.path.exists(p) for p in [MODEL_PATH, ENCODER_PATH, SCALER_PATH]):
        model = joblib.load(MODEL_PATH)
        le = joblib.load(ENCODER_PATH)
        scaler = joblib.load(SCALER_PATH)
        return model, le, scaler
    raise RuntimeError("Model files not found. Training may be in progress.")


def predict_careers(responses: dict, top_n: int = 5) -> list[dict]:
    """
    Given a dict of questionnaire responses, returns top_n career predictions.
    Each result: {career, confidence, salary_inr, salary_usd, growth, description,
                  key_skills, certifications, work_env, skill_gaps, why}
    """
    model, le, scaler = load_model()
    careers_df = pd.read_csv(DATA_PATH)

    x = encode_inputs(responses)
    x_scaled = scaler.transform(x)

    proba = model.predict_proba(x_scaled)[0]
    top_indices = np.argsort(proba)[::-1][:top_n]

    results = []
    for idx in top_indices:
        career_name = le.inverse_transform([idx])[0]
        confidence = float(proba[idx])

        row = careers_df[careers_df["career"] == career_name]
        if row.empty:
            continue
        row = row.iloc[0]

        # Skill gap: compare user's skill ratings vs expected (simplified heuristic)
        skill_gap = _compute_skill_gaps(responses, career_name)
        why = _generate_why(responses, career_name, row)

        results.append({
            "career": career_name,
            "confidence": round(confidence * 100, 1),
            "category": row.get("category", ""),
            "salary_inr": int(row.get("avg_salary_inr", 0)),
            "salary_usd": int(row.get("avg_salary_usd", 0)),
            "growth": row.get("growth_outlook", ""),
            "min_education": row.get("min_education", ""),
            "description": row.get("description", ""),
            "key_skills": [s.strip() for s in row.get("key_skills", "").split(",") if s.strip()],
            "top_certifications": [s.strip() for s in row.get("top_certifications", "").split(",") if s.strip()],
            "work_environment": row.get("work_environment", ""),
            "roadmap": row.get("roadmap", ""),
            "free_resources": row.get("free_resources", ""),
            "skill_gaps": skill_gap,
            "why": why,
        })


    return results


def _compute_skill_gaps(responses: dict, career: str) -> list[dict]:
    """Return list of {skill, user_score, required_score, gap} for key skills."""
    # Career → required skill levels (1–10)
    requirements = {
        "Software Engineer":         {"programming": 8, "analytical": 7, "math_comfort": 6},
        "Data Scientist":            {"programming": 7, "analytical": 9, "math_comfort": 9},
        "Machine Learning Engineer": {"programming": 9, "analytical": 9, "math_comfort": 9},
        "UI/UX Designer":            {"creativity": 8, "communication": 7},
        "Product Manager":           {"leadership": 8, "communication": 9, "analytical": 7},
        "Doctor (MBBS)":             {"patience": 8, "interest_science": 9, "detail_oriented": 9},
        "Lawyer":                    {"communication": 9, "analytical": 8},
        "Teacher / Educator":        {"communication": 9, "patience": 8, "interest_social": 8},
        "Research Scientist":        {"analytical": 9, "math_comfort": 9, "patience": 9},
        "Entrepreneur":              {"leadership": 8, "risk_tolerance": 8, "communication": 8},
        "Nurse":                     {"patience": 9, "interest_social": 9, "detail_oriented": 8},
        "Dentist":                   {"detail_oriented": 9, "interest_science": 9, "patience": 8},
        "Physiotherapist":           {"patience": 8, "interest_social": 8},
        "Surgeon":                   {"detail_oriented": 10, "analytical": 9, "interest_science": 10},
        "Pilot":                     {"analytical": 8, "math_comfort": 8},
        "Electrician":               {"detail_oriented": 8, "math_comfort": 7},
        "Chef":                      {"creativity": 8},
        "IAS Officer":               {"leadership": 9, "analytical": 8},
        "Blockchain Developer":      {"programming": 9, "analytical": 8},
        "Web Developer":             {"programming": 8},
        "Project Manager":           {"leadership": 8, "communication": 8},
        "Marketing Manager":         {"communication": 9, "creativity": 8},
        "AI Prompt Engineer":        {"communication": 8, "creativity": 8, "interest_technology": 8},
        "Web3 Security Auditor":     {"programming": 9, "analytical": 9, "detail_oriented": 9},
        "Quantum Software Developer":{"programming": 9, "math_comfort": 9, "analytical": 9},
        "Generative AI Specialist":  {"programming": 8, "analytical": 8, "interest_technology": 9},
        "No-Code/Low-Code Developer":{"creativity": 7, "interest_technology": 8},
        "MLOps Engineer":            {"programming": 9, "detail_oriented": 8, "analytical": 8},
        "Sustainable Tech Analyst":  {"analytical": 8, "interest_nature": 8},
        "Digital Twin Engineer":     {"programming": 7, "analytical": 8, "detail_oriented": 8},
        "Synthography Artist (AI Art)":{"creativity": 9, "interest_arts": 8},
        "Cloud FinOps Practitioner": {"analytical": 8, "interest_business": 8},
    }
    reqs = requirements.get(career, {})
    gaps = []
    for skill, required in reqs.items():
        if responses.get(skill, 5) < required:
            gaps.append(skill.replace('_', ' ').title())
    return gaps

def _generate_why(responses: dict, career: str, career_row: pd.Series = None) -> str:
    """Generate a high-quality, realistic, and highly explicit explanation of why this career fits."""
    # 1. Nuanced feature labels for explicit explanations
    feature_labels = {
        "programming": "programming and software development",
        "analytical": "analytical reasoning and logic",
        "interest_technology": "emerging technologies",
        "creativity": "creative problem-solving",
        "communication": "communication and interpersonal work",
        "leadership": "leadership and team management",
        "interest_science": "scientific exploration",
        "interest_social": "social impact and community service",
        "interest_arts": "artistic design and aesthetics",
        "interest_business": "business strategy and entrepreneurship",
        "risk_tolerance": "decisive action under risk",
        "math_comfort": "mathematics and quantitative analysis",
        "patience": "patient, long-term project execution",
        "detail_oriented": "attention to detail and precision",
        "interest_nature": "environmental and natural sciences",
        "impact_importance": "making a meaningful global impact",
        "competitiveness": "competitive and goal-driven environments",
    }

    # 2. Identify Top User Drivers (Signals)
    user_signals = []
    for feat, label in feature_labels.items():
        score = float(responses.get(feat, 5))
        if score >= 7:
            user_signals.append((score, label))
    
    # Sort by score and take top 3
    user_signals.sort(key=lambda x: x[0], reverse=True)
    drivers = [s[1] for s in user_signals[:3]]
    
    # 3. Analyze Value Alignment (Salary, Risk, Math)
    salary = float(responses.get("salary_priority", 5))
    risk = float(responses.get("risk_tolerance", 5))
    math = float(responses.get("math_comfort", 5))
    
    value_logic = []
    if salary >= 8 and risk <= 4:
        value_logic.append("high paying salary with less risks")
    elif salary >= 8:
        value_logic.append("high earning potential")
    
    if math >= 8:
        value_logic.append("maths and quantitative challenges")
    elif math >= 7:
        value_logic.append("mathematical reasoning")

    # 4. Get the target profile (signature) or derive from CSV
    signature = CAREER_SIGNATURES.get(career, {})
    
    # 5. Component 1: Explicit Alignment ("Because you showed...")
    all_reasons = value_logic + drivers # Prioritize the specific value logic requested
    
    if not all_reasons:
        p1 = f"This recommendation is based on your overall balanced profile, which aligns well with the diverse demands of a {career} role."
    else:
        # Construct the string
        if len(all_reasons) == 1:
            reasons_str = all_reasons[0]
        elif len(all_reasons) == 2:
            reasons_str = f"{all_reasons[0]} and {all_reasons[1]}"
        else:
            reasons_str = f"{', '.join(all_reasons[:2])}, and {all_reasons[2]}"
        
        p1 = f"We matched you to this career because you showed high interest in {reasons_str}. In a {career} role, these specific interests are directly applied to achieve professional success."

    # 6. Component 2: Cultural & Environment Fit (Personalized)
    p2_parts = []
    user_env = responses.get("work_env")
    career_env_str = str(career_row.get("work_environment", "")).lower() if career_row is not None else ""
    
    if user_env == "Remote (flexible)" and "remote" in career_env_str:
        p2_parts.append("your preference for remote work matches this industry's flexibility")
    elif user_env == "Office (structured)" and "office" in career_env_str:
        p2_parts.append("you'll thrive in the structured office setting this role provides")
    
    user_social = responses.get("introvert_extrovert", 5)
    if user_social >= 8:
        p2_parts.append("your outgoing personality will help you excel in the collaborative aspects of this field")
    elif user_social <= 3:
        p2_parts.append("the focused, independent nature of this work aligns with your preferred working style")

    if p2_parts:
        p2 = "Additionally, " + " and ".join(p2_parts[:2]) + "."
    else:
        # Use description from CSV for more detail if p2 is empty
        desc = str(career_row.get("description", "")) if career_row is not None else ""
        if desc:
            p2 = f"As a {career}, you will be {desc.lower().replace('.', '')}, which perfectly utilizes your stated preferences."
        else:
            p2 = f"This path offers the professional stability and environment you're looking for."

    # 7. Component 3: Impact & Outlook
    impact = responses.get("impact_importance", 5)
    growth = str(career_row.get("growth_outlook", "")) if career_row is not None else "Stable"
    
    if impact >= 8:
        p3 = f"Since you prioritize making a meaningful impact, the {growth.lower()} growth and social value of this path will be deeply rewarding."
    else:
        p3 = f"With a {growth.lower()} growth outlook, this career provides the long-term security and advancement opportunities you desire."

    stream_context = ""
    if career_row is not None and "Bachelor's" in str(career_row.get("min_education", "")):
        stream_context = f"\n\nYour educational background provides a solid foundation to transition into this field via the roadmap provided below."

    return f"{p1}\n\n{p2}\n\n{p3}{stream_context}"


if __name__ == "__main__":
    print("Training Career Finder model...")
    _, _, _, acc, report = train_model()
    print(f"\nAccuracy: {acc:.2%}\n")
    print(report)
