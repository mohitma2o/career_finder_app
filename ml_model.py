import math
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler
import joblib
import logging

try:
    import metapolib
    _HAS_METAPOLIB = True
except Exception:
    metapolib = None
    _HAS_METAPOLIB = False

logging.basicConfig(level=logging.INFO)


CAREERS = [
    {
        'career': 'Data Scientist',
        'tech': 5, 'creative': 3, 'people': 3, 'analytical': 5, 'physical': 1,
        'education': 'Bachelor', 'salary_usd': 110000,
        'entry': 'Learn Python, statistics, ML basics; build projects',
        'mastery': 'Advanced ML, MLOps, domain expertise, publish projects',
        'description': 'Work with data to build predictive models and extract insights.',
        'resources': ['Coursera: ML', 'Fast.ai', 'Kaggle']
    },
    {
        'career': 'Software Developer',
        'tech': 5, 'creative': 3, 'people': 3, 'analytical': 4, 'physical': 1,
        'education': 'Bachelor', 'salary_usd': 95000,
        'entry': 'Learn programming, data structures, build apps, internships',
        'mastery': 'System design, performance, OSS contributions, leadership',
        'description': 'Design and build software applications and systems.',
        'resources': ['freeCodeCamp', 'LeetCode', 'CS50']
    },
    {
        'career': 'UX/UI Designer',
        'tech': 3, 'creative': 5, 'people': 4, 'analytical': 3, 'physical': 1,
        'education': 'Diploma', 'salary_usd': 80000,
        'entry': 'Learn design principles, Figma, build a portfolio',
        'mastery': 'Research, interaction design, leadership, cross-discipline work',
        'description': 'Design user interfaces and experiences.',
        'resources': ['Interaction Design Foundation', 'Figma tutorials']
    },
    {
        'career': 'Data Analyst',
        'tech': 4, 'creative': 2, 'people': 3, 'analytical': 5, 'physical': 1,
        'education': 'Bachelor', 'salary_usd': 70000,
        'entry': 'Excel, SQL, Python/R, dashboards and reporting',
        'mastery': 'Advanced analytics, business domain knowledge, visualization',
        'description': 'Analyze business data and create reports to support decisions.',
        'resources': ['Mode Analytics', 'Tableau', 'DataCamp']
    },
    {
        'career': 'Product Manager',
        'tech': 3, 'creative': 4, 'people': 5, 'analytical': 4, 'physical': 1,
        'education': 'Bachelor', 'salary_usd': 120000,
        'entry': 'Understand product lifecycle, build domain knowledge, PM internships',
        'mastery': 'Strategy, leadership, metrics, stakeholder management',
        'description': 'Define product strategy and coordinate cross-functional teams.',
        'resources': ['Reforge', 'Product School', 'Cracking the PM Interview']
    },
    {
        'career': 'Civil Engineer',
        'tech': 3, 'creative': 2, 'people': 3, 'analytical': 4, 'physical': 4,
        'education': 'Bachelor', 'salary_usd': 85000,
        'entry': 'Engineering degree, internships, CAD and field work',
        'mastery': 'PE license, large projects, construction management',
        'description': 'Plan, design, and oversee construction projects.',
        'resources': ['Engineering textbooks', 'ASCE resources']
    },
    {
        'career': 'Teacher/Professor',
        'tech': 2, 'creative': 3, 'people': 5, 'analytical': 3, 'physical': 2,
        'education': 'Master', 'salary_usd': 60000,
        'entry': 'Degree in subject, teaching credentials, student teaching',
        'mastery': 'Advanced degrees, publications, curriculum development',
        'description': 'Teach and mentor students in academic settings.',
        'resources': ['Local education boards', 'Pedagogy workshops']
    }
]


def _build_dataframe():
    df = pd.DataFrame(CAREERS)
    return df


def prepare_model():
    df = _build_dataframe()

    feature_cols = ['tech', 'creative', 'people', 'analytical', 'physical']
    X = df[feature_cols].values

    le_edu = LabelEncoder()
    edu_encoded = le_edu.fit_transform(df['education'])

    X = np.column_stack([X, edu_encoded])

    le_career = LabelEncoder()
    y = le_career.fit_transform(df['career'])

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X.astype(float))

    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_scaled, y)

    return {
        'model': model,
        'scaler': scaler,
        'le_career': le_career,
        'le_edu': le_edu,
        'df': df,
        'feature_cols': feature_cols
    }


_MODEL_STORE = None


def get_model(refresh=False):
    global _MODEL_STORE
    if _MODEL_STORE is None or refresh:
        logging.info('Training in-memory career model...')
        _MODEL_STORE = prepare_model()
    return _MODEL_STORE


def predict(user_scores, education_level, top_n=3):
    """Predict top N career recommendations.

    user_scores: dict with keys 'tech','creative','people','analytical','physical' values 1-5
    education_level: string matching one of the known education levels
    """
    store = get_model()
    model = store['model']
    scaler = store['scaler']
    le_career = store['le_career']
    le_edu = store['le_edu']
    df = store['df']
    feature_cols = store['feature_cols']

    features = [float(user_scores.get(k, 1)) for k in feature_cols]
    try:
        edu_enc = le_edu.transform([education_level])[0]
    except Exception:
        # fallback to most common
        edu_enc = 0

    X_user = np.array([features + [edu_enc]])
    X_user_scaled = scaler.transform(X_user)

    probs = model.predict_proba(X_user_scaled)[0]
    idxs = np.argsort(probs)[::-1][:top_n]

    results = []
    for idx in idxs:
        career_label = le_career.inverse_transform([idx])[0]
        prob = float(probs[idx])
        row = df[df['career'] == career_label].iloc[0].to_dict()
        results.append({
            'career': career_label,
            'score': round(prob * 100, 1),
            'salary_usd': row.get('salary_usd'),
            'description': row.get('description'),
            'entry': row.get('entry'),
            'mastery': row.get('mastery'),
            'resources': row.get('resources')
        })

    return results


if __name__ == '__main__':
    store = get_model(refresh=True)
    print('Model trained on careers:', list(store['df']['career']))
