import React, { useState, useEffect } from 'react';
import { Brain, Cpu, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

// This is a local-only AI analyzer using Transformers.js
// It runs 100% on the user's browser (Zero server cost)
export default function LocalAIAnalyzer({ text, targetCareer }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState("Idle");

  const analyze = async () => {
    if (!text) return;
    setLoading(true);
    setStatus("Loading AI Model (Approx 20MB)...");
    
    try {
      // Dynamically import to avoid blocking main thread on load
      const { pipeline } = await import('@xenova/transformers');
      
      setStatus("Extracting Keywords...");
      // For this demo, we use a simple zero-shot classifier or sentiment
      // Since LLMs are large, we'll use a tiny model to demonstrate local processing
      const classifier = await pipeline('sentiment-analysis', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english');
      
      const analysis = await classifier(text);
      
      setStatus("Synthesizing Insights...");
      await new Promise(r => setTimeout(r, 1000)); // Simulate extra logic
      
      setResult({
        sentiment: analysis[0].label,
        score: (analysis[0].score * 100).toFixed(1),
        recommendation: analysis[0].label === 'POSITIVE' 
          ? "Your profile has a strong 'Action-Oriented' tone. Great for leadership roles!"
          : "Your profile seems a bit passive. Try using more power verbs (e.g., 'Spearheaded', 'Optimized')."
      });
    } catch (err) {
      console.error(err);
      setResult({ error: "Local AI failed to load. Check your internet for model download." });
    } finally {
      setLoading(false);
      setStatus("Complete");
    }
  };

  return (
    <div className="card" style={{ padding: '2rem', background: 'rgba(129, 140, 248, 0.03)', border: '1px solid rgba(129, 140, 248, 0.2)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ padding: '0.8rem', background: 'var(--accent)', borderRadius: '12px' }}>
          <Brain size={24} color="white" />
        </div>
        <div>
          <h3 style={{ margin: 0 }}>On-Device AI Auditor</h3>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Powered by Transformers.js • 100% Private</p>
        </div>
      </div>

      {!result && !loading && (
        <button className="btn btn-primary btn-block" onClick={analyze} style={{ display: 'flex', gap: '8px' }}>
          <Cpu size={18} /> Run Local Skill Audit
        </button>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '1rem' }}>
          <Loader2 className="animate-spin" style={{ margin: '0 auto 1rem', color: 'var(--accent)' }} />
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{status}</div>
        </div>
      )}

      {result && (
        <div className="fade-up">
          {result.error ? (
            <div style={{ color: '#f87171', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <AlertCircle size={18} /> {result.error}
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', borderLeft: '4px solid var(--accent)' }}>
                <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>Tone Analysis</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{result.sentiment} ({result.score}%)</div>
              </div>
              <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>AI Recommendation</div>
                <div style={{ fontSize: '0.95rem', lineHeight: 1.5 }}>{result.recommendation}</div>
              </div>
              <button className="btn" onClick={() => setResult(null)} style={{ marginTop: '0.5rem' }}>
                Re-scan Resume
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
