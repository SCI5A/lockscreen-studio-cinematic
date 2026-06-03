import { useState, useRef, useEffect, useReducer, useMemo } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";

const FPS = 60; // 60 FPS for smooth cinematic movement
const TOTAL_FRAMES = 1800; // 30 seconds at 60 FPS

function makeId() { return Math.random().toString(36).slice(2, 8); }

const INIT = {
  time: "12:07",
  date: "Saturday, June 3",
  hijri: "١٧ ذو الحجة ١٤٤٧",
  bg: null,
  bgType: "image",
  audio: null,
  audioName: "",
  overlayOpacity: 0.1,
  blur: 10,
  isDarkMode: true,
  notifs: [
    { id: "1", text: "كل شيء في هذه الحياة", startFrame: 120, duration: 300 },
    { id: "2", text: "إما أن يتركك أو تتركه", startFrame: 360, duration: 300 },
    { id: "3", text: "إلا الله إن أقبلت إليه أغناك", startFrame: 600, duration: 300 },
    { id: "4", text: "وإن تركته ناداك", startFrame: 840, duration: 300 }
  ],
  frame: 0,
  playing: false,
  zoomEffect: true,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET": return { ...state, ...action.payload };
    case "ADD_NOTIF": {
      const id = makeId();
      return {
        ...state,
        notifs: [...state.notifs, { id, text: "نص جديد", startFrame: state.frame + 60, duration: 300 }],
      };
    }
    case "UPD_NOTIF":
      return { ...state, notifs: state.notifs.map(n => n.id === action.id ? { ...n, ...action.payload } : n) };
    case "DEL_NOTIF":
      return { ...state, notifs: state.notifs.filter(n => n.id !== action.id) };
    default: return state;
  }
}

/* ── Professional Components ── */

const FileButton = ({ onUpload, label, accept, icon, active }) => {
  const inputRef = useRef();
  return (
    <div 
      onClick={() => inputRef.current.click()}
      style={{
        flex: 1, padding: "12px", background: active ? "rgba(10, 132, 255, 0.15)" : "rgba(255,255,255,0.03)",
        borderRadius: "16px", border: active ? "1px solid #0a84ff" : "1px solid rgba(255,255,255,0.1)",
        cursor: "pointer", textAlign: "center", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      }}
    >
      <div style={{ fontSize: "20px", marginBottom: "4px" }}>{icon}</div>
      <div style={{ fontSize: "11px", fontWeight: "600", color: active ? "#0a84ff" : "rgba(255,255,255,0.6)" }}>{label}</div>
      <input type="file" ref={inputRef} accept={accept} hidden onChange={(e) => {
        const file = e.target.files[0];
        if (file) {
          const url = URL.createObjectURL(file);
          onUpload(url, file.type.startsWith("video") ? "video" : file.type.startsWith("audio") ? "audio" : "image", file);
        }
      }} />
    </div>
  );
};

