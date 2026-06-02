import { useState, useRef, useEffect, useCallback, useReducer } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FPS = 30;
const TOTAL_FRAMES = 600; // Longer duration for better cinematic feel

const NOTIF_COLORS = ["rgba(255, 255, 255, 0.7)", "rgba(255, 255, 255, 0.8)"];

function makeId() { return Math.random().toString(36).slice(2, 8); }

const INIT = {
  time: "12:01",
  date: "Saturday, April 25",
  hijri: "٨ ذو القعدة ١٤٤٧",
  bg: null,
  bgType: "image",
  overlayOpacity: 0.1,
  blur: 0,
  notifs: [
    { id: "1", text: "كل شيء في هذه الحياة", startFrame: 60, duration: 400 },
    { id: "2", text: "إما أن يتركك أو تتركه", startFrame: 120, duration: 340 },
    { id: "3", text: "إلا الله إن أقبلت إليه أغناك", startFrame: 180, duration: 280 },
    { id: "4", text: "وإن تركته ناداك", startFrame: 240, duration: 220 }
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
        notifs: [...state.notifs, { id, text: "نص جديد", startFrame: state.frame + 30, duration: 200 }],
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

function FileUploader({ onUpload, label, accept }) {
  const inputRef = useRef();
  return (
    <div onClick={() => inputRef.current.click()} style={{
      padding: "10px", background: "#1c1c1e", borderRadius: "8px", border: "1px dashed #3a3a3c",
      cursor: "pointer", textAlign: "center", marginBottom: "10px"
    }}>
      <span style={{ fontSize: "12px", color: "#0a84ff" }}>{label}</span>
      <input type="file" ref={inputRef} accept={accept} hidden onChange={(e) => {
        const file = e.target.files[0];
        if (file) {
          const url = URL.createObjectURL(file);
          onUpload(url, file.type.startsWith("video") ? "video" : "image");
        }
      }} />
    </div>
  );
}

function IPhonePreview({ st, frame }) {
  const { time, date, hijri, notifs, bg, bgType, overlayOpacity, blur, zoomEffect } = st;
  const visibleNotifs = notifs.filter(n => frame >= n.startFrame && frame < n.startFrame + n.duration);

  return (
    <div style={{
      width: 320, height: 690, borderRadius: 50, position: "relative", overflow: "hidden",
      boxShadow: "0 0 0 12px #1c1c1e, 0 0 0 13px #3a3a3c, 0 30px 60px rgba(0,0,0,0.5)",
      background: "#000"
    }}>
      {/* Background with Zoom Effect */}
      <motion.div
        animate={zoomEffect && st.playing ? { scale: [1, 1.1] } : { scale: 1 }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
        style={{ position: "absolute", inset: 0 }}
      >
        {bg ? (
          bgType === "video" ? (
            <video src={bg} autoPlay loop muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ backgroundImage: `url(${bg})`, backgroundSize: "cover", backgroundPosition: "center", width: "100%", height: "100%" }} />
          )
        ) : (
          <div style={{ background: "linear-gradient(to bottom, #1a1a2e, #16213e)", width: "100%", height: "100%" }} />
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
        <div style={{ display: "flex", gap: "5px" }}>📶 🔋</div>
      </div>

      {/* Clock & Date */}
      <div style={{ position: "absolute", top: 80, width: "100%", textAlign: "center", color: "#fff", zIndex: 10 }}>
        <h1 style={{ fontSize: "85px", fontWeight: "200", margin: 0, letterSpacing: "-2px" }}>{time}</h1>
        <p style={{ fontSize: "20px", margin: "5px 0", fontWeight: "400" }}>{date}</p>
        <p style={{ fontSize: "16px", opacity: 0.8, fontFamily: "Amiri, serif", direction: "rtl" }}>{hijri}</p>
      </div>

      {/* Notifications Stack */}
      <div style={{ position: "absolute", bottom: 100, left: 20, right: 20, display: "flex", flexDirection: "column-reverse", gap: "10px", zIndex: 10 }}>
        <AnimatePresence>
          {visibleNotifs.map((n, i) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
              style={{
                background: "rgba(255, 255, 255, 0.75)", backdropFilter: "blur(25px) saturate(180%)",
                borderRadius: "22px", padding: "12px 16px", border: "1px solid rgba(255,255,255,0.3)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.15)", direction: "rtl"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <div style={{ width: 20, height: 20, borderRadius: 5, background: "#007aff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px" }}>✉️</div>
                <span style={{ fontSize: "13px", fontWeight: "600", color: "#000" }}>البريد</span>
                <span style={{ fontSize: "11px", color: "rgba(0,0,0,0.5)", marginRight: "auto" }}>الآن</span>
              </div>
              <p style={{ margin: 0, fontSize: "16px", color: "#000", fontWeight: "400", lineHeight: "1.4" }}>{n.text}</p>
            </motion.div>
          ))}
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

  useEffect(() => {
    if (st.playing) {
      timerRef.current = setInterval(() => {
        dispatch({ type: "SET", payload: { frame: (st.frame + 1) % TOTAL_FRAMES } });
      }, 1000 / FPS);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [st.playing, st.frame]);

  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100vh", background: "#000",
      color: "#fff", fontFamily: "system-ui", overflow: "hidden", position: "relative"
    }}>
      {/* Top Header */}
      <div style={{ padding: "10px 15px", borderBottom: "1px solid #1c1c1e", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 100, background: "#000" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: "none", border: "none", color: "#fff", fontSize: "20px", cursor: "pointer" }}>☰</button>
          <h2 style={{ margin: 0, fontSize: "16px" }}>Cinematic Studio 🎬</h2>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => dispatch({ type: "SET", payload: { playing: !st.playing } })} style={{
            padding: "6px 15px", borderRadius: "15px", border: "none",
            background: st.playing ? "#ff3b30" : "#34c759", color: "#fff", fontWeight: "bold", fontSize: "12px"
          }}>
            {st.playing ? "إيقاف" : "تشغيل"}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
        {/* Sidebar Controls (Responsive) */}
        <div style={{
          width: "280px", padding: "20px", borderRight: "1px solid #1c1c1e", overflowY: "auto",
          position: window.innerWidth <= 768 ? "absolute" : "relative",
          left: sidebarOpen ? 0 : "-280px",
          top: 0, bottom: 0, background: "#0a0a0a", zTarget: 50, transition: "left 0.3s ease",
          boxShadow: sidebarOpen && window.innerWidth <= 768 ? "10px 0 30px rgba(0,0,0,0.5)" : "none"
        }}>
          <h3>الإعدادات</h3>
          
          <FileUploader label="رفع خلفية (فيديو أو صورة)" accept="image/*,video/*" onUpload={(url, type) => dispatch({ type: "SET", payload: { bg: url, bgType: type } })} />

          <div style={{ marginBottom: "20px" }}>
            <label style={{ fontSize: "12px", opacity: 0.6 }}>شفافية الطبقة</label>
            <input type="range" min="0" max="0.8" step="0.05" value={st.overlayOpacity} onChange={(e) => dispatch({ type: "SET", payload: { overlayOpacity: parseFloat(e.target.value) } })} style={{ width: "100%" }} />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ fontSize: "12px", opacity: 0.6 }}>الوقت</label>
            <input type="text" value={st.time} onChange={(e) => dispatch({ type: "SET", payload: { time: e.target.value } })} style={{ width: "100%", background: "#1c1c1e", border: "1px solid #3a3a3c", color: "#fff", padding: "8px", borderRadius: "5px" }} />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <h4 style={{ margin: 0 }}>الإشعارات</h4>
              <button onClick={() => dispatch({ type: "ADD_NOTIF" })} style={{ background: "#0a84ff", border: "none", color: "#fff", padding: "4px 10px", borderRadius: "5px", fontSize: "12px" }}>إضافة</button>
            </div>
            {st.notifs.map(n => (
              <div key={n.id} style={{ background: "#1c1c1e", padding: "10px", borderRadius: "8px", marginBottom: "8px" }}>
                <input type="text" value={n.text} onChange={(e) => dispatch({ type: "UPD_NOTIF", id: n.id, payload: { text: e.target.value } })} style={{ width: "100%", background: "transparent", border: "none", color: "#fff", marginBottom: "5px" }} />
                <div style={{ display: "flex", gap: "10px", fontSize: "10px", opacity: 0.5 }}>
                  <span>البداية: {n.startFrame}</span>
                  <button onClick={() => dispatch({ type: "DEL_NOTIF", id: n.id })} style={{ color: "#ff3b30", background: "none", border: "none", marginLeft: "auto" }}>حذف</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Preview Area */}
        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", background: "#080808", position: "relative" }}>
          <IPhonePreview st={st} frame={st.frame} />
          
          {/* Timeline Bar */}
          <div style={{ position: "absolute", bottom: 20, width: "80%", background: "rgba(28,28,30,0.8)", padding: "15px", borderRadius: "15px", backdropFilter: "blur(10px)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "5px" }}>
              <span>00:00</span>
              <span>الإطار: {st.frame} / {TOTAL_FRAMES}</span>
            </div>
            <input type="range" min="0" max={TOTAL_FRAMES} value={st.frame} onChange={(e) => dispatch({ type: "SET", payload: { frame: parseInt(e.target.value), playing: false } })} style={{ width: "100%", accentColor: "#0a84ff" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
