# Career Finder — AI-guided Questionnaire

This is a small Python + Streamlit project that recommends careers based on a short questionnaire.

Quick start (Windows):

1. Create and activate a Python environment (recommended):

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

2. Install dependencies:

```powershell
python -m pip install -r requirements.txt
```

3. Run the app:

```powershell
streamlit run app.py
```

App files:

- `app.py` — Streamlit UI (questionnaire + editor)
- `ml_model.py` — in-memory synthetic career dataset and model/predict functions
- `requirements.txt` — dependencies
- `README.md` — this file

Notes:

- The project uses a small synthetic careers list inside `ml_model.py` for demo purposes.
- The editor page lets you edit and save `README.md` from the browser.
# CareerFinder AI

## Setup (Windows CMD)
```
cd C:/Users/Mohit/Desktop/career_finder_app
python -m venv venv
call venv\Scripts\activate.bat
pip install -r requirements.txt
streamlit run app.py
```

**Or after creating venv:**
```
call venv\Scripts\activate.bat & pip install -r requirements.txt & streamlit run app.py
```

## Features
- Interactive questionnaire on interests/skills/education
- ML-powered (RandomForest) top 5 career recommendations
- Salary estimates (US avg), entry requirements, mastery paths
- Match score charts (matplotlib)

## How it works
Questionnaire → feature vector → scikit-learn model predict → recommendations from careers_data.csv (15+ careers)

App auto-trains model on first run. Fully self-contained.
