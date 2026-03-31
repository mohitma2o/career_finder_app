"""
app.py — Career Finder AI  |  Streamlit UI
Multi-step questionnaire → Ensemble ML prediction → Rich results with charts + PDF export
"""

import streamlit as st
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib import rcParams
import os, json, io, datetime

from questionnaire import SECTIONS, get_total_questions
from ml_model import predict_careers, train_model, MODEL_PATH, ENCODER_PATH, SCALER_PATH

# ── Page config ────────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="Career Finder AI",
    page_icon="🎯",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# ── Custom CSS ─────────────────────────────────────────────────────────────────
st.markdown("""
<style>
    .main { padding-top: 1rem; }
    .stProgress > div > div { background: linear-gradient(90deg, #6C63FF, #48CAE4); border-radius: 10px; }
    .career-card {
        background: #f8f9ff;
        border: 1px solid #e0e0ff;
        border-radius: 14px;
        padding: 1.4rem 1.6rem;
        margin-bottom: 1.2rem;
        box-shadow: 0 2px 8px rgba(108,99,255,0.07);
    }
    .rank-badge {
        display: inline-block;
        background: #6C63FF;
        color: white;
        border-radius: 50%;
        width: 32px; height: 32px;
        line-height: 32px;
        text-align: center;
        font-weight: 700;
        font-size: 0.95rem;
        margin-right: 0.5rem;
    }
    .career-title { font-size: 1.35rem; font-weight: 700; color: #2d2b55; display: inline; }
    .confidence-bar-wrap { background: #e8e8ff; border-radius: 10px; height: 12px; margin: 0.6rem 0; }
    .confidence-bar { background: linear-gradient(90deg, #6C63FF, #48CAE4); border-radius: 10px; height: 12px; }
    .tag {
        display: inline-block;
        background: #ede9ff;
        color: #4a3f9f;
        border-radius: 20px;
        padding: 2px 12px;
        font-size: 0.78rem;
        margin: 2px;
        font-weight: 500;
    }
    .why-box {
        background: #fff8e7;
        border-left: 4px solid #f5c518;
        border-radius: 0 8px 8px 0;
        padding: 0.6rem 1rem;
        font-size: 0.9rem;
        color: #6b5900;
        margin-top: 0.5rem;
    }
    .section-header { font-size: 1.6rem; font-weight: 700; color: #2d2b55; margin-bottom: 0.3rem; }
    .section-subtitle { color: #888; font-size: 0.95rem; margin-bottom: 1.2rem; }
    .stat-box {
        background: #f0f0ff;
        border-radius: 10px;
        padding: 0.8rem 1rem;
        text-align: center;
    }
    .stat-value { font-size: 1.4rem; font-weight: 700; color: #6C63FF; }
    .stat-label { font-size: 0.78rem; color: #888; }
    h1 { color: #2d2b55 !important; }
    .stSlider > div > div > div > div { background: #6C63FF !important; }
</style>
""", unsafe_allow_html=True)

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
    """Train model on first run if not cached."""
    if not st.session_state.model_ready:
        if not all(os.path.exists(p) for p in [MODEL_PATH, ENCODER_PATH, SCALER_PATH]):
            with st.spinner("🔧 Training AI model for the first time… (30–60 seconds)"):
                train_model()
        st.session_state.model_ready = True


# ── Helper: render a single question widget ─────────────────────────────────────
def render_question(q, key_prefix=""):
    key = f"{key_prefix}_{q['id']}"
    current = st.session_state.responses.get(q["id"])

    if q["type"] == "scale":
        val = st.slider(
            q["text"],
            min_value=1, max_value=10,
            value=int(current) if current else 5,
            key=key,
            help=f"{q.get('min_label','Low')} → {q.get('max_label','High')}",
        )
        col1, col2 = st.columns([1, 1])
        col1.caption(f"1 = {q.get('min_label','Low')}")
        col2.caption(f"10 = {q.get('max_label','High')}")
        st.session_state.responses[q["id"]] = val

    elif q["type"] == "slider":
        val = st.slider(
            q["text"],
            min_value=q["min"], max_value=q["max"],
            value=int(current) if current else q["default"],
            key=key,
        )
        st.session_state.responses[q["id"]] = val

    elif q["type"] == "select":
        idx = 0
        if current and current in q["options"]:
            idx = q["options"].index(current)
        val = st.selectbox(q["text"], q["options"], index=idx, key=key)
        st.session_state.responses[q["id"]] = val

    st.markdown("")


