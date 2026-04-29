# Career Finder

A tool designed to help students and professionals identify suitable career paths through data-driven analysis and machine learning. This application combines a comprehensive self-assessment with an ensemble model to provide tailored recommendations, market insights, and actionable roadmaps.

## 🚀 Tech Stack
This project utilizes a high-performance, professional-grade technology stack.

### Frontend
- **Framework**: React 18 with Vite
- **3D Graphics**: Three.js & React Three Fiber (R3F)
- **Visuals**: Framer Motion, Lucide Icons, and Custom Glassmorphism CSS
- **Analytics**: Recharts for data visualization
- **Authentication**: Google OAuth 2.0

### Backend
- **Framework**: FastAPI (Asynchronous Python)
- **AI Intelligence**: Google Gemini Pro (LLM) for reasoning and roadmaps
- **Machine Learning**: Scikit-Learn, Pandas, NumPy, and Joblib
- **Database**: SQLite with SQLAlchemy 2.0 ORM
- **Security**: JWT (Jose) and Bcrypt (Passlib)
- **Reports**: FPDF2 for dynamic PDF generation

## Core Functionality

- **Comprehensive Assessment**: Evaluates users across academic background, technical skills, personal interests, work preferences, and personality traits.
- **Personalized Reasoning**: Provides detailed explanations for each recommendation, referencing specific user signals like salary priority, risk tolerance, and skill alignment.
- **Industry Analytics**: Displays comparative data for different career paths, including salary trends, growth outlooks, and confidence scores.
- **Skill Assessment**: Includes a technical knowledge test to help users gauge their preparation level for a specific role.
- **Resume and Interview Support**: Generates tailored resume templates and provides common interview questions for recommended careers.

## Getting Started

### Prerequisites
- Python 3.10 or higher
- Node.js 18 or higher

### Backend Installation
1. Create a virtual environment:
   `python -m venv .venv`
2. Activate the environment:
   - Windows: `.\.venv\Scripts\Activate.ps1`
   - Mac/Linux: `source .venv/bin/activate`
3. Install dependencies:
   `pip install -r requirements.txt`
4. Start the server:
   `python -m uvicorn backend.main:app --reload`

### Frontend Installation
1. Navigate to the frontend directory:
   `cd frontend`
2. Install dependencies:
   `npm install`
3. Start the development server:
   `npm run dev`

The application will be accessible at `http://localhost:5173`.

## Project Structure

- `backend/`: API implementation and routing logic.
- `frontend/`: React source code and assets.
- `ml_model.py`: Core logic for career prediction and reasoning generation.
- `questionnaire.py`: Definition of the assessment sections and questions.
- `careers_data.csv`: The foundational dataset containing career attributes and requirements.

## Methodology

1. **Profile Synthesis**: User responses are converted into numerical feature vectors.
2. **Probability Mapping**: The ensemble model calculates match scores across multiple career categories.
3. **Data Enrichment**: Results are cross-referenced with real-world market data for salary and growth projections.
4. **Actionable Roadmap**: The system generates a multi-phase transition plan for the top career matches.
