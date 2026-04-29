import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import QuestionRenderer from "../components/QuestionRenderer";
import { getQuestionnaire, predict } from "../api/client";

/**
 * Multi-step quiz page.
 * Fetches question structure from the API, renders one section at a time,
 * persists responses to localStorage on every change.
 */
export default function QuizPage({ onResults }) {
  const navigate = useNavigate();
  const [sections, setSections] = useState([]);
  const [sectionIdx, setSectionIdx] = useState(0);
  const [responses, setResponses] = useState(() => {
    try {
      const saved = localStorage.getItem("cf_responses");
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.error("Failed to parse responses from localStorage:", e);
      return {};
    }
  });
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);

  useEffect(() => {
    getQuestionnaire()
      .then((data) => {
        const qSections = data.sections || data || [];
        setSections(qSections);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch questionnaire:", err);
        setLoading(false);
      });
  }, []);

  // Persist responses to localStorage on every update
  useEffect(() => {
    localStorage.setItem("cf_responses", JSON.stringify(responses));
  }, [responses]);

  if (loading) return <p style={{ color: "var(--text-muted)" }}>Loading questionnaire...</p>;
  if (!sections.length) return <p>No questions available.</p>;

  const section = sections[sectionIdx];
  const progress = sectionIdx / sections.length;

  const handleChange = (questionId, value) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleBack = () => {
    if (sectionIdx > 0) setSectionIdx((i) => i - 1);
    else navigate("/");
  };

  const handleNext = async () => {
    if (sectionIdx < sections.length - 1) {
      setSectionIdx((i) => i + 1);
      window.scrollTo(0, 0);
    } else {
      // Final section — run prediction
      setPredicting(true);
      try {
        const data = await predict(responses, 5);
        const results = data; 
        localStorage.setItem("cf_results", JSON.stringify(results));
        
        // Save to local history fallback
        const history = JSON.parse(localStorage.getItem('cf_history') || '[]');
        history.unshift({
          id: Date.now(),
          timestamp: new Date().toISOString(),
          results: results,
          responses: responses,
          userId: localStorage.getItem('cf_token')?.startsWith('mock-token-') ? JSON.parse(localStorage.getItem('cf_user_mock'))?.id : 'anonymous'
        });
        localStorage.setItem('cf_history', JSON.stringify(history.slice(0, 50)));

        onResults(results);
        navigate("/results");
      } catch (err) {

        alert("Prediction failed: " + err.message);
      } finally {
        setPredicting(false);
      }
    }
  };

  const isLast = sectionIdx === sections.length - 1;

  return (
    <div className="fade-up">
      {/* Progress */}
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress * 100}%` }} />
      </div>
      <p className="form-sublabel" style={{ marginBottom: "1.5rem" }}>
        PHASE {sectionIdx + 1} / {sections.length} &mdash; {section.title.toUpperCase()}
      </p>

      <h2 style={{ marginBottom: "0.25rem" }}>{section.title}</h2>
      <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>
        Provide accurate parameters for optimal prediction.
      </p>

      {/* Questions */}
      {section.questions.map((q) => (
        <div key={q.id}>
          <QuestionRenderer
            question={q}
            value={responses[q.id]}
            onChange={(val) => handleChange(q.id, val)}
          />
          <hr className="divider" />
        </div>
      ))}

      {/* Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1.5rem" }}>
        <button className="btn" onClick={handleBack}>
          {sectionIdx > 0 ? "Back" : "Home"}
        </button>
        <button
          className="btn btn-primary"
          onClick={handleNext}
          disabled={predicting}
        >
          {predicting
            ? "Processing..."
            : isLast
            ? "Get Results"
            : "Next"}
        </button>
      </div>
    </div>
  );
}
