/**
 * Side-by-side career comparison panel.
 * Shows skill gaps, strengths/weaknesses, and a personalized verdict.
 */
export default function ComparisonPanel({ career1, career2 }) {
  const totalGap = (c) =>
    (c.skill_gaps || []).reduce((sum, g) => sum + (g.gap || 0), 0);
  const strengths = (c) =>
    (c.skill_gaps || []).filter((g) => (g.gap || 0) === 0).map((g) => g.skill);
  const weaknesses = (c) =>
    (c.skill_gaps || []).filter((g) => (g.gap || 0) > 0).map((g) => g.skill);

  const gap1 = totalGap(career1);
  const gap2 = totalGap(career2);

  let verdict;
  if (gap1 < gap2) {
    verdict = `Based on your inputs, ${career1.career} requires less upskilling and aligns more naturally with your current profile.`;
  } else if (gap2 < gap1) {
    verdict = `Based on your inputs, ${career2.career} requires less upskilling and aligns more naturally with your current profile.`;
  } else if (career1.confidence >= career2.confidence) {
    verdict = `Both careers require similar effort, but ${career1.career} has a higher confidence match.`;
  } else {
    verdict = `Both careers require similar effort, but ${career2.career} has a higher confidence match.`;
  }

  return (
    <>
      <div className="info-banner">
        <strong>Personalized Verdict: </strong>{verdict}
      </div>

      <div className="grid-2">
        <ComparisonCard career={career1} gap={gap1} strengths={strengths(career1)} weaknesses={weaknesses(career1)} />
        <ComparisonCard career={career2} gap={gap2} strengths={strengths(career2)} weaknesses={weaknesses(career2)} />
      </div>
    </>
  );
}

function ComparisonCard({ career, gap, strengths, weaknesses }) {
  const skills = Array.isArray(career.key_skills)
    ? career.key_skills
    : (career.key_skills || "").split(",").map((s) => s.trim());

  return (
    <div className="stat-box" style={{ textAlign: "left" }}>
      <h3 style={{ color: "var(--accent)", marginBottom: "0.5rem" }}>{career.career}</h3>
      <p style={{ marginBottom: "0.5rem" }}>
        <strong>Match Confidence: </strong>
        <span style={{ color: "var(--cyan)" }}>{career.confidence}%</span>
      </p>

      <div style={{
        background: "rgba(255,255,255,0.02)",
        padding: "10px",
        borderRadius: "8px",
        marginBottom: "0.75rem",
      }}>
        <p style={{ margin: "0 0 4px" }}><strong>Total Skill Gap:</strong> {gap} pts</p>
        <p style={{ margin: "0 0 4px", fontSize: "0.88rem" }}>
          <strong>Strengths: </strong>
          <span style={{ color: "var(--accent)" }}>
            {strengths.slice(0, 3).join(", ") || "N/A"}
          </span>
        </p>
        <p style={{ margin: 0, fontSize: "0.88rem" }}>
          <strong>Needs Work: </strong>
          <span style={{ color: "var(--amber)" }}>
            {weaknesses.slice(0, 3).join(", ") || "Perfect alignment"}
          </span>
        </p>
      </div>

      <p><strong>Salary (INR):</strong> {Number(career.salary_inr || 0).toLocaleString("en-IN")}</p>
      <p><strong>Growth:</strong> {career.growth}</p>
      <p><strong>Skills:</strong> {skills.slice(0, 3).join(", ")}</p>
    </div>
  );
}
