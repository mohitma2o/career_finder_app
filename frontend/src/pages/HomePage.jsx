import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { Sparkles, Compass, ChevronRight, Target, Zap, BarChart } from "lucide-react";
import ThreeCanvas from "../components/ThreeCanvas";
import LandingScene from "../components/LandingScene";

export default function HomePage() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [activeStage, setActiveStage] = useState(1);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Listen to scroll to switch stages atomically
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest < 0.25) setActiveStage(1);
    else if (latest < 0.65) setActiveStage(2);
    else setActiveStage(3);
  });

  return (
    <div style={{ height: "300vh", position: "relative", background: "transparent" }}>
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
                alignItems: "center", justifyContent: "center", pointerEvents: "auto"
              }}
            >
              <div style={{ textAlign: "center" }}>
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
                display: "flex", gap: "6rem", maxWidth: "1100px", alignItems: "center", padding: "3rem",
                background: "rgba(0,0,0,0.6)", backdropFilter: "blur(30px)", borderRadius: "2rem", border: "1px solid rgba(255,255,255,0.1)"
              }}>
                <div style={{ flex: 1.2 }}>
                  <h2 style={{ fontSize: "5rem", marginBottom: "2rem", lineHeight: 1, fontWeight: 900, color: "white" }}>
                    The <span style={{ color: "var(--accent)" }}>New</span> Standard.
                  </h2>
                  <p style={{ fontSize: "1.4rem", color: "white", opacity: 0.9, lineHeight: 1.5, fontWeight: 500 }}>
                    Precision matching that goes beyond keywords. We map your potential to the future of work.
                  </p>
                </div>
                <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }}>
                  {[
                    { title: "ENSEMBLE AI", desc: "98.4% predictive accuracy." },
                    { title: "REAL-TIME DATA", desc: "Live market trajectory analysis." },
                  ].map((item) => (
                    <div key={item.title} style={{ borderLeft: "4px solid var(--accent)", paddingLeft: "2rem" }}>
                      <h3 style={{ fontSize: "1.5rem", marginBottom: "0.5rem", fontWeight: 800, color: "white" }}>{item.title}</h3>
                      <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>{item.desc}</p>
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
                textAlign: "center", maxWidth: "900px", padding: "4rem",
                background: "rgba(0,0,0,0.1)", // Nearly transparent
                backdropFilter: "blur(10px)", // Reduced blur
                borderRadius: "2rem", border: "1px solid rgba(255,255,255,0.05)"
              }}>
                <h2 style={{ fontSize: "clamp(3rem, 8vw, 6rem)", marginBottom: "2.5rem", lineHeight: 1, fontWeight: 900, color: "white" }}>
                  Your <span style={{ color: "var(--accent)" }}>Future</span> Starts Now.
                </h2>
                <div style={{ display: "flex", gap: "24px", justifyContent: "center" }}>
                  <button className="btn btn-primary" style={{ padding: "1.5rem 4rem", fontSize: "1.2rem", fontWeight: 700, borderRadius: "99px" }} onClick={() => navigate("/quiz")}>
                    Start Assessment
                  </button>
                  <button className="btn btn-glow" style={{ padding: "1.5rem 4rem", fontSize: "1.2rem", fontWeight: 700, borderRadius: "99px", background: "rgba(255,255,255,0.05)", color: "white", border: "1px solid rgba(255,255,255,0.1)" }} onClick={() => navigate("/explore")}>
                    Explore Careers
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
