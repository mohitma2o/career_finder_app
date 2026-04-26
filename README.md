# Career Finder AI 🎯

A professional, AI-powered career recommendation platform that helps students discover their ideal career paths using ensemble machine learning and interactive data visualization.

## 🚀 Tech Stack

- **Frontend**: React 18, Vite, Three.js (Fiber/Drei), Framer Motion, Lucide Icons.
- **Backend**: FastAPI (Python 3.10+), Uvicorn, Pydantic.
- **ML Engine**: Scikit-Learn (RandomForest, GradientBoosting, SVM), Pandas, NumPy.
- **Styling**: Vanilla CSS with glassmorphism and dark mode support.

## ✨ Key Features

- **Advanced Assessment**: Multi-step questionnaire across 5 core dimensions.
- **Ensemble ML Model**: High-accuracy predictions using a soft-voting classifier.
- **Interactive Results**:
  - **3D Career Showcase**: Immersive 3D visualization of top matches.
  - **Analytics Dashboard**: Radar charts, confidence bars, and salary comparisons.
  - **Career Explorer**: Searchable database of 130+ mapped careers.
  - **AI Career Mentor**: Real-time advice on roadmaps, skills, and salaries.
- **Professional Reports**: Export results to high-quality PDF or JSON formats.

## 🛠️ Quick Start

### 1. Prerequisites
- Python 3.10+
- Node.js 18+

### 2. Backend Setup
```bash
# Create and activate virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1 # Windows
source .venv/bin/activate    # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Run the server
python -m uvicorn backend.main:app --reload
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:5173`.

## 📁 File Structure

```
career_finder_app/
├── backend/            # FastAPI implementation & routes
├── frontend/           # React application (Vite-based)
├── ml_model.py         # ML pipeline and training logic
├── questionnaire.py    # Assessment definitions
├── careers_data.csv    # Knowledge base (130+ careers)
└── README.md
```

## 🧠 How It Works

1. **Data Ingestion**: The system processes a 25-point profile from the user.
2. **Feature Engineering**: Encodes academic, skill, and interest parameters.
3. **Inference**: The ensemble model calculates probabilities across 30+ career clusters.
4. **Contextual Enrichment**: Matches top predictions with market data (Salary, Growth, Skills).
5. **Guidance**: The AI Mentor provides specific roadmap steps based on results.

## 🎯 Objectives

- **Precision Matching**: Leverage supervised ML for high-confidence career alignment.
- **Professional UX**: Clean, emoji-free (in core data), premium aesthetic.
- **Actionable Insights**: Provide clear roadmaps and free learning resources for every path.
