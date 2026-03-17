import streamlit as st
from ml_model import predict, get_model
import json
import os

st.set_page_config(page_title='Career Finder', layout='wide')

def sidebar_inputs():
    st.sidebar.header('Your Preferences')
    tech = st.sidebar.slider('Interest in Technology', 1, 5, 3)
    creative = st.sidebar.slider('Interest in Creativity', 1, 5, 3)
    people = st.sidebar.slider('Interest in Working with People', 1, 5, 3)
    analytical = st.sidebar.slider('Interest in Analytical Work', 1, 5, 3)
    physical = st.sidebar.slider('Interest in Physical Work', 1, 5, 1)

    store = get_model()
    edu_options = list(store['df']['education'].unique())
    education = st.sidebar.selectbox('Highest Education', edu_options)

    return {'tech': tech, 'creative': creative, 'people': people, 'analytical': analytical, 'physical': physical}, education


def show_recommendations(user_scores, education):
    with st.spinner('Finding best career matches...'):
        results = predict(user_scores, education, top_n=5)

    st.header('Recommended Careers')
    for r in results:
        with st.expander(f"{r['career']} — Match: {r['score']}%"):
            st.write(r.get('description', ''))
            st.write(f"**Approx. Salary (USD):** {r.get('salary_usd')}")
            st.write(f"**How to enter:** {r.get('entry')}")
            st.write(f"**How to master:** {r.get('mastery')}")
            resources = r.get('resources', []) or []
            if resources:
                st.write('**Helpful resources:**')
                for res in resources:
                    st.write('- ' + str(res))


def editor_page():
    st.header('Project Editor')
    path = 'README.md'
    if not os.path.exists(path):
        with open(path, 'w', encoding='utf-8') as f:
            f.write('# Career Finder\n\nEdit this README and save.')

    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = st.text_area('Edit README.md', value=content, height=400)
    if st.button('Save README'):
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        st.success('Saved README.md')


def main():
    page = st.sidebar.selectbox('Page', ['Career Finder', 'Editor'])
    st.title('Career Finder — AI-guided questionnaire')

    if page == 'Career Finder':
        user_scores, education = sidebar_inputs()
        if st.button('Get Recommendations'):
            show_recommendations(user_scores, education)

        if st.button('Retrain Model (refresh in-memory)'):
            get_model(refresh=True)
            st.success('Model retrained in memory')

    else:
        editor_page()


if __name__ == '__main__':
    main()
import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import joblib
from questionnaire import questions
from ml_model import predict_career, load_data, prepare_model

st.set_page_config(page_title="CareerFinder AI", layout="wide")

# Load model (train if not exists)
try:
    model = joblib.load('model.pkl')
    scaler = joblib.load('scaler.pkl')
    le_career = joblib.load('le_career.pkl')
    le_edu = joblib.load('le_edu.pkl')
    df = load_data()
except:
    st.info("Training model...")
    df = load_data()
    model, scaler, le_career, le_edu, df = prepare_model(df)
    joblib.dump(model, 'model.pkl')
    joblib.dump(scaler, 'scaler.pkl')
    joblib.dump(le_career, 'le_career.pkl')
    joblib.dump(le_edu, 'le_edu.pkl')

st.title("🚀 CareerFinder AI")
st.markdown("Discover your perfect career based on interests and skills! Answer the questionnaire below.")

# Questionnaire
responses = {}
if 'responses' not in st.session_state:
    st.session_state.responses = {}

col1, col2 = st.columns(2)

with col1:
    st.subheader("Interests (0-10 scale)")
    for q in questions[:-1]:  # Exclude education
        val = st.slider(q['text'], 0, 10, key=q['id'])
        st.session_state.responses[q['id']] = val

with col2:
    st.subheader("Education")
    education = st.selectbox(
        questions[-1]['text'],
        options=questions[-1]['options'],
        key='education'
    )
    st.session_state.responses['education'] = education

# Predict button
if st.button("🔮 Find My Career!", type="primary"):
    responses = st.session_state.responses
    recommendations = predict_career(responses, model, scaler, le_career, le_edu, df)
    
    st.success("Here are your top career recommendations!")
    
    # Visualize match scores
    fig, ax = plt.subplots()
    careers = [r['career'] for r in recommendations]
    scores = [r['match_score'] for r in recommendations]
    ax.barh(careers, scores, color='skyblue')
    ax.set_xlabel('Match Score (%)')
    ax.set_title('Career Match Scores')
    st.pyplot(fig)
    
    # Detailed recommendations
    for rec in recommendations:
        with st.expander(f"**{rec['career']}** (Match: {rec['match_score']:.1f}%) 💼"):
            col1, col2, col3 = st.columns([1,1,1])
            with col1:
                st.metric("Avg Salary (USD)", f"${rec['salary']:,.0f}")
            with col2:
                st.info("**Entry Requirements:**")
                st.write(rec['entry'])
            with col3:
                st.info("**Mastery Path:**")
                st.write(rec['mastery'])

st.sidebar.markdown("## About")
st.sidebar.info("Powered by scikit-learn ML model.\nData: 15+ careers with interests, salaries, guides.")
