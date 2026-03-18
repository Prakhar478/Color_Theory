import { useRef, useEffect, useState, useCallback } from 'react';
import {
  motion, AnimatePresence,
  useMotionValue, useSpring,
} from 'framer-motion';
import { emitColor } from '../utils/colorBus';

// â”€â”€ Constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const SIZE  = 480;
const CX    = SIZE / 2;
const CY    = SIZE / 2;
const R_OUT = 196;
const R_IN  = 112;
const N     = 12;
const SEG   = (2 * Math.PI) / N;
const OFF   = -Math.PI / 2 - SEG / 2;
const TGAP  = 0.055;
const DOT_R = R_OUT + 28;
const DOT_W = 26;

const SEGS = [
  { name:'Yellow',     type:'secondary',    color:'#FFE000', rgb:'255,224,0'   },
  { name:'Orange',     type:'intermediate', color:'#FF8C00', rgb:'255,140,0'   },
  { name:'Red-Orange', type:'intermediate', color:'#FF4500', rgb:'255,69,0'    },
  { name:'Red',        type:'primary',      color:'#EE1111', rgb:'238,17,17'   },
  { name:'Red-Violet', type:'intermediate', color:'#CC1166', rgb:'204,17,102'  },
  { name:'Magenta',    type:'secondary',    color:'#DD00CC', rgb:'221,0,204'   },
  { name:'Violet',     type:'intermediate', color:'#7700CC', rgb:'119,0,204'   },
  { name:'Blue',       type:'primary',      color:'#1144EE', rgb:'17,68,238'   },
  { name:'Blue-Green', type:'intermediate', color:'#008877', rgb:'0,136,119'   },
  { name:'Cyan',       type:'secondary',    color:'#00CCCC', rgb:'0,204,204'   },
  { name:'Green',      type:'primary',      color:'#11AA22', rgb:'17,170,34'   },
  { name:'Yel-Green',  type:'intermediate', color:'#88CC00', rgb:'136,204,0'   },
];

const HARMONIES = {
  complementary: b => [b,(b+6)%N],
  analogous:     b => [(b+N-1)%N,b,(b+1)%N],
  triadic:       b => [b,(b+4)%N,(b+8)%N],
  split:         b => [b,(b+5)%N,(b+7)%N],
};
const HARMONY_KEYS   = ['none','complementary','analogous','triadic','split'];
const HARMONY_LABELS = { none:'Free Explore', complementary:'Complementary', analogous:'Analogous', triadic:'Triadic', split:'Split-Comp' };
const SCHEME_DESC = {
  none:          'Hover to preview. Click or drag to select. Choose a harmony scheme.',
  complementary: '<b style="color:#fff">Complementary</b> &mdash; directly opposite (180&deg;). Maximum contrast.',
  analogous:     '<b style="color:#fff">Analogous</b> &mdash; neighboring hues (&plusmn;30&deg;). Natural harmony.',
  triadic:       '<b style="color:#fff">Triadic</b> &mdash; three hues 120&deg; apart. Vibrant and balanced.',
  split:         '<b style="color:#fff">Split-Complementary</b> &mdash; base + two near-complement neighbors.',
};

// â”€â”€ Timing tokens â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const T_FAST   = { duration: 0.15, ease: 'easeOut' };
const T_MEDIUM = { duration: 0.25, ease: 'easeOut' };
const T_SLOW   = { duration: 0.40, ease: 'easeOut' };

// â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const segMid = i => OFF + (i + 0.5) * SEG;

function getSegAt(mx, my) {
  const dx = mx - CX, dy = my - CY;
  const d  = Math.sqrt(dx*dx + dy*dy);
  if (d < R_IN || d > R_OUT) return -1;
  let a = Math.atan2(dy, dx) - OFF;
  while (a < 0)          a += 2 * Math.PI;
  while (a >= 2 * Math.PI) a -= 2 * Math.PI;
  return Math.floor(a / SEG) % N;
}

function toCanvas(e, canvas) {
  const rect = canvas.getBoundingClientRect();
  const src  = e.touches ? e.touches[0] : e;
  return {
    cx:      (src.clientX - rect.left) * (SIZE / rect.width),
    cy:      (src.clientY - rect.top)  * (SIZE / rect.height),
    px:      ((src.clientX - rect.left) / rect.width)  * 100,
    py:      ((src.clientY - rect.top)  / rect.height) * 100,
    clientX: src.clientX,
    clientY: src.clientY,
    rect,
  };
}

function getTints(hex) {
  const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5),16);
  return Array.from({length:6},(_,i)=>{
    const t=(i+1)/7;
    return '#'+[Math.round(r+(255-r)*t),Math.round(g+(255-g)*t),Math.round(b+(255-b)*t)].map(v=>v.toString(16).padStart(2,'0')).join('');
  }).reverse();
}
function getShades(hex) {
  const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5),16);
  return Array.from({length:6},(_,i)=>{
    const t=(i+1)/7;
    return '#'+[r,g,b].map(v=>Math.round(v*(1-t)).toString(16).padStart(2,'0')).join('');
  });
}

