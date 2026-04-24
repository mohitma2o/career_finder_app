"""
app.py — Career Finder AI | Webruit Dark Mode UI
Multi-step questionnaire → Ensemble ML prediction → Rich results with Plotly & Lottie
"""

import streamlit as st
import pandas as pd
import numpy as np
import json
import io
import datetime
import requests
import plotly.graph_objects as go
import plotly.express as px
from streamlit_lottie import st_lottie
from fpdf import FPDF
import os

from questionnaire import SECTIONS, get_total_questions
from ml_model import predict_careers, train_model, MODEL_PATH, ENCODER_PATH, SCALER_PATH

# ── Page config ────────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="Career Finder AI",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ── Custom Webruit Dark CSS ──────────────────────────────────────────────────
st.markdown("""
<style>
    /* Global background & Typography */
    .stApp {
        background-color: #0B0B0E;
        color: #E2E2E2;
        font-family: 'Inter', system-ui, sans-serif;
    }
    
    /* Typography */
    h1, h2, h3, h4, h5, h6 { 
        color: #FFFFFF !important;
        font-family: 'Inter', system-ui, sans-serif;
        font-weight: 700;
        letter-spacing: -0.02em;
    }
    
    /* Neon Text Gradient for Headers */
    .neon-text {
        background: -webkit-linear-gradient(45deg, #15CF93, #00E5FF);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-weight: 800;
    }

    /* Custom Progress Bar */
    .stProgress > div > div > div > div {
        background: linear-gradient(90deg, #15CF93, #00E5FF);
        border-radius: 4px;
    }

    /* Dark Glassmorphism Bento Cards */
    .career-card {
        background: rgba(255, 255, 255, 0.03);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
        transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
    }
    .career-card:hover {
        transform: translateY(-4px);
        border-color: rgba(21, 207, 147, 0.4);
        box-shadow: 0 10px 30px rgba(21, 207, 147, 0.08);
    }
    
    /* Badges & Tags */
    .rank-badge {
        display: inline-block;
        background: rgba(21, 207, 147, 0.1);
        border: 1px solid #15CF93;
        color: #15CF93 !important;
        border-radius: 6px;
        width: 32px; height: 32px;
        line-height: 30px;
        text-align: center;
        font-weight: 700;
        font-family: 'Courier New', monospace;
        font-size: 1.1rem;
        margin-right: 0.8rem;
    }
    .career-title { font-size: 1.5rem; font-weight: 700; color: #FFFFFF; display: inline; }
    
    .tag {
        display: inline-block;
        background: rgba(255, 255, 255, 0.05);
        color: #B0B0B0 !important;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        padding: 4px 10px;
        font-size: 0.8rem;
        margin: 3px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    /* Insight / Why Box */
    .why-box {
        background: rgba(21, 207, 147, 0.05);
        border-left: 3px solid #15CF93;
        border-radius: 0 8px 8px 0;
        padding: 1rem 1.2rem;
        font-size: 0.95rem;
        color: #D0D0D0;
        margin-top: 1rem;
    }

    /* Stat Box (Bento Grid Style) */
    .stat-box {
        background: rgba(255, 255, 255, 0.03);
        border-radius: 12px;
        padding: 1.5rem 1.2rem;
        text-align: center;
        border: 1px solid rgba(255,255,255,0.05);
        transition: border-color 0.3s ease;
        height: 100%;
    }
    .stat-box:hover {
        border-color: rgba(0, 229, 255, 0.3);
    }
    .stat-value { 
        font-size: 2.2rem; 
        font-weight: 800; 
        background: -webkit-linear-gradient(45deg, #15CF93, #00E5FF);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 0.5rem;
    }
    .stat-label { font-size: 0.8rem; color: #888; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; }

    /* Button Styling */
    .stButton > button {
        border-radius: 8px !important;
        font-weight: 600 !important;
        letter-spacing: 0.5px !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        background: rgba(255, 255, 255, 0.05) !important;
        color: #FFF !important;
        transition: all 0.2s ease !important;
    }
    .stButton > button:hover {
        background: rgba(255, 255, 255, 0.1) !important;
        border-color: rgba(255, 255, 255, 0.2) !important;
    }
    .stButton > button[kind="primary"] {
        background: #15CF93 !important;
        color: #0B0B0E !important;
        border: none !important;
        box-shadow: 0 0 15px rgba(21, 207, 147, 0.4) !important;
    }
    .stButton > button[kind="primary"]:hover {
        background: #18E5A3 !important;
        box-shadow: 0 0 25px rgba(21, 207, 147, 0.6) !important;
    }

    /* Force Streamlit components dark */
    [data-baseweb="select"] > div { background-color: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.1); color: #FFF; }
    [data-baseweb="input"] > div { background-color: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.1); color: #FFF; }
    div[data-testid="stMarkdownContainer"] p { color: #D0D0D0; }
</style>
""", unsafe_allow_html=True)