# ── Page: HOME ────────────────────────────────────────────────────────────────
def page_home():
    col1, col2 = st.columns([1.4, 1], gap="large")
    with col1:
        st.markdown("## 🎯 Career Finder AI")
        st.markdown("### Find the career that's built for *you*")
        st.markdown("""
        Answer **25 questions** across 5 sections and our AI will:
        - Analyse your **academic profile, skills, interests & personality**
        - Predict your **top 5 career matches** with confidence scores
        - Explain **why each career fits** you
        - Show **skill gaps** you need to close
        - Provide **salary ranges, growth outlook & certifications**
        """)
        st.markdown("")
        c1, c2, c3 = st.columns(3)
        c1.markdown('<div class="stat-box"><div class="stat-value">25</div><div class="stat-label">Questions</div></div>', unsafe_allow_html=True)
        c2.markdown('<div class="stat-box"><div class="stat-value">30+</div><div class="stat-label">Careers mapped</div></div>', unsafe_allow_html=True)
        c3.markdown('<div class="stat-box"><div class="stat-value">5</div><div class="stat-label">Dimensions</div></div>', unsafe_allow_html=True)
        st.markdown("")
        if st.button("🚀 Start the Assessment", type="primary", use_container_width=True):
            st.session_state.page = "quiz"
            st.session_state.section_idx = 0
            st.session_state.responses = {}
            st.rerun()

    with col2:
        st.markdown("#### What we assess")
        dimensions = [
            ("🎓", "Academic Background", "Stream, CGPA, education level"),
            ("🛠️", "Skills & Abilities", "Coding, communication, creativity…"),
            ("❤️", "Interests & Passions", "Technology, science, arts, business…"),
            ("💼", "Work Preferences", "Environment, style, salary goals"),
            ("🧠", "Personality Traits", "Intro/extrovert, patience, detail…"),
        ]
        for icon, title, desc in dimensions:
            st.markdown(f"**{icon} {title}**  \n{desc}")
            st.markdown("")


# ── Page: QUIZ ────────────────────────────────────────────────────────────────
def page_quiz():
    ensure_model()
    total_sections = len(SECTIONS)
    sec_idx = st.session_state.section_idx
    section = SECTIONS[sec_idx]

    # Progress bar
    progress = (sec_idx) / total_sections
    st.progress(progress)
    st.caption(f"Section {sec_idx + 1} of {total_sections}  |  {section['icon']} {section['title']}")

    st.markdown(f"<div class='section-header'>{section['icon']} {section['title']}</div>", unsafe_allow_html=True)
    st.markdown("<div class='section-subtitle'>Answer honestly — there are no right or wrong answers.</div>", unsafe_allow_html=True)

    with st.form(key=f"section_form_{sec_idx}"):
        for q in section["questions"]:
            render_question(q, key_prefix=f"s{sec_idx}")
            st.divider()

        col_back, col_next = st.columns([1, 1])
        with col_back:
            if sec_idx > 0:
                back = st.form_submit_button("← Back", use_container_width=True)
            else:
                back = False
                st.form_submit_button("🏠 Home", use_container_width=True, disabled=False)
        with col_next:
            if sec_idx < total_sections - 1:
                nxt = st.form_submit_button("Next →", type="primary", use_container_width=True)
            else:
                nxt = st.form_submit_button("🎯 Get My Results", type="primary", use_container_width=True)

    if back:
        st.session_state.section_idx -= 1
        st.rerun()

    if nxt:
        if sec_idx < total_sections - 1:
            st.session_state.section_idx += 1
            st.rerun()
        else:
            with st.spinner("🤖 Analysing your profile… running ensemble model…"):
                results = predict_careers(st.session_state.responses, top_n=5)
            st.session_state.results = results
            st.session_state.page = "results"
            st.rerun()