// â”€â”€ Canvas draw â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// NO cursor dot drawn here â€” removed completely.
// Hover feedback is purely canvas: larger boost + stronger shadowBlur.
function drawWheel(ctx, hoverIdx, selIdx, activeArr, pulse) {
  ctx.clearRect(0, 0, SIZE, SIZE);

  SEGS.forEach((seg, i) => {
    const sa    = OFF + i*SEG + TGAP;
    const ea    = OFF + (i+1)*SEG - TGAP;
    const isAct = !activeArr || activeArr.includes(i);
    const isH   = hoverIdx === i;
    const isS   = selIdx   === i;

    // PROBLEM 1 FIX: bigger hover boost so segment itself brightens
    const boost = isH ? 16 + Math.sin(pulse)*2 : isS ? 6 : 0;
    const oR    = R_OUT + boost;

    const grd = ctx.createRadialGradient(CX,CY,R_IN+4,CX,CY,oR-2);
    if (isAct) {
      // Hover: brighter inner stop
      grd.addColorStop(0,    isH ? seg.color+'cc' : seg.color+'99');
      grd.addColorStop(0.45, isH ? seg.color+'ee' : seg.color+'cc');
      grd.addColorStop(1,    seg.color+'ff');
    } else {
      grd.addColorStop(0, seg.color+'0a');
      grd.addColorStop(1, seg.color+'20');
    }
    ctx.beginPath(); ctx.moveTo(CX,CY); ctx.arc(CX,CY,oR,sa,ea); ctx.closePath();
    ctx.fillStyle = grd; ctx.fill();

    // Sheen
    if (isAct) {
      const mid = segMid(i);
      const sh  = ctx.createLinearGradient(CX+R_IN*Math.cos(mid),CY+R_IN*Math.sin(mid),CX+oR*Math.cos(mid),CY+oR*Math.sin(mid));
      sh.addColorStop(0,   'rgba(255,255,255,0.22)');
      sh.addColorStop(0.3, 'rgba(255,255,255,0.07)');
      sh.addColorStop(1,   'rgba(255,255,255,0)');
      ctx.beginPath(); ctx.moveTo(CX,CY); ctx.arc(CX,CY,oR,sa,ea); ctx.closePath();
      ctx.fillStyle = sh; ctx.fill();
    }

    // Glow ring â€” PROBLEM 1 FIX: shadowBlur 28 on hover
    if (isH || isS) {
      ctx.save();
      ctx.beginPath(); ctx.arc(CX,CY,oR-3,sa+0.01,ea-0.01);
      ctx.strokeStyle = seg.color;
      ctx.lineWidth   = isH ? 7 : 3.5;
      ctx.shadowColor = seg.color;
      ctx.shadowBlur  = isH ? 28 + Math.sin(pulse)*5 : 14;
      ctx.stroke(); ctx.restore();
    }

    // Harmony outline
    if (isAct && activeArr) {
      ctx.save();
      ctx.beginPath(); ctx.arc(CX,CY,R_OUT-2,sa+0.01,ea-0.01);
      ctx.strokeStyle = seg.color+'aa'; ctx.lineWidth = 4;
      ctx.shadowColor = seg.color; ctx.shadowBlur = 10;
      ctx.stroke(); ctx.restore();
    }
  });

  // Separators
  for (let i = 0; i < N; i++) {
    const a = OFF + i*SEG;
    ctx.beginPath();
    ctx.moveTo(CX+R_IN*Math.cos(a),       CY+R_IN*Math.sin(a));
    ctx.lineTo(CX+(R_OUT+12)*Math.cos(a),  CY+(R_OUT+12)*Math.sin(a));
    ctx.strokeStyle = 'rgba(0,0,0,0.85)'; ctx.lineWidth = 5; ctx.stroke();
  }

  ctx.beginPath(); ctx.arc(CX,CY,R_OUT,0,Math.PI*2);
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1.5; ctx.stroke();

  const ig = ctx.createRadialGradient(CX-18,CY-18,0,CX,CY,R_IN);
  ig.addColorStop(0,'#1c1c2e'); ig.addColorStop(0.7,'#111120'); ig.addColorStop(1,'#0a0a16');
  ctx.beginPath(); ctx.arc(CX,CY,R_IN,0,Math.PI*2); ctx.fillStyle=ig; ctx.fill();
  ctx.beginPath(); ctx.arc(CX,CY,R_IN,0,Math.PI*2);
  ctx.strokeStyle='rgba(255,255,255,0.12)'; ctx.lineWidth=1.5; ctx.stroke();

  const tr = R_IN-22;
  const tp = idx => { const a=segMid(idx); return{x:CX+tr*Math.cos(a),y:CY+tr*Math.sin(a)}; };
  ctx.save(); ctx.setLineDash([]);
  const[pa,pb,pc]=[tp(3),tp(7),tp(10)];
  ctx.beginPath(); ctx.moveTo(pa.x,pa.y); ctx.lineTo(pb.x,pb.y); ctx.lineTo(pc.x,pc.y); ctx.closePath();
  ctx.strokeStyle='rgba(255,255,255,0.25)'; ctx.lineWidth=1.5; ctx.stroke();
  ctx.setLineDash([4,5]);
  const[pd,pe,pf]=[tp(0),tp(5),tp(9)];
  ctx.beginPath(); ctx.moveTo(pd.x,pd.y); ctx.lineTo(pe.x,pe.y); ctx.lineTo(pf.x,pf.y); ctx.closePath();
  ctx.strokeStyle='rgba(255,255,255,0.13)'; ctx.lineWidth=1.2; ctx.stroke();
  ctx.setLineDash([]); ctx.restore();

  // Labels â€” PROBLEM 4 FIX: dim inactive labels
  SEGS.forEach((seg,i)=>{
    const isAct = !activeArr || activeArr.includes(i);
    const isH   = hoverIdx===i, isS = selIdx===i;
    // Active = 1.0, selected = 0.95, hover = 1.0, inactive = 0.45
    const alpha = isH ? 1.0 : isS ? 0.95 : isAct ? (activeArr ? 0.9 : 0.72) : 0.45;
    const mid   = segMid(i);
    const lr    = (R_IN+R_OUT)/2 + (isH?6:isS?3:0);
    const lx    = CX+lr*Math.cos(mid), ly=CY+lr*Math.sin(mid);
    ctx.save(); ctx.translate(lx,ly);
    let rot=mid+Math.PI/2; if(Math.cos(mid)<-0.001) rot=mid-Math.PI/2;
    ctx.rotate(rot);
    ctx.shadowColor='rgba(0,0,0,0.95)'; ctx.shadowBlur=10;
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillStyle='rgba(255,255,255,'+alpha+')';
    ctx.font='bold '+(isH?12:11)+'px "Inter",sans-serif';
    ctx.fillText(seg.name.toUpperCase(),0,-7);
    const tc=seg.type==='primary'
      ?'rgba(232,255,71,'+(alpha*0.9)+')'
      :seg.type==='secondary'
        ?'rgba(160,225,255,'+(alpha*0.85)+')'
        :'rgba(180,180,180,'+(alpha*0.5)+')';
    ctx.fillStyle=tc; ctx.font='8px "Inter",sans-serif';
    ctx.fillText(seg.type,0,6); ctx.shadowBlur=0; ctx.restore();
  });
}

