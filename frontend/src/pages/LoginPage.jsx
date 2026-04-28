import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { LogIn, UserPlus, User, Sparkles, ArrowRight, Loader2, Lock, Shield, ChevronLeft } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    
    if (isRegister) {
      const result = await register(username, password);
      if (result.success) {
        setSuccess("Account created! You can now login.");
        setIsRegister(false);
        setPassword("");
      } else {
        setError(result.error);
      }
    } else {
      const result = await login(username, password);
      if (result.success) {
        navigate("/history");
      } else {
        setError(result.error);
      }
    }
    setIsProcessing(false);
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      background: "transparent",
      position: "relative",
      zIndex: 10
    }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          width: "100%",
          maxWidth: "440px",
          padding: "3rem",
          background: "rgba(15, 15, 25, 0.4)",
          backdropFilter: "blur(40px)",
          borderRadius: "2.5rem",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          textAlign: "center"
        }}
      >
        <div style={{ marginBottom: "2rem" }}>
          <motion.div 
            key={isRegister ? "reg-icon" : "login-icon"}
            initial={{ rotate: -20, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            style={{ 
              width: "70px", 
              height: "70px", 
              background: isRegister ? "linear-gradient(135deg, #ec4899, #8b5cf6)" : "linear-gradient(135deg, var(--accent), #818cf8)",
              borderRadius: "1.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.5rem",
              boxShadow: "0 0 40px var(--glow)"
            }}
          >
            {isRegister ? <UserPlus size={36} color="white" /> : <Shield size={36} color="white" />}
          </motion.div>
          
          <h1 style={{ fontSize: "2.2rem", fontWeight: 900, color: "white", marginBottom: "0.5rem" }}>
            {isRegister ? "Create Account" : "Access Portal"}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "1rem" }}>
            {isRegister ? "Join the career discovery network" : "Secure authentication for all users"}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ position: "relative" }}>
            <User size={18} style={{ position: "absolute", left: "1.2rem", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)" }} />
            <input 
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{ 
                width: "100%", 
                padding: "1.2rem 1.2rem 1.2rem 3.5rem", 
                background: "rgba(255,255,255,0.05)", 
                border: "1px solid rgba(255,255,255,0.1)", 
                borderRadius: "1.2rem", 
                color: "white",
                fontSize: "1rem",
                outline: "none"
              }}
            />
          </div>

          <div style={{ position: "relative" }}>
            <Lock size={18} style={{ position: "absolute", left: "1.2rem", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)" }} />
            <input 
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ 
                width: "100%", 
                padding: "1.2rem 1.2rem 1.2rem 3.5rem", 
                background: "rgba(255,255,255,0.05)", 
                border: "1px solid rgba(255,255,255,0.1)", 
                borderRadius: "1.2rem", 
                color: "white",
                fontSize: "1rem",
                outline: "none"
              }}
            />
          </div>

          <button 
            type="submit" 
            disabled={isProcessing}
            className="btn btn-primary"
            style={{ 
              width: "100%", 
              padding: "1.2rem", 
              borderRadius: "1.2rem", 
              fontSize: "1.1rem", 
              fontWeight: 700,
              marginTop: "0.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              background: isRegister ? "linear-gradient(135deg, #ec4899, #8b5cf6)" : "var(--accent)"
            }}
          >
            {isProcessing ? <Loader2 className="animate-spin" /> : (
              isRegister ? <><UserPlus size={20} /> Create Account</> : <><LogIn size={20} /> Login Now</>
            )}
          </button>
        </form>

        <div style={{ marginTop: "1.5rem" }}>
          <button 
            onClick={() => { setIsRegister(!isRegister); setError(null); setSuccess(null); }}
            style={{ background: "transparent", border: "none", color: "var(--accent)", fontWeight: 600, cursor: "pointer" }}
          >
            {isRegister ? "Already have an account? Login" : "Don't have an account? Register"}
          </button>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{ 
                marginTop: "1.5rem", 
                padding: "1rem", 
                background: "rgba(239, 68, 68, 0.1)", 
                borderRadius: "1rem", 
                color: "#f87171",
                fontSize: "0.9rem",
                border: "1px solid rgba(239, 68, 68, 0.2)"
              }}
            >
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{ 
                marginTop: "1.5rem", 
                padding: "1rem", 
                background: "rgba(34, 197, 94, 0.1)", 
                borderRadius: "1rem", 
                color: "#4ade80",
                fontSize: "0.9rem",
                border: "1px solid rgba(34, 197, 94, 0.2)"
              }}
            >
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ marginTop: "2rem", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "1.5rem" }}>
          <button 
            onClick={() => navigate("/")}
            style={{ 
              background: "transparent", 
              border: "none", 
              color: "rgba(255,255,255,0.4)", 
              fontSize: "0.9rem",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              margin: "0 auto",
              cursor: "pointer"
            }}
          >
            <ChevronLeft size={16} /> Back to Dashboard
          </button>
        </div>
      </motion.div>
    </div>
  );
}
