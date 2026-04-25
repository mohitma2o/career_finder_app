import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import CareerCard from "../components/CareerCard";
import ComparisonPanel from "../components/ComparisonPanel";
import RadarChart from "../components/RadarChart";
import BarChart from "../components/BarChart";
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
  const tabs = ["Recommendations", "Analytics", "Compare", "Export"];

  // Radar data
  const radarLabels = ["Programming", "Analytics", "Creativity", "Communication", "Leadership", "Tech", "Science", "Business"];
  const radarKeys = ["programming", "analytical", "creativity", "communication", "leadership", "interest_technology", "interest_science", "interest_business"];
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
      {/* Hero */}
      <h2 style={{ marginBottom: "1rem" }}>Prediction Complete</h2>
      <div className="hero-banner">
        <h3>Primary Match: {top.career}</h3>
        <p>
          Match Confidence: <strong style={{ color: "var(--cyan)" }}>{top.confidence}%</strong>
          {" | "}
          Avg Salary: <strong>INR {Number(top.salary_inr || 0).toLocaleString("en-IN")}</strong>
        </p>
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
            valueFormatter={(v) => `${(v / 100000).toFixed(1)}L`}
            accentColor="#00E5FF"
          />

          <hr className="divider" />

          <h3 style={{ marginBottom: "1rem" }}>Skill and Interest Profile</h3>
          <RadarChart labels={radarLabels} values={radarValues} size={320} />
        </div>
      )}

      {activeTab === 2 && (
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

      {activeTab === 3 && (
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
    </div>
  );
}
