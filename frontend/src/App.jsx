import { useState, useEffect, useRef } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useScroll } from "framer-motion";
import Sidebar from "./components/Sidebar";
import HomePage from "./pages/HomePage";
import QuizPage from "./pages/QuizPage";
import ResultsPage from "./pages/ResultsPage";
import ExplorerPage from "./pages/ExplorerPage";
import HistoryPage from "./pages/HistoryPage";
import { ThemeProvider } from "./theme/ThemeProvider";
import ThreeCanvas from "./components/ThreeCanvas";
import LandingScene from "./components/LandingScene";

export default function App() {
  const [results, setResults] = useState(() => {
    const saved = localStorage.getItem("cf_results");
    return saved ? JSON.parse(saved) : null;
  });

  const [responses, setResponses] = useState(() => {
    const saved = localStorage.getItem("cf_responses");
    return saved ? JSON.parse(saved) : {};
  });

  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const containerRef = useRef(null);

  // Track scroll for the entire app container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  useEffect(() => {
    if (results) localStorage.setItem("cf_results", JSON.stringify(results));
  }, [results]);

  useEffect(() => {
    if (Object.keys(responses).length > 0) localStorage.setItem("cf_responses", JSON.stringify(responses));
  }, [responses]);

  const handleResults = (newResults) => {
    setResults(newResults);
  };

  const handleReset = () => {
    setResults(null);
    setResponses({});
  };

  const handleRestore = (hResults, hResponses) => {
    setResults(hResults);
    setResponses(hResponses);
    localStorage.setItem("cf_results", JSON.stringify(hResults));
    localStorage.setItem("cf_responses", JSON.stringify(hResponses));
  };

  return (
    <ThemeProvider>
      <div ref={containerRef} className="app-container" style={{ position: 'relative', minHeight: '100vh', background: '#000' }}>
        {/* Persistent 3D Galaxy Background */}
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0 }}>
          <ThreeCanvas>
            <LandingScene scroll={isHomePage ? scrollYProgress : undefined} />
          </ThreeCanvas>
        </div>

        <div className="app-layout" style={{ 
          position: 'relative', 
          zIndex: 1,
          background: isHomePage ? 'transparent' : 'rgba(0,0,0,0.7)', // Darker overlay for non-home pages
          backdropFilter: isHomePage ? 'none' : 'blur(40px)', // Heavy blur for readability
          transition: 'all 0.5s ease'
        }}>
          <Sidebar hasResults={!!results} />
          
          <main className="main-content" style={{
            background: isHomePage ? 'transparent' : 'rgba(15,15,25,0.4)',
            borderRadius: isHomePage ? '0' : '2rem',
            margin: isHomePage ? '0' : '2rem 2rem 2rem var(--sidebar-w)', 
            padding: isHomePage ? '0' : '3rem',
            marginLeft: isHomePage ? 'var(--sidebar-w)' : 'calc(var(--sidebar-w) + 2rem)',
            border: isHomePage ? 'none' : '1px solid rgba(255,255,255,0.05)',
            boxShadow: isHomePage ? 'none' : '0 20px 50px rgba(0,0,0,0.5)',
            maxWidth: 'none' // Let the glass shell expand
          }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/quiz" element={<QuizPage onResults={handleResults} />} />
              <Route path="/results" element={<ResultsPage results={results} responses={responses} onReset={handleReset} />} />
              <Route path="/explore" element={<ExplorerPage />} />
              <Route path="/history" element={<HistoryPage onRestore={handleRestore} />} />
            </Routes>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
