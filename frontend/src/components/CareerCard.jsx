/**
 * CareerCard component.
 * Displays a single career recommendation with glassmorphism styling,
 * expandable roadmap and free-courses sections.
 */
export default function CareerCard({ career, rank }) {
  const skills = Array.isArray(career.key_skills)
    ? career.key_skills
    : (career.key_skills || "").split(",").map((s) => s.trim());
  const certs = Array.isArray(career.certifications)
    ? career.certifications
    : (career.top_certifications || "").split(",").map((s) => s.trim());
  const resources = (career.free_resources || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="card fade-up" style={{ marginBottom: "1.5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "0.75rem" }}>
        {rank != null && <span className="rank-badge">{String(rank).padStart(2, "0")}</span>}
        <h3 style={{ margin: 0 }}>{career.career}</h3>
      </div>

      {/* Tags */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "0.75rem" }}>
        <span className="tag">{career.category || career.growth || "Career"}</span>
        <span className="tag">{career.growth} Growth</span>
        <span className="tag tag-accent">
          {typeof career.salary_inr === "number"
            ? `INR ${career.salary_inr.toLocaleString("en-IN")}`
            : `INR ${Number(career.avg_salary_inr || 0).toLocaleString("en-IN")}`}
        </span>
      </div>

      {/* Description */}
      <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginBottom: "0.75rem" }}>
        {career.description}
      </p>

      {/* Insight */}
      {career.why && (
        <div className="insight-box">
          <strong>Insight: </strong>{career.why}
        </div>
      )}

      {/* Detail columns */}
      <div className="grid-3" style={{ marginTop: "1rem" }}>
        <div>
          <h4 style={{ fontSize: "0.85rem", marginBottom: "0.4rem" }}>Compensation</h4>
          <p className="form-sublabel">INR {Number(career.salary_inr || career.avg_salary_inr || 0).toLocaleString("en-IN")}</p>
          <p className="form-sublabel">USD {Number(career.salary_usd || career.avg_salary_usd || 0).toLocaleString("en-US")}</p>
          {career.work_env && <p className="form-sublabel">{career.work_env}</p>}
        </div>
        <div>
          <h4 style={{ fontSize: "0.85rem", marginBottom: "0.4rem" }}>Key Skills</h4>
          {skills.slice(0, 4).map((s, i) => (
            <p key={i} className="form-sublabel">{s}</p>
          ))}
        </div>
        <div>
          <h4 style={{ fontSize: "0.85rem", marginBottom: "0.4rem" }}>Certifications</h4>
          {certs.slice(0, 3).map((c, i) => (
            <p key={i} className="form-sublabel">{c}</p>
          ))}
        </div>
      </div>

      {/* Roadmap */}
      {career.roadmap && (
        <details className="expandable">
          <summary>Learning Roadmap</summary>
          <div className="expandable-body">{career.roadmap}</div>
        </details>
      )}

      {/* Free Resources */}
      {resources.length > 0 && (
        <details className="expandable">
          <summary>Free Courses and Resources</summary>
          <div className="expandable-body">
            <ul style={{ paddingLeft: "1rem" }}>
              {resources.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        </details>
      )}
    </div>
  );
}
