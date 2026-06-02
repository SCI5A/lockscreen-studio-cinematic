import { useState, useRef, useEffect, useCallback, useReducer } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FPS = 30;
const TOTAL_FRAMES = 900; // 30 seconds default

function makeId() { return Math.random().toString(36).slice(2, 8); }

const INIT = {
  time: "12:01",
  date: "Saturday, April 25",
  hijri: "٨ ذو القعدة ١٤٤٧",
  bg: null,
  bgType: "image",
  audio: null,
  audioName: "",
  overlayOpacity: 0.15,
  blur: 0,
  isDarkMode: true,
  notifs: [
    { id: "1", text: "كل شيء في هذه الحياة", startFrame: 60, duration: 150 },
    { id: "2", text: "إما أن يتركك أو تتركه", startFrame: 180, duration: 150 },
    { id: "3", text: "إلا الله إن أقبلت إليه أغناك", startFrame: 300, duration: 150 },
    { id: "4", text: "وإن تركته ناداك", startFrame: 420, duration: 150 }
  ],
  selectedNotif: null,
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
        notifs: [...state.notifs, { id, text: "نص جديد", startFrame: state.frame + 30, duration: 150 }],
        selectedNotif: id
      };
    }
    case "UPD_NOTIF":
      return { ...state, notifs: state.notifs.map(n => n.id === action.id ? { ...n, ...action.payload } : n) };
    case "DEL_NOTIF":
      return { ...state, notifs: state.notifs.filter(n => n.id !== action.id) };
    default: return state;
  }
}

/* ── UI Components ── */

function FileUploader({ onUpload, label, accept, icon }) {
  const inputRef = useRef();
  return (
    <div onClick={() => inputRef.current.click()} style={{
      padding: "12px", background: "rgba(255,255,255,0.05)", borderRadius: "10px", border: "1px dashed rgba(255,255,255,0.2)",
      cursor: "pointer", textAlign: "center", marginBottom: "12px", transition: "all 0.2s"
    }}>
      <div style={{ fontSize: "18px", marginBottom: "4px" }}>{icon}</div>
      <span style={{ fontSize: "12px", color: "#0a84ff", fontWeight: "500" }}>{label}</span>
      <input type="file" ref={inputRef} accept={accept} hidden onChange={(e) => {
        const file = e.target.files[0];
        if (file) {
          const url = URL.createObjectURL(file);
          onUpload(url, file.type.startsWith("video") ? "video" : file.type.startsWith("audio") ? "audio" : "image", file);
        }
      }} />
    </div>
  );
}

