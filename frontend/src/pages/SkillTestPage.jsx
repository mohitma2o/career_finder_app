import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, ArrowLeft, Loader2, Check, X } from 'lucide-react';
import { getSkillTestQuestions } from '../api/client';

export default function SkillTestPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const career = searchParams.get('career') || 'Selected Career';
  
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getSkillTestQuestions(career);
        setQuestions(data.questions);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [career]);

  const handleAnswer = (index) => {
    if (isAnswered) return;
    
    setSelectedIdx(index);
    setIsAnswered(true);
    
    if (index === questions[step].correct) {
      setScore(score + 1);
    }

    setTimeout(() => {
      if (step < questions.length - 1) {
        setStep(step + 1);
        setSelectedIdx(null);
        setIsAnswered(false);
      } else {
        setFinished(true);
      }
    }, 1500);
  };

  const getReadiness = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage >= 80) return { label: 'Expert Confidence', color: '#10B981', desc: 'Your preparation is excellent! You have a deep understanding of the core technical requirements for this field.' };
    if (percentage >= 50) return { label: 'Moderate Confidence', color: '#FBBF24', desc: 'Your preparation is on the right track. You have a solid foundation but could benefit from more specialized study.' };
    return { label: 'Initial Preparation', color: '#6366F1', desc: 'You are in the early stages of preparation. Focus on the foundational concepts outlined in your career roadmap.' };
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <Loader2 className="animate-spin" size={48} color="var(--accent)" />
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Preparing technical assessment...</p>
      </div>
    );
  }

  const readiness = getReadiness();
  const currentQ = questions[step];

  return (
    <div className="fade-up" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1rem' }}>
      <button className="btn" onClick={() => navigate(-1)} style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)' }}>
        <ArrowLeft size={16} /> Back to Results
      </button>

      <div className="card" style={{ 
        padding: '3rem', 
        borderRadius: '2rem', 
        background: 'rgba(255, 255, 255, 0.02)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.05)'
      }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: '800' }}>Technical Assessment</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>Testing your knowledge in <strong>{career}</strong></p>

        {!finished ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--accent)', fontWeight: '600' }}>Question {step + 1} of {questions.length}</span>
              <span style={{ fontSize: '0.9rem', opacity: 0.5 }}>{Math.round(((step) / questions.length) * 100)}% Complete</span>
            </div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', marginBottom: '3rem', overflow: 'hidden' }}>
              <div style={{ width: `${((step + 1) / questions.length) * 100}%`, height: '100%', background: 'var(--accent)', transition: 'width 0.5s ease', boxShadow: '0 0 10px var(--accent)' }} />
            </div>

            <h3 style={{ fontSize: '1.5rem', marginBottom: '2.5rem', lineHeight: '1.4', minHeight: '4.2rem' }}>{currentQ.question}</h3>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              {currentQ.options.map((opt, i) => {
                let statusStyle = {};
                let icon = null;

                if (isAnswered) {
                  if (i === selectedIdx) {
                    statusStyle = { background: 'rgba(129, 140, 248, 0.2)', borderColor: 'var(--accent)', color: 'white' };
                    icon = <Check size={18} style={{ color: 'var(--accent)' }} />;
                  } else {
                    statusStyle = { opacity: 0.4 };
                  }
                }

                return (
                  <button 
                    key={i} 
                    className={`btn ${!isAnswered ? 'btn-glow' : ''}`}
                    disabled={isAnswered}
                    style={{ 
                      textAlign: 'left', 
                      padding: '1.2rem 2rem', 
                      fontSize: '1rem', 
                      borderRadius: '1.2rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      ...statusStyle
                    }}
                    onClick={() => handleAnswer(i)}
                  >
                    <span>{opt}</span>
                    {icon}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }} className="fade-up">
            <div style={{ 
              width: '100px', height: '100px', borderRadius: '50%', background: readiness.color + '15', 
              color: readiness.color, display: 'flex', alignItems: 'center', justifyContent: 'center', 
              margin: '0 auto 2rem',
              border: `2px solid ${readiness.color}44`
            }}>
              <CheckCircle size={50} />
            </div>
            <h2 style={{ fontSize: '2.8rem', marginBottom: '0.5rem', fontWeight: '900' }}>{readiness.label}</h2>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '3rem', maxWidth: '500px', margin: '0 auto 3rem' }}>{readiness.desc}</p>
            
            <div style={{ 
              background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)', 
              padding: '3rem', 
              borderRadius: '2rem', 
              border: '1px solid rgba(255,255,255,0.05)', 
              marginBottom: '3rem',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ fontSize: '0.9rem', fontWeight: '600', letterSpacing: '2px', opacity: 0.5, marginBottom: '1rem', textTransform: 'uppercase' }}>Percentage of Preparation</div>
              <div style={{ fontSize: '4.5rem', fontWeight: '900', color: readiness.color, textShadow: `0 0 20px ${readiness.color}44` }}>
                {Math.round((score / questions.length) * 100)}%
              </div>
              <p style={{ marginTop: '1rem', opacity: 0.7 }}>Based on your technical assessment performance.</p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => navigate('/results')} style={{ padding: '1rem 2.5rem' }}>View Dashboard</button>
              <button className="btn" onClick={() => {
                setStep(0);
                setScore(0);
                setFinished(false);
                setSelectedIdx(null);
                setIsAnswered(false);
              }} style={{ padding: '1rem 2.5rem', background: 'rgba(255,255,255,0.05)' }}>Retake Test</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
