import { useState, useRef, useEffect, useCallback, useReducer } from "react";

const FPS = 30;
const TOTAL_FRAMES = 300;

const GRADIENT_PRESETS = [
  { name: "Obsidian", value: "linear-gradient(160deg,#0f0c29 0%,#302b63 50%,#24243e 100%)" },
  { name: "Aurora",   value: "linear-gradient(160deg,#0b3d2e 0%,#0f5c4e 40%,#1a2a6c 100%)" },
  { name: "Ember",    value: "linear-gradient(160deg,#1a0533 0%,#6b1a3a 50%,#c0392b 100%)" },
  { name: "Slate",    value: "linear-gradient(160deg,#0d1117 0%,#161b22 50%,#21262d 100%)" },
  { name: "Dusk",     value: "linear-gradient(160deg,#2d1b4e 0%,#11998e 100%)" },
  { name: "Ash",      value: "linear-gradient(160deg,#1c1c1e 0%,#2c2c2e 100%)" },
];

const NOTIF_COLORS = ["#30d158","#0a84ff","#ff375f","#ffd60a","#bf5af2","#ff9f0a","#64d2ff"];
const NOTIF_APPS   = ["Messages","Instagram","WhatsApp","Twitter","Gmail","Snapchat","TikTok","YouTube"];
const APP_ICONS = {
  Messages:"💬", Instagram:"📸", WhatsApp:"🟢", Twitter:"🐦",
  Gmail:"✉️", Snapchat:"👻", TikTok:"🎵", YouTube:"▶️",
};

function makeId() { return Math.random().toString(36).slice(2,8); }

const DEFAULT_NOTIFS = [
  { id:"a1", app:"Messages",  icon:"💬", sender:"Sarah ✨",  message:"Are you coming tonight? 🎉", time:"now", color:"#30d158", startFrame:45,  duration:200 },
  { id:"a2", app:"Instagram", icon:"📸", sender:"Instagram", message:"Ahmed liked your photo",     time:"2m",  color:"#0a84ff", startFrame:100, duration:170 },
];

const INIT = {
  time:"09:41", date:"Saturday, May 31", hijri:"٣ ذو القعدة ١٤٤٧",
  bg:null, bgType:null, gradient:GRADIENT_PRESETS[0].value,
  overlayOpacity:0.25, blur:0,
  notifs:DEFAULT_NOTIFS, selectedNotif:null,
  frame:0, playing:false, totalFrames:TOTAL_FRAMES,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET": return { ...state, ...action.payload };
    case "UPD_NOTIF":
      return { ...state, notifs: state.notifs.map(n => n.id===action.id ? {...n,...action.payload} : n) };
    case "ADD_NOTIF": {
      const id = makeId();
      const color = NOTIF_COLORS[state.notifs.length % NOTIF_COLORS.length];
      return { ...state, notifs:[...state.notifs,{id,app:"Messages",icon:"💬",sender:"New Contact",message:"Hey there!",time:"now",color,startFrame:state.frame,duration:150}], selectedNotif:id };
    }
    case "DEL_NOTIF":
      return { ...state, notifs:state.notifs.filter(n=>n.id!==action.id), selectedNotif:state.selectedNotif===action.id?null:state.selectedNotif };
    default: return state;
  }
}

function fmtTC(frame) {
  const s=Math.floor(frame/FPS), f=frame%FPS;
  return `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}:${String(f).padStart(2,"0")}`;
}

const Ico = ({ d, size=14, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color||"currentColor"}
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p,i)=><path key={i} d={p}/>) : <path d={d}/>}
  </svg>
);

const IC = {
  play:"M5 3l14 9-14 9V3z",
  pause:["M6 4h4v16H6z","M14 4h4v16h-4z"],
  stop:"M4 4h16v16H4z",
  plus:["M12 5v14","M5 12h14"],
  trash:["M3 6h18","M8 6V4h8v2","M19 6l-1 14H6L5 6"],
  img:["M21 19H3a2 2 0 01-2-2V7a2 2 0 012-2h18a2 2 0 012 2v10a2 2 0 01-2 2z","M3 15l5-5 4 4 3-3 5 5"],
  video:["M15 10l4.553-2.277A1 1 0 0121 8.72v6.56a1 1 0 01-1.447.898L15 14","M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"],
  dl:["M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4","M7 10l5 5 5-5","M12 15V3"],
  layers:["M12 2L2 7l10 5 10-5-10-5z","M2 17l10 5 10-5","M2 12l10 5 10-5"],
  film:["M2 2h20v20H2z","M7 2v20","M17 2v20","M2 12h20","M2 7h5","M2 17h5","M17 17h5","M17 7h5"],
  gear:["M12 15a3 3 0 100-6 3 3 0 000 6z","M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"],
};