# ── Helper functions for Lottie & PDF ──────────────────────────────────────────
def load_lottieurl(url: str):
    try:
        r = requests.get(url)
        if r.status_code != 200:
            return None
        return r.json()
    except:
        return None

def create_pdf_report(results, responses):
    def safe_text(text):
        if not text: return ""
        return str(text).encode('ascii', 'ignore').decode('ascii')

    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", 'B', 24)
    # Using dark grey instead of bright neon for PDF readability
    pdf.set_text_color(30, 30, 30)
    pdf.cell(0, 15, safe_text("Career Finder AI Report"), new_x="LMARGIN", new_y="NEXT", align="C")
    
    pdf.set_font("Arial", 'I', 12)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 10, safe_text(f"Generated on: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}"), new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.ln(10)
    
    pdf.set_font("Arial", 'B', 16)
    pdf.set_text_color(20, 20, 20)
    pdf.cell(0, 10, safe_text("Your Top Recommendations"), new_x="LMARGIN", new_y="NEXT")
    pdf.ln(5)
    
    for i, r in enumerate(results, 1):
        pdf.set_font("Arial", 'B', 14)
        pdf.set_text_color(21, 207, 147) # Teal
        pdf.cell(0, 8, safe_text(f"{i}. {r['career']} (Match: {r['confidence']}%)"), new_x="LMARGIN", new_y="NEXT")
        
        pdf.set_font("Arial", '', 11)
        pdf.set_text_color(50, 50, 50)
        pdf.multi_cell(0, 6, safe_text(f"Description: {r['description']}"), new_x="LMARGIN", new_y="NEXT")
        pdf.multi_cell(0, 6, safe_text(f"Why it fits you: {r['why']}"), new_x="LMARGIN", new_y="NEXT")
        pdf.cell(0, 6, safe_text(f"Average Salary: INR {r['salary_inr']:,} | USD {r['salary_usd']:,}"), new_x="LMARGIN", new_y="NEXT")
        pdf.cell(0, 6, safe_text(f"Key Skills: {', '.join(r['key_skills'][:5])}"), new_x="LMARGIN", new_y="NEXT")
        pdf.ln(5)
        
    return bytes(pdf.output())

# ── Session state initialisation ───────────────────────────────────────────────
if "page" not in st.session_state:
    st.session_state.page = "home"
if "section_idx" not in st.session_state:
    st.session_state.section_idx = 0
if "responses" not in st.session_state:
    st.session_state.responses = {}
if "results" not in st.session_state:
    st.session_state.results = None
if "model_ready" not in st.session_state:
    st.session_state.model_ready = False

def ensure_model():
    if not st.session_state.model_ready:
        if not all(os.path.exists(p) for p in [MODEL_PATH, ENCODER_PATH, SCALER_PATH]):
            with st.spinner("Initializing neural pathways... (Training Model)"):
                train_model()
        st.session_state.model_ready = True

