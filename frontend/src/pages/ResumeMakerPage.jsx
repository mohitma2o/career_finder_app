import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Download, Sparkles, Check, ChevronRight, ChevronLeft, BarChart2, ShieldAlert, Award, BookOpen, Brain } from 'lucide-react';
import { analyzeResume, exportResumePdf, getCareers, rewriteText } from '../api/client';
import LocalAIAnalyzer from '../components/LocalAIAnalyzer';

export default function ResumeMakerPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialCareer = searchParams.get('career') || '';

  const [step, setStep] = useState(1);
  const totalSteps = 5;

  const [targetCareer, setTargetCareer] = useState(initialCareer);
  const [allCareers, setAllCareers] = useState([]);
  const [resumeData, setResumeData] = useState({
    personal: { name: '', email: '', phone: '', location: '', linkedin: '', github: '' },
    summary: '',
    experience: [{ company: '', role: '', period: '', description: '' }],
    education: [{ school: '', degree: '', year: '' }],
    skills: '',
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Fetch all careers for suggestions
  useEffect(() => {
    getCareers().then(data => {
      if (data && data.careers) {
        setAllCareers(data.careers.map(c => c.career));
      }
    }).catch(console.error);
  }, []);

  // Auto-fill summary when targetCareer changes
  useEffect(() => {
    if (targetCareer && !resumeData.summary) {
      setResumeData(prev => ({
        ...prev,
        summary: `Highly motivated professional with a strong interest in ${targetCareer}. Seeking to leverage technical expertise and strategic thinking to drive impact in a professional setting.`
      }));
    }
  }, [targetCareer]);

  const updatePersonal = (field, val) => {
    setResumeData(prev => ({ ...prev, personal: { ...prev.personal, [field]: val } }));
  };

  const addExperience = () => {
    setResumeData(prev => ({ ...prev, experience: [...prev.experience, { company: '', role: '', period: '', description: '' }] }));
  };

  const removeExperience = (idx) => {
    setResumeData(prev => ({ ...prev, experience: prev.experience.filter((_, i) => i !== idx) }));
  };

  const updateExperience = (idx, field, val) => {
    const newExp = [...resumeData.experience];
    newExp[idx][field] = val;
    setResumeData(prev => ({ ...prev, experience: newExp }));
  };

  const addEducation = () => {
    setResumeData(prev => ({ ...prev, education: [...prev.education, { school: '', degree: '', year: '' }] }));
  };

  const updateEducation = (idx, field, val) => {
    const newEdu = [...resumeData.education];
    newEdu[idx][field] = val;
    setResumeData(prev => ({ ...prev, education: newEdu }));
  };

  const generateAISummary = async () => {
    setIsGenerating(true);
    
    // Determine the most relevant career name
    // 1. Look for a role mentioned in the current summary text
    // 2. Fallback to targetCareer
    // 3. Fallback to a generic term
    let activeRole = targetCareer || "Professional";
    const text = resumeData.summary.toLowerCase();
    const commonRoles = ["software developer", "engineer", "analyst", "manager", "designer", "banker", "doctor"];
    for (const role of commonRoles) {
      if (text.includes(role)) {
        activeRole = role.charAt(0).toUpperCase() + role.slice(1);
        break;
      }
    }

    try {
      const result = await rewriteText(resumeData.summary, activeRole);
      setResumeData(prev => ({ ...prev, summary: result.rewritten_text }));
    } catch (err) {
      console.error(err);
      const summaries = [
        `Dynamic and results-oriented professional with a focus on ${activeRole}. Proven track record of operational efficiency and collaborative problem-solving.`,
        `Ambitious individual with a background in technical excellence. Committed to leveraging analytical skills to deliver high-performance solutions as a ${activeRole}.`,
        `Experienced specialist with deep expertise in core domains. Passionate about continuous improvement and driving measurable growth in ${activeRole} roles.`
      ];
      const random = summaries[Math.floor(Math.random() * summaries.length)];
      setResumeData(prev => ({ ...prev, summary: random }));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRewriteDescription = async (idx) => {
    const currentText = resumeData.experience[idx].description;
    if (!currentText) {
      alert("Please write some bullet points first so the AI can professionalize them.");
      return;
    }
    
    setIsAnalyzing(true); // Reuse analyzing state for loading
    try {
      const result = await rewriteText(currentText, targetCareer);
      updateExperience(idx, 'description', result.rewritten_text);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to rewrite. Please ensure you have written some text and the backend is running.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleOpenExternalAI = (text) => {
    // 1. Try to detect role from the text itself
    let activeRole = "career";
    const commonRoles = ["software developer", "engineer", "analyst", "manager", "designer", "banker", "doctor", "astronaut", "accountant"];
    for (const role of commonRoles) {
      if (text.toLowerCase().includes(role)) {
        activeRole = role.charAt(0).toUpperCase() + role.slice(1);
        break;
      }
    }
    
    // 2. If no role detected in text, use the targetCareer if it's set and not generic
    if (activeRole === "career" && targetCareer) {
      activeRole = targetCareer;
    }

    const prompt = `Rewrite this for a professional resume in ${activeRole} field: ${text}`;
    const url = `https://www.google.com/search?q=${encodeURIComponent(prompt)}`;
    window.open(url, '_blank');
  };

  const handleDownloadPdf = async () => {
    try {
      const blob = await exportResumePdf(resumeData, targetCareer);
      const pdfBlob = new Blob([blob], { type: 'application/pdf' });
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.style.display = "none";
      a.href = url;
      const safeName = (resumeData.personal.name || "Resume").replace(/\s+/g, '_');
      a.download = `${safeName}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("PDF Export failed.");
    }
  };

  return (
    <div className="fade-up" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1rem' }}>
      
      {/* Career Selection Header */}
      <div className="card" style={{ padding: '1.5rem 2.5rem', marginBottom: '2rem', borderRadius: '1.5rem', background: 'rgba(129, 140, 248, 0.05)', border: '1px solid rgba(129, 140, 248, 0.2)', display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <label className="form-label" style={{ marginBottom: '8px', color: 'var(--accent)', fontSize: '0.8rem', letterSpacing: '1px' }}>TARGETING CAREER</label>
          <input 
            list="careers-list"
            type="text" 
            placeholder="Select or type a career path..." 
            value={targetCareer} 
            onChange={e => setTargetCareer(e.target.value)}
            style={{ width: '100%', fontSize: '1.2rem', fontWeight: '800', background: 'transparent', border: 'none', borderBottom: '2px solid var(--accent)', borderRadius: 0, padding: '4px 0' }}
          />
          <datalist id="careers-list">
            {allCareers.map(c => <option key={c} value={c} />)}
          </datalist>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-glow" onClick={handleDownloadPdf}>
            <Download size={16} /> Download Professional PDF
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <button className="btn" onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent' }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '3rem', alignItems: 'start' }}>
        
        {/* Editor Side */}
        <div className="card" style={{ padding: '2.5rem', borderRadius: '2rem', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)' }}>
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ color: 'var(--accent)', fontWeight: '700', fontSize: '0.9rem' }}>STEP {step} OF {totalSteps}</span>
              <span style={{ opacity: 0.5, fontSize: '0.9rem' }}>{Math.round((step/totalSteps)*100)}% Complete</span>
            </div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${(step/totalSteps)*100}%`, height: '100%', background: 'var(--accent)', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 0 10px var(--accent)' }} />
            </div>
          </div>

          {step === 1 && (
            <div className="fade-up">
              <h2 style={{ marginBottom: '0.5rem', fontSize: '1.8rem' }}>Personal Identity</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>How recruiters will reach you.</p>
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" placeholder="John Doe" value={resumeData.personal.name} onChange={e => updatePersonal('name', e.target.value)} />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Professional Email</label>
                    <input type="email" placeholder="john@example.com" value={resumeData.personal.email} onChange={e => updatePersonal('email', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input type="text" placeholder="+1 234 567 890" value={resumeData.personal.phone} onChange={e => updatePersonal('phone', e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input type="text" placeholder="New York, NY" value={resumeData.personal.location} onChange={e => updatePersonal('location', e.target.value)} />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">LinkedIn Profile</label>
                    <input type="text" placeholder="linkedin.com/in/johndoe" value={resumeData.personal.linkedin} onChange={e => updatePersonal('linkedin', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">GitHub/Portfolio</label>
                    <input type="text" placeholder="github.com/johndoe" value={resumeData.personal.github} onChange={e => updatePersonal('github', e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="fade-up">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.8rem' }}>Executive Summary</h2>
                <button className="btn" onClick={() => handleOpenExternalAI(resumeData.summary)} style={{ fontSize: '0.7rem', padding: '4px 10px', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px' }}>
                  Get Help
                </button>
              </div>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Hook recruiters in 3 seconds or less.</p>
              <textarea 
                style={{ width: '100%', minHeight: '180px', padding: '1.2rem', borderRadius: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'white', resize: 'vertical', lineHeight: '1.6' }}
                value={resumeData.summary}
                onChange={e => setResumeData(prev => ({ ...prev, summary: e.target.value }))}
                placeholder="Highlight your top achievements and career goals..."
              />
            </div>
          )}

          {step === 3 && (
            <div className="fade-up">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.8rem' }}>Experience</h2>
                <button className="btn" onClick={addExperience} style={{ padding: '8px 16px', fontSize: '0.8rem', borderRadius: '99px' }}><Plus size={14} /> Add Position</button>
              </div>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Quantify your impact with numbers and metrics.</p>
              <div style={{ display: 'grid', gap: '2rem' }}>
                {resumeData.experience.map((exp, i) => (
                  <div key={i} style={{ padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '1.5rem', border: '1px solid var(--border)', position: 'relative' }}>
                    {resumeData.experience.length > 1 && (
                      <button onClick={() => removeExperience(i)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: '#ff6b6b', cursor: 'pointer', opacity: 0.6 }}>
                        <Trash2 size={18} />
                      </button>
                    )}
                    <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
                      <div className="form-group">
                        <label className="form-label">Company</label>
                        <input type="text" value={exp.company} onChange={e => updateExperience(i, 'company', e.target.value)} placeholder="Google / Startup X" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Role</label>
                        <input type="text" value={exp.role} onChange={e => updateExperience(i, 'role', e.target.value)} placeholder="Senior Developer" />
                      </div>
                    </div>
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                      <label className="form-label">Period</label>
                      <input type="text" value={exp.period} onChange={e => updateExperience(i, 'period', e.target.value)} placeholder="Oct 2021 - Present" />
                    </div>
                    <div className="form-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <label className="form-label" style={{ margin: 0 }}>Responsibilities & Achievements</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn" onClick={() => handleOpenExternalAI(exp.description)} style={{ fontSize: '0.7rem', padding: '4px 10px', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px' }}>
                            Get Help
                          </button>
                        </div>
                      </div>
                      <textarea 
                        style={{ width: '100%', minHeight: '120px', padding: '1.2rem', borderRadius: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'white', lineHeight: '1.6' }}
                        value={exp.description}
                        onChange={e => updateExperience(i, 'description', e.target.value)}
                        placeholder="Increased system efficiency by 40% through..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="fade-up">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.8rem' }}>Education</h2>
                <button className="btn" onClick={addEducation} style={{ padding: '8px 16px', fontSize: '0.8rem', borderRadius: '99px' }}><Plus size={14} /> Add Degree</button>
              </div>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Academic background and key certifications.</p>
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                {resumeData.education.map((edu, i) => (
                  <div key={i} className="grid-3" style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '1.5rem', border: '1px solid var(--border)' }}>
                    <div className="form-group">
                      <label className="form-label">Institution</label>
                      <input type="text" value={edu.school} onChange={e => updateEducation(i, 'school', e.target.value)} placeholder="Stanford University" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Degree/Certificate</label>
                      <input type="text" value={edu.degree} onChange={e => updateEducation(i, 'degree', e.target.value)} placeholder="B.S. in Computer Science" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Year</label>
                      <input type="text" value={edu.year} onChange={e => updateEducation(i, 'year', e.target.value)} placeholder="2022" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="fade-up">
              <h2 style={{ marginBottom: '0.5rem', fontSize: '1.8rem' }}>Skills Portfolio</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Strategic keywords for ATS optimization.</p>
              <textarea 
                style={{ width: '100%', minHeight: '180px', padding: '1.2rem', borderRadius: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'white', resize: 'vertical', lineHeight: '1.8' }}
                value={resumeData.skills}
                onChange={e => setResumeData(prev => ({ ...prev, skills: e.target.value }))}
                placeholder="Python, React, AWS, Strategic Planning, Data Analysis..."
              />
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4rem' }}>
            <button className="btn" disabled={step === 1} onClick={() => setStep(step - 1)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.8rem 1.5rem' }}>
              <ChevronLeft size={16} /> Previous
            </button>
            {step < totalSteps ? (
              <button className="btn btn-primary" onClick={() => setStep(step + 1)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.8rem 2.5rem' }}>
                Continue <ChevronRight size={16} />
              </button>
            ) : (
              <button className="btn btn-glow" onClick={handleDownloadPdf} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '1.2rem 3rem' }}>
                <Check size={20} /> Generate & Download PDF
              </button>
            )}
          </div>
        </div>

        {/* Analytics & Preview Side */}
        <div style={{ position: 'sticky', top: '2rem' }}>
          
          <div className="form-sublabel" style={{ marginBottom: '1rem', textAlign: 'center', color: 'var(--accent)', fontWeight: '700' }}>LIVE RESUME PREVIEW</div>

          {/* Professional Preview */}
          <div style={{ 
            background: 'white', 
            color: '#111', 
            width: '100%', 
            minHeight: '700px', 
            padding: '4rem', 
            borderRadius: '4px', 
            boxShadow: '0 40px 100px rgba(0,0,0,0.6)',
            fontSize: '0.8rem',
            lineHeight: '1.5',
            fontFamily: '"Times New Roman", Times, serif',
            position: 'relative',
            border: '1px solid #ddd'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h1 style={{ fontSize: '2rem', margin: '0 0 0.5rem', fontWeight: '800', letterSpacing: '1px', color: '#000' }}>
                {resumeData.personal.name ? resumeData.personal.name.toUpperCase() : 'YOUR NAME'}
              </h1>
              <p style={{ margin: '4px 0', color: '#444', fontSize: '0.85rem' }}>
                {resumeData.personal.location} | {resumeData.personal.phone} | {resumeData.personal.email}
              </p>
              <p style={{ margin: '4px 0', fontSize: '0.75rem', color: 'var(--accent)' }}>
                {resumeData.personal.linkedin} {resumeData.personal.github && ` | ${resumeData.personal.github}`}
              </p>
            </div>

            <div style={{ borderTop: '2px solid #333', paddingTop: '1.5rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ textTransform: 'uppercase', fontWeight: '800', marginBottom: '8px', borderBottom: '1px solid #eee', color: 'var(--accent)' }}>Summary</h4>
                <p style={{ margin: 0, textAlign: 'justify' }}>{resumeData.summary || 'Expert professional with a focus on strategic impact...'}</p>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ textTransform: 'uppercase', fontWeight: '800', marginBottom: '12px', borderBottom: '1px solid #eee', color: 'var(--accent)' }}>Experience</h4>
                {resumeData.experience.map((exp, i) => (
                  <div key={i} style={{ marginBottom: '1.2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '0.9rem' }}>
                      <span style={{ textTransform: 'uppercase' }}>{exp.role || 'ROLE TITLE'}</span>
                      <span style={{ fontStyle: 'italic' }}>{exp.period}</span>
                    </div>
                    <div style={{ fontWeight: '700', color: '#555', marginBottom: '6px' }}>{exp.company || 'ORGANIZATION NAME'}</div>
                    <p style={{ margin: 0, whiteSpace: 'pre-wrap', color: '#333' }}>{exp.description}</p>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ textTransform: 'uppercase', fontWeight: '800', marginBottom: '12px', borderBottom: '1px solid #eee', color: 'var(--accent)' }}>Education</h4>
                {resumeData.education.map((edu, i) => (
                  <div key={i} style={{ marginBottom: '0.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800' }}>
                      <span>{edu.degree || 'DEGREE NAME'}</span>
                      <span>{edu.year}</span>
                    </div>
                    <div style={{ color: '#555' }}>{edu.school || 'ACADEMIC INSTITUTION'}</div>
                  </div>
                ))}
              </div>

              <div>
                <h4 style={{ textTransform: 'uppercase', fontWeight: '800', marginBottom: '10px', borderBottom: '1px solid #eee', color: 'var(--accent)' }}>Core Competencies</h4>
                <p style={{ margin: 0, letterSpacing: '0.5px' }}>{resumeData.skills || 'Technical Expertise, Strategic Leadership, Analytical Problem Solving'}</p>
              </div>
            </div>
          </div>

          {/* Local AI Audit Section */}
          <div style={{ marginTop: '2rem' }}>
            <LocalAIAnalyzer text={resumeData.summary + " " + resumeData.experience.map(e => e.description).join(" ")} targetCareer={targetCareer} />
          </div>
        </div>

      </div>
    </div>
  );
}