/* ── iPhone Preview ── */
function IPhoneLockscreen({ st, frame }) {
  const { time, date, hijri, notifs, bg, bgType, gradient, overlayOpacity, blur } = st;
  const visible = notifs.filter(n => frame >= n.startFrame && frame < n.startFrame + n.duration);
  const bgStyle = bg
    ? bgType==="image" ? {backgroundImage:`url(${bg})`,backgroundSize:"cover",backgroundPosition:"center"} : {background:"#000"}
    : {background:gradient};

  return (
    <div style={{
      width:270, height:585, borderRadius:42, position:"relative", overflow:"hidden",
      boxShadow:"0 0 0 1.5px #3a3a3c,0 0 0 3px #1c1c1e,0 24px 64px rgba(0,0,0,0.9),inset 0 0 0 1px rgba(255,255,255,0.07)",
      flexShrink:0, ...bgStyle,
    }}>
      {bg && bgType==="video" && (
        <video src={bg} autoPlay loop muted playsInline style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}}/>
      )}
      {!bg && (
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 35% 25%,rgba(99,102,241,0.25) 0%,transparent 55%),radial-gradient(ellipse at 75% 75%,rgba(16,185,129,0.15) 0%,transparent 50%)"}}/>
      )}
      <div style={{position:"absolute",inset:0,background:`rgba(0,0,0,${overlayOpacity})`,backdropFilter:blur>0?`blur(${blur}px)`:"none"}}/>
      {/* Dynamic Island */}
      <div style={{position:"absolute",top:10,left:"50%",transform:"translateX(-50%)",width:110,height:30,borderRadius:18,background:"#000",boxShadow:"0 0 0 1px rgba(255,255,255,0.08)",zIndex:20}}/>
      {/* Status bar */}
      <div style={{position:"absolute",top:0,left:0,right:0,height:50,display:"flex",alignItems:"flex-end",justifyContent:"space-between",padding:"0 22px 6px",zIndex:20}}>
        <span style={{color:"#fff",fontSize:13,fontWeight:600,letterSpacing:-0.3}}>{time}</span>
        <div style={{display:"flex",alignItems:"center",gap:4,color:"#fff"}}>
          <svg width="12" height="10" viewBox="0 0 12 10" fill="white"><rect x="0" y="5" width="2" height="5" rx="0.5"/><rect x="3" y="3" width="2" height="7" rx="0.5"/><rect x="6" y="1" width="2" height="9" rx="0.5"/><rect x="9" y="0" width="2" height="10" rx="0.5" opacity="0.35"/></svg>
          <svg width="14" height="10" viewBox="0 0 14 10" fill="white"><path d="M7 2C4.5 2 2.2 3 0.5 4.7L2 6.2C3.3 4.8 5 4 7 4s3.7.8 5 2.2l1.5-1.5C11.8 3 9.5 2 7 2z" opacity="0.35"/><path d="M7 5c-1.5 0-2.8.6-3.8 1.5L4.7 8C5.4 7.4 6.2 7 7 7s1.6.4 2.3 1l1.5-1.5C9.8 5.6 8.5 5 7 5z"/><circle cx="7" cy="9.5" r="1"/></svg>
          <svg width="22" height="11" viewBox="0 0 22 11" fill="none"><rect x="0.5" y="0.5" width="18" height="10" rx="2.5" stroke="white" strokeOpacity="0.35"/><rect x="2" y="2" width="14" height="7" rx="1.5" fill="white"/><path d="M20 3.5v3a1.5 1.5 0 000-3z" fill="white" fillOpacity="0.4"/></svg>
        </div>
      </div>
      {/* Clock */}
      <div style={{position:"absolute",top:65,left:0,right:0,display:"flex",flexDirection:"column",alignItems:"center",zIndex:10}}>
        <div style={{color:"#fff",fontSize:70,fontWeight:100,lineHeight:1,letterSpacing:-3,textShadow:"0 2px 20px rgba(0,0,0,0.5)",userSelect:"none"}}>{time}</div>
        <div style={{color:"rgba(255,255,255,0.88)",fontSize:15,fontWeight:400,marginTop:3,textShadow:"0 1px 8px rgba(0,0,0,0.6)"}}>{date}</div>
        <div style={{color:"rgba(255,255,255,0.6)",fontSize:12,fontWeight:300,marginTop:3,fontFamily:"'Amiri',Georgia,serif",direction:"rtl",textShadow:"0 1px 8px rgba(0,0,0,0.6)"}}>{hijri}</div>
      </div>
      {/* Notifications */}
      <div style={{position:"absolute",top:248,left:12,right:12,display:"flex",flexDirection:"column",gap:7,zIndex:10}}>
        {visible.map((n) => {
          const age = frame - n.startFrame;
          const p = Math.min(1, age/18);
          return (
            <div key={n.id} style={{
              background:"rgba(28,28,30,0.72)",backdropFilter:"blur(24px) saturate(180%)",
              borderRadius:16,padding:"9px 13px",border:"1px solid rgba(255,255,255,0.1)",
              transform:`translateY(${(1-p)*18}px)`,opacity:p,
            }}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                <span style={{fontSize:12}}>{n.icon}</span>
                <span style={{color:"rgba(255,255,255,0.65)",fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.07em"}}>{n.app}</span>
                <span style={{marginLeft:"auto",color:"rgba(255,255,255,0.45)",fontSize:10}}>{n.time}</span>
              </div>
              <div style={{color:"#fff",fontSize:12,fontWeight:600,marginBottom:1}}>{n.sender}</div>
              <div style={{color:"rgba(255,255,255,0.7)",fontSize:12,lineHeight:1.3}}>{n.message}</div>
            </div>
          );
        })}
      </div>
      {/* Home bar */}
      <div style={{position:"absolute",bottom:10,left:"50%",transform:"translateX(-50%)",width:100,height:4,borderRadius:3,background:"rgba(255,255,255,0.4)",zIndex:20}}/>
      {/* Quick actions */}
      <div style={{position:"absolute",bottom:22,left:0,right:0,display:"flex",justifyContent:"space-between",padding:"0 22px",zIndex:20}}>
        {["🔦","📷"].map((icon,i)=>(
          <div key={i} style={{width:40,height:40,borderRadius:20,background:"rgba(255,255,255,0.16)",backdropFilter:"blur(12px)",border:"1px solid rgba(255,255,255,0.18)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>{icon}</div>
        ))}
      </div>
    </div>
  );
}

/* ── Properties Panel ── */
function PropertiesPanel({ st, dispatch }) {
  const sel = st.notifs.find(n => n.id === st.selectedNotif);

  const F = (label, key, opts={}) => (
    <label key={key} style={{display:"block",marginBottom:9}}>
      <div style={{fontSize:10,color:"#636366",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:3}}>{label}</div>
      <input type={opts.type||"text"} value={st[key]??""} dir={opts.rtl?"rtl":undefined}
        onChange={e=>dispatch({type:"SET",payload:{[key]:e.target.value}})}
        style={{width:"100%",background:"#1c1c1e",border:"1px solid #2c2c2e",borderRadius:7,padding:"6px 9px",color:"#fff",fontSize:12,fontFamily:opts.rtl?"'Amiri',Georgia,serif":"system-ui",outline:"none",boxSizing:"border-box"}}
      />
    </label>
  );

  const S = (label, key, min, max, step=1, fmt=v=>v) => (
    <div key={key} style={{marginBottom:9}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
        <span style={{fontSize:10,color:"#636366",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em"}}>{label}</span>
        <span style={{fontSize:10,color:"#48484a"}}>{fmt(st[key])}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={st[key]}
        onChange={e=>dispatch({type:"SET",payload:{[key]:parseFloat(e.target.value)}})}
        style={{width:"100%",accentColor:"#0a84ff",display:"block"}}
      />
    </div>
  );

  const NF = (label, key, opts={}) => !sel ? null : (
    <label key={key} style={{display:"block",marginBottom:7}}>
      <div style={{fontSize:10,color:"#48484a",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:3}}>{label}</div>
      {opts.type==="select"
        ? <select value={sel[key]}
            onChange={e=>{const v=e.target.value;dispatch({type:"UPD_NOTIF",id:sel.id,payload:{[key]:v,icon:APP_ICONS[v]||"🔔"}});}}
            style={{width:"100%",background:"#111113",border:"1px solid #2c2c2e",borderRadius:6,padding:"5px 8px",color:"#fff",fontSize:11,outline:"none",boxSizing:"border-box"}}>
            {NOTIF_APPS.map(a=><option key={a}>{a}</option>)}
          </select>
        : <input type="text" value={sel[key]}
            onChange={e=>dispatch({type:"UPD_NOTIF",id:sel.id,payload:{[key]:e.target.value}})}
            style={{width:"100%",background:"#111113",border:"1px solid #2c2c2e",borderRadius:6,padding:"5px 8px",color:"#fff",fontSize:11,outline:"none",boxSizing:"border-box"}}
          />
      }
    </label>
  );

  return (
    <div style={{padding:"10px 12px",overflowY:"auto",height:"100%",boxSizing:"border-box",scrollbarWidth:"thin",scrollbarColor:"#2c2c2e transparent"}}>
      <Sec>Lockscreen</Sec>
      {F("Time","time")}
      {F("Gregorian Date","date")}
      {F("Hijri Date","hijri",{rtl:true})}
      {S("Overlay Opacity","overlayOpacity",0,0.85,0.05,v=>`${Math.round(v*100)}%`)}
      {S("Background Blur","blur",0,18,1,v=>`${v}px`)}

      <Sec style={{marginTop:6}}>
        Notifications
        <button onClick={()=>dispatch({type:"ADD_NOTIF"})}
          style={{marginLeft:"auto",background:"#0a84ff22",border:"1px solid #0a84ff44",borderRadius:5,color:"#0a84ff",padding:"2px 7px",fontSize:10,cursor:"pointer",display:"flex",alignItems:"center",gap:3,fontFamily:"system-ui"}}>
          <Ico d={IC.plus} size={9}/> Add
        </button>
      </Sec>

      <div style={{display:"flex",flexDirection:"column",gap:3,marginBottom:8}}>
        {st.notifs.map(n=>(
          <div key={n.id} onClick={()=>dispatch({type:"SET",payload:{selectedNotif:st.selectedNotif===n.id?null:n.id}})}
            style={{display:"flex",alignItems:"center",gap:7,padding:"7px 9px",borderRadius:8,cursor:"pointer",
              background:st.selectedNotif===n.id?"#1c2a3a":"#111113",
              border:`1px solid ${st.selectedNotif===n.id?"#0a84ff44":"#1c1c1e"}`}}>
            <span style={{fontSize:13}}>{n.icon}</span>
            <div style={{flex:1,minWidth:0}}>
              <div style={{color:"#fff",fontSize:11,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{n.sender}</div>
              <div style={{color:"#48484a",fontSize:10,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{n.message}</div>
            </div>
            <div style={{width:6,height:6,borderRadius:"50%",background:n.color,flexShrink:0}}/>
            <button onClick={e=>{e.stopPropagation();dispatch({type:"DEL_NOTIF",id:n.id});}}
              style={{background:"none",border:"none",color:"#ff453a",cursor:"pointer",padding:2,opacity:0.7,lineHeight:0}}>
              <Ico d={IC.trash} size={11}/>
            </button>
          </div>
        ))}
      </div>

      {sel && (
        <div style={{background:"#0d0d0f",border:"1px solid #1c1c1e",borderRadius:9,padding:"9px 9px 5px"}}>
          <div style={{fontSize:9,color:"#3a3a3c",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:7}}>Edit notification</div>
          {NF("App","app",{type:"select"})}
          {NF("Sender","sender")}
          {NF("Message","message")}
          {NF("Time label","time")}
          {NF("Icon (emoji)","icon")}
          <div style={{marginBottom:5}}>
            <div style={{fontSize:10,color:"#48484a",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:5}}>Color</div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
              {NOTIF_COLORS.map(c=>(
                <div key={c} onClick={()=>dispatch({type:"UPD_NOTIF",id:sel.id,payload:{color:c}})}
                  style={{width:18,height:18,borderRadius:"50%",background:c,cursor:"pointer",
                    outline:sel.color===c?`2px solid ${c}`:"none",outlineOffset:2}}/>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Sec({ children, style={} }) {
  return (
    <div style={{fontSize:10,color:"#48484a",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:7,display:"flex",alignItems:"center",gap:5,...style}}>
      {children}
    </div>
  );
}

/* ── Asset Manager ── */
function AssetManager({ st, dispatch }) {
  const imgRef = useRef(), vidRef = useRef();

  const handleImg = e => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = ev => dispatch({type:"SET",payload:{bg:ev.target.result,bgType:"image"}});
    r.readAsDataURL(f);
  };
  const handleVid = e => {
    const f = e.target.files[0]; if (!f) return;
    dispatch({type:"SET",payload:{bg:URL.createObjectURL(f),bgType:"video"}});
  };

  return (
    <div style={{padding:"10px 12px",overflowY:"auto",height:"100%",boxSizing:"border-box",scrollbarWidth:"thin",scrollbarColor:"#2c2c2e transparent"}}>
      <Sec>Media</Sec>
      <input ref={imgRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleImg}/>
      <input ref={vidRef} type="file" accept="video/*" style={{display:"none"}} onChange={handleVid}/>
      <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:12}}>
        {[
          {label:"Image",icon:IC.img,sub:"JPG · PNG · WEBP",fn:()=>imgRef.current.click()},
          {label:"Video",icon:IC.video,sub:"MP4 · MOV",fn:()=>vidRef.current.click()},
        ].map(({label,icon,sub,fn})=>(
          <button key={label} onClick={fn} style={{display:"flex",alignItems:"center",gap:9,background:"#111113",border:"1px solid #1c1c1e",borderRadius:9,padding:"9px 11px",color:"#fff",cursor:"pointer",textAlign:"left"}}>
            <div style={{color:"#0a84ff",lineHeight:0}}><Ico d={icon} size={14}/></div>
            <div>
              <div style={{fontSize:11,fontWeight:600}}>Upload {label}</div>
              <div style={{fontSize:10,color:"#48484a"}}>{sub}</div>
            </div>
          </button>
        ))}
      </div>

      {st.bg && (
        <div style={{marginBottom:12}}>
          <Sec>Active BG</Sec>
          <div style={{borderRadius:9,overflow:"hidden",border:"1px solid #0a84ff33"}}>
            {st.bgType==="image" && <img src={st.bg} style={{width:"100%",height:70,objectFit:"cover",display:"block"}} alt="bg"/>}
            {st.bgType==="video" && <div style={{height:70,background:"#0a0a0c",display:"flex",alignItems:"center",justifyContent:"center",color:"#0a84ff",fontSize:10}}>▶ Video</div>}
            <button onClick={()=>dispatch({type:"SET",payload:{bg:null,bgType:null}})}
              style={{width:"100%",background:"#1c1c1e",border:"none",borderTop:"1px solid #2c2c2e",color:"#ff453a",padding:"5px",fontSize:10,cursor:"pointer"}}>
              Remove
            </button>
          </div>
        </div>
      )}

      <Sec>Gradients</Sec>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,marginBottom:12}}>
        {GRADIENT_PRESETS.map(p=>(
          <button key={p.name} onClick={()=>dispatch({type:"SET",payload:{gradient:p.value,bg:null,bgType:"gradient"}})}
            style={{height:46,borderRadius:8,background:p.value,border:st.gradient===p.value&&!st.bg?"2px solid #0a84ff":"1px solid rgba(255,255,255,0.06)",cursor:"pointer",position:"relative",overflow:"hidden"}}>
            <span style={{position:"absolute",bottom:4,left:6,color:"rgba(255,255,255,0.85)",fontSize:8,fontWeight:700,textShadow:"0 1px 4px rgba(0,0,0,0.8)"}}>{p.name}</span>
          </button>
        ))}
      </div>

      <Sec>Export</Sec>
      <div style={{background:"#0d0d0f",border:"1px solid #1c1c1e",borderRadius:9,padding:10}}>
        {[["Format","MP4 · H.264"],["Resolution","1080×1920"],["FPS","30"],["Duration",`${(st.totalFrames/FPS).toFixed(1)}s`]].map(([k,v])=>(
          <div key={k} style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
            <span style={{fontSize:10,color:"#48484a"}}>{k}</span>
            <span style={{fontSize:10,color:"#ebebf5",fontWeight:600}}>{v}</span>
          </div>
        ))}
        <button onClick={()=>alert("🎬 To export MP4:\nnpm install && npm run remotion:render\n→ out/lockscreen.mp4")}
          style={{width:"100%",padding:"8px",borderRadius:8,border:"none",background:"linear-gradient(135deg,#0a84ff,#5e5ce6)",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 14px rgba(10,132,255,0.35)",display:"flex",alignItems:"center",justifyContent:"center",gap:5,marginTop:2}}>
          <Ico d={IC.dl} size={12}/> Export MP4
        </button>
      </div>
    </div>
  );
}

/* ── Timeline Editor ── */
function TimelineEditor({ st, dispatch }) {
  const trackRef = useRef();
  const rafRef = useRef();
  const playRef = useRef({time:0,frame:0});
  const drag = useRef(null);

  useEffect(()=>{
    if (st.playing) {
      playRef.current = {time:performance.now(), frame:st.frame};
      const tick = () => {
        const elapsed = (performance.now()-playRef.current.time)/1000;
        const nf = Math.floor(playRef.current.frame + elapsed*FPS);
        if (nf >= st.totalFrames) { dispatch({type:"SET",payload:{playing:false,frame:0}}); return; }
        dispatch({type:"SET",payload:{frame:nf}});
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    }
    return ()=>cancelAnimationFrame(rafRef.current);
  },[st.playing]);

  const f2p = f => (f/st.totalFrames)*100;

  const scrub = useCallback(e=>{
    const rect = trackRef.current?.getBoundingClientRect(); if (!rect) return;
    const x = (e.touches?.[0]?.clientX??e.clientX)-rect.left;
    dispatch({type:"SET",payload:{frame:Math.max(0,Math.min(st.totalFrames,Math.round((x/rect.width)*st.totalFrames))),playing:false}});
  },[st.totalFrames]);

  const onClipDown = (e,n)=>{
    e.stopPropagation();
    const rect = trackRef.current?.getBoundingClientRect(); if (!rect) return;
    const x=(e.touches?.[0]?.clientX??e.clientX)-rect.left;
    drag.current = {id:n.id, off:(x/rect.width)*st.totalFrames - n.startFrame};
  };

  const onMove = useCallback(e=>{
    if (!drag.current) return;
    const rect = trackRef.current?.getBoundingClientRect(); if (!rect) return;
    const x=(e.touches?.[0]?.clientX??e.clientX)-rect.left;
    const ns = Math.max(0,Math.round((x/rect.width)*st.totalFrames - drag.current.off));
    dispatch({type:"UPD_NOTIF",id:drag.current.id,payload:{startFrame:ns}});
  },[st.totalFrames]);

  const onUp = useCallback(()=>{drag.current=null;},[]);

  const RH=20, TH=24, LW=100;
  const ticks = Array.from({length:Math.floor(st.totalFrames/FPS)+1},(_,i)=>i*FPS);

  return (
    <div style={{height:"100%",display:"flex",flexDirection:"column",background:"#0a0a0c",userSelect:"none"}}>
      {/* Controls */}
      <div style={{height:36,display:"flex",alignItems:"center",gap:5,padding:"0 10px",borderBottom:"1px solid #1a1a1c",flexShrink:0}}>
        <CB onClick={()=>dispatch({type:"SET",payload:{playing:false,frame:0}})}><Ico d={IC.stop} size={11}/></CB>
        <CB accent={st.playing} onClick={()=>{
          if(st.frame>=st.totalFrames) dispatch({type:"SET",payload:{frame:0}});
          dispatch({type:"SET",payload:{playing:!st.playing}});
        }}><Ico d={st.playing?IC.pause:IC.play} size={11}/></CB>
        <span style={{fontSize:10,color:"#48484a",fontFamily:"'SF Mono',monospace",marginLeft:2}}>
          {fmtTC(st.frame)}<span style={{color:"#2c2c2e"}}> / {fmtTC(st.totalFrames)}</span>
        </span>
        <div style={{flex:1}}/>
        <span style={{fontSize:9,color:"#2c2c2e"}}>Drag clips to reposition</span>
        <input type="number" min={60} max={900} step={30} value={st.totalFrames}
          onChange={e=>dispatch({type:"SET",payload:{totalFrames:parseInt(e.target.value)||300}})}
          style={{width:48,background:"#1c1c1e",border:"1px solid #2c2c2e",borderRadius:4,color:"#ebebf5",fontSize:10,padding:"2px 4px",textAlign:"center",outline:"none"}}/>
        <span style={{fontSize:9,color:"#3a3a3c"}}>frames</span>
      </div>

      {/* Tracks */}
      <div style={{display:"flex",flex:1,overflow:"hidden"}}>
        {/* Labels */}
        <div style={{width:LW,flexShrink:0,background:"#080809",borderRight:"1px solid #1a1a1c"}}>
          <div style={{height:RH,borderBottom:"1px solid #1a1a1c"}}/>
          {st.notifs.map(n=>(
            <div key={n.id} style={{height:TH+2,borderBottom:"1px solid #141416",display:"flex",alignItems:"center",gap:5,padding:"0 7px",cursor:"pointer"}}
              onClick={()=>dispatch({type:"SET",payload:{selectedNotif:n.id===st.selectedNotif?null:n.id}})}>
              <div style={{width:5,height:5,borderRadius:"50%",background:n.color,flexShrink:0}}/>
              <span style={{fontSize:9,color:"#636366",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{n.sender}</span>
            </div>
          ))}
        </div>

        {/* Scrub area */}
        <div style={{flex:1,overflow:"hidden",position:"relative",cursor:"crosshair"}}
          ref={trackRef}
          onMouseDown={scrub} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
          onTouchStart={scrub} onTouchMove={onMove} onTouchEnd={onUp}
        >
          {/* Ruler */}
          <div style={{position:"absolute",top:0,left:0,right:0,height:RH,background:"#0d0d10",borderBottom:"1px solid #1a1a1c",overflow:"hidden"}}>
            {ticks.map(f=>(
              <div key={f} style={{position:"absolute",left:`${f2p(f)}%`,height:"100%",display:"flex",flexDirection:"column",alignItems:"center",transform:"translateX(-50%)"}}>
                <span style={{fontSize:8,color:"#3a3a3c",marginTop:2,whiteSpace:"nowrap"}}>{f/FPS}s</span>
                <div style={{width:1,height:5,background:"#2c2c2e",marginTop:"auto"}}/>
              </div>
            ))}
          </div>
          {/* Tracks */}
          {st.notifs.map((n,i)=>(
            <div key={n.id} style={{position:"absolute",top:RH+i*(TH+2),left:0,right:0,height:TH+2,borderBottom:"1px solid #111113",background:i%2===0?"#0a0a0c":"#0d0d0f"}}>
              <div onMouseDown={e=>onClipDown(e,n)} onTouchStart={e=>onClipDown(e,n)}
                style={{position:"absolute",top:2,height:TH-2,left:`${f2p(n.startFrame)}%`,width:`${f2p(n.duration)}%`,minWidth:4,
                  background:`${n.color}28`,border:`1px solid ${n.color}88`,borderRadius:4,
                  cursor:"grab",display:"flex",alignItems:"center",paddingLeft:5,overflow:"hidden"}}>
                <span style={{fontSize:9,color:n.color,fontWeight:700,whiteSpace:"nowrap"}}>{n.sender}</span>
              </div>
            </div>
          ))}
          {/* Playhead */}
          <div style={{position:"absolute",top:0,bottom:0,left:`${f2p(st.frame)}%`,pointerEvents:"none",zIndex:20}}>
            <div style={{position:"absolute",top:0,left:-5,width:10,height:13,background:"rgba(255,255,255,0.9)",clipPath:"polygon(0 0,100% 0,100% 55%,50% 100%,0 55%)"}}/>
            <div style={{width:1,height:"100%",background:"rgba(255,255,255,0.55)"}}/>
          </div>
        </div>
      </div>
    </div>
  );
}

function CB({ children, onClick, accent }) {
  return (
    <button onClick={onClick} style={{width:24,height:24,borderRadius:5,background:accent?"#ff453a22":"#1c1c1e",border:`1px solid ${accent?"#ff453a55":"#2c2c2e"}`,color:accent?"#ff453a":"#8e8e93",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",lineHeight:0}}>
      {children}
    </button>
  );
}

/* ── Top Bar ── */
function TopBar({ st, dispatch }) {
  return (
    <div style={{height:42,background:"#070709",borderBottom:"1px solid #1a1a1c",display:"flex",alignItems:"center",padding:"0 12px",gap:8,flexShrink:0}}>
      <div style={{display:"flex",alignItems:"center",gap:7}}>
        <div style={{width:24,height:24,borderRadius:7,background:"linear-gradient(135deg,#0a84ff,#5e5ce6)",display:"flex",alignItems:"center",justifyContent:"center",lineHeight:0}}>
          <Ico d={IC.film} size={11} color="#fff"/>
        </div>
        <span style={{fontSize:12,fontWeight:700,color:"#ebebf5",letterSpacing:-0.3}}>Lockscreen Studio</span>
      </div>
      <div style={{marginLeft:12,display:"flex",background:"#1c1c1e",borderRadius:6,padding:2,gap:1}}>
        {["iphone","android"].map(d=>(
          <button key={d} onClick={()=>dispatch({type:"SET",payload:{deviceType:d}})}
            style={{borderRadius:4,padding:"2px 9px",border:"none",cursor:"pointer",background:st.deviceType===d?"#0a84ff":"transparent",color:st.deviceType===d?"#fff":"#636366",fontSize:10,fontWeight:600,textTransform:"capitalize"}}>
            {d==="iphone"?"iPhone":"Android"}
          </button>
        ))}
      </div>
      <div style={{flex:1}}/>
      <button onClick={()=>alert("🎬 Cinematic Lockscreen Studio\n\nLive preview running in Claude artifact!\n\nTo export real MP4:\n  npm install\n  npm run remotion:render\n  → out/lockscreen.mp4 (1080×1920 · 30fps)")}
        style={{padding:"5px 11px",borderRadius:6,border:"none",background:"linear-gradient(135deg,#0a84ff,#5e5ce6)",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:5,boxShadow:"0 2px 10px rgba(10,132,255,0.4)"}}>
        <Ico d={IC.dl} size={11} color="#fff"/> Export
      </button>
    </div>
  );
}

/* ── Main App ── */
export default function App() {
  const [st, dispatch] = useReducer(reducer, INIT);

  return (
    <div style={{display:"flex",flexDirection:"column",width:"100%",height:"100vh",background:"#080809",fontFamily:"system-ui,-apple-system,sans-serif",color:"#ebebf5",overflow:"hidden"}}>
      <TopBar st={st} dispatch={dispatch}/>

      {/* Top: Timeline (Moved from Bottom) */}
      <div style={{flexShrink:0,borderBottom:"1px solid #1a1a1c"}}>
        <PanelHeader icon={IC.film} label="Timeline" style={{height:24}}/>
        <div style={{height:118}}><TimelineEditor st={st} dispatch={dispatch}/></div>
      </div>

      <div style={{flex:1,display:"flex",overflow:"hidden",minHeight:0}}>
        {/* Left: Properties */}
        <div style={{width:215,flexShrink:0,borderRight:"1px solid #1a1a1c",background:"#0a0a0c",display:"flex",flexDirection:"column",overflow:"hidden"}}>
          <PanelHeader icon={IC.layers} label="Properties"/>
          <div style={{flex:1,overflow:"hidden"}}><PropertiesPanel st={st} dispatch={dispatch}/></div>
        </div>

        {/* Center: Preview */}
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"#080809",position:"relative",overflow:"hidden",minWidth:0}}>
          <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(circle,#1a1a1e 1px,transparent 1px)",backgroundSize:"22px 22px",opacity:0.4}}/>
          <div style={{position:"absolute",top:8,left:10,fontSize:9,color:"#2c2c2e",fontFamily:"monospace",background:"#0d0d10",padding:"2px 7px",borderRadius:4,border:"1px solid #1a1a1c"}}>
            {st.totalFrames/FPS}s · 30fps · {st.totalFrames} frames
          </div>
          <div style={{position:"absolute",top:8,right:10,fontSize:9,color:"#2c2c2e",fontFamily:"monospace",background:"#0d0d10",padding:"2px 7px",borderRadius:4,border:"1px solid #1a1a1c"}}>
            f{st.frame}
          </div>
          <div style={{position:"relative",zIndex:10,filter:"drop-shadow(0 28px 56px rgba(0,0,0,0.8))"}}>
            <IPhoneLockscreen st={st} frame={st.frame}/>
          </div>
        </div>

        {/* Right: Assets */}
        <div style={{width:195,flexShrink:0,borderLeft:"1px solid #1a1a1c",background:"#0a0a0c",display:"flex",flexDirection:"column",overflow:"hidden"}}>
          <PanelHeader icon={IC.img} label="Assets"/>
          <div style={{flex:1,overflow:"hidden"}}><AssetManager st={st} dispatch={dispatch}/></div>
        </div>
      </div>
    </div>
  );
}

function PanelHeader({ icon, label, style={} }) {
  return (
    <div style={{height:28,display:"flex",alignItems:"center",padding:"0 10px",gap:6,borderBottom:"1px solid #1a1a1c",flexShrink:0,...style}}>
      <Ico d={icon} size={10} color="#0a84ff"/>
      <span style={{fontSize:9,color:"#3a3a3c",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em"}}>{label}</span>
    </div>
  );
}