// â”€â”€ Copy button â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function CopyButton({ hex }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    if (!hex) return;
    navigator.clipboard.writeText(hex).catch(()=>{});
    setCopied(true); setTimeout(()=>setCopied(false),1600);
  };
  return (
    <motion.button onClick={handle}
      whileHover={{
        boxShadow: copied ? '0 0 22px rgba(100,255,150,0.35)' : '0 0 22px rgba(255,255,255,0.12)',
        y: -1,
      }}
      whileTap={{ scale:0.95 }}
      animate={{
        background:  copied?'rgba(100,255,150,0.14)':'rgba(255,255,255,0.07)',
        borderColor: copied?'rgba(100,255,150,0.5)' :'rgba(255,255,255,0.13)',
        color:       copied?'#6fffaa':'rgba(255,255,255,0.72)',
      }}
      transition={T_FAST}
      style={{
        width:'100%', padding:'0.65rem', borderRadius:'12px',
        border:'1px solid rgba(255,255,255,0.13)',
        fontSize:'0.72rem', fontWeight:600, cursor:'pointer',
        letterSpacing:'.08em', fontFamily:"'Inter',sans-serif",
      }}
    >
      {copied ? '\u2713 COPIED' : 'COPY HEX ' + hex}
    </motion.button>
  );
}

