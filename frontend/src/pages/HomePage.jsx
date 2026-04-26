import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence, useSpring } from "framer-motion";
import { Sparkles, Compass, TrendingUp, Brain, Target, Zap } from "lucide-react";
import { GridFloor, InteractiveBackground } from "../components/HomeElements";

export default function HomePage() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [activeStage, setActiveStage] = useState(1);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Listen to scroll to switch stages
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest < 0.25) setActiveStage(1);
    else if (latest < 0.65) setActiveStage(2);
    else setActiveStage(3);
  });

  // Mouse tracking for parallax
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ 
        x: (e.clientX / window.innerWidth) - 0.5, 
        y: (e.clientY / window.innerHeight) - 0.5 
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const springConfig = { damping: 25, stiffness: 150 };
  const mouseX = useSpring(mousePos.x, springConfig);
  const mouseY = useSpring(mousePos.y, springConfig);

  return (
    <div ref={containerRef} style={{ height: "300vh", position: "relative", background: "transparent" }}>
      <InteractiveBackground />
      
      <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 10, pointerEvents: "none" }}>
        <AnimatePresence mode="wait">
          {activeStage === 1 && (
            <motion.div
              key="stage1"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              style={{
                width: "100%", height: "100%", display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", pointerEvents: "auto",
                position: 'relative'
              }}
            >
              <GridFloor />
              <div style={{ textAlign: "center", position: 'relative', zIndex: 10 }}>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="tag-accent" 
                  style={{ 
                    display: 'inline-flex', alignItems: 'center', gap: '8px', 
                    padding: '8px 20px', borderRadius: '99px', fontSize: '0.85rem', 
                    fontWeight: 600, marginBottom: '2rem'
                  }}
                >
                  <Sparkles size={14} /> AI-POWERED CAREER DISCOVERY
                </motion.div>
                <div style={{ fontSize: "clamp(3.5rem, 12vw, 9rem)", fontWeight: 900, color: "white", lineHeight: 0.9, letterSpacing: "-0.06em", textTransform: "uppercase", textShadow: "0 20px 80px rgba(0,0,0,0.8)" }}>
                  CAREER <br />
                  <span style={{ color: "var(--accent)", textShadow: "0 0 40px var(--glow)" }}>FINDER AI</span>
                </div>
                <div style={{ marginTop: "3rem", color: "white", fontSize: "1rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5em", opacity: 0.6 }}>
                  Scroll to explore
                </div>
              </div>
            </motion.div>
          )}

          {activeStage === 2 && (
            <motion.div
              key="stage2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              style={{
                width: "100%", height: "100%", display: "flex", alignItems: "center",
                justifyContent: "center", padding: "0 2rem", pointerEvents: "auto"
              }}
            >
              <div style={{ 
                display: "flex", gap: "6rem", maxWidth: "1200px", alignItems: "center", padding: "2rem",
                background: "transparent"
              }}>
                <div style={{ flex: 1.2 }}>
                  <h2 style={{ fontSize: "5rem", marginBottom: "2rem", lineHeight: 1, fontWeight: 900, color: "white" }}>
                    The <span style={{ color: "var(--accent)" }}>New</span> Standard.
                  </h2>
                  <p style={{ fontSize: "1.4rem", color: "white", opacity: 0.9, lineHeight: 1.5, fontWeight: 500 }}>
                    Precision matching that goes beyond keywords. We map your potential to the future of work using an ensemble of neural networks.
                  </p>
                </div>
                <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr", gap: "2.5rem" }}>
                  {[
                    { title: "ENSEMBLE AI", desc: "98% predictive accuracy based on 260+ career paths.", icon: Brain },
                    { title: "REAL-TIME DATA", desc: "Live market analysis across 50+ unique industries.", icon: Zap },
                  ].map((item) => (
                    <div key={item.title} style={{ borderLeft: "4px solid var(--accent)", paddingLeft: "2rem" }}>
                      <h3 style={{ fontSize: "1.6rem", marginBottom: "0.5rem", fontWeight: 800, color: "white", display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <item.icon size={24} color="var(--accent)" /> {item.title}
                      </h3>
                      <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeStage === 3 && (
            <motion.div
              key="stage3"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
              style={{
                width: "100%", height: "100%", display: "flex", alignItems: "center",
                justifyContent: "center", padding: "0 2rem", pointerEvents: "auto"
              }}
            >
              <div style={{ 
                textAlign: "center", maxWidth: "1000px", padding: "2rem",
                background: "transparent"
              }}>
                <h2 style={{ fontSize: "clamp(3.5rem, 10vw, 7rem)", marginBottom: "3rem", lineHeight: 1, fontWeight: 900, color: "white" }}>
                  Your <span style={{ color: "var(--accent)" }}>Future</span> Starts Now.
                </h2>
                <p style={{ fontSize: "1.5rem", color: "rgba(255,255,255,0.6)", marginBottom: "4rem", maxWidth: "800px", margin: "0 auto 4rem" }}>
                  Join thousands of professionals discovering their true north with AI-driven precision.
                </p>
                <div style={{ display: "flex", gap: "24px", justifyContent: "center" }}>
                  <button className="btn btn-primary" style={{ padding: "1.8rem 5rem", fontSize: "1.3rem", fontWeight: 700, borderRadius: "99px" }} onClick={() => navigate("/quiz")}>
                    <Compass size={24} /> Start Assessment
                  </button>
                  <button className="btn btn-glow" style={{ padding: "1.8rem 5rem", fontSize: "1.3rem", fontWeight: 700, borderRadius: "99px", background: "rgba(255,255,255,0.05)", color: "white", border: "1px solid rgba(255,255,255,0.1)" }} onClick={() => navigate("/explore")}>
                    <TrendingUp size={24} /> Explore Careers
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
