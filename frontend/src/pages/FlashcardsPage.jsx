import React, { useState } from 'react';
import { BookOpen, ChevronRight, ChevronLeft, RotateCcw, BrainCircuit } from 'lucide-react';

const DECK = [
  { q: "What is Cloud Computing?", a: "The delivery of computing services—including servers, storage, databases, networking, software—over the Internet ('the cloud').", category: "Technology" },
  { q: "What is the difference between SQL and NoSQL?", a: "SQL databases are relational, table-based, and have predefined schemas. NoSQL databases are non-relational, document-based, and have dynamic schemas.", category: "Engineering" },
  { q: "What is ROI in business?", a: "Return on Investment (ROI) is a performance measure used to evaluate the efficiency or profitability of an investment.", category: "Business" },
  { q: "What is a 'Full Stack' developer?", a: "A developer who can handle both front-end (client-side) and back-end (server-side) development of a web application.", category: "Career" },
  { q: "What is Machine Learning?", a: "A branch of AI that focuses on building systems that learn from data, identify patterns, and make decisions with minimal human intervention.", category: "Data Science" },
  { q: "What is the STAR method?", a: "A structured manner of responding to a behavioral-based interview question by discussing the specific Situation, Task, Action, and Result.", category: "Interview" }
];

export default function FlashcardsPage() {
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const next = () => { setIsFlipped(false); setIndex((i) => (i + 1) % DECK.length); };
  const prev = () => { setIsFlipped(false); setIndex((i) => (i - 1 + DECK.length) % DECK.length); };
  const flip = () => { setIsFlipped(!isFlipped); };

  const current = DECK[index];

  return (
    <div className="fade-up" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 900 }}>Technical Mastery</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Flashcards to sharp your industry knowledge.</p>
      </div>

      <div 
        onClick={flip}
        style={{ 
          height: '400px', 
          perspective: '1000px', 
          cursor: 'pointer',
          marginBottom: '2.5rem'
        }}
      >
        <div style={{ 
          position: 'relative', width: '100%', height: '100%', 
          transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)', 
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}>
          {/* Front */}
          <div style={{ 
            position: 'absolute', width: '100%', height: '100%', 
            backfaceVisibility: 'hidden',
            background: 'rgba(30,30,40,0.8)',
            border: '2px solid rgba(129, 140, 248, 0.3)',
            borderRadius: '2.5rem',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '3rem', textAlign: 'center',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
          }}>
            <div style={{ color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1.5rem' }}>
              {current.category}
            </div>
            <h2 style={{ fontSize: '2.2rem', lineHeight: 1.2, color: 'white' }}>{current.q}</h2>
            <div style={{ marginTop: '2rem', color: 'rgba(255,255,255,0.2)', fontSize: '0.9rem' }}>
              Click to flip
            </div>
          </div>

          {/* Back */}
          <div style={{ 
            position: 'absolute', width: '100%', height: '100%', 
            backfaceVisibility: 'hidden',
            background: 'var(--accent)',
            borderRadius: '2.5rem',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '3rem', textAlign: 'center',
            transform: 'rotateY(180deg)',
            boxShadow: '0 0 50px var(--glow)'
          }}>
             <h3 style={{ fontSize: '1.5rem', color: 'black', lineHeight: 1.4, fontWeight: 600 }}>{current.a}</h3>
             <div style={{ marginTop: '2rem', color: 'rgba(0,0,0,0.4)', fontSize: '0.9rem', fontWeight: 700 }}>
              Click to return
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '2rem' }}>
        <button className="btn" onClick={prev} style={{ padding: '1rem' }}><ChevronLeft /></button>
        <div style={{ fontSize: '1.1rem', fontWeight: 700, minWidth: '100px', textAlign: 'center' }}>
          {index + 1} / {DECK.length}
        </div>
        <button className="btn" onClick={next} style={{ padding: '1rem' }}><ChevronRight /></button>
      </div>

      <div style={{ marginTop: '4rem', display: 'flex', justifyContent: 'center' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 2rem', borderRadius: '1.5rem' }}>
          <BrainCircuit color="var(--accent)" />
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Daily progress syncs with your career path</span>
        </div>
      </div>
    </div>
  );
}