# ── Page: RESULTS ─────────────────────────────────────────────────────────────
def page_results():
    results = st.session_state.results
    if not results:
        st.warning("No results found. Please retake the quiz.")
        if st.button("Retake"):
            st.session_state.page = "home"
            st.rerun()
        return

    st.markdown("## 🎯 Your Career Recommendations")
    st.markdown("Based on your profile, here are your top career matches:")

    # ── Top match highlight ──────────────────────────────────────────────────
    top = results[0]
    col_a, col_b, col_c, col_d = st.columns(4)
    col_a.metric("🥇 Top Match", top["career"])
    col_b.metric("✅ Confidence", f"{top['confidence']}%")
    col_c.metric("💰 Avg Salary (INR)", f"₹{top['salary_inr']:,}")
    col_d.metric("📈 Growth Outlook", top["growth"])

    st.markdown("---")

    # ── Tabs ─────────────────────────────────────────────────────────────────
    tab1, tab2, tab3 = st.tabs(["📋 Career Cards", "📊 Charts & Analysis", "📥 Export"])

    with tab1:
        for rank, r in enumerate(results, 1):
            with st.container():
                st.markdown(f"""
                <div class="career-card">
                    <span class="rank-badge">{rank}</span>
                    <span class="career-title">{r['career']}</span>
                    &nbsp;&nbsp;<span class="tag">{r.get('category','')}</span>
                    &nbsp;<span class="tag">{r['growth']} growth</span>
                    <div class="confidence-bar-wrap">
                        <div class="confidence-bar" style="width:{r['confidence']}%"></div>
                    </div>
                    <small style="color:#888">Match confidence: <b>{r['confidence']}%</b></small>
                    <p style="margin-top:0.7rem;color:#444">{r['description']}</p>
                    <div class="why-box">💡 {r['why']}</div>
                </div>
                """, unsafe_allow_html=True)

                col1, col2, col3 = st.columns(3)
                with col1:
                    st.markdown("**💰 Salary**")
                    st.markdown(f"₹{r['salary_inr']:,} / year (India)")
                    st.markdown(f"${r['salary_usd']:,} / year (US)")
                    st.markdown(f"🎓 Min: {r['min_education']}")
                    st.markdown(f"🏢 {r['work_env']}")

                with col2:
                    st.markdown("**🛠️ Key Skills**")
                    for skill in r["key_skills"][:5]:
                        st.markdown(f"• {skill.strip()}")

                with col3:
                    st.markdown("**📜 Top Certifications**")
                    for cert in r["certifications"][:4]:
                        st.markdown(f"• {cert.strip()}")

                # Skill gap
                if r["skill_gaps"]:
                    with st.expander(f"🔍 Skill Gap Analysis for {r['career']}"):
                        gap_df = pd.DataFrame(r["skill_gaps"])
                        fig, ax = plt.subplots(figsize=(7, max(2, len(gap_df) * 0.6)))
                        y = range(len(gap_df))
                        ax.barh(list(y), gap_df["required"], color="#e0e0ff", label="Required", height=0.5)
                        ax.barh(list(y), gap_df["user"], color="#6C63FF", label="Your score", height=0.5)
                        ax.set_yticks(list(y))
                        ax.set_yticklabels(gap_df["skill"])
                        ax.set_xlim(0, 10)
                        ax.set_xlabel("Score (1–10)")
                        ax.legend()
                        ax.set_title("Your scores vs required level")
                        fig.tight_layout()
                        st.pyplot(fig)
                        plt.close()

                # New: Roadmap and Free Resources
                careers_df = pd.read_csv("careers_data.csv")
                career_row = careers_df[careers_df["career"] == r['career']]
                if not career_row.empty:
                    row_data = career_row.iloc[0]
                    roadmap = row_data.get("roadmap", "")
                    resources = row_data.get("free_resources", "")

                    with st.expander("🗺️ Roadmap to Success"):
                        st.markdown(f"**{r['career']} Roadmap:**")
                        st.markdown(roadmap.replace("→", " → "))

                    with st.expander("🎓 Free Resources & Courses"):
                        st.markdown("**Start learning today:**")
                        for res in resources.split(","):
                            st.markdown(f"• [{res.strip()}]")

                st.markdown("")

    with tab2:
        # Confidence bar chart
        st.markdown("### Match Confidence Scores")
        fig, ax = plt.subplots(figsize=(9, 4))
        careers = [r["career"] for r in results]
        confs = [r["confidence"] for r in results]
        colors = ["#6C63FF", "#48CAE4", "#90E0EF", "#ADE8F4", "#CAF0F8"]
        bars = ax.barh(careers[::-1], confs[::-1], color=colors[::-1], height=0.55)
        for bar, val in zip(bars, confs[::-1]):
            ax.text(bar.get_width() + 0.5, bar.get_y() + bar.get_height() / 2,
                    f"{val}%", va="center", fontsize=11, fontweight="bold", color="#2d2b55")
        ax.set_xlim(0, max(confs) + 12)
        ax.set_xlabel("Confidence (%)")
        ax.spines[["top", "right"]].set_visible(False)
        fig.tight_layout()
        st.pyplot(fig)
        plt.close()

        # Salary comparison
        st.markdown("### Salary Comparison (INR / year)")
        fig2, ax2 = plt.subplots(figsize=(9, 4))
        salaries = [r["salary_inr"] for r in results]
        x = np.arange(len(careers))
        bars2 = ax2.bar(x, salaries, color="#6C63FF", width=0.5)
        ax2.set_xticks(x)
        ax2.set_xticklabels(careers, rotation=15, ha="right", fontsize=9)
        ax2.set_ylabel("Annual salary (₹)")
        ax2.yaxis.set_major_formatter(plt.FuncFormatter(lambda v, _: f"₹{int(v/100000)}L"))
        for bar, val in zip(bars2, salaries):
            ax2.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 15000,
                     f"₹{val//100000}L", ha="center", fontsize=9, color="#2d2b55")
        ax2.spines[["top", "right"]].set_visible(False)
        fig2.tight_layout()
        st.pyplot(fig2)
        plt.close()

        # Radar chart – user profile
        st.markdown("### Your Skill & Interest Profile")
        labels = ["Programming", "Analytics", "Creativity", "Communication", "Leadership",
                  "Tech Interest", "Science", "Business", "Social", "Arts"]
        keys = ["programming", "analytical", "creativity", "communication", "leadership",
                "interest_technology", "interest_science", "interest_business",
                "interest_social", "interest_arts"]
        resp = st.session_state.responses
        values = [resp.get(k, 5) for k in keys]
        values += values[:1]

        angles = np.linspace(0, 2 * np.pi, len(labels), endpoint=False).tolist()
        angles += angles[:1]

        fig3, ax3 = plt.subplots(figsize=(6, 6), subplot_kw=dict(polar=True))
        ax3.plot(angles, values, color="#6C63FF", linewidth=2)
        ax3.fill(angles, values, color="#6C63FF", alpha=0.2)
        ax3.set_xticks(angles[:-1])
        ax3.set_xticklabels(labels, fontsize=9)
        ax3.set_ylim(0, 10)
        ax3.set_yticks([2, 4, 6, 8, 10])
        ax3.set_yticklabels(["2", "4", "6", "8", "10"], fontsize=7, color="gray")
        ax3.set_title("Your Profile Radar", pad=20, fontsize=13, fontweight="bold")
        fig3.tight_layout()
        st.pyplot(fig3)
        plt.close()

    with tab3:
        st.markdown("### 📥 Export Your Results")
        st.markdown("Download your results as a structured JSON report:")

        careers_df = pd.read_csv("careers_data.csv")
        report = {
            "generated_on": datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
            "responses": st.session_state.responses,
            "recommendations": []
        }
        for r in results:
            career_row = careers_df[careers_df["career"] == r["career"]]
            rec_data = {k: v for k, v in r.items() if k != "skill_gaps"}
            if not career_row.empty:
                row_data = career_row.iloc[0]
                rec_data["roadmap"] = row_data.get("roadmap", "")
                rec_data["free_resources"] = row_data.get("free_resources", "")
            report["recommendations"].append(rec_data)
        json_str = json.dumps(report, indent=2)
        st.download_button(
            "⬇️ Download JSON Report",
            data=json_str,
            file_name="career_finder_report.json",
            mime="application/json",
            use_container_width=True,
        )

        st.markdown("---")
        if st.button("🔄 Retake Assessment", type="primary", use_container_width=True):
            st.session_state.page = "home"
            st.session_state.responses = {}
            st.session_state.results = None
            st.rerun()


# ── Router ─────────────────────────────────────────────────────────────────────
def main():
    with st.sidebar:
        st.markdown("## 🎯 Career Finder AI")
        st.markdown("---")
        if st.button("🏠 Home", use_container_width=True):
            st.session_state.page = "home"
            st.rerun()
        if st.button("📝 Take Quiz", use_container_width=True):
            st.session_state.page = "quiz"
            st.session_state.section_idx = 0
            st.rerun()
        if st.session_state.results:
            if st.button("📊 View Results", use_container_width=True):
                st.session_state.page = "results"
                st.rerun()
        st.markdown("---")
        st.caption("Built with Streamlit + scikit-learn")

    page = st.session_state.page
    if page == "home":
        page_home()
    elif page == "quiz":
        page_quiz()
    elif page == "results":
        page_results()


if __name__ == "__main__":
    main()