function IPhonePreview({ st, frame }) {
  const { time, date, hijri, notifs, bg, bgType, overlayOpacity, blur, zoomEffect, isDarkMode } = st;
  
  // Sort notifications by startFrame to ensure they stack correctly
  const activeNotifs = notifs
    .filter(n => frame >= n.startFrame && frame < n.startFrame + n.duration)
    .sort((a, b) => a.startFrame - b.startFrame);

  return (
    <div style={{
      width: 320, height: 690, borderRadius: 50, position: "relative", overflow: "hidden",
      boxShadow: "0 0 0 12px #1c1c1e, 0 0 0 13px #3a3a3c, 0 30px 60px rgba(0,0,0,0.8)",
      background: "#000"
    }}>
      {/* Background Layer */}
      <motion.div
        animate={zoomEffect && st.playing ? { scale: [1, 1.15] } : { scale: 1 }}
        transition={{ duration: 25, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
        style={{ position: "absolute", inset: 0 }}
      >
        {bg ? (
          bgType === "video" ? (
            <video src={bg} autoPlay loop muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ backgroundImage: `url(${bg})`, backgroundSize: "cover", backgroundPosition: "center", width: "100%", height: "100%" }} />
          )
        ) : (
          <div style={{ background: isDarkMode ? "linear-gradient(135deg, #0f0c29, #302b63, #24243e)" : "linear-gradient(135deg, #74ebd5, #acb6e5)", width: "100%", height: "100%" }} />
        )}
      </motion.div>

      {/* Overlay & Blur */}
      <div style={{
        position: "absolute", inset: 0,
        background: `rgba(0,0,0,${overlayOpacity})`,
        backdropFilter: blur > 0 ? `blur(${blur}px)` : "none"
      }} />

      {/* Status Bar */}
      <div style={{ position: "absolute", top: 15, width: "100%", display: "flex", justifyContent: "space-between", padding: "0 30px", color: "#fff", fontSize: "14px", fontWeight: "600", zIndex: 10 }}>
        <span>{time}</span>
        <div style={{ display: "flex", gap: "5px", opacity: 0.9 }}>📶 🔋</div>
      </div>

      {/* Clock & Date */}
      <div style={{ position: "absolute", top: 80, width: "100%", textAlign: "center", color: "#fff", zIndex: 10 }}>
        <h1 style={{ fontSize: "85px", fontWeight: "200", margin: 0, letterSpacing: "-2px", textShadow: "0 2px 20px rgba(0,0,0,0.3)" }}>{time}</h1>
        <p style={{ fontSize: "20px", margin: "5px 0", fontWeight: "400" }}>{date}</p>
        <p style={{ fontSize: "16px", opacity: 0.8, fontFamily: "Amiri, serif", direction: "rtl" }}>{hijri}</p>
      </div>

      {/* Notifications Stack (Pushing down from top) */}
      <div style={{ 
        position: "absolute", top: 260, left: 16, right: 16, 
        display: "flex", flexDirection: "column-reverse", gap: "10px", zIndex: 10 
      }}>
        <AnimatePresence initial={false} mode="popLayout">
          {activeNotifs.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              style={{ textAlign: "center", color: "#fff", fontSize: "12px", marginTop: "20px" }}
            >
              لا توجد إشعارات قديمة
            </motion.div>
          ) : (
            [...activeNotifs].reverse().map((n, i) => (
              <motion.div
                key={n.id}
                layout
                initial={{ opacity: 0, y: -50, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 150, 
                  damping: 20,
                  layout: { duration: 0.3 }
                }}
                style={{
                  background: isDarkMode ? "rgba(255, 255, 255, 0.75)" : "rgba(0, 0, 0, 0.6)", 
                  backdropFilter: "blur(25px) saturate(180%)",
                  borderRadius: "22px", padding: "14px 18px", 
                  border: isDarkMode ? "1px solid rgba(255,255,255,0.3)" : "1px solid rgba(0,0,0,0.1)",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.2)", direction: "rtl"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, background: "#007aff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px" }}>✉️</div>
                  <span style={{ fontSize: "14px", fontWeight: "700", color: isDarkMode ? "#000" : "#fff" }}>البريد</span>
                  <span style={{ fontSize: "11px", color: isDarkMode ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.5)", marginRight: "auto" }}>الآن</span>
                </div>
                <p style={{ margin: 0, fontSize: "17px", color: isDarkMode ? "#000" : "#fff", fontWeight: "400", lineHeight: "1.5" }}>{n.text}</p>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Home Bar */}
      <div style={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", width: 120, height: 5, background: "#fff", borderRadius: 10, opacity: 0.5 }} />
    </div>
  );
}

export default function App() {
  const [st, dispatch] = useReducer(reducer, INIT);
  const timerRef = useRef();
  const audioRef = useRef(new Audio());
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);

  useEffect(() => {
    if (st.playing) {
      timerRef.current = setInterval(() => {
        dispatch({ type: "SET", payload: { frame: (st.frame + 1) % TOTAL_FRAMES } });
      }, 1000 / FPS);
      if (st.audio) {
        audioRef.current.src = st.audio;
        audioRef.current.play().catch(e => console.log("Audio play blocked"));
      }
    } else {
      clearInterval(timerRef.current);
      audioRef.current.pause();
    }
    return () => clearInterval(timerRef.current);
  }, [st.playing, st.audio]);

  // Sync audio with frame
  useEffect(() => {
    if (st.playing && st.audio) {
      const targetTime = st.frame / FPS;
      if (Math.abs(audioRef.current.currentTime - targetTime) > 0.5) {
        audioRef.current.currentTime = targetTime;
      }
    }
  }, [st.frame]);

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100vh", background: st.isDarkMode ? "#000" : "#f5f5f7",
      color: st.isDarkMode ? "#fff" : "#000", fontFamily: "system-ui", overflow: "hidden", position: "relative"
    }}>
      {/* Top Header */}
      <div style={{ padding: "10px 15px", borderBottom: `1px solid ${st.isDarkMode ? "#1c1c1e" : "#d1d1d6"}`, display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 100, background: st.isDarkMode ? "#000" : "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: "none", border: "none", color: st.isDarkMode ? "#fff" : "#000", fontSize: "20px", cursor: "pointer" }}>☰</button>
          <h2 style={{ margin: 0, fontSize: "16px" }}>Cinematic Studio 🎬</h2>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button onClick={() => dispatch({ type: "SET", payload: { isDarkMode: !st.isDarkMode } })} style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer" }}>
            {st.isDarkMode ? "☀️" : "🌙"}
          </button>
          <button onClick={() => dispatch({ type: "SET", payload: { playing: !st.playing } })} style={{
            padding: "6px 15px", borderRadius: "15px", border: "none",
            background: st.playing ? "#ff3b30" : "#34c759", color: "#fff", fontWeight: "bold", fontSize: "12px"
          }}>
            {st.playing ? "إيقاف" : "تشغيل"}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
        {/* Sidebar Controls */}
        <div style={{
          width: "300px", padding: "20px", borderRight: `1px solid ${st.isDarkMode ? "#1c1c1e" : "#d1d1d6"}`, overflowY: "auto",
          position: window.innerWidth <= 768 ? "absolute" : "relative",
          left: sidebarOpen ? 0 : "-300px",
          top: 0, bottom: 0, background: st.isDarkMode ? "#0a0a0a" : "#fafafa", zIndex: 50, transition: "left 0.3s ease",
          boxShadow: sidebarOpen && window.innerWidth <= 768 ? "10px 0 30px rgba(0,0,0,0.5)" : "none"
        }}>
          <h3 style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "1px", opacity: 0.6, marginBottom: "20px" }}>الإعدادات</h3>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <FileUploader icon="🖼️" label="خلفية" accept="image/*,video/*" onUpload={(url, type) => dispatch({ type: "SET", payload: { bg: url, bgType: type } })} />
            <FileUploader icon="🎵" label={st.audio ? "تغيير الموسيقى" : "موسيقى"} accept="audio/*" onUpload={(url, type, file) => dispatch({ type: "SET", payload: { audio: url, audioName: file?.name || "" } })} />
          </div>
          {st.audioName && <div style={{ fontSize: "10px", opacity: 0.5, marginBottom: "10px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>🎵 {st.audioName}</div>}

          <div style={{ marginBottom: "20px" }}>
            <label style={{ fontSize: "11px", opacity: 0.6, display: "block", marginBottom: "5px" }}>شفافية الطبقة ({Math.round(st.overlayOpacity * 100)}%)</label>
            <input type="range" min="0" max="0.8" step="0.05" value={st.overlayOpacity} onChange={(e) => dispatch({ type: "SET", payload: { overlayOpacity: parseFloat(e.target.value) } })} style={{ width: "100%", accentColor: "#0a84ff" }} />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ fontSize: "11px", opacity: 0.6, display: "block", marginBottom: "5px" }}>الوقت</label>
            <input type="text" value={st.time} onChange={(e) => dispatch({ type: "SET", payload: { time: e.target.value } })} style={{ width: "100%", background: st.isDarkMode ? "#1c1c1e" : "#fff", border: `1px solid ${st.isDarkMode ? "#3a3a3c" : "#d1d1d6"}`, color: st.isDarkMode ? "#fff" : "#000", padding: "8px", borderRadius: "8px" }} />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
              <h4 style={{ margin: 0, fontSize: "14px" }}>الإشعارات</h4>
              <button onClick={() => dispatch({ type: "ADD_NOTIF" })} style={{ background: "#0a84ff", border: "none", color: "#fff", padding: "5px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: "600" }}>إضافة +</button>
            </div>
            {st.notifs.map(n => (
              <div key={n.id} style={{ background: st.isDarkMode ? "#1c1c1e" : "#fff", padding: "12px", borderRadius: "12px", marginBottom: "10px", border: `1px solid ${st.isDarkMode ? "#2c2c2e" : "#e5e5ea"}` }}>
                <textarea value={n.text} onChange={(e) => dispatch({ type: "UPD_NOTIF", id: n.id, payload: { text: e.target.value } })} style={{ width: "100%", background: "transparent", border: "none", color: st.isDarkMode ? "#fff" : "#000", marginBottom: "8px", fontSize: "13px", resize: "none", outline: "none" }} rows="2" />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "8px" }}>
                  <div>
                    <label style={{ fontSize: "9px", opacity: 0.5, display: "block" }}>بداية (إطار)</label>
                    <input type="number" value={n.startFrame} onChange={(e) => dispatch({ type: "UPD_NOTIF", id: n.id, payload: { startFrame: parseInt(e.target.value) } })} style={{ width: "100%", background: "rgba(0,0,0,0.1)", border: "none", color: "inherit", fontSize: "11px", padding: "4px", borderRadius: "4px" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: "9px", opacity: 0.5, display: "block" }}>مدة (إطار)</label>
                    <input type="number" value={n.duration} onChange={(e) => dispatch({ type: "UPD_NOTIF", id: n.id, payload: { duration: parseInt(e.target.value) } })} style={{ width: "100%", background: "rgba(0,0,0,0.1)", border: "none", color: "inherit", fontSize: "11px", padding: "4px", borderRadius: "4px" }} />
                  </div>
                </div>
                <button onClick={() => dispatch({ type: "DEL_NOTIF", id: n.id })} style={{ color: "#ff3b30", background: "none", border: "none", fontSize: "11px", fontWeight: "600", padding: 0, cursor: "pointer" }}>حذف الإشعار</button>
              </div>
            ))}
          </div>
        </div>

        {/* Main Preview Area */}
        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", background: st.isDarkMode ? "#080808" : "#e5e5ea", position: "relative" }}>
          <div style={{ transform: window.innerWidth <= 768 ? "scale(0.8)" : "scale(1)" }}>
            <IPhonePreview st={st} frame={st.frame} />
          </div>
          
          {/* Timeline Bar */}
          <div style={{ 
            position: "absolute", bottom: 20, width: "90%", maxWidth: "800px", 
            background: st.isDarkMode ? "rgba(28,28,30,0.85)" : "rgba(255,255,255,0.85)", 
            padding: "15px 20px", borderRadius: "20px", backdropFilter: "blur(20px)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)", zIndex: 60
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "8px", fontWeight: "600", opacity: 0.7 }}>
              <span>00:00</span>
              <span style={{ color: "#0a84ff" }}>الإطار: {st.frame} / {TOTAL_FRAMES} ({(st.frame/FPS).toFixed(1)}s)</span>
            </div>
            <input type="range" min="0" max={TOTAL_FRAMES} value={st.frame} onChange={(e) => dispatch({ type: "SET", payload: { frame: parseInt(e.target.value), playing: false } })} style={{ width: "100%", accentColor: "#0a84ff", cursor: "pointer" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
