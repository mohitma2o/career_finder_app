import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, X, Minimize2, Maximize2, User, Bot } from "lucide-react";
import { chatWithMentor } from "../api/client";

/**
 * MentorChat component.
 * A floating, glassmorphism chat widget that allows users to talk to the AI Career Mentor.
 */
export default function MentorChat({ careerContext }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([
    { role: "assistant", content: "Greetings! I am your AI Career Mentor. I've analyzed your potential. What would you like to know about your future path?" }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    const userMsg = message.trim();
    setMessage("");
    setChat((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const data = await chatWithMentor(userMsg, careerContext);
      setChat((prev) => [...prev, { role: "assistant", content: data.response }]);
    } catch (err) {
      setChat((prev) => [...prev, { role: "assistant", content: "I'm having trouble connecting to my knowledge base right now. Please try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        className="chat-toggle btn-glow"
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          background: 'var(--accent)',
          color: 'var(--bg)',
          boxShadow: '0 10px 40px var(--glow)',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        <MessageSquare size={28} />
      </button>
    );
  }

  return (
    <div 
      className={`mentor-chat-window fade-up ${isMinimized ? 'minimized' : ''}`}
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        width: '400px',
        maxHeight: isMinimized ? '60px' : '600px',
        height: isMinimized ? '60px' : '80vh',
        background: 'rgba(15, 15, 25, 0.8)',
        backdropFilter: 'blur(30px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
        overflow: 'hidden',
        boxShadow: '0 20px 80px rgba(0,0,0,0.6)',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {/* Header */}
      <div style={{ 
        padding: '1rem 1.5rem', 
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(129, 140, 248, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 10px #10B981' }} />
          <span style={{ fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>AI Career Mentor</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setIsMinimized(!isMinimized)} style={{ background: 'none', border: 'none', color: 'white', opacity: 0.5, cursor: 'pointer' }}>
            {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
          </button>
          <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', opacity: 0.5, cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div 
            ref={scrollRef}
            style={{ 
              flex: 1, 
              overflowY: 'auto', 
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
          >
            {chat.map((msg, i) => (
              <div 
                key={i} 
                style={{ 
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  display: 'flex',
                  gap: '10px',
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
                }}
              >
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  background: msg.role === 'user' ? 'rgba(255,255,255,0.1)' : 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '4px'
                }}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} color="black" />}
                </div>
                <div style={{ 
                  padding: '0.8rem 1rem', 
                  borderRadius: msg.role === 'user' ? '1rem 0.2rem 1rem 1rem' : '0.2rem 1rem 1rem 1rem',
                  background: msg.role === 'user' ? 'rgba(129, 140, 248, 0.2)' : 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  fontSize: '0.9rem',
                  lineHeight: '1.5',
                  color: msg.role === 'user' ? 'white' : 'rgba(255,255,255,0.9)'
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: 'flex-start', display: 'flex', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={16} color="black" />
                </div>
                <div className="typing-dots">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form 
            onSubmit={handleSend}
            style={{ 
              padding: '1.2rem', 
              borderTop: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              gap: '10px'
            }}
          >
            <input 
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about salary, skills, roadmap..."
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '99px',
                padding: '0.7rem 1.2rem',
                color: 'white',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
            <button 
              type="submit"
              disabled={!message.trim() || loading}
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'var(--accent)',
                color: 'var(--bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                opacity: !message.trim() || loading ? 0.5 : 1
              }}
            >
              <Send size={18} />
            </button>
          </form>
        </>
      )}
    </div>
  );
}
