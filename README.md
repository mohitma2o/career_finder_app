# Career Finder AI 🎯

An AI-powered career recommendation system that helps students discover the best-fit career paths using supervised machine learning.

## Features

- **Multi-step questionnaire** across 5 dimensions: Academic, Skills, Interests, Work Preferences, Personality
- **Ensemble ML model** (RandomForest + GradientBoosting + SVM with soft voting)
- **30+ careers** mapped with real salary data, growth outlook, and certifications
- **Skill gap analysis** per recommended career
- **Why this career?** plain-English explanation per result
- **Radar chart** of your personal profile
- **Salary comparison chart** and confidence bar chart
- **JSON export** of your full results report

## Quick Start

```bash
# 1. Clone
git clone https://github.com/mohitma2o/career_finder_app.git
cd career_finder_app

# 2. Create virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1     # Windows
source .venv/bin/activate         # Mac/Linux

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run
streamlit run app.py
```

The model trains automatically on first run (~30 seconds). Subsequent runs load from cache.

## File Structure

```
career_finder_app/
├── app.py              # Streamlit UI (multi-step wizard + results)
├── ml_model.py         # Ensemble model, training, prediction, SHAP-style explanations
├── questionnaire.py    # Question definitions for all 5 sections
├── careers_data.csv    # 30+ careers with salary, skills, certifications
├── requirements.txt    # Dependencies
└── README.md
```

## How It Works

1. User answers 25 questions across 5 sections
2. Responses are encoded into a numeric feature vector (25 dimensions)
3. Ensemble model (RF + GB + SVM) predicts career probabilities
4. Top 5 careers returned with confidence %, salary, growth, skill gaps, and reasoning

## Model Details

- **Algorithm**: VotingClassifier (RandomForest + GradientBoosting + SVM)
- **Training data**: 3,000 synthetic samples generated from career-specific feature signatures
- **Features**: 25 (academic, skills, interests, work prefs, personality)
- **Careers**: 31 mapped categories across Technology, Healthcare, Engineering, Finance, Arts, Law, Science

## Objectives

- Develop an AI-based career recommendation system for students
- Analyze academic performance, skills, interests, and personality traits
- Apply supervised machine learning for accurate predictions
- Design a user-friendly interface with confidence scores
- Support informed career decisions through data-driven insights