const NotificationItem = ({ n, isDarkMode }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: -100, scale: 0.8, filter: "blur(10px)" }}
    animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
    exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
    transition={{ 
      type: "spring", 
      stiffness: 100, 
      damping: 18, 
      mass: 0.8,
      layout: { type: "spring", stiffness: 100, damping: 20 }
    }}
    style={{
      background: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.6)",
      backdropFilter: "blur(30px) saturate(190%)",
      WebkitBackdropFilter: "blur(30px) saturate(190%)",
      borderRadius: "24px", padding: "16px 20px",
      border: "0.5px solid rgba(255,255,255,0.2)",
      boxShadow: "0 15px 35px rgba(0,0,0,0.2)",
      direction: "rtl", width: "100%", originY: 0
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
      <div style={{ 
        width: 24, height: 24, borderRadius: "6px", 
        background: "linear-gradient(135deg, #007aff, #0051af)", 
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", color: "#fff" 
      }}>✉️</div>
      <span style={{ fontSize: "14px", fontWeight: "700", color: isDarkMode ? "#000" : "#fff", letterSpacing: "-0.3px" }}>البريد</span>
      <span style={{ fontSize: "12px", color: isDarkMode ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.4)", marginRight: "auto" }}>الآن</span>
    </div>
    <p style={{ 
      margin: 0, fontSize: "17px", color: isDarkMode ? "#000" : "#fff", 
      fontWeight: "500", lineHeight: "1.4", letterSpacing: "-0.2px" 
    }}>{n.text}</p>
  </motion.div>
);

function IPhonePreview({ st, frame }) {
  const { time, date, hijri, notifs, bg, bgType, overlayOpacity, blur, zoomEffect, isDarkMode } = st;
  
  const activeNotifs = useMemo(() => 
    notifs.filter(n => frame >= n.startFrame && frame < n.startFrame + n.duration)
    .sort((a, b) => a.startFrame - b.startFrame),
  [notifs, frame]);

  return (
    <div style={{
      width: 340, height: 720, borderRadius: 55, position: "relative", overflow: "hidden",
      boxShadow: "0 0 0 12px #1c1c1e, 0 0 0 14px #3a3a3c, 0 40px 100px rgba(0,0,0,0.9)",
      background: "#000", transform: "translateZ(0)"
    }}>
      {/* Dynamic Background */}
      <motion.div
        animate={zoomEffect && st.playing ? { scale: 1.2 } : { scale: 1.05 }}
        transition={{ duration: 30, ease: "linear" }}
        style={{ position: "absolute", inset: 0, filter: `blur(${blur}px)` }}
      >
        {bg ? (
          bgType === "video" ? (
            <video src={bg} autoPlay loop muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ backgroundImage: `url(${bg})`, backgroundSize: "cover", backgroundPosition: "center", width: "100%", height: "100%" }} />
          )
        ) : (
          <div style={{ background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)", width: "100%", height: "100%" }} />
        )}
      </motion.div>

      <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${overlayOpacity})` }} />

      {/* iOS Clock Area */}
      <div style={{ position: "absolute", top: 100, width: "100%", textAlign: "center", color: "#fff", zIndex: 10 }}>
        <motion.h1 
          key={time}
          initial={{ opacity: 0.8, y: 5 }} animate={{ opacity: 1, y: 0 }}
          style={{ fontSize: "95px", fontWeight: "300", margin: 0, letterSpacing: "-3px", textShadow: "0 4px 30px rgba(0,0,0,0.4)" }}
        >{time}</motion.h1>
        <p style={{ fontSize: "22px", margin: "4px 0", fontWeight: "500", letterSpacing: "-0.5px" }}>{date}</p>
        <p style={{ fontSize: "17px", opacity: 0.9, fontFamily: "'Amiri', serif", direction: "rtl" }}>{hijri}</p>
      </div>

      {/* Cinematic Notifications Container */}
      <div style={{ 
        position: "absolute", top: 320, left: 20, right: 20, 
        display: "flex", flexDirection: "column-reverse", gap: "12px", zIndex: 20 
      }}>
        <AnimatePresence mode="popLayout">
          {activeNotifs.length === 0 ? (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0.5, y: 0 }}
              exit={{ opacity: 0, y: 40, filter: "blur(10px)" }}
              transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
              style={{ textAlign: "center", color: "#fff", fontSize: "14px", marginTop: "40px", fontWeight: "500" }}
            >
              لا توجد إشعارات قديمة
            </motion.div>
          ) : (
            [...activeNotifs].reverse().map((n) => (
              <NotificationItem key={n.id} n={n} isDarkMode={isDarkMode} />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Dynamic Island & Bottom Bar */}
      <div style={{ position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", width: 110, height: 35, background: "#000", borderRadius: 20 }} />
      <div style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", width: 130, height: 5, background: "#fff", borderRadius: 10, opacity: 0.4 }} />
    </div>
  );
}

// Add CSS for Custom Fonts and Better Range Input
const style = document.createElement('style');
style.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Amiri&display=swap');
  input[type=range] { -webkit-appearance: none; background: transparent; }
  input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; height: 20px; width: 20px; border-radius: 50%; background: #0a84ff; cursor: pointer; border: 3px solid #fff; box-shadow: 0 0 10px rgba(0,0,0,0.2); margin-top: -7px; }
  input[type=range]::-webkit-slider-runnable-track { width: 100%; height: 6px; cursor: pointer; background: rgba(255,255,255,0.1); border-radius: 3px; }
  textarea::placeholder { color: rgba(255,255,255,0.3); }
  * { box-sizing: border-box; }
`;
document.head.appendChild(style);


export default function App() {
  const [st, dispatch] = useReducer(reducer, INIT);
  const audioRef = useRef(new Audio());
  const requestRef = useRef();
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);

  const animate = useCallback((time) => {
    if (st.playing) {
      dispatch({ type: "SET", payload: { frame: (st.frame + 1) % TOTAL_FRAMES } });
    }
    requestRef.current = requestAnimationFrame(animate);
  }, [st.playing, st.frame]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [animate]);

  useEffect(() => {
    if (st.playing && st.audio) {
      audioRef.current.src = st.audio;
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [st.playing, st.audio]);

  // Precise audio sync
  useEffect(() => {
    if (st.playing && st.audio) {
      const target = st.frame / FPS;
      if (Math.abs(audioRef.current.currentTime - target) > 0.1) {
        audioRef.current.currentTime = target;
      }
    }
  }, [st.frame]);

  return (
    <div style={{
      display: "flex", height: "100vh", background: st.isDarkMode ? "#000" : "#f2f2f7",
      color: st.isDarkMode ? "#fff" : "#000", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      overflow: "hidden"
    }}>
      {/* Modern Sidebar */}
      <motion.div 
        animate={{ width: sidebarOpen ? 360 : 0, opacity: sidebarOpen ? 1 : 0 }}
        style={{ 
          background: st.isDarkMode ? "#0a0a0a" : "#fff", borderRight: "1px solid rgba(255,255,255,0.05)",
          display: "flex", flexDirection: "column", overflow: "hidden", zIndex: 100, boxShadow: "20px 0 50px rgba(0,0,0,0.3)"
        }}
      >
        <div style={{ padding: "30px", flex: 1, overflowY: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "800", margin: 0, background: "linear-gradient(90deg, #fff, #888)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>الاستوديو السينمائي</h2>
            <button onClick={() => setSidebarOpen(false)} style={{ background: "rgba(255,255,255,0.05)", border: "none", color: "#fff", width: 32, height: 32, borderRadius: "50%", cursor: "pointer" }}>✕</button>
          </div>

          <section style={{ marginBottom: "32px" }}>
            <h3 style={{ fontSize: "12px", fontWeight: "700", color: "#888", textTransform: "uppercase", marginBottom: "16px", letterSpacing: "1px" }}>الوسائط</h3>
            <div style={{ display: "flex", gap: "12px" }}>
              <FileButton icon="🖼️" label="الخلفية" accept="image/*,video/*" active={!!st.bg} onUpload={(url, type) => dispatch({ type: "SET", payload: { bg: url, bgType: type } })} />
              <FileButton icon="🎵" label="الموسيقى" accept="audio/*" active={!!st.audio} onUpload={(url, type, file) => dispatch({ type: "SET", payload: { audio: url, audioName: file.name } })} />
            </div>
            {st.audioName && <div style={{ fontSize: "11px", color: "#0a84ff", marginTop: "10px", fontWeight: "500" }}>✓ {st.audioName}</div>}
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h3 style={{ fontSize: "12px", fontWeight: "700", color: "#888", textTransform: "uppercase", marginBottom: "16px", letterSpacing: "1px" }}>تأثيرات المشهد</h3>
            <div style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "13px" }}>تعتيم الخلفية</span>
                <span style={{ fontSize: "13px", color: "#0a84ff" }}>{Math.round(st.overlayOpacity * 100)}%</span>
              </div>
              <input type="range" min="0" max="0.6" step="0.01" value={st.overlayOpacity} onChange={(e) => dispatch({ type: "SET", payload: { overlayOpacity: parseFloat(e.target.value) } })} style={{ width: "100%", accentColor: "#0a84ff" }} />
            </div>
            <div style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "13px" }}>قوة الضبابية (Blur)</span>
                <span style={{ fontSize: "13px", color: "#0a84ff" }}>{st.blur}px</span>
              </div>
              <input type="range" min="0" max="40" step="1" value={st.blur} onChange={(e) => dispatch({ type: "SET", payload: { blur: parseInt(e.target.value) } })} style={{ width: "100%", accentColor: "#0a84ff" }} />
            </div>
          </section>

          <section>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "12px", fontWeight: "700", color: "#888", textTransform: "uppercase", margin: 0, letterSpacing: "1px" }}>الإشعارات</h3>
              <button onClick={() => dispatch({ type: "ADD_NOTIF" })} style={{ background: "#0a84ff", color: "#fff", border: "none", padding: "6px 14px", borderRadius: "10px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>إضافة +</button>
            </div>
            {st.notifs.map(n => (
              <div key={n.id} style={{ background: "rgba(255,255,255,0.03)", padding: "16px", borderRadius: "18px", marginBottom: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                <textarea value={n.text} onChange={(e) => dispatch({ type: "UPD_NOTIF", id: n.id, payload: { text: e.target.value } })} style={{ width: "100%", background: "transparent", border: "none", color: "#fff", fontSize: "14px", marginBottom: "12px", outline: "none", resize: "none" }} rows="2" />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ fontSize: "10px", color: "#666", display: "block", marginBottom: "4px" }}>وقت الظهور (ث)</label>
                    <input type="number" step="0.1" value={(n.startFrame / FPS).toFixed(1)} onChange={(e) => dispatch({ type: "UPD_NOTIF", id: n.id, payload: { startFrame: Math.round(parseFloat(e.target.value) * FPS) } })} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "none", color: "#fff", padding: "8px", borderRadius: "8px", fontSize: "12px" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: "10px", color: "#666", display: "block", marginBottom: "4px" }}>مدة البقاء (ث)</label>
                    <input type="number" step="0.1" value={(n.duration / FPS).toFixed(1)} onChange={(e) => dispatch({ type: "UPD_NOTIF", id: n.id, payload: { duration: Math.round(parseFloat(e.target.value) * FPS) } })} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "none", color: "#fff", padding: "8px", borderRadius: "8px", fontSize: "12px" }} />
                  </div>
                </div>
                <button onClick={() => dispatch({ type: "DEL_NOTIF", id: n.id })} style={{ color: "#ff453a", background: "none", border: "none", fontSize: "11px", fontWeight: "700", marginTop: "12px", cursor: "pointer", padding: 0 }}>حذف</button>
              </div>
            ))}
          </section>
        </div>
      </motion.div>

      {/* Main Canvas Area */}
      <div style={{ flex: 1, position: "relative", display: "flex", flexDirection: "column", background: st.isDarkMode ? "#000" : "#e5e5ea" }}>
        {/* Floating Controls */}
        <div style={{ position: "absolute", top: 30, left: 30, right: 30, display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 10 }}>
          {!sidebarOpen && <button onClick={() => setSidebarOpen(true)} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", padding: "10px 20px", borderRadius: "20px", backdropFilter: "blur(20px)", cursor: "pointer", fontWeight: "600" }}>☰ القائمة</button>}
          <div style={{ display: "flex", gap: "12px", marginLeft: "auto" }}>
             <button onClick={() => dispatch({ type: "SET", payload: { isDarkMode: !st.isDarkMode } })} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", width: 44, height: 44, borderRadius: "50%", backdropFilter: "blur(20px)", cursor: "pointer", fontSize: "20px" }}>{st.isDarkMode ? "☀️" : "🌙"}</button>
             <button onClick={() => dispatch({ type: "SET", payload: { playing: !st.playing } })} style={{ background: st.playing ? "#ff453a" : "#34c759", border: "none", color: "#fff", padding: "0 30px", borderRadius: "22px", fontWeight: "800", fontSize: "15px", cursor: "pointer", boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>{st.playing ? "إيقاف" : "تشغيل العرض"}</button>
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", perspective: "1000px" }}>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            style={{ transform: window.innerWidth <= 768 ? "scale(0.7)" : "scale(0.9)" }}
          >
            <IPhonePreview st={st} frame={st.frame} />
          </motion.div>
        </div>

        {/* Cinematic Timeline */}
        <div style={{ padding: "30px 50px", background: "linear-gradient(0deg, rgba(0,0,0,0.8) 0%, transparent 100%)", position: "absolute", bottom: 0, width: "100%" }}>
          <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", color: "#fff", fontSize: "12px", fontWeight: "700", opacity: 0.6 }}>
              <span>00:00</span>
              <span style={{ color: "#0a84ff" }}>{(st.frame / FPS).toFixed(2)}s / {(TOTAL_FRAMES / FPS).toFixed(0)}s</span>
            </div>
            <input type="range" min="0" max={TOTAL_FRAMES} value={st.frame} onChange={(e) => dispatch({ type: "SET", payload: { frame: parseInt(e.target.value), playing: false } })} style={{ width: "100%", height: "6px", borderRadius: "3px", background: "rgba(255,255,255,0.1)", accentColor: "#0a84ff", cursor: "pointer" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