# ── Questionnaire Rendering ──────────────────────────────────────────────────
def render_question(q, key_prefix=""):
    key = f"{key_prefix}_{q['id']}"
    current = st.session_state.responses.get(q["id"])

    if q["type"] == "scale":
        val = st.slider(
            q["text"], min_value=1, max_value=10, value=int(current) if current else 5, key=key,
            help=f"{q.get('min_label','Low')} → {q.get('max_label','High')}",
        )
        c1, c2 = st.columns([1, 1])
        c1.caption(f"1 = {q.get('min_label','Low')}")
        c2.caption(f"10 = {q.get('max_label','High')}")
        st.session_state.responses[q["id"]] = val

    elif q["type"] == "slider":
        val = st.slider(q["text"], min_value=q["min"], max_value=q["max"], value=int(current) if current else q["default"], key=key)
        st.session_state.responses[q["id"]] = val

    elif q["type"] == "select":
        idx = q["options"].index(current) if current and current in q["options"] else 0
        val = st.selectbox(q["text"], q["options"], index=idx, key=key)
        st.session_state.responses[q["id"]] = val
    st.markdown("<br>", unsafe_allow_html=True)


# ── Page: HOME ────────────────────────────────────────────────────────────────
def page_home():
    col1, col2 = st.columns([1.2, 1], gap="large")
    with col1:
        st.markdown("<h1 style='font-size: 3.5rem;'><span class='neon-text'>Career Finder</span> AI</h1>", unsafe_allow_html=True)
        st.markdown("<h3>Discover the career that aligns perfectly with your true potential, powered by ensemble machine learning.</h3>", unsafe_allow_html=True)
        st.markdown("""
        Answer **25 questions** across 5 dimensions and our models will:
        - 🧠 Analyse your **skills, interests & personality matrix**
        - ⚡ Predict your **top 5 career matches** with confidence %
        - 💡 Explain **exactly why** a career fits your profile
        - 📊 Provide **advanced visualizations** and **skill gap analysis**
        """)
        
        st.markdown("<br>", unsafe_allow_html=True)
        c1, c2, c3 = st.columns(3)
        c1.markdown('<div class="stat-box"><div class="stat-value">25</div><div class="stat-label">Data Points</div></div>', unsafe_allow_html=True)
        c2.markdown('<div class="stat-box"><div class="stat-value">30+</div><div class="stat-label">Careers</div></div>', unsafe_allow_html=True)
        c3.markdown('<div class="stat-box"><div class="stat-value">3</div><div class="stat-label">ML Models</div></div>', unsafe_allow_html=True)
        
        st.markdown("<br><br>", unsafe_allow_html=True)
        btn1, btn2, btn3 = st.columns([1,1,1])
        with btn1:
            if st.button("🚀 Start Assessment", type="primary", use_container_width=True):
                st.session_state.page = "quiz"
                st.session_state.section_idx = 0
                st.session_state.responses = {}
                st.rerun()
        with btn2:
            if st.button("🔍 Explore Database", use_container_width=True):
                st.session_state.page = "explorer"
                st.rerun()
        with btn3:
            # File uploader to load profile
            uploaded_file = st.file_uploader("📥 Load Profile JSON", type=["json"], label_visibility="collapsed")
            if uploaded_file is not None:
                try:
                    data = json.load(uploaded_file)
                    st.session_state.responses = data.get("responses", {})
                    st.session_state.results = data.get("recommendations", [])
                    st.session_state.page = "results"
                    st.rerun()
                except:
                    st.error("Invalid JSON file.")

    with col2:
        # Load a nice dark/tech Lottie animation
        # Using a network/AI abstract animation suitable for dark mode
        lottie_hero = load_lottieurl("https://assets3.lottiefiles.com/packages/lf20_qp1q7mct.json")
        if lottie_hero:
            st_lottie(lottie_hero, height=500, key="hero")
        else:
            st.info("Animation loading failed, but the platform is fully operational.")


