import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

export default function SkillTestPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const career = searchParams.get('career') || 'Selected Career';
  
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const questions = [
    { q: `How would you describe your current proficiency in the core technologies used in ${career}?`, options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] },
    { q: `Have you completed any hands-on projects related to ${career}?`, options: ['None yet', 'Small tutorials', 'Large personal projects', 'Professional experience'] },
    { q: `How many hours per week can you dedicate to upskilling for this role?`, options: ['< 5 hours', '5-10 hours', '10-20 hours', '20+ hours'] },
    { q: `Do you have a professional portfolio or GitHub showcasing related work?`, options: ['No', 'Starting one', 'Yes, active', 'Yes, verified by peers'] }
  ];

  const handleAnswer = (index) => {
    setScore(score + (index + 1) * 25);
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setFinished(true);
    }
  };

  const getReadiness = () => {
    const finalScore = score / questions.length;
    if (finalScore > 80) return { label: 'High Readiness', color: '#10B981', desc: 'You are nearly ready to apply. Focus on networking and final certifications.' };
    if (finalScore > 50) return { label: 'Mid Readiness', color: '#FBBF24', desc: 'You have a solid foundation. Focus on building 2-3 significant projects.' };
    return { label: 'Developing', color: '#6366F1', desc: 'A great start! Focus on the core skills listed in your roadmap first.' };
  };

  const readiness = getReadiness();

  return (
    <div className="fade-up" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <button className="btn" onClick={() => navigate(-1)} style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <ArrowLeft size={16} /> Back to Results
      </button>

      <div className="card" style={{ padding: '3rem', borderRadius: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Readiness Assessment</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>Deep-dive into your specific preparation for <strong>{career}</strong>.</p>

        {!finished ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--accent)' }}>Question {step + 1} of {questions.length}</span>
              <span style={{ fontSize: '0.9rem', opacity: 0.5 }}>{Math.round(((step) / questions.length) * 100)}% Complete</span>
            </div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', marginBottom: '3rem', overflow: 'hidden' }}>
              <div style={{ width: `${((step + 1) / questions.length) * 100}%`, height: '100%', background: 'var(--accent)', transition: 'width 0.3s ease' }} />
            </div>

            <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem', lineHeight: '1.4' }}>{questions[step].q}</h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {questions[step].options.map((opt, i) => (
                <button 
                  key={i} 
                  className="btn btn-glow" 
                  style={{ textAlign: 'left', padding: '1.2rem 2rem', fontSize: '1rem', borderRadius: '1rem' }}
                  onClick={() => handleAnswer(i)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }} className="fade-up">
            <div style={{ 
              width: '80px', height: '80px', borderRadius: '50%', background: readiness.color + '22', 
              color: readiness.color, display: 'flex', alignItems: 'center', justifyContent: 'center', 
              margin: '0 auto 2rem'
            }}>
              <CheckCircle size={40} />
            </div>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{readiness.label}</h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '3rem' }}>{readiness.desc}</p>
            
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '1.5rem', border: '1px solid var(--border)', marginBottom: '3rem' }}>
              <div style={{ fontSize: '0.9rem', opacity: 0.5, marginBottom: '1rem' }}>COMPOSITE READINESS SCORE</div>
              <div style={{ fontSize: '3rem', fontWeight: '900', color: readiness.color }}>{score / questions.length}%</div>
            </div>

            <button className="btn btn-primary" onClick={() => navigate('/results')}>Return to Dashboard</button>
          </div>
        )}
      </div>
    </div>
  );
}
