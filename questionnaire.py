"""
questionnaire.py — Structured multi-section questionnaire for Career Finder AI
Covers: Academic performance, Skills, Interests (RIASEC), Work preferences, Personality
"""

SECTIONS = [
    {
        "id": "academic",
        "title": "Academic Background",
        "icon": "Academics",
        "questions": [
            {
                "id": "education_level",
                "text": "What is your current / highest education level?",
                "type": "select",
                "options": ["High School (10th)", "Senior Secondary (12th)", "Bachelor's (ongoing)", "Bachelor's (completed)", "Master's (ongoing)", "Master's (completed)", "PhD"],
            },
            {
                "id": "stream",
                "text": "Which academic stream / field are you from?",
                "type": "select",
                "options": ["Science (PCM)", "Science (PCB)", "Commerce", "Arts / Humanities", "Engineering", "Medical", "Computer Science", "Management", "Law", "Other"],
            },
            {
                "id": "cgpa",
                "text": "What is your approximate CGPA / percentage?",
                "type": "slider",
                "min": 40,
                "max": 100,
                "default": 70,
                "unit": "%",
            },
            {
                "id": "math_comfort",
                "text": "How comfortable are you with Mathematics / Statistics?",
                "type": "scale",
                "min_label": "Hate it",
                "max_label": "Love it",
            },
        ],
    },
    {
        "id": "skills",
        "title": "Skills & Abilities",
        "icon": "Skills",
        "questions": [
            {
                "id": "programming",
                "text": "Rate your programming / coding ability",
                "type": "scale",
                "min_label": "None",
                "max_label": "Expert",
            },
            {
                "id": "communication",
                "text": "Rate your verbal & written communication skills",
                "type": "scale",
                "min_label": "Weak",
                "max_label": "Strong",
            },
            {
                "id": "analytical",
                "text": "Rate your analytical / problem-solving ability",
                "type": "scale",
                "min_label": "Weak",
                "max_label": "Strong",
            },
            {
                "id": "creativity",
                "text": "Rate your creative / artistic ability",
                "type": "scale",
                "min_label": "Low",
                "max_label": "High",
            },
            {
                "id": "leadership",
                "text": "Rate your leadership & team management skills",
                "type": "scale",
                "min_label": "Beginner",
                "max_label": "Natural leader",
            },
            {
                "id": "technical_writing",
                "text": "Rate your technical writing / documentation skills",
                "type": "scale",
                "min_label": "Weak",
                "max_label": "Strong",
            },
        ],
    },
    {
        "id": "interests",
        "title": "Interests & Passions",
        "icon": "Interests",
        "questions": [
            {
                "id": "interest_technology",
                "text": "How interested are you in technology & computers?",
                "type": "scale",
                "min_label": "Not at all",
                "max_label": "Deeply passionate",
            },
            {
                "id": "interest_science",
                "text": "How interested are you in scientific research?",
                "type": "scale",
                "min_label": "Not at all",
                "max_label": "Deeply passionate",
            },
            {
                "id": "interest_business",
                "text": "How interested are you in business & entrepreneurship?",
                "type": "scale",
                "min_label": "Not at all",
                "max_label": "Deeply passionate",
            },
            {
                "id": "interest_arts",
                "text": "How interested are you in arts, design & creativity?",
                "type": "scale",
                "min_label": "Not at all",
                "max_label": "Deeply passionate",
            },
            {
                "id": "interest_social",
                "text": "How much do you enjoy helping / teaching others?",
                "type": "scale",
                "min_label": "Not at all",
                "max_label": "Very much",
            },
            {
                "id": "interest_nature",
                "text": "How interested are you in nature, environment & living things?",
                "type": "scale",
                "min_label": "Not at all",
                "max_label": "Deeply passionate",
            },
        ],
    },
    {
        "id": "work_preferences",
        "title": "Work Preferences",
        "icon": "Work",
        "questions": [
            {
                "id": "work_env",
                "text": "What work environment do you prefer?",
                "type": "select",
                "options": ["Office (structured)", "Remote (flexible)", "Fieldwork / Outdoors", "Lab / Research", "Hospital / Clinic", "Travel frequently", "No preference"],
            },
            {
                "id": "work_style",
                "text": "How do you prefer to work?",
                "type": "select",
                "options": ["Independently (solo focus)", "Small team (2–5)", "Large team / department", "Client-facing roles", "Mix of all"],
            },
            {
                "id": "salary_priority",
                "text": "How important is a high salary to you?",
                "type": "scale",
                "min_label": "Not important",
                "max_label": "Top priority",
            },
            {
                "id": "risk_tolerance",
                "text": "Are you comfortable with job uncertainty / risk?",
                "type": "scale",
                "min_label": "Prefer stability",
                "max_label": "Love risk",
            },
            {
                "id": "impact_importance",
                "text": "How important is social impact in your career?",
                "type": "scale",
                "min_label": "Not important",
                "max_label": "Essential",
            },
        ],
    },
    {
        "id": "personality",
        "title": "Personality & Traits",
        "icon": "Personality",
        "questions": [
            {
                "id": "introvert_extrovert",
                "text": "Where do you fall on the introvert–extrovert scale?",
                "type": "scale",
                "min_label": "Introvert",
                "max_label": "Extrovert",
            },
            {
                "id": "detail_oriented",
                "text": "How detail-oriented are you?",
                "type": "scale",
                "min_label": "Big picture thinker",
                "max_label": "Very detail-oriented",
            },
            {
                "id": "patience",
                "text": "How patient are you with long, slow-progress tasks?",
                "type": "scale",
                "min_label": "Impatient",
                "max_label": "Very patient",
            },
            {
                "id": "competitiveness",
                "text": "How competitive are you?",
                "type": "scale",
                "min_label": "Collaborative",
                "max_label": "Highly competitive",
            },
        ],
    },
]


def get_all_feature_ids():
    """Returns ordered list of all question IDs (used as ML feature names)."""
    feature_ids = []
    for section in SECTIONS:
        for q in section["questions"]:
            feature_ids.append(q["id"])
    return feature_ids


def get_section_count():
    return len(SECTIONS)


def get_total_questions():
    return sum(len(s["questions"]) for s in SECTIONS)