# ── Page: QUIZ ────────────────────────────────────────────────────────────────
def page_quiz():
    ensure_model()
    total_sections = len(SECTIONS)
    sec_idx = st.session_state.section_idx
    section = SECTIONS[sec_idx]

    progress = (sec_idx) / total_sections
    st.progress(progress)
    st.caption(f"PHASE {sec_idx + 1} / {total_sections} | {section['title'].upper()}")

    st.markdown(f"<h2>{section['icon']} {section['title']}</h2>", unsafe_allow_html=True)
    st.markdown("<p style='color:#888;'>Provide accurate parameters for optimal prediction.</p>", unsafe_allow_html=True)

    with st.form(key=f"section_form_{sec_idx}", clear_on_submit=False):
        for q in section["questions"]:
            render_question(q, key_prefix=f"s{sec_idx}")
            st.divider()

        col_back, col_middle, col_next = st.columns([1, 2, 1])
        with col_back:
            if sec_idx > 0:
                if st.form_submit_button("← Back", use_container_width=True):
                    st.session_state.section_idx -= 1
                    st.rerun()
            else:
                if st.form_submit_button("🏠 Abort", use_container_width=True):
                    st.session_state.page = "home"
                    st.rerun()
        
        with col_next:
            if sec_idx < total_sections - 1:
                if st.form_submit_button("Next →", type="primary", use_container_width=True):
                    st.session_state.section_idx += 1
                    st.rerun()
            else:
                if st.form_submit_button("⚡ Execute Model", type="primary", use_container_width=True):
                    with st.spinner("Processing dimensions through Ensemble Matrix..."):
                        results = predict_careers(st.session_state.responses, top_n=5)
                    st.session_state.results = results
                    st.session_state.page = "results"
                    st.rerun()