// â”€â”€ Main â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function ColorWheel() {
  const canvasRef   = useRef(null);
  const wrapRef     = useRef(null);
  const animRef     = useRef(null);
  const pulseRef    = useRef(0);
  const isDragging  = useRef(false);
  const hoverRef    = useRef(-1);

  const [selIdx,      setSelIdx]      = useState(-1);
  const [hoverIdx,    setHoverIdx]    = useState(-1);
  const [committed,   setCommitted]   = useState(null);
  const [previewCol,  setPreviewCol]  = useState(null);
  const [scheme,      setScheme]      = useState('none');
  const [ripples,     setRipples]     = useState([]);
  const [wheelScale,  setWheelScale]  = useState(1);
  const [selectorKey, setSelectorKey] = useState(0);
  const [tiltX,       setTiltX]       = useState(0);
  const [tiltY,       setTiltY]       = useState(0);
  const [canvasScale, setCanvasScale] = useState(1);

  // Scale wheel to fit mobile screen
  // The outer dots extend ~28px beyond the 480px canvas on each side
  // So total visual width = 480 + 56 = 536px. We scale to fit that.
  useEffect(() => {
    const updateScale = () => {
      const VISUAL = SIZE + 56; // dots overflow
      // Use 88% of screen on mobile so wheel doesn't touch edges
      const padding = window.innerWidth < 600 ? 40 : 16;
      const available = Math.min(window.innerWidth - padding, VISUAL);
      setCanvasScale(Math.min(available / VISUAL, 1));
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // Selector spring â€” follows cursor while dragging, snaps to seg center otherwise
  const selX = useMotionValue(CX);
  const selY = useMotionValue(CY);
  const smSelX = useSpring(selX, { stiffness:320, damping:26 });
  const smSelY = useSpring(selY, { stiffness:320, damping:26 });

  const activeArr     = scheme==='none'||selIdx<0 ? null : HARMONIES[scheme]?.(selIdx);
  const harmonyColors = activeArr ? activeArr.map(i=>SEGS[i]) : [];
  const displayColor  = committed || previewCol;

  // 60fps loop
  useEffect(()=>{
    const loop=()=>{
      pulseRef.current+=0.065;
      const c=canvasRef.current;
      if(c) drawWheel(c.getContext('2d'),hoverRef.current,selIdx,activeArr,pulseRef.current);
      animRef.current=requestAnimationFrame(loop);
    };
    animRef.current=requestAnimationFrame(loop);
    return()=>cancelAnimationFrame(animRef.current);
  },[selIdx,scheme]);

  // Commit segment
  const commitSeg = useCallback((segI, rawCX, rawCY, canvasRect)=>{
    if (segI<0) return;
    const seg = SEGS[segI];
    setSelIdx(segI);
    setCommitted(seg);
    setSelectorKey(k=>k+1);

    if (canvasRect) {
      const px=((rawCX-canvasRect.left)/canvasRect.width)*100;
      const py=((rawCY-canvasRect.top)/canvasRect.height)*100;
      const id=Date.now();
      setRipples(p=>[...p,{id,px,py,color:seg.color}]);
      setTimeout(()=>setRipples(p=>p.filter(r=>r.id!==id)),400);
    }
    setWheelScale(0.968);
    setTimeout(()=>setWheelScale(1),170);
  },[]);

  // Mouse handlers
  const onMouseDown=useCallback(e=>{
    isDragging.current=true;
    const c=canvasRef.current; if(!c) return;
    const r=toCanvas(e,c);
    commitSeg(getSegAt(r.cx,r.cy),r.clientX,r.clientY,r.rect);
  },[commitSeg]);

  const onMouseMove=useCallback(e=>{
    const c=canvasRef.current; if(!c) return;
    const r=toCanvas(e,c);
    const segI=getSegAt(r.cx,r.cy);

    if (isDragging.current && segI>=0) {
      selX.set(r.cx); selY.set(r.cy);
      commitSeg(segI,r.clientX,r.clientY,r.rect);
    } else if (!isDragging.current && selIdx>=0) {
      const mid=segMid(selIdx);
      const dr=(R_IN+R_OUT)/2;
      selX.set(CX+dr*Math.cos(mid));
      selY.set(CY+dr*Math.sin(mid));
    }

    hoverRef.current=segI;
    setHoverIdx(segI);
    setPreviewCol(segI>=0?SEGS[segI]:(committed||null));
    c.style.cursor=segI>=0?'crosshair':'default';

    // 3D tilt â€” max 3deg
    const wr=wrapRef.current?.getBoundingClientRect();
    if(wr){
      const nx=(e.clientX-wr.left)/wr.width-0.5;
      const ny=(e.clientY-wr.top)/wr.height-0.5;
      setTiltX(-ny*3); setTiltY(nx*3);
    }
  },[commitSeg,committed,selIdx]);

  const onMouseLeave=useCallback(()=>{
    isDragging.current=false;
    hoverRef.current=-1;
    setHoverIdx(-1);
    setPreviewCol(committed||null);
    setTiltX(0); setTiltY(0);
    if(canvasRef.current) canvasRef.current.style.cursor='default';
    if(selIdx>=0){
      const mid=segMid(selIdx);
      const dr=(R_IN+R_OUT)/2;
      selX.set(CX+dr*Math.cos(mid));
      selY.set(CY+dr*Math.sin(mid));
    }
  },[committed,selIdx]);

  const onMouseUp=useCallback(()=>{ isDragging.current=false; },[]);

  const onTouchStart=useCallback(e=>{
    e.preventDefault(); isDragging.current=true;
    const c=canvasRef.current; if(!c) return;
    const r=toCanvas(e,c);
    commitSeg(getSegAt(r.cx,r.cy),r.clientX,r.clientY,r.rect);
  },[commitSeg]);
  const onTouchMove=useCallback(e=>{
    e.preventDefault();
    const c=canvasRef.current; if(!c) return;
    const r=toCanvas(e,c);
    const segI=getSegAt(r.cx,r.cy);
    if(segI>=0){ selX.set(r.cx); selY.set(r.cy); commitSeg(segI,r.clientX,r.clientY,r.rect); }
  },[commitSeg]);
  const onTouchEnd=useCallback(()=>{ isDragging.current=false; },[]);

  useEffect(()=>{
    window.addEventListener('mouseup',onMouseUp);
    return()=>window.removeEventListener('mouseup',onMouseUp);
  },[onMouseUp]);

  useEffect(()=>{
    if(selIdx>=0){
      const mid=segMid(selIdx);
      const dr=(R_IN+R_OUT)/2;
      selX.set(CX+dr*Math.cos(mid));
      selY.set(CY+dr*Math.sin(mid));
    }
  },[]);

  const tints   = committed?getTints(committed.color):[];
  const shades  = committed?getShades(committed.color):[];
  const typeTag = committed
    ?committed.type==='primary'?'Primary':committed.type==='secondary'?'Secondary':'Intermediate'
    :'';

  return (
    <motion.section
      id="wheel-section"
      initial={{ opacity:0, y:20 }}
      animate={{ opacity:1, y:0 }}
      transition={T_SLOW}
      style={{ textAlign:'center', paddingBottom:'5rem', overflowX:'hidden' }}
    >
      {/* PROBLEM 2 FIX: Clash Display heading, Inter body */}
      <div className="section-label" style={{ display:'inline-block' }}>Part 01 &mdash; Color Wheel</div>
      <h2 className="section-title" style={{ fontFamily:"'Clash Display',sans-serif", fontWeight:600, letterSpacing:'-0.02em' }}>
        Pick a color.<br />See its family.
      </h2>
      <p className="section-desc" style={{ margin:'0 auto 2rem', fontFamily:"'Inter',sans-serif", fontSize:'0.85rem', color:'rgba(255,255,255,0.55)' }}>
        Hover to preview &middot; Click or drag to select &middot; Choose a harmony scheme
      </p>

      {/* Harmony tabs — grid on mobile */}
      <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))',gap:'0.45rem',justifyContent:'center',margin:'0 auto 2rem',maxWidth:'560px',padding:'0 1rem' }}>
        {HARMONY_KEYS.map(k=>(
          <motion.button key={k} onClick={()=>setScheme(k)}
            whileTap={{ scale:0.94 }}
            animate={{
              border:     scheme===k?'1.5px solid #e8ff47'          :'1px solid rgba(255,255,255,0.1)',
              background: scheme===k?'rgba(232,255,71,0.12)'        :'rgba(255,255,255,0.04)',
              color:      scheme===k?'#e8ff47'                      :'rgba(255,255,255,0.45)',
              boxShadow:  scheme===k?'0 0 20px rgba(232,255,71,0.2)':'none',
            }}
            transition={T_FAST}
            style={{ padding:'0.5rem 0.8rem',borderRadius:'10px',cursor:'pointer',fontSize:'0.73rem',fontFamily:"'Inter',sans-serif",letterSpacing:'0.04em',textTransform:'uppercase',textAlign:'center' }}
          >{HARMONY_LABELS[k]}</motion.button>
        ))}
      </div>

      {/* Main layout */}
      <div style={{ display:'flex',gap:'2rem',alignItems:'flex-start',justifyContent:'center',flexWrap:'wrap',maxWidth:'1100px',margin:'0 auto',padding:'0 0.5rem' }}>

        {/* Wheel — responsive wrapper scales canvas to fit */}
        <div style={{
          width: '100%',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          height: (SIZE * canvasScale) + 'px',
        }}>
        <div
          ref={wrapRef}
          style={{
            position: 'relative',
            width: SIZE + 'px',
            height: SIZE + 'px',
            flexShrink: 0,
            transformOrigin: 'top center',
            transform: 'scale(' + canvasScale + ')',
          }}
        >

          {/* Ambient glow */}
          <motion.div
            animate={{ opacity:displayColor?1:0 }}
            transition={T_SLOW}
            style={{
              position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',
              width:'420px',height:'420px',borderRadius:'50%',
              background:displayColor?'radial-gradient(circle,'+displayColor.color+'40 0%,'+displayColor.color+'10 48%,transparent 70%)':'transparent',
              pointerEvents:'none',zIndex:0,filter:'blur(10px)',
              transition:'background 0.4s easeOut',
            }}
          />

          {/* Ripples â€” snappy 0.25s */}
          <AnimatePresence>
            {ripples.map(r=>(
              <motion.div key={r.id}
                initial={{ scale:0, opacity:0.5, x:'-50%', y:'-50%' }}
                animate={{ scale:2.5, opacity:0 }}
                exit={{ opacity:0 }}
                transition={{ duration:0.25, ease:'easeOut' }}
                style={{
                  position:'absolute',left:r.px+'%',top:r.py+'%',
                  width:'44px',height:'44px',borderRadius:'50%',
                  border:'2px solid '+r.color,
                  background:'radial-gradient(circle,'+r.color+'44 0%,transparent 70%)',
                  pointerEvents:'none',zIndex:22,
                }}
              />
            ))}
          </AnimatePresence>

          {/* Canvas â€” PROBLEM 7 FIX: subtle breathing animation */}
          <motion.canvas
            ref={canvasRef}
            width={SIZE} height={SIZE}
            animate={{
              scale:   1,
              rotateX: tiltX,
              rotateY: tiltY,
            }}
            transition={{
              scale:   { type:'spring',stiffness:600,damping:22 },
              rotateX: T_FAST,
              rotateY: T_FAST,
            }}
            style={{
              width:SIZE+'px',height:SIZE+'px',display:'block',
              position:'relative',zIndex:1,touchAction:'none',
              transformStyle:'preserve-3d',
            }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          />

          {/* PROBLEM 1 FIX: cursor dot REMOVED completely */}

          {/* Selector dot â€” colored, spring physics */}
          <AnimatePresence>
            {committed&&(
              <motion.div
                key={'sel-'+selectorKey}
                initial={{ scale:0, opacity:0 }}
                animate={{ scale:[0,1.5,1], opacity:1 }}
                exit={{ scale:0, opacity:0 }}
                transition={{ duration:0.28, ease:[0.34,1.56,0.64,1] }}
                style={{
                  position:'absolute', left:0, top:0,
                  x:smSelX, y:smSelY,
                  translateX:'-50%', translateY:'-50%',
                  width:'20px', height:'20px', borderRadius:'50%',
                  background:committed.color,
                  border:'3px solid rgba(255,255,255,0.95)',
                  boxShadow:'0 0 0 2px '+committed.color+', 0 0 40px 8px '+committed.color+'88, 0 0 120px '+committed.color+'44',
                  pointerEvents:'none', zIndex:30,
                }}
              />
            )}
          </AnimatePresence>

          {/* Outer dots â€” PROBLEM 4 FIX: smaller, dimmer when inactive */}
          {SEGS.map((seg,i)=>{
            const mid  = segMid(i);
            const dotX = CX+DOT_R*Math.cos(mid)-DOT_W/2;
            const dotY = CY+DOT_R*Math.sin(mid)-DOT_W/2;
            const isAct = activeArr?activeArr.includes(i):selIdx===i;
            const isDim = activeArr?!activeArr.includes(i):false;
            return(
              <motion.div key={i} title={seg.name}
                onClick={()=>commitSeg(i,0,0,null)}
                onMouseEnter={()=>{ hoverRef.current=i; setPreviewCol(SEGS[i]); }}
                onMouseLeave={()=>{ hoverRef.current=selIdx; setPreviewCol(committed||null); }}
                whileHover={{ scale:1.35 }}
                whileTap={{ scale:0.85 }}
                animate={{
                  scale:     isDim?0.68:isAct?1.32:1,
                  opacity:   isDim?0.1:isAct?1:0.5,
                  boxShadow: isAct?'0 0 0 3px rgba(255,255,255,0.22),0 0 18px 5px '+seg.color+'88':'0 2px 8px rgba(0,0,0,0.5)',
                }}
                transition={T_FAST}
                style={{
                  position:'absolute',left:dotX+'px',top:dotY+'px',
                  width:DOT_W+'px',height:DOT_W+'px',borderRadius:'50%',
                  background:seg.color,cursor:'pointer',
                  border:isAct?'2.5px solid white':'1.5px solid rgba(255,255,255,0.28)',
                  zIndex:isAct?10:2,
                }}
              />
            );
          })}

          {/* PROBLEM 3 FIX: center circle 118â†’140px, stronger glow */}
          <motion.div
            animate={{
              background:  displayColor?displayColor.color+'1a':'rgba(10,10,22,0.92)',
              borderColor: displayColor?displayColor.color+'55':'rgba(255,255,255,0.1)',
              boxShadow:   displayColor
                ?'0 0 140px '+displayColor.color+'55,0 0 60px '+displayColor.color+'40,inset 0 1px 0 rgba(255,255,255,0.1)'
                :'none',
            }}
            transition={T_MEDIUM}
            style={{
              position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',
              width:'140px',height:'140px',borderRadius:'50%',
              border:'1.5px solid rgba(255,255,255,0.1)',
              display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'4px',
              pointerEvents:'none',backdropFilter:'blur(24px)',zIndex:5,
            }}
          >
            <AnimatePresence mode="wait">
              {displayColor?(
                <motion.div key={displayColor.name}
                  initial={{ opacity:0,scale:0.82 }} animate={{ opacity:1,scale:1 }} exit={{ opacity:0,scale:0.82 }}
                  transition={T_FAST}
                  style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:'4px' }}
                >
                  <motion.div
                    animate={{ background:displayColor.color, boxShadow:'0 0 18px '+displayColor.color+'bb' }}
                    transition={T_MEDIUM}
                    style={{ width:32,height:32,borderRadius:'50%',border:'2.5px solid rgba(255,255,255,0.4)',marginBottom:'2px' }}
                  />
                  {/* PROBLEM 2 FIX: Clash Display name, monospace hex */}
                  <span style={{ fontFamily:"'Clash Display',sans-serif",fontSize:'0.75rem',fontWeight:600,color:'white',textAlign:'center',padding:'0 8px',lineHeight:1.1,letterSpacing:'-0.01em' }}>{displayColor.name}</span>
                  <span style={{ fontFamily:'monospace',fontSize:'0.5rem',color:'rgba(255,255,255,0.45)',letterSpacing:'.04em' }}>{displayColor.color}</span>
                </motion.div>
              ):(
                <motion.span key="empty" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                  style={{ fontFamily:"'Inter',sans-serif",fontSize:'0.62rem',color:'rgba(255,255,255,0.22)',textAlign:'center',padding:'0 12px',lineHeight:1.6 }}
                >Hover<br/>a color</motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
        </div>{/* end responsive wheel wrapper */}

        {/* Right panel */}
        <div style={{ flex:'0 0 320px',minWidth:'min(320px,100%)',width:'100%',maxWidth:'480px',textAlign:'left',display:'flex',flexDirection:'column',gap:'1rem',padding:'0 0.5rem' }}>

          {/* PROBLEM 6 FIX: stronger glass panels */}
          <motion.div
            animate={{
              borderColor: committed?committed.color+'44':'rgba(255,255,255,0.12)',
              boxShadow:   committed
                ?'0 0 120px '+committed.color+'30,0 0 40px '+committed.color+'18,0 10px 40px rgba(0,0,0,0.6)'
                :'0 10px 40px rgba(0,0,0,0.6)',
            }}
            transition={T_MEDIUM}
            style={{
              borderRadius:'20px',overflow:'hidden',
              border:'1px solid rgba(255,255,255,0.12)',
              background:'rgba(255,255,255,0.06)',
              backdropFilter:'blur(30px)',
              boxShadow:'0 10px 40px rgba(0,0,0,0.6)',
            }}
          >
            <motion.div
              animate={{ background:committed?committed.color:'rgba(255,255,255,0.04)' }}
              transition={T_MEDIUM}
              style={{ height:'110px',position:'relative' }}
            >
              {committed&&<div style={{ position:'absolute',inset:0,background:'linear-gradient(135deg,rgba(255,255,255,0.18) 0%,transparent 55%)' }}/>}
              {committed&&(
                <div style={{ position:'absolute',bottom:'0.7rem',left:'0.9rem',fontSize:'0.58rem',fontWeight:700,color:'rgba(255,255,255,0.6)',letterSpacing:'.14em',textTransform:'uppercase',fontFamily:"'Inter',sans-serif" }}>
                  {typeTag}
                </div>
              )}
            </motion.div>

            <div style={{ padding:'1.2rem' }}>
              <AnimatePresence mode="wait">
                {committed?(
                  <motion.div key={committed.name}
                    initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:-8 }}
                    transition={T_MEDIUM}
                  >
                    {/* PROBLEM 2 FIX: large Clash Display name */}
                    <div style={{ fontFamily:"'Clash Display',sans-serif",fontSize:'1.6rem',fontWeight:600,color:'white',marginBottom:'0.05rem',letterSpacing:'-0.02em',lineHeight:1.1 }}>
                      {committed.name}
                    </div>
                    {/* Big monospace HEX */}
                    <div style={{ fontFamily:'monospace',fontSize:'1.05rem',fontWeight:700,color:'rgba(255,255,255,0.88)',marginBottom:'0.15rem',letterSpacing:'0.03em' }}>
                      {committed.color}
                    </div>
                    <div style={{ fontFamily:"'Inter',sans-serif",fontSize:'0.72rem',color:'rgba(255,255,255,0.35)',marginBottom:'1rem' }}>
                      rgb({committed.rgb})
                    </div>
                    <CopyButton hex={committed.color}/>
                  </motion.div>
                ):(
                  <motion.div key="empty" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                    style={{ fontFamily:"'Inter',sans-serif",color:'rgba(255,255,255,0.2)',fontSize:'0.82rem',textAlign:'center',padding:'0.5rem 0' }}
                  >Select a color from the wheel</motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Harmony palette */}
          <AnimatePresence>
            {harmonyColors.length>0&&(
              <motion.div
                initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:10 }}
                transition={T_MEDIUM}
                style={{ borderRadius:'20px',border:'1px solid rgba(255,255,255,0.12)',background:'rgba(255,255,255,0.06)',backdropFilter:'blur(30px)',padding:'1.1rem',boxShadow:'0 10px 40px rgba(0,0,0,0.5)' }}
              >
                <div style={{ fontFamily:"'Inter',sans-serif",fontSize:'0.6rem',color:'rgba(255,255,255,0.3)',letterSpacing:'.15em',textTransform:'uppercase',marginBottom:'0.85rem' }}>{scheme} palette</div>
                <div style={{ display:'flex',gap:'0.5rem' }}>
                  {harmonyColors.map((seg,k)=>(
                    <motion.div key={k}
                      whileHover={{ y:-4,boxShadow:'0 8px 24px '+seg.color+'55',transition:T_FAST }}
                      whileTap={{ scale:0.94 }}
                      onClick={()=>commitSeg(activeArr[k])}
                      style={{ flex:1,cursor:'pointer',borderRadius:'12px',overflow:'hidden',border:'1px solid rgba(255,255,255,0.1)' }}
                    >
                      <div style={{ height:'52px',background:seg.color,position:'relative' }}>
                        <div style={{ position:'absolute',inset:0,background:'linear-gradient(135deg,rgba(255,255,255,0.15) 0%,transparent 60%)' }}/>
                      </div>
                      <div style={{ padding:'0.4rem 0.5rem',background:'rgba(0,0,0,0.35)' }}>
                        <div style={{ fontFamily:"'Inter',sans-serif",fontSize:'0.58rem',fontWeight:600,color:'white',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{seg.name}</div>
                        <div style={{ fontFamily:'monospace',fontSize:'0.5rem',color:'rgba(255,255,255,0.3)' }}>{seg.color}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tints + shades */}
          <AnimatePresence>
            {committed&&(
              <motion.div
                initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}
                transition={T_MEDIUM}
                style={{ borderRadius:'20px',border:'1px solid rgba(255,255,255,0.12)',background:'rgba(255,255,255,0.06)',backdropFilter:'blur(30px)',padding:'1.1rem',boxShadow:'0 10px 40px rgba(0,0,0,0.5)' }}
              >
                <div style={{ fontFamily:"'Inter',sans-serif",fontSize:'0.6rem',color:'rgba(255,255,255,0.3)',letterSpacing:'.15em',textTransform:'uppercase',marginBottom:'0.65rem' }}>Tints &amp; Shades</div>
                <div style={{ display:'flex',gap:'3px',borderRadius:'10px',overflow:'hidden',height:'48px' }}>
                  {[...tints.slice().reverse(),committed.color,...shades].map((h,k)=>(
                    <motion.div key={k} title={h}
                      whileHover={{ scaleY:1.14,zIndex:5,transition:T_FAST }}
                      style={{ flex:1,background:h,cursor:'pointer',originY:'bottom' }}
                    />
                  ))}
                </div>
                <div style={{ display:'flex',justifyContent:'space-between',fontFamily:"'Inter',sans-serif",fontSize:'0.52rem',color:'rgba(255,255,255,0.18)',marginTop:'0.4rem' }}>
                  <span>lighter</span><span>pure</span><span>darker</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scheme description */}
          <motion.div
            animate={{ borderColor:committed?committed.color+'22':'rgba(255,255,255,0.07)' }}
            transition={T_SLOW}
            style={{ borderRadius:'14px',padding:'0.95rem 1.1rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',fontFamily:"'Inter',sans-serif",fontSize:'0.79rem',color:'rgba(255,255,255,0.45)',lineHeight:1.8,backdropFilter:'blur(12px)' }}
            dangerouslySetInnerHTML={{ __html:SCHEME_DESC[scheme]||'' }}
          />
        </div>
      </div>

      {/* Legend */}
      <div style={{ display:'flex',gap:'2rem',justifyContent:'center',marginTop:'2.5rem',flexWrap:'wrap' }}>
        <div style={{ display:'flex',alignItems:'center',gap:'0.45rem',fontFamily:"'Inter',sans-serif",fontSize:'0.65rem',color:'rgba(255,255,255,0.3)' }}>
          <div style={{ width:9,height:9,borderRadius:'50%',background:'rgba(255,255,255,0.45)' }}/>Solid = Primaries (R, G, B)
        </div>
        <div style={{ display:'flex',alignItems:'center',gap:'0.45rem',fontFamily:"'Inter',sans-serif",fontSize:'0.65rem',color:'rgba(255,255,255,0.22)' }}>
          <div style={{ width:9,height:3,background:'rgba(255,255,255,0.25)',borderRadius:2 }}/>Dashed = Secondaries (Y, C, M)
        </div>
      </div>
    </motion.section>
  );
}