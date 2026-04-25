import { useState } from "react";

/**
 * Renders a single question based on its type.
 * Open/Closed: add a new type by adding one key to RENDERERS.
 */
const RENDERERS = {
  scale: ScaleQuestion,
  slider: SliderQuestion,
  select: SelectQuestion,
};

export default function QuestionRenderer({ question, value, onChange }) {
  const Renderer = RENDERERS[question.type];
  if (!Renderer) return <p>Unknown question type: {question.type}</p>;
  return <Renderer question={question} value={value} onChange={onChange} />;
}

function ScaleQuestion({ question, value, onChange }) {
  const val = value ?? 5;
  return (
    <div className="form-group">
      <label className="form-label">{question.text}</label>
      <input
        type="range"
        min={1}
        max={10}
        value={val}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
        <span className="form-sublabel">1 = {question.min_label || "Low"}</span>
        <span className="form-sublabel" style={{ fontWeight: 600, color: "var(--accent)" }}>{val}</span>
        <span className="form-sublabel">10 = {question.max_label || "High"}</span>
      </div>
    </div>
  );
}

function SliderQuestion({ question, value, onChange }) {
  const val = value ?? question.default;
  return (
    <div className="form-group">
      <label className="form-label">{question.text}</label>
      <input
        type="range"
        min={question.min}
        max={question.max}
        value={val}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
        <span className="form-sublabel">{question.min}</span>
        <span className="form-sublabel" style={{ fontWeight: 600, color: "var(--accent)" }}>{val}{question.unit || ""}</span>
        <span className="form-sublabel">{question.max}</span>
      </div>
    </div>
  );
}

function SelectQuestion({ question, value, onChange }) {
  return (
    <div className="form-group">
      <label className="form-label">{question.text}</label>
      <select value={value || question.options[0]} onChange={(e) => onChange(e.target.value)}>
        {question.options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
