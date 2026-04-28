# Career Finder

A tool designed to help students and professionals identify suitable career paths through data-driven analysis and machine learning. This application combines a comprehensive self-assessment with an ensemble model to provide tailored recommendations, market insights, and actionable roadmaps.

## Technical Overview

The project is built with a decoupled architecture focusing on performance and accuracy.

- **Frontend**: Developed with React and Vite, utilizing Three.js for interactive visualizations and Framer Motion for interface transitions.
- **Backend**: Built on FastAPI to ensure high-performance API responses and seamless communication with the ML engine.
- **Machine Learning**: Utilizes an ensemble approach with Scikit-Learn (RandomForest, GradientBoosting, and SVM) to analyze user profiles against a dataset of over 400 career signatures.
- **Data Management**: Powered by Pandas and NumPy for efficient data processing and feature engineering.

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
