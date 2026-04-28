import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import CareerCard from "../components/CareerCard";
import ComparisonPanel from "../components/ComparisonPanel";
import RadarChart from "../components/RadarChart";
import BarChart from "../components/BarChart";
import ThreeCanvas from "../components/ThreeCanvas";
import CareerCard3D from "../components/CareerCard3D";
import MentorChat from "../components/MentorChat";
import { Sparkles } from "lucide-react";
import { exportPdf } from "../api/client";

/**
 * Results page with 4 tabs:
 * Recommendations, Analytics, Compare, Export.
 */
export default function ResultsPage({ results, responses, onReset }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [sel1, setSel1] = useState(0);
  const [sel2, setSel2] = useState(1);

  // Save to history on mount
  useState(() => {
    if (results && results.length) {
      const history = JSON.parse(localStorage.getItem("cf_history") || "[]");
      const currentId = btoa(new Date().toISOString()).slice(0, 8);
      
      // Prevent duplicates by checking the top recommendation and time
      const lastEntry = history[0];
      const isDuplicate = lastEntry && lastEntry.results[0].career === results[0].career && 
                          (new Date() - new Date(lastEntry.timestamp)) < 60000;

      if (!isDuplicate) {
        const newEntry = {
          id: currentId,
          timestamp: new Date().toISOString(),
          results: results,
          responses: responses
        };
        localStorage.setItem("cf_history", JSON.stringify([newEntry, ...history].slice(0, 10)));
      }
    }
  });

  if (!results || !results.length) {
    return (
      <div className="fade-up">
        <h2>No results found</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>
          Please complete the assessment first.
        </p>
        <button className="btn btn-primary" onClick={() => navigate("/quiz")}>
          Start Assessment
        </button>
      </div>
    );
  }

  const top = results[0];
  const tabs = ["Recommendations", "Analytics", "Resume Maker", "Interview Prep", "Compare", "Export"];

  // Resume Template Generator
  const resumeTemplate = useMemo(() => {
    if (!top) return "";
    const skills = Array.isArray(top.key_skills) ? top.key_skills : (top.key_skills || "").split(",");
    const certs = Array.isArray(top.top_certifications) ? top.top_certifications : (top.top_certifications || "").split(",");
    const roadmap = (top.roadmap || "").split(/[→\u2014-]/).map(s => s.trim()).filter(Boolean);
    
    return `
[FULL NAME]
[City, State] | [Phone Number] | [Email Address]
[LinkedIn Profile URL] | [Portfolio/GitHub/Professional Site]

EXECUTIVE SUMMARY
Highly analytical and results-driven professional transitioning into a ${top.career} role with a focus on ${top.category}. Expert at leveraging ${skills[0]} and ${skills[1]} to solve complex organizational challenges. Proven track record of operational excellence and ${top.category.toLowerCase()} innovation. Committed to delivering high-performance solutions and driving measurable business growth through ${skills.slice(0, 3).join(", ")}.

CORE COMPETENCIES & ATS KEYWORDS
${skills.map(s => `• ${s.trim().padEnd(30)} | Specialized in ${top.category}`).join("\n")}

SELECTED KEY ACHIEVEMENTS (Quantified Impact)
• Optimized [Process/System] using ${skills[0]}, resulting in a [X]% increase in efficiency over [Timeframe].
• Engineered a [Project Name] that reduced operational costs by $[Amount] annually through ${skills[1]} implementation.
• Orchestrated a multi-phase transition to ${roadmap[0] || 'modern industry standards'}, impacting [Number] users/stakeholders.
• Recognized for [Specific Award/Achievement] in ${top.category}, demonstrating leadership and technical mastery.

TARGETED PROFESSIONAL DEVELOPMENT
${certs.map(c => `• Candidate for ${c.trim()} (Expected completion: [Date])`).join("\n")}
• Continuous Upskilling: Actively mastering ${roadmap[1] || 'advanced field methodologies'} and ${skills[2] || 'emerging technologies'}.

STRATEGIC CAREER TRAJECTORY
• Phase 1: High-impact contribution as a ${top.career}, focusing on ${skills[0]} mastery.
• Phase 2: Leading ${top.category} initiatives and mentoring junior teams in ${skills[1]} best practices.

EDUCATION
[Degree Name] | [University Name]
• Relevant Honors: [GPA if >3.5], [Dean's List], [Scholarships]

TECHNICAL TOOLS & STACK
[Tool 1] | [Tool 2] | [Tool 3] | [Tool 4]
    `.trim();
  }, [top]);

  // Interview Questions Generator
  const interviewQuestions = useMemo(() => {
    if (!top) return [];
    const skills = Array.isArray(top.key_skills) ? top.key_skills : (top.key_skills || "").split(",");
    
    return [
      // BEHAVIORAL
      { q: "Tell me about a time you had to learn a complex new skill quickly.", a: `Focus on your transition into ${top.career}. Mention specific tools like ${skills[0]} and your methodical approach to learning.` },
      { q: "How do you handle disagreements within a technical or creative team?", a: "Emphasize communication, data-driven decisions, and maintaining focus on the project goals." },
      { q: "Describe a project where you failed. What did you learn?", a: `Choose a real example, take responsibility, and show how that experience made you a better candidate for ${top.category}.` },
      { q: "What is your greatest professional achievement so far?", a: "Quantify your result. Use the metrics mentioned in your Smart Resume Template." },
      
      // CAREER-SPECIFIC
      { q: `Why are you interested in becoming a ${top.career}?`, a: `Align your personal values with the industry impact. Mention your affinity for ${top.category}.` },
      { q: `What do you think is the biggest challenge in ${top.category} today?`, a: `Discuss current industry shifts, such as AI automation or sustainability requirements.` },
      { q: `How do you stay updated with the latest trends in ${top.career}?`, a: `Mention specific newsletters, communities, or the certifications you are currently pursuing.` },
      { q: "What unique perspective do you bring from your previous background?", a: `Highlight your 'transferable skills' and how they complement the technical needs of ${top.category}.` },
      
      // TECHNICAL / DOMAIN
      { q: `How would you explain the importance of ${skills[0]} to a non-technical person?`, a: "Use a simple analogy. Focus on the 'Why' (business value) rather than the 'How' (technicality)." },
      { q: `In your opinion, what is the most critical tool for a ${top.career} today?`, a: `Likely ${skills[1]} or similar. Explain how it streamlines the workflow in ${top.category}.` },
      { q: "Walk me through your process for solving a complex problem.", a: `Use the STAR method (Situation, Task, Action, Result) applied to a ${top.category} scenario.` },
      { q: "How do you ensure the quality and accuracy of your work?", a: `Mention peer reviews, testing frameworks, or specific validation techniques used in ${top.category}.` },
      
      // CLOSING / STRATEGIC
      { q: "Do you have any questions for us?", a: `Ask about the team's biggest challenge, the company's 5-year vision for ${top.category}, or their mentorship program.` },
      { q: "What is your preferred work environment/culture?", a: `Show flexibility but emphasize your need for growth, which is why you chose the ${top.career} path.` },
      { q: "How do you handle tight deadlines and high-pressure situations?", a: `Discuss prioritization techniques and your ability to remain focused on core ${top.category} objectives.` }
    ];
  }, [top]);

  // Radar data
  const radarLabels = ["Tech", "Science", "Business", "Arts", "Social", "Nature", "Analytical", "Creative", "Leadership", "Competitive"];
  const radarKeys = ["interest_technology", "interest_science", "interest_business", "interest_arts", "interest_social", "interest_nature", "analytical", "creativity", "leadership", "competitiveness"];
  const radarValues = radarKeys.map((k) => responses[k] || 5);

  // Bar data
  const confData = results.map((r) => ({ label: r.career, value: r.confidence }));
  const salData = results.map((r) => ({ label: r.career, value: r.salary_inr }));

  const handlePdfExport = async () => {
    try {
      const blob = await exportPdf(results, responses);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "career_report.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("PDF export failed: " + err.message);
    }
  };

  const handleJsonExport = () => {
    const report = {
      generated_on: new Date().toISOString(),
      responses,
      recommendations: results.map(({ skill_gaps, ...rest }) => rest),
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "career_profile.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    localStorage.removeItem("cf_responses");
    localStorage.removeItem("cf_results");
    onReset();
    navigate("/");
  };

  return (
    <div className="fade-up">
      {/* Hero 3D Showcase */}
      <div style={{ 
        height: '400px', 
        width: '100%', 
        position: 'relative', 
        marginBottom: '2rem',
        borderRadius: '2rem',
        overflow: 'hidden',
        background: 'radial-gradient(circle at center, rgba(129, 140, 248, 0.1) 0%, transparent 70%)',
        border: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div style={{ position: 'absolute', top: '2rem', left: '2rem', zIndex: 10 }}>
          <p className="form-sublabel" style={{ color: 'var(--accent)', fontWeight: '700' }}>YOUR FUTURE IS READY</p>
          <h2 style={{ fontSize: '2.5rem', marginTop: '0.5rem' }}>Top Match Found</h2>
        </div>
        
        <ThreeCanvas>
          <ambientLight intensity={1} />
          <pointLight position={[5, 5, 5]} intensity={1} />
          {top && (
            <CareerCard3D 
              career={top} 
              position={[0, 0, 0]} 
              rotation={[0, 0, 0]} 
            />
          )}
        </ThreeCanvas>
      </div>

      <div className="hero-banner" style={{ background: 'transparent', border: '1px solid rgba(129, 140, 248, 0.2)', padding: '1.5rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', opacity: 0.8 }}>Recommended Path</h3>
            <h2 style={{ fontSize: '2rem', margin: '0.2rem 0' }}>{top?.career || "Calculating..."}</h2>
            {top?.why && (
              <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem', color: 'var(--accent)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '1rem' }}>💡</span> {top.why}
              </p>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--accent)' }}>{top?.confidence || 0}%</div>
            <div className="form-sublabel">Match Confidence</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {tabs.map((t, i) => (
          <button
            key={t}
            className={`tab${activeTab === i ? " active" : ""}`}
            onClick={() => setActiveTab(i)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 0 && (
        <div>
          {results.map((r, i) => (
            <CareerCard key={r.career} career={r} rank={i + 1} />
          ))}
        </div>
      )}

      {activeTab === 1 && (
        <div>
          <h3 style={{ marginBottom: "1rem" }}>Confidence Scores</h3>
          <BarChart data={confData} maxValue={100} valueFormatter={(v) => `${v}%`} />

          <hr className="divider" />

          <h3 style={{ marginBottom: "1rem" }}>Salary Comparison (INR)</h3>
          <BarChart
            data={salData}
            valueFormatter={(v) => v ? `${(v / 100000).toFixed(1)}L` : "N/A"}
            accentColor="#00E5FF"
          />

          <hr className="divider" />

          <h3 style={{ marginBottom: "1rem" }}>Skill and Interest Profile</h3>
          <RadarChart labels={radarLabels} values={radarValues} size={320} />
        </div>
      )}

      {activeTab === 2 && (
        <div className="fade-up" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ 
            maxWidth: '600px', 
            margin: '0 auto', 
            background: 'rgba(129, 140, 248, 0.05)', 
            padding: '4rem', 
            borderRadius: '2rem', 
            border: '1px solid rgba(129, 140, 248, 0.2)',
            backdropFilter: 'blur(20px)'
          }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              background: 'var(--accent)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 2rem',
              boxShadow: '0 0 30px var(--accent)'
            }}>
              <Sparkles size={40} color="var(--bg)" />
            </div>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: '800' }}>AI Resume Maker</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2.5rem', lineHeight: '1.6' }}>
              Transform your {top.career} potential into a professional reality. Our AI-driven builder helps you craft a high-impact resume tailored specifically for your top career match.
            </p>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <button 
                className="btn btn-glow" 
                style={{ padding: '1.2rem', fontSize: '1.1rem', borderRadius: '1rem' }}
                onClick={() => navigate(`/resume-maker?career=${encodeURIComponent(top.career)}`)}
              >
                🚀 Start Building Your Resume
              </button>
              <p style={{ fontSize: '0.85rem', opacity: 0.5, marginTop: '1rem' }}>
                Includes AI-generated summaries, skill optimization, and professional formatting.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 3 && (
        <div className="fade-up">
          <h3 style={{ marginBottom: '1.5rem' }}>Interview Preparation Flashcards</h3>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {interviewQuestions.map((iq, i) => (
              <details key={i} className="card" style={{ 
                padding: '1.5rem', 
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border)',
                borderRadius: '1rem',
                cursor: 'pointer'
              }}>
                <summary style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--accent)', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {iq.q}
                  <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>View Sample Answer</span>
                </summary>
                <p style={{ marginTop: '1rem', color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '1rem' }}>
                  {iq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      )}

      {activeTab === 4 && (
        <div>
          <h3 style={{ marginBottom: "1rem" }}>Side-by-Side Comparison</h3>
          <div className="grid-2" style={{ marginBottom: "1.5rem" }}>
            <div className="form-group">
              <label className="form-label">Career 1</label>
              <select value={sel1} onChange={(e) => setSel1(Number(e.target.value))}>
                {results.map((r, i) => (
                  <option key={i} value={i}>{r.career}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Career 2</label>
              <select value={sel2} onChange={(e) => setSel2(Number(e.target.value))}>
                {results.map((r, i) => (
                  <option key={i} value={i}>{r.career}</option>
                ))}
              </select>
            </div>
          </div>
          <ComparisonPanel career1={results[sel1]} career2={results[sel2]} />
        </div>
      )}

      {activeTab === 5 && (
        <div>
          <h3 style={{ marginBottom: "0.5rem" }}>Export Your Data</h3>
          <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
            Save your results or download a professional PDF report.
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button className="btn" onClick={handleJsonExport}>Download JSON</button>
            <button className="btn" onClick={handlePdfExport}>Download PDF Report</button>
            <button className="btn" onClick={handleReset} style={{ borderColor: "rgba(255,100,100,0.3)", color: "#FF6B6B" }}>
              Reset
            </button>
          </div>
        </div>
      )}

      {/* AI Career Mentor */}
      <MentorChat careerContext={top?.career} />
    </div>
  );
}