# ── Page: RESULTS ─────────────────────────────────────────────────────────────
def page_results():
    results = st.session_state.results
    if not results:
        st.warning("No data found. Please run the assessment.")
        if st.button("Return to Home"):
            st.session_state.page = "home"
            st.rerun()
        return

    st.markdown("<h2>🎯 Prediction Matrix Complete</h2>", unsafe_allow_html=True)
    
    # Hero metric
    top = results[0]
    st.markdown(f"""
    <div style="background: rgba(21, 207, 147, 0.1); border: 1px solid #15CF93; padding: 2rem; border-radius: 12px; margin-bottom: 2rem;">
        <h3 style="color: #15CF93; margin:0;">🥇 Primary Match: {top['career']}</h3>
        <p style="font-size:1.2rem; opacity:0.9; margin-top:0.5rem; color:#FFF;">Match Confidence: <b style="color:#00E5FF;">{top['confidence']}%</b> | Avg Salary: <b>₹{top['salary_inr']:,}</b></p>
    </div>
    """, unsafe_allow_html=True)

    tab1, tab2, tab3, tab4 = st.tabs(["✨ Recommendations", "📊 Analytics", "⚖️ Compare", "📥 Export"])

    with tab1:
        for rank, r in enumerate(results, 1):
            st.markdown(f"""
            <div class="career-card">
                <div style="display:flex; align-items:center;">
                    <span class="rank-badge">0{rank}</span>
                    <div class="career-title">{r['career']}</div>
                </div>
                <div style="margin-top:0.8rem;">
                    <span class="tag">{r.get('category','Domain')}</span>
                    <span class="tag">{r['growth']} Growth</span>
                    <span class="tag">₹{r['salary_inr']:,}</span>
                </div>
                <p style="margin-top:1rem;color:#D0D0D0; font-size:1.05rem;">{r['description']}</p>
                <div class="why-box">💡 <b>Synthesis:</b> {r['why']}</div>
            </div>
            """, unsafe_allow_html=True)

            c1, c2, c3 = st.columns(3)
            with c1:
                st.markdown("**💰 Compensation & Environment**")
                st.markdown(f"- **INR:** ₹{r['salary_inr']:,}")
                st.markdown(f"- **USD:** ${r['salary_usd']:,}")
                st.markdown(f"- **Env:** {r['work_env']}")
            with c2:
                st.markdown("**🛠️ Required Skillset**")
                for sk in r["key_skills"][:4]:
                    st.markdown(f"- {sk}")
            with c3:
                st.markdown("**📜 Optimal Certifications**")
                for cert in r["certifications"][:3]:
                    st.markdown(f"- {cert}")

            if r["skill_gaps"]:
                with st.expander(f"🔍 Skill Gap Analysis for {r['career']}"):
                    gap_df = pd.DataFrame(r["skill_gaps"])
                    fig = px.bar(gap_df, x=["user", "required"], y="skill", barmode="group", orientation='h',
                                 color_discrete_sequence=["#00E5FF", "#15CF93"],
                                 labels={'value': 'Score (1-10)', 'variable': 'Legend', 'skill': ''},
                                 title="Current Parameters vs Requirements",
                                 template="plotly_dark")
                    fig.update_layout(plot_bgcolor='rgba(0,0,0,0)', paper_bgcolor='rgba(0,0,0,0)', margin=dict(l=0, r=0, t=40, b=0))
                    st.plotly_chart(fig, use_container_width=True)
            
            # New Features: Roadmap & Free Resources
            with st.expander(f"🗺️ Roadmap & Free Courses for {r['career']}"):
                st.markdown(f"**Optimal Roadmap:** {r.get('roadmap', 'Data unavailable')}")
                st.markdown("**Free Resources / Courses:**")
                resources = str(r.get('free_resources', '')).split(',')
                for res in resources:
                    st.markdown(f"- {res.strip()}")
            
            st.markdown("<hr style='border: 1px solid rgba(255,255,255,0.1);'>", unsafe_allow_html=True)

    with tab2:
        st.markdown("### Match Confidence Landscape")
        df_conf = pd.DataFrame({"Career": [r["career"] for r in results], "Confidence": [r["confidence"] for r in results]})
        fig_conf = px.bar(df_conf, x="Confidence", y="Career", orientation='h', color="Confidence", 
                          color_continuous_scale=["#0B0B0E", "#00E5FF", "#15CF93"], title="Confidence Scores", template="plotly_dark")
        fig_conf.update_layout(yaxis={'categoryorder':'total ascending'}, plot_bgcolor='rgba(0,0,0,0)', paper_bgcolor='rgba(0,0,0,0)')
        st.plotly_chart(fig_conf, use_container_width=True)

        st.markdown("### Compensation Matrix (INR)")
        df_sal = pd.DataFrame({"Career": [r["career"] for r in results], "Salary (INR)": [r["salary_inr"] for r in results]})
        fig_sal = px.bar(df_sal, x="Career", y="Salary (INR)", color="Salary (INR)", 
                         color_continuous_scale=["#00E5FF", "#15CF93"], title="Expected Annual Salary (INR)", template="plotly_dark")
        fig_sal.update_layout(plot_bgcolor='rgba(0,0,0,0)', paper_bgcolor='rgba(0,0,0,0)')
        st.plotly_chart(fig_sal, use_container_width=True)

        st.markdown("### Dynamic Personality Radar")
        categories = ["Programming", "Analytics", "Creativity", "Communication", "Leadership", "Tech", "Science", "Business"]
        keys = ["programming", "analytical", "creativity", "communication", "leadership", "interest_technology", "interest_science", "interest_business"]
        values = [st.session_state.responses.get(k, 5) for k in keys]
        
        fig_radar = go.Figure(data=go.Scatterpolar(
            r=values + [values[0]],
            theta=categories + [categories[0]],
            fill='toself',
            line_color='#15CF93',
            fillcolor='rgba(21, 207, 147, 0.2)'
        ))
        fig_radar.update_layout(
            polar=dict(
                radialaxis=dict(visible=True, range=[0, 10], gridcolor='rgba(255,255,255,0.1)'),
                angularaxis=dict(gridcolor='rgba(255,255,255,0.1)')
            ),
            showlegend=False,
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)',
            title="Skill & Interest Profile",
            template="plotly_dark",
            font=dict(color="#FFF")
        )
        st.plotly_chart(fig_radar, use_container_width=True)

    with tab3:
        st.markdown("### ⚖️ Side-by-Side Comparison")
        c_names = [r["career"] for r in results]
        comp1, comp2 = st.columns(2)
        with comp1: sel1 = st.selectbox("Career Matrix 1", c_names, index=0)
        with comp2: sel2 = st.selectbox("Career Matrix 2", c_names, index=1 if len(c_names)>1 else 0)
        
        r1 = next(r for r in results if r["career"] == sel1)
        r2 = next(r for r in results if r["career"] == sel2)
        
        st.markdown("<br>", unsafe_allow_html=True)
        
        # Calculate personalized fit based on user input
        total_gap_1 = sum(g.get('gap', 0) for g in r1.get('skill_gaps', []))
        total_gap_2 = sum(g.get('gap', 0) for g in r2.get('skill_gaps', []))
        
        if total_gap_1 < total_gap_2:
            st.info(f"💡 **Personalized Verdict:** Based on your inputs, **{r1['career']}** requires less upskilling (lower skill gap) and aligns more naturally with your current profile.")
        elif total_gap_2 < total_gap_1:
            st.info(f"💡 **Personalized Verdict:** Based on your inputs, **{r2['career']}** requires less upskilling (lower skill gap) and aligns more naturally with your current profile.")
        else:
            if r1['confidence'] >= r2['confidence']:
                st.info(f"💡 **Personalized Verdict:** Both careers require similar effort to master, but **{r1['career']}** has a higher overall confidence match.")
            else:
                st.info(f"💡 **Personalized Verdict:** Both careers require similar effort to master, but **{r2['career']}** has a higher overall confidence match.")

        col1, col2 = st.columns(2)
        
        def display_comp_card(r):
            gaps = r.get('skill_gaps', [])
            total_gap = sum(g.get('gap', 0) for g in gaps)
            strengths = [g['skill'] for g in gaps if g.get('gap', 0) == 0]
            weaknesses = [g['skill'] for g in gaps if g.get('gap', 0) > 0]
            
            str_html = ", ".join(strengths[:3]) if strengths else "N/A"
            weak_html = ", ".join(weaknesses[:3]) if weaknesses else "None! Perfect alignment."

            st.markdown(f"""
            <div class="stat-box" style="text-align:left;">
                <h3 style="margin-top:0; color:#15CF93;">{r['career']}</h3>
                <p><b>Match Confidence:</b> <span style="color:#00E5FF;">{r['confidence']}%</span></p>
                <div style="background:rgba(255,255,255,0.02); padding:10px; border-radius:8px; margin: 10px 0;">
                    <p style="margin:0 0 5px 0;"><b>Total Skill Gap:</b> {total_gap} pts</p>
                    <p style="margin:0 0 5px 0; font-size:0.9rem;"><b>✅ Your Strengths:</b> <span style="color:#15CF93;">{str_html}</span></p>
                    <p style="margin:0; font-size:0.9rem;"><b>⚠️ Needs Work:</b> <span style="color:#FFB74D;">{weak_html}</span></p>
                </div>
                <p><b>Salary (INR):</b> ₹{r['salary_inr']:,}</p>
                <p><b>Growth Outlook:</b> {r['growth']}</p>
                <p><b>Primary Skills:</b> {', '.join(r['key_skills'][:3])}</p>
            </div>
            """, unsafe_allow_html=True)
            
        with col1: display_comp_card(r1)
        with col2: display_comp_card(r2)

    with tab4:
        st.markdown("### 📥 Extract Data")
        st.markdown("Save your generated matrix or download a professional PDF report.")
        
        # Prepare JSON
        report = {
            "generated_on": datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
            "responses": st.session_state.responses,
            "recommendations": [{k: v for k, v in r.items() if k != "skill_gaps"} for r in results]
        }
        json_str = json.dumps(report, indent=2)
        
        # Prepare PDF
        pdf_bytes = create_pdf_report(results, st.session_state.responses)
        
        c1, c2, c3 = st.columns(3)
        with c1:
            st.download_button("💾 Export State (JSON)", data=json_str, file_name="career_profile.json", mime="application/json", use_container_width=True)
        with c2:
            st.download_button("📄 Download PDF Report", data=pdf_bytes, file_name="career_report.pdf", mime="application/pdf", use_container_width=True)
        with c3:
            if st.button("🔄 Reset Environment", use_container_width=True):
                st.session_state.page = "home"
                st.session_state.responses = {}
                st.session_state.results = None
                st.rerun()

