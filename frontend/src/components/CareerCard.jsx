/**
 * CareerCard component.
 * Displays a single career recommendation with glassmorphism styling,
 * expandable roadmap and free-courses sections.
 */
export default function CareerCard({ career, rank }) {
  const skills = Array.isArray(career.key_skills)
    ? career.key_skills
    : (typeof career.key_skills === "string" ? career.key_skills.split(",").map((s) => s.trim()) : []);

  const certs = Array.isArray(career.top_certifications)
    ? career.top_certifications
    : (typeof career.top_certifications === "string" ? career.top_certifications.split(",").map((s) => s.trim()) : []);

  const resources = Array.isArray(career.free_resources)
    ? career.free_resources
    : (typeof career.free_resources === "string" ? career.free_resources.split(",").map((s) => s.trim()).filter(Boolean) : []);

  // Parse skills into a cleaner list
  const skillList = skills.slice(0, 6);

  // Parse roadmap into steps
  const roadmapSteps = (career.roadmap || "")
    .split(/[→\u2014-]/) // Split by common separators: arrow, em-dash, or hyphen
    .map((s) => s.trim())
    .filter(Boolean);

  // Growth to Demand Index mapping
  const growthMap = {
    'Very High': 95,
    'High': 85,
    'Medium': 65,
    'Low': 45
  };
  const demandIndex = growthMap[career.growth] || 75;


  return (
    <div className="card fade-up" style={{ 
      marginBottom: "2rem", 
      background: 'rgba(255, 255, 255, 0.02)',
      backdropFilter: 'blur(30px)',
      border: '1px solid rgba(255,255,255,0.05)',
      padding: '2.5rem',
      borderRadius: '2rem'
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {rank != null && <span className="rank-badge" style={{ fontSize: '1rem', width: '40px', height: '40px' }}>{rank}</span>}
          <div>
            <h3 style={{ fontSize: '1.8rem', margin: 0, letterSpacing: '-0.03em' }}>{career.career}</h3>
            <p style={{ color: 'var(--accent)', fontSize: '0.9rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>
              {career.category || 'Professional Track'}
            </p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
           <div className="tag tag-accent" style={{ fontSize: '1rem', padding: '6px 14px' }}>
             {career.confidence}% Match
           </div>
        </div>
      </div>

      {/* Market Pulse (New Phase 2 Feature) */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '20px', 
        marginBottom: '2rem',
        padding: '1.5rem',
        background: 'rgba(129, 140, 248, 0.05)',
        borderRadius: '1.5rem',
        border: '1px solid rgba(129, 140, 248, 0.1)'
      }}>
        <div>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--accent)' }}>📈</span> Market Momentum
          </h4>
          <div style={{ height: '8px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
            <div style={{ height: '100%', width: `${demandIndex}%`, background: 'var(--accent)', boxShadow: '0 0 10px var(--accent)' }} />
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text)', margin: 0 }}>
            Demand Index: <strong style={{ color: 'var(--accent)' }}>{demandIndex}/100</strong>
          </p>
        </div>
        <div>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--accent)' }}>💎</span> Top Skills Required
          </h4>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {skillList.slice(0, 3).map(s => (
              <span key={s} style={{ fontSize: '0.75rem', padding: '4px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Description */}
      <p style={{ color: "var(--text-muted)", fontSize: "1.1rem", marginBottom: "1.5rem", lineHeight: '1.6' }}>
        {career.description}
      </p>

      {/* Interactive Skill Map (New Phase 2 Feature) */}
      <div style={{ marginBottom: '2rem' }}>
        <h4 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '1.2rem' }}>Core Competency Map</h4>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          padding: '2rem',
          background: 'radial-gradient(circle, rgba(129, 140, 248, 0.05) 0%, transparent 70%)',
          position: 'relative',
          minHeight: '180px'
        }}>
          {/* Central Career Node */}
          <div style={{ 
            width: '100px', 
            height: '100px', 
            borderRadius: '50%', 
            background: 'var(--accent)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            textAlign: 'center',
            fontSize: '0.7rem',
            fontWeight: '800',
            color: 'var(--bg)',
            zIndex: 2,
            boxShadow: '0 0 30px var(--accent)'
          }}>
            {career.career}
          </div>
          
          {/* Skill Branch Nodes */}
          {skillList.map((skill, i) => {
            const angle = (i / skillList.length) * Math.PI * 2;
            const x = Math.cos(angle) * 100;
            const y = Math.sin(angle) * 80;
            return (
              <div key={skill} style={{ 
                position: 'absolute',
                transform: `translate(${x}px, ${y}px)`,
                padding: '6px 12px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '20px',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                whiteSpace: 'nowrap',
                transition: 'all 0.3s ease',
                cursor: 'default'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(129, 140, 248, 0.1)';
                e.target.style.borderColor = 'var(--accent)';
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.03)';
                e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                e.target.style.color = 'var(--text-muted)';
              }}
              >
                {skill}
              </div>
            );
          })}
        </div>
      </div>

      {/* Roadmap Visualization */}
      {roadmapSteps.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--accent)' }}>🚀</span> Your Roadmap to Success
          </h4>
          <div style={{ position: 'relative', paddingLeft: '2rem' }}>
            {/* Timeline Line */}
            <div style={{ 
              position: 'absolute', 
              left: '7px', 
              top: '10px', 
              bottom: '10px', 
              width: '2px', 
              background: 'linear-gradient(to bottom, var(--accent), transparent)' 
            }} />
            
            {roadmapSteps.map((step, i) => (
              <div key={i} style={{ position: 'relative', marginBottom: '1.5rem' }}>
                <div style={{ 
                  position: 'absolute', 
                  left: '-2rem', 
                  top: '4px', 
                  width: '16px', 
                  height: '16px', 
                  borderRadius: '50%', 
                  background: 'var(--bg)', 
                  border: '3px solid var(--accent)',
                  zIndex: 1
                }} />
                <p style={{ fontSize: '0.95rem', color: 'var(--text)', margin: 0 }}>
                  <strong style={{ color: 'var(--accent)', marginRight: '8px' }}>Step {i + 1}:</strong> {step}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Free Resources Grid */}
      {resources.length > 0 && (
        <div>
          <h4 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Recommended Free Learning</h4>
          <div className="grid-2">
            {resources.map((r, i) => (
              <div key={i} className="btn-glow" style={{ 
                padding: '1rem', 
                borderRadius: '0.75rem', 
                background: 'rgba(255,255,255,0.03)', 
                border: '1px solid rgba(255,255,255,0.05)',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{ color: 'var(--accent)' }}>✦</span> {r}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
