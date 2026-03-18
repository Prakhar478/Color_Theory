import { useRef, useEffect, useState, useCallback } from 'react';
import {
  motion, AnimatePresence,
  useMotionValue, useSpring, useTransform,
} from 'framer-motion';

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
const DOT_R = R_OUT + 30;
const DOT_W = 30;

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
  none:          'Hover to preview color. Click or drag to select. Choose a harmony scheme.',
  complementary: '<b style="color:#fff">Complementary</b> &mdash; directly opposite (180&deg;). Maximum contrast.',
  analogous:     '<b style="color:#fff">Analogous</b> &mdash; neighboring hues (&plusmn;30&deg;). Natural harmony.',
  triadic:       '<b style="color:#fff">Triadic</b> &mdash; three hues 120&deg; apart. Vibrant and balanced.',
  split:         '<b style="color:#fff">Split-Complementary</b> &mdash; base + two near-complement neighbors.',
};

// â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const segMid = i => OFF + (i + 0.5) * SEG;

function getSegAt(mx, my) {
  const dx = mx - CX, dy = my - CY;
  const d  = Math.sqrt(dx*dx + dy*dy);
  if (d < R_IN || d > R_OUT) return -1;
  let a = Math.atan2(dy, dx) - OFF;
  while (a < 0)          a += 2*Math.PI;
  while (a >= 2*Math.PI) a -= 2*Math.PI;
  return Math.floor(a / SEG) % N;
}