# ── Page: EXPLORER ─────────────────────────────────────────────────────────────
def page_explorer():
    st.markdown("<h2>🔍 Global Career Database</h2>", unsafe_allow_html=True)
    st.markdown("Query the knowledge base of mapped careers and parameters.")
    
    if st.button("← Return to Terminal"):
        st.session_state.page = "home"
        st.rerun()
        
    df = pd.read_csv("careers_data.csv")
    
    st.markdown("#### Database Filters")
    # Advanced Options Layout
    c1, c2, c3 = st.columns(3)
    with c1: search = st.text_input("Query Name", "")
    with c2: cat_filter = st.selectbox("Category Segment", ["All"] + list(df["category"].unique()))
    with c3: sort_by = st.selectbox("Order By", ["Salary (High to Low)", "Alphabetical", "Growth Outlook"])
    
    # Extra filters
    c4, c5 = st.columns(2)
    with c4: min_salary = st.slider("Minimum Salary (INR)", 0, 5000000, 0, step=100000)
    with c5: growth_filter = st.multiselect("Growth Outlook", ["Very High", "High", "Medium", "Low"], default=["Very High", "High", "Medium"])
    
    if search: df = df[df["career"].str.contains(search, case=False)]
    if cat_filter != "All": df = df[df["category"] == cat_filter]
    if sort_by == "Salary (High to Low)": df = df.sort_values(by="avg_salary_inr", ascending=False)
    elif sort_by == "Alphabetical": df = df.sort_values(by="career")
    elif sort_by == "Growth Outlook": df = df.sort_values(by="growth_outlook")
    
    df = df[df["avg_salary_inr"] >= min_salary]
    if growth_filter:
        df = df[df["growth_outlook"].isin(growth_filter)]
    
    st.markdown(f"<p style='color:#15CF93;'>Showing {len(df)} matching records</p>", unsafe_allow_html=True)
    
    # Bento Grid Layout for Explorer
    cols = st.columns(2)
    for i, (_, row) in enumerate(df.iterrows()):
        with cols[i % 2]:
            st.markdown(f"""
            <div class="career-card" style="padding:1.2rem; height: 100%;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                    <div class="career-title" style="font-size:1.2rem;">{row['career']}</div>
                    <div style="font-weight:bold; color:#00E5FF;">₹{row['avg_salary_inr']:,}</div>
                </div>
                <div><span class="tag">{row['category']}</span> <span class="tag">{row['growth_outlook']}</span></div>
                <p style="margin-top:0.8rem; color:#A0A0A0; font-size:0.9rem;">{row['description']}</p>
                <div style="margin-top:0.8rem; font-size:0.85rem; color:#888;">
                    <strong>Roadmap:</strong> {row.get('roadmap', 'N/A')}
                </div>
            </div>
            """, unsafe_allow_html=True)

# ── Router ─────────────────────────────────────────────────────────────────────
def main():
    with st.sidebar:
        st.markdown("## ⚡ MENU")
        if st.button("🏠 Home", use_container_width=True): st.session_state.page = "home"; st.rerun()
        if st.button("📝 Start Assessment", use_container_width=True): st.session_state.page = "quiz"; st.session_state.section_idx = 0; st.rerun()
        if st.button("🔍 Database", use_container_width=True): st.session_state.page = "explorer"; st.rerun()
        if st.session_state.results:
            if st.button("📊 View Matrix", use_container_width=True): st.session_state.page = "results"; st.rerun()
        
        
        st.markdown("---")

    page = st.session_state.page
    if page == "home": page_home()
    elif page == "quiz": page_quiz()
    elif page == "results": page_results()
    elif page == "explorer": page_explorer()

if __name__ == "__main__":
    main()