// Returns true canvas coords + raw client coords + bounding rect
function toCanvas(e, canvas) {
  const rect = canvas.getBoundingClientRect();
  const src  = e.touches ? e.touches[0] : e;
  return {
    cx:      (src.clientX - rect.left) * (SIZE / rect.width),
    cy:      (src.clientY - rect.top)  * (SIZE / rect.height),
    // percentage position inside the wrapper div (for ripple / cursor dot)
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
function drawWheel(ctx, hoverIdx, selIdx, activeArr, pulse) {
  ctx.clearRect(0, 0, SIZE, SIZE);

  SEGS.forEach((seg, i) => {
    const sa    = OFF + i*SEG + TGAP;
    const ea    = OFF + (i+1)*SEG - TGAP;
    const isAct = !activeArr || activeArr.includes(i);
    const isH   = hoverIdx === i;
    const isS   = selIdx   === i;
    const boost = isH ? 11+Math.sin(pulse)*2.5 : isS ? 5 : 0;
    const oR    = R_OUT + boost;

    const grd = ctx.createRadialGradient(CX,CY,R_IN+4,CX,CY,oR-2);
    if (isAct) {
      grd.addColorStop(0,    seg.color+'99');
      grd.addColorStop(0.45, seg.color+'cc');
      grd.addColorStop(1,    seg.color+'ff');
    } else {
      grd.addColorStop(0, seg.color+'0a');
      grd.addColorStop(1, seg.color+'20');
    }
    ctx.beginPath(); ctx.moveTo(CX,CY); ctx.arc(CX,CY,oR,sa,ea); ctx.closePath();
    ctx.fillStyle=grd; ctx.fill();

    if (isAct) {
      const mid=segMid(i);
      const sh=ctx.createLinearGradient(CX+R_IN*Math.cos(mid),CY+R_IN*Math.sin(mid),CX+oR*Math.cos(mid),CY+oR*Math.sin(mid));
      sh.addColorStop(0,'rgba(255,255,255,0.22)');
      sh.addColorStop(0.3,'rgba(255,255,255,0.07)');
      sh.addColorStop(1,'rgba(255,255,255,0)');
      ctx.beginPath(); ctx.moveTo(CX,CY); ctx.arc(CX,CY,oR,sa,ea); ctx.closePath();
      ctx.fillStyle=sh; ctx.fill();
    }

    if (isH||isS) {
      ctx.save();
      ctx.beginPath(); ctx.arc(CX,CY,oR-3,sa+0.01,ea-0.01);
      ctx.strokeStyle=seg.color; ctx.lineWidth=isH?6:3.5;
      ctx.shadowColor=seg.color; ctx.shadowBlur=isH?20+Math.sin(pulse)*5:12;
      ctx.stroke(); ctx.restore();
    }

    if (isAct&&activeArr) {
      ctx.save();
      ctx.beginPath(); ctx.arc(CX,CY,R_OUT-2,sa+0.01,ea-0.01);
      ctx.strokeStyle=seg.color+'aa'; ctx.lineWidth=4;
      ctx.shadowColor=seg.color; ctx.shadowBlur=10;
      ctx.stroke(); ctx.restore();
    }
  });

  for (let i=0;i<N;i++) {
    const a=OFF+i*SEG;
    ctx.beginPath();
    ctx.moveTo(CX+R_IN*Math.cos(a),CY+R_IN*Math.sin(a));
    ctx.lineTo(CX+(R_OUT+12)*Math.cos(a),CY+(R_OUT+12)*Math.sin(a));
    ctx.strokeStyle='rgba(0,0,0,0.85)'; ctx.lineWidth=5; ctx.stroke();
  }

  ctx.beginPath(); ctx.arc(CX,CY,R_OUT,0,Math.PI*2);
  ctx.strokeStyle='rgba(255,255,255,0.08)'; ctx.lineWidth=1.5; ctx.stroke();

  const ig=ctx.createRadialGradient(CX-18,CY-18,0,CX,CY,R_IN);
  ig.addColorStop(0,'#1c1c2e'); ig.addColorStop(0.7,'#111120'); ig.addColorStop(1,'#0a0a16');
  ctx.beginPath(); ctx.arc(CX,CY,R_IN,0,Math.PI*2); ctx.fillStyle=ig; ctx.fill();
  ctx.beginPath(); ctx.arc(CX,CY,R_IN,0,Math.PI*2);
  ctx.strokeStyle='rgba(255,255,255,0.12)'; ctx.lineWidth=1.5; ctx.stroke();

  const tr=R_IN-22;
  const tp=idx=>{ const a=segMid(idx); return{x:CX+tr*Math.cos(a),y:CY+tr*Math.sin(a)}; };
  ctx.save(); ctx.setLineDash([]);
  const[pa,pb,pc]=[tp(3),tp(7),tp(10)];
  ctx.beginPath(); ctx.moveTo(pa.x,pa.y); ctx.lineTo(pb.x,pb.y); ctx.lineTo(pc.x,pc.y); ctx.closePath();
  ctx.strokeStyle='rgba(255,255,255,0.25)'; ctx.lineWidth=1.5; ctx.stroke();
  ctx.setLineDash([4,5]);
  const[pd,pe,pf]=[tp(0),tp(5),tp(9)];
  ctx.beginPath(); ctx.moveTo(pd.x,pd.y); ctx.lineTo(pe.x,pe.y); ctx.lineTo(pf.x,pf.y); ctx.closePath();
  ctx.strokeStyle='rgba(255,255,255,0.13)'; ctx.lineWidth=1.2; ctx.stroke();
  ctx.setLineDash([]); ctx.restore();

  SEGS.forEach((seg,i)=>{
    const isAct=!activeArr||activeArr.includes(i);
    const isH=hoverIdx===i,isS=selIdx===i;
    const alpha=isH||isS?1:isAct?0.88:0.07;
    const mid=segMid(i);
    const lr=(R_IN+R_OUT)/2+(isH?5:isS?3:0);
    const lx=CX+lr*Math.cos(mid),ly=CY+lr*Math.sin(mid);
    ctx.save(); ctx.translate(lx,ly);
    let rot=mid+Math.PI/2; if(Math.cos(mid)<-0.001) rot=mid-Math.PI/2;
    ctx.rotate(rot);
    ctx.shadowColor='rgba(0,0,0,0.95)'; ctx.shadowBlur=10;
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillStyle='rgba(255,255,255,'+alpha+')';
    ctx.font='bold '+(isH?12:11)+'px "Space Grotesk",sans-serif';
    ctx.fillText(seg.name.toUpperCase(),0,-7);
    const tc=seg.type==='primary'?'rgba(232,255,71,'+(alpha*0.9)+')':seg.type==='secondary'?'rgba(160,225,255,'+(alpha*0.85)+')':'rgba(180,180,180,'+(alpha*0.55)+')';
    ctx.fillStyle=tc; ctx.font='8.5px "Space Grotesk",sans-serif';
    ctx.fillText(seg.type,0,6); ctx.shadowBlur=0; ctx.restore();
  });
}

// â”€â”€ Copy button â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function CopyButton({ hex, color }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    if (!hex) return;
    navigator.clipboard.writeText(hex).catch(()=>{});
    setCopied(true); setTimeout(()=>setCopied(false),1600);
  };
  return (
    <motion.button onClick={handle}
      whileTap={{ scale:0.94 }}
      animate={{
        background:  copied?'rgba(100,255,150,0.14)':'rgba(255,255,255,0.07)',
        borderColor: copied?'rgba(100,255,150,0.5)' :'rgba(255,255,255,0.13)',
        color:       copied?'#6fffaa':'rgba(255,255,255,0.7)',
        boxShadow:   copied?'0 0 20px rgba(100,255,150,0.3)':'0 0 0px transparent',
      }}
      transition={{ duration:0.22 }}
      style={{
        width:'100%', padding:'0.65rem', borderRadius:'12px',
        border:'1px solid rgba(255,255,255,0.13)',
        fontSize:'0.74rem', fontWeight:700, cursor:'pointer',
        letterSpacing:'.07em', fontFamily:"'Space Grotesk',sans-serif",
      }}
    >
      {copied ? '\u2713 COPIED!' : 'COPY HEX ' + hex}
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
  const [onWheel,     setOnWheel]     = useState(false);
  const [tiltX,       setTiltX]       = useState(0);
  const [tiltY,       setTiltY]       = useState(0);

  // â”€â”€ Cursor-follow motion values with springs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // For the cursor preview dot (raw cursor position)
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const smCursorX = useSpring(cursorX, { stiffness:600, damping:30 });
  const smCursorY = useSpring(cursorY, { stiffness:600, damping:30 });

  // For the selector dot (follows cursor while on wheel, springs to segment center otherwise)
  const selX = useMotionValue(CX);
  const selY = useMotionValue(CY);
  const smSelX = useSpring(selX, { stiffness:320, damping:26 });
  const smSelY = useSpring(selY, { stiffness:320, damping:26 });

  const activeArr     = scheme==='none'||selIdx<0 ? null : HARMONIES[scheme]?.(selIdx);
  const harmonyColors = activeArr ? activeArr.map(i=>SEGS[i]) : [];
  const displayColor  = committed || previewCol;

  // â”€â”€ 60fps loop â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€ Commit (click / drag) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const commitSeg = useCallback((segI, rawCX, rawCY, canvasRect)=>{
    if (segI<0) return;
    const seg=SEGS[segI];
    setSelIdx(segI);
    setCommitted(seg);
    setSelectorKey(k=>k+1);

    // Ripple â€” faster, snappier (0.25s)
    if (canvasRect) {
      const px=((rawCX-canvasRect.left)/canvasRect.width)*100;
      const py=((rawCY-canvasRect.top)/canvasRect.height)*100;
      const id=Date.now();
      setRipples(p=>[...p,{id,px,py,color:seg.color}]);
      setTimeout(()=>setRipples(p=>p.filter(r=>r.id!==id)),400);
    }

    // Wheel click scale bounce
    setWheelScale(0.965);
    setTimeout(()=>setWheelScale(1),160);
  },[]);

  // â”€â”€ Mouse events â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const onMouseDown = useCallback(e=>{
    isDragging.current=true;
    const c=canvasRef.current; if(!c) return;
    const r=toCanvas(e,c);
    commitSeg(getSegAt(r.cx,r.cy), r.clientX, r.clientY, r.rect);
  },[commitSeg]);

  const onMouseMove = useCallback(e=>{
    const c=canvasRef.current; if(!c) return;
    const r=toCanvas(e,c);
    const segI=getSegAt(r.cx,r.cy);

    // Update cursor preview dot position (in px relative to wrapper)
    cursorX.set(r.cx);
    cursorY.set(r.cy);

    // Update selector position to follow real cursor when dragging
    if (isDragging.current && segI>=0) {
      selX.set(r.cx);
      selY.set(r.cy);
      commitSeg(segI, r.clientX, r.clientY, r.rect);
    } else if (!isDragging.current && selIdx>=0) {
      // Snap back to segment center when not dragging
      const mid=segMid(selIdx);
      const dr=(R_IN+R_OUT)/2;
      selX.set(CX+dr*Math.cos(mid));
      selY.set(CY+dr*Math.sin(mid));
    }

    hoverRef.current=segI;
    setHoverIdx(segI);
    setPreviewCol(segI>=0?SEGS[segI]:(committed||null));
    c.style.cursor=segI>=0?'crosshair':'default';

    // 3D tilt â€” max 3 degrees
    const wRect=wrapRef.current?.getBoundingClientRect();
    if(wRect){
      const nx=(e.clientX-wRect.left)/wRect.width-0.5;
      const ny=(e.clientY-wRect.top)/wRect.height-0.5;
      setTiltX(-ny*3);
      setTiltY( nx*3);
    }
  },[commitSeg,committed,selIdx]);

  const onMouseLeave=useCallback(()=>{
    isDragging.current=false;
    hoverRef.current=-1;
    setHoverIdx(-1);
    setOnWheel(false);
    setPreviewCol(committed||null);
    setTiltX(0); setTiltY(0);
    if(canvasRef.current) canvasRef.current.style.cursor='default';
    // Snap selector back to segment center
    if(selIdx>=0){
      const mid=segMid(selIdx);
      const dr=(R_IN+R_OUT)/2;
      selX.set(CX+dr*Math.cos(mid));
      selY.set(CY+dr*Math.sin(mid));
    }
  },[committed,selIdx]);

  const onMouseUp=useCallback(()=>{ isDragging.current=false; },[]);
  const onMouseEnter=useCallback(()=>setOnWheel(true),[]);

  // Touch
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
    cursorX.set(r.cx); cursorY.set(r.cy);
    if(segI>=0){ selX.set(r.cx); selY.set(r.cy); commitSeg(segI,r.clientX,r.clientY,r.rect); }
  },[commitSeg]);
  const onTouchEnd=useCallback(()=>{ isDragging.current=false; },[]);

  useEffect(()=>{
    window.addEventListener('mouseup',onMouseUp);
    return()=>window.removeEventListener('mouseup',onMouseUp);
  },[onMouseUp]);

  // Init selector position
  useEffect(()=>{
    if(selIdx>=0){
      const mid=segMid(selIdx);
      const dr=(R_IN+R_OUT)/2;
      selX.set(CX+dr*Math.cos(mid));
      selY.set(CY+dr*Math.sin(mid));
    }
  },[]);

  const tints  = committed?getTints(committed.color):[];
  const shades = committed?getShades(committed.color):[];
  const typeTag= committed
    ?committed.type==='primary'?'#RGB Primary':committed.type==='secondary'?'#RGB Secondary':'#Intermediate'
    :'';

  return (
    <motion.section
      id="wheel-section"
      initial={{ opacity:0, y:24 }}
      animate={{ opacity:1, y:0 }}
      transition={{ duration:0.5, ease:[0.22,1,0.36,1] }}
      style={{ textAlign:'center', paddingBottom:'5rem' }}
    >
      <div className="section-label" style={{ display:'inline-block' }}>Part 01 &mdash; Color Wheel</div>
      <h2 className="section-title">Pick a color.<br />See its family.</h2>
      <p className="section-desc" style={{ margin:'0 auto 2rem' }}>
        Hover to preview &middot; Click or drag to select &middot; Choose a harmony scheme
      </p>

      {/* â”€â”€ Harmony tabs â”€â”€ */}
      <div style={{ display:'flex',gap:'0.5rem',justifyContent:'center',flexWrap:'wrap',marginBottom:'2rem' }}>
        {HARMONY_KEYS.map(k=>(
          <motion.button key={k} onClick={()=>setScheme(k)}
            whileHover={{ scale:1.05,y:-1 }} whileTap={{ scale:0.94 }}
            animate={{
              border:     scheme===k?'1.5px solid #e8ff47'          :'1px solid rgba(255,255,255,0.1)',
              background: scheme===k?'rgba(232,255,71,0.12)'        :'rgba(255,255,255,0.04)',
              color:      scheme===k?'#e8ff47'                      :'rgba(255,255,255,0.5)',
              boxShadow:  scheme===k?'0 0 18px rgba(232,255,71,0.2)':'0 0 0px transparent',
            }}
            transition={{ duration:0.18 }}
            style={{ padding:'0.45rem 1.1rem',borderRadius:'999px',cursor:'pointer',fontSize:'0.78rem',backdropFilter:'blur(12px)',fontFamily:"'Space Grotesk',sans-serif",letterSpacing:'0.04em' }}
          >{HARMONY_LABELS[k]}</motion.button>
        ))}
      </div>

      {/* â”€â”€ Main layout â”€â”€ */}
      <div style={{ display:'flex',gap:'2.5rem',alignItems:'flex-start',justifyContent:'center',flexWrap:'wrap',maxWidth:'1100px',margin:'0 auto' }}>

        {/* â”€â”€ Wheel â”€â”€ */}
        <div ref={wrapRef} style={{ position:'relative',flexShrink:0,width:SIZE+'px',height:SIZE+'px' }}>

          {/* Strong ambient glow behind wheel */}
          <motion.div
            animate={{ opacity: displayColor?1:0 }}
            transition={{ duration:0.4 }}
            style={{
              position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',
              width:'420px',height:'420px',borderRadius:'50%',
              background: displayColor
                ? 'radial-gradient(circle,'+displayColor.color+'40 0%,'+displayColor.color+'10 45%,transparent 68%)'
                : 'transparent',
              pointerEvents:'none',zIndex:0,
              filter:'blur(8px)',
              transition:'background 0.35s ease',
            }}
          />

          {/* Ripples â€” color-based, 0.25s snappy */}
          <AnimatePresence>
            {ripples.map(r=>(
              <motion.div key={r.id}
                initial={{ scale:0, opacity:0.55, x:'-50%', y:'-50%' }}
                animate={{ scale:2.5, opacity:0 }}
                exit={{ opacity:0 }}
                transition={{ duration:0.25, ease:'easeOut' }}
                style={{
                  position:'absolute', left:r.px+'%', top:r.py+'%',
                  width:'44px', height:'44px', borderRadius:'50%',
                  border:'2px solid '+r.color,
                  background:'radial-gradient(circle,'+r.color+'50 0%,transparent 70%)',
                  pointerEvents:'none', zIndex:22,
                }}
              />
            ))}
          </AnimatePresence>

          {/* Canvas with 3D tilt + click scale */}
          <motion.canvas
            ref={canvasRef}
            width={SIZE} height={SIZE}
            animate={{
              scale:   wheelScale,
              rotateX: tiltX,
              rotateY: tiltY,
            }}
            transition={{ scale:{ type:'spring',stiffness:600,damping:22 }, rotateX:{ duration:0.15 }, rotateY:{ duration:0.15 } }}
            style={{
              width:SIZE+'px', height:SIZE+'px', display:'block',
              position:'relative', zIndex:1, touchAction:'none',
              transformStyle:'preserve-3d',
            }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
            onMouseEnter={onMouseEnter}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          />

          {/* â”€â”€ Cursor preview dot (follows raw cursor, visible on hover only) â”€â”€ */}
          <AnimatePresence>
            {onWheel && previewCol && !isDragging.current && (
              <motion.div
                initial={{ scale:0, opacity:0 }}
                animate={{ scale:1, opacity:1 }}
                exit={{ scale:0, opacity:0 }}
                transition={{ duration:0.15 }}
                style={{
                  position:'absolute',
                  left:0, top:0,
                  x: smCursorX,
                  y: smCursorY,
                  translateX: '-50%',
                  translateY: '-50%',
                  width:'22px', height:'22px', borderRadius:'50%',
                  background: previewCol.color,
                  border:'2.5px solid rgba(255,255,255,0.85)',
                  boxShadow:'0 0 10px '+previewCol.color+'99',
                  pointerEvents:'none', zIndex:25,
                  opacity:0.78,
                }}
              />
            )}
          </AnimatePresence>

          {/* â”€â”€ Selector dot â€” cursor-follow while dragging, snaps to segment center otherwise â”€â”€ */}
          <AnimatePresence>
            {committed && (
              <motion.div
                key={'sel-'+selectorKey}
                initial={{ scale:0, opacity:0 }}
                animate={{ scale:[0,1.5,1], opacity:1 }}
                exit={{ scale:0, opacity:0 }}
                transition={{ duration:0.28, ease:[0.34,1.56,0.64,1] }}
                style={{
                  position:'absolute',
                  left:0, top:0,
                  x: smSelX,
                  y: smSelY,
                  translateX: '-50%',
                  translateY: '-50%',
                  width:'20px', height:'20px', borderRadius:'50%',
                  background: committed.color,
                  border:'3px solid rgba(255,255,255,0.95)',
                  boxShadow: '0 0 0 2px '+committed.color+', 0 0 40px 8px '+committed.color+'88, 0 0 120px '+committed.color+'44',
                  pointerEvents:'none', zIndex:30,
                }}
              />
            )}
          </AnimatePresence>

          {/* Outer color dots */}
          {SEGS.map((seg,i)=>{
            const mid  = segMid(i);
            const dotX = CX+DOT_R*Math.cos(mid)-DOT_W/2;
            const dotY = CY+DOT_R*Math.sin(mid)-DOT_W/2;
            const isAct= activeArr?activeArr.includes(i):selIdx===i;
            const isDim= activeArr?!activeArr.includes(i):false;
            return(
              <motion.div key={i} title={seg.name}
                onClick={()=>commitSeg(i,0,0,null)}
                onMouseEnter={()=>{ hoverRef.current=i; setPreviewCol(SEGS[i]); }}
                onMouseLeave={()=>{ hoverRef.current=selIdx; setPreviewCol(committed||null); }}
                whileHover={{ scale:1.4,zIndex:20 }}
                whileTap={{ scale:0.85 }}
                animate={{ scale:isDim?0.72:isAct?1.38:1, opacity:isDim?0.1:1, boxShadow:isAct?'0 0 0 3px rgba(255,255,255,0.25),0 0 20px 6px '+seg.color+'99':'0 2px 8px rgba(0,0,0,0.5)' }}
                transition={{ type:'spring',stiffness:380,damping:20 }}
                style={{ position:'absolute',left:dotX+'px',top:dotY+'px',width:DOT_W+'px',height:DOT_W+'px',borderRadius:'50%',background:seg.color,cursor:'pointer',border:isAct?'3px solid white':'2px solid rgba(255,255,255,0.3)',zIndex:isAct?10:2 }}
              />
            );
          })}

          {/* Center info bubble */}
          <motion.div
            animate={{
              background:  displayColor?displayColor.color+'1a':'rgba(10,10,22,0.92)',
              borderColor: displayColor?displayColor.color+'55':'rgba(255,255,255,0.1)',
              boxShadow:   displayColor?'0 0 120px '+displayColor.color+'44,0 0 40px '+displayColor.color+'30,inset 0 1px 0 rgba(255,255,255,0.1)':'none',
            }}
            transition={{ duration:0.3 }}
            style={{
              position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',
              width:'118px',height:'118px',borderRadius:'50%',
              border:'1.5px solid rgba(255,255,255,0.1)',
              display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'3px',
              pointerEvents:'none',backdropFilter:'blur(24px)',zIndex:5,
            }}
          >
            <AnimatePresence mode="wait">
              {displayColor?(
                <motion.div key={displayColor.name}
                  initial={{ opacity:0,scale:0.8 }} animate={{ opacity:1,scale:1 }} exit={{ opacity:0,scale:0.8 }}
                  transition={{ duration:0.18 }}
                  style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:'3px' }}
                >
                  <motion.div
                    animate={{ background:displayColor.color, boxShadow:'0 0 16px '+displayColor.color+'aa' }}
                    transition={{ duration:0.25 }}
                    style={{ width:28,height:28,borderRadius:'50%',border:'2.5px solid rgba(255,255,255,0.4)',marginBottom:'2px' }}
                  />
                  <span style={{ fontSize:'0.62rem',fontWeight:700,color:'white',textAlign:'center',padding:'0 6px',lineHeight:1.1 }}>{displayColor.name}</span>
                  <span style={{ fontFamily:'monospace',fontSize:'0.46rem',color:'rgba(255,255,255,0.4)',letterSpacing:'.04em' }}>{displayColor.color}</span>
                </motion.div>
              ):(
                <motion.span key="empty" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                  style={{ fontSize:'0.6rem',color:'rgba(255,255,255,0.25)',textAlign:'center',padding:'0 10px',lineHeight:1.5 }}
                >Hover<br/>a color</motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* â”€â”€ Right panel â”€â”€ */}
        <div style={{ flex:'0 0 320px',minWidth:'280px',textAlign:'left',display:'flex',flexDirection:'column',gap:'1rem' }}>

          {/* Color preview card â€” glassmorphic, strong glow */}
          <motion.div
            animate={{
              borderColor: committed?committed.color+'44':'rgba(255,255,255,0.08)',
              boxShadow:   committed?'0 0 120px '+committed.color+'30,0 0 40px '+committed.color+'20,0 10px 40px rgba(0,0,0,0.6)':'0 10px 40px rgba(0,0,0,0.6)',
            }}
            transition={{ duration:0.35 }}
            style={{
              borderRadius:'20px',overflow:'hidden',
              border:'1px solid rgba(255,255,255,0.08)',
              background:'rgba(255,255,255,0.05)',
              backdropFilter:'blur(20px)',
              boxShadow:'0 10px 40px rgba(0,0,0,0.6)',
            }}
          >
            <motion.div
              animate={{ background:committed?committed.color:'rgba(255,255,255,0.04)' }}
              transition={{ duration:0.3 }}
              style={{ height:'110px',position:'relative' }}
            >
              {committed&&<div style={{ position:'absolute',inset:0,background:'linear-gradient(135deg,rgba(255,255,255,0.2) 0%,transparent 55%)' }}/>}
              {committed&&<motion.div
                initial={{ opacity:0,y:4 }} animate={{ opacity:1,y:0 }}
                style={{ position:'absolute',bottom:'0.7rem',left:'0.9rem',fontSize:'0.6rem',fontWeight:700,color:'rgba(255,255,255,0.65)',letterSpacing:'.12em',textTransform:'uppercase' }}
              >{typeTag}</motion.div>}
            </motion.div>

            <div style={{ padding:'1.2rem' }}>
              <AnimatePresence mode="wait">
                {committed?(
                  <motion.div key={committed.name}
                    initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:-8 }}
                    transition={{ duration:0.2 }}
                  >
                    <div style={{ fontFamily:"'Clash Display',sans-serif",fontSize:'1.4rem',color:'white',marginBottom:'0.1rem',letterSpacing:'-0.01em' }}>{committed.name}</div>
                    {/* Big HEX display */}
                    <div style={{ fontFamily:'monospace',fontSize:'1rem',fontWeight:700,color:'rgba(255,255,255,0.85)',marginBottom:'0.2rem',letterSpacing:'0.04em' }}>{committed.color}</div>
                    <div style={{ fontFamily:'monospace',fontSize:'0.7rem',color:'rgba(255,255,255,0.35)',marginBottom:'1rem' }}>rgb({committed.rgb})</div>
                    <CopyButton hex={committed.color} color={committed.color}/>
                  </motion.div>
                ):(
                  <motion.div key="empty" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                    style={{ color:'rgba(255,255,255,0.2)',fontSize:'0.82rem',textAlign:'center',padding:'0.5rem 0' }}
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
                transition={{ duration:0.22 }}
                style={{ borderRadius:'20px',border:'1px solid rgba(255,255,255,0.08)',background:'rgba(255,255,255,0.05)',backdropFilter:'blur(20px)',padding:'1.1rem',boxShadow:'0 10px 40px rgba(0,0,0,0.5)' }}
              >
                <div style={{ fontSize:'0.6rem',color:'rgba(255,255,255,0.32)',letterSpacing:'.14em',textTransform:'uppercase',marginBottom:'0.8rem' }}>{scheme} palette</div>
                <div style={{ display:'flex',gap:'0.5rem' }}>
                  {harmonyColors.map((seg,k)=>(
                    <motion.div key={k}
                      whileHover={{ y:-4,boxShadow:'0 8px 24px '+seg.color+'66' }}
                      whileTap={{ scale:0.94 }}
                      transition={{ duration:0.18 }}
                      onClick={()=>commitSeg(activeArr[k])}
                      style={{ flex:1,cursor:'pointer',borderRadius:'12px',overflow:'hidden',border:'1px solid rgba(255,255,255,0.1)' }}
                    >
                      <div style={{ height:'52px',background:seg.color,position:'relative' }}>
                        <div style={{ position:'absolute',inset:0,background:'linear-gradient(135deg,rgba(255,255,255,0.15) 0%,transparent 60%)' }}/>
                      </div>
                      <div style={{ padding:'0.35rem 0.5rem',background:'rgba(0,0,0,0.35)' }}>
                        <div style={{ fontSize:'0.58rem',fontWeight:700,color:'white',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{seg.name}</div>
                        <div style={{ fontFamily:'monospace',fontSize:'0.5rem',color:'rgba(255,255,255,0.32)' }}>{seg.color}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tints + shades â€” hover scale interaction */}
          <AnimatePresence>
            {committed&&(
              <motion.div
                initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}
                transition={{ duration:0.22 }}
                style={{ borderRadius:'20px',border:'1px solid rgba(255,255,255,0.08)',background:'rgba(255,255,255,0.05)',backdropFilter:'blur(20px)',padding:'1.1rem',boxShadow:'0 10px 40px rgba(0,0,0,0.5)' }}
              >
                <div style={{ fontSize:'0.6rem',color:'rgba(255,255,255,0.32)',letterSpacing:'.14em',textTransform:'uppercase',marginBottom:'0.65rem' }}>Tints &amp; Shades</div>
                <div style={{ display:'flex',gap:'3px',borderRadius:'10px',overflow:'hidden',height:'48px' }}>
                  {[...tints.slice().reverse(),committed.color,...shades].map((h,k)=>(
                    <motion.div key={k} title={h}
                      whileHover={{ scaleY:1.15, zIndex:5, boxShadow:'0 0 12px '+h+'aa', transition:{ duration:0.15 } }}
                      style={{ flex:1,background:h,cursor:'pointer',originY:'bottom' }}
                    />
                  ))}
                </div>
                <div style={{ display:'flex',justifyContent:'space-between',fontSize:'0.54rem',color:'rgba(255,255,255,0.18)',marginTop:'0.4rem' }}>
                  <span>lighter</span><span>pure</span><span>darker</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scheme description */}
          <motion.div
            animate={{ borderColor:committed?committed.color+'25':'rgba(255,255,255,0.07)' }}
            transition={{ duration:0.3 }}
            style={{ borderRadius:'14px',padding:'0.95rem 1.1rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',fontSize:'0.79rem',color:'#888',lineHeight:1.8,backdropFilter:'blur(12px)' }}
            dangerouslySetInnerHTML={{ __html:SCHEME_DESC[scheme]||'' }}
          />
        </div>
      </div>

      {/* Legend */}
      <div style={{ display:'flex',gap:'2rem',justifyContent:'center',marginTop:'2.5rem',flexWrap:'wrap' }}>
        <div style={{ display:'flex',alignItems:'center',gap:'0.45rem',fontSize:'0.67rem',color:'#666' }}>
          <div style={{ width:10,height:10,borderRadius:'50%',background:'rgba(255,255,255,0.5)' }}/>Solid = Primaries (R, G, B)
        </div>
        <div style={{ display:'flex',alignItems:'center',gap:'0.45rem',fontSize:'0.67rem',color:'#555' }}>
          <div style={{ width:10,height:3,background:'rgba(255,255,255,0.28)',borderRadius:2 }}/>Dashed = Secondaries (Y, C, M)
        </div>
      </div>
    </motion.section>
  );
}