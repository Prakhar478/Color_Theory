import { useRef, useEffect, useState, useCallback } from 'react';

const SIZE  = 500;
const CX    = SIZE / 2, CY = SIZE / 2;
const R_OUT = 200;
const R_IN  = 115;
const N     = 12;
const SEG   = (2 * Math.PI) / N;
const OFF   = -Math.PI / 2 - SEG / 2;
const TGAP  = 0.052;

const SEGS = [
  { name: 'Yellow',     type: 'secondary',    color: '#FFE000', rgb: '255, 224, 0'   },
  { name: 'Orange',     type: 'intermediate', color: '#FF8C00', rgb: '255, 140, 0'   },
  { name: 'Red-Orange', type: 'intermediate', color: '#FF4500', rgb: '255, 69, 0'    },
  { name: 'Red',        type: 'primary',      color: '#EE1111', rgb: '238, 17, 17'   },
  { name: 'Red-Violet', type: 'intermediate', color: '#CC1166', rgb: '204, 17, 102'  },
  { name: 'Magenta',    type: 'secondary',    color: '#DD00CC', rgb: '221, 0, 204'   },
  { name: 'Violet',     type: 'intermediate', color: '#7700CC', rgb: '119, 0, 204'   },
  { name: 'Blue',       type: 'primary',      color: '#1144EE', rgb: '17, 68, 238'   },
  { name: 'Blue-Green', type: 'intermediate', color: '#008877', rgb: '0, 136, 119'   },
  { name: 'Cyan',       type: 'secondary',    color: '#00CCCC', rgb: '0, 204, 204'   },
  { name: 'Green',      type: 'primary',      color: '#11AA22', rgb: '17, 170, 34'   },
  { name: 'Yel-Green',  type: 'intermediate', color: '#88CC00', rgb: '136, 204, 0'   },
];

const HARMONIES = {
  complementary: (b) => [b, (b + 6) % N],
  analogous:     (b) => [(b + N - 1) % N, b, (b + 1) % N],
  triadic:       (b) => [b, (b + 4) % N, (b + 8) % N],
  split:         (b) => [b, (b + 5) % N, (b + 7) % N],
};

function segMid(i) { return OFF + (i + 0.5) * SEG; }
function getSegAt(mx, my) {
  const dx = mx - CX, dy = my - CY, d = Math.sqrt(dx*dx+dy*dy);
  if (d < R_IN || d > R_OUT) return -1;
  let a = Math.atan2(dy, dx) - OFF;
  while (a < 0) a += 2*Math.PI;
  while (a >= 2*Math.PI) a -= 2*Math.PI;
  return Math.floor(a / SEG) % N;
}

function drawWheel(ctx, hoverIdx, selIdx, activeArr, pulse, dragScale) {
  ctx.clearRect(0, 0, SIZE, SIZE);

  // Outer ambient
  const amb = ctx.createRadialGradient(CX,CY,R_OUT-10,CX,CY,R_OUT+30);
  amb.addColorStop(0,'rgba(255,255,255,0.025)'); amb.addColorStop(1,'transparent');
  ctx.beginPath(); ctx.arc(CX,CY,R_OUT+30,0,Math.PI*2); ctx.fillStyle=amb; ctx.fill();

  const scale = dragScale || 1;

  SEGS.forEach((seg, i) => {
    const sa = OFF + i*SEG + TGAP, ea = OFF + (i+1)*SEG - TGAP;
    const isAct   = !activeArr || activeArr.includes(i);
    const isHover = hoverIdx === i;
    const isSel   = selIdx === i;
    const mid     = segMid(i);
    const boost   = isHover ? 12 + Math.sin(pulse)*3 : isSel ? 6 : 0;
    const oR      = (R_OUT + boost) * scale;

    // Main fill
    const grd = ctx.createRadialGradient(CX,CY,R_IN+4,CX,CY,oR-2);
    if (isAct) {
      grd.addColorStop(0,   seg.color+'99');
      grd.addColorStop(0.45,seg.color+'cc');
      grd.addColorStop(1,   seg.color+'ff');
    } else {
      grd.addColorStop(0, seg.color+'0a'); grd.addColorStop(1, seg.color+'22');
    }
    ctx.beginPath(); ctx.moveTo(CX,CY); ctx.arc(CX,CY,oR,sa,ea); ctx.closePath();
    ctx.fillStyle = grd; ctx.fill();

    // Sheen
    if (isAct) {
      const sh = ctx.createLinearGradient(
        CX+R_IN*Math.cos(mid),CY+R_IN*Math.sin(mid),
        CX+oR*Math.cos(mid),CY+oR*Math.sin(mid)
      );
      sh.addColorStop(0,'rgba(255,255,255,0.25)');
      sh.addColorStop(0.3,'rgba(255,255,255,0.08)');
      sh.addColorStop(1,'rgba(255,255,255,0)');
      ctx.beginPath(); ctx.moveTo(CX,CY); ctx.arc(CX,CY,oR,sa,ea); ctx.closePath();
      ctx.fillStyle=sh; ctx.fill();
    }

    // Hover glow ring
    if (isHover || isSel) {
      ctx.save();
      ctx.beginPath(); ctx.arc(CX,CY,oR-3,sa+0.01,ea-0.01);
      ctx.strokeStyle = seg.color;
      ctx.lineWidth   = isHover ? 7 : 4;
      ctx.shadowColor = seg.color;
      ctx.shadowBlur  = isHover ? 24+Math.sin(pulse)*6 : 14;
      ctx.stroke(); ctx.restore();
    }

    // Active scheme outline
    if (isAct && activeArr) {
      ctx.save();
      ctx.beginPath(); ctx.arc(CX,CY,R_OUT-2,sa+0.01,ea-0.01);
      ctx.strokeStyle=seg.color+'aa'; ctx.lineWidth=4;
      ctx.shadowColor=seg.color; ctx.shadowBlur=12;
      ctx.stroke(); ctx.restore();
    }
  });

  // Separators
  for (let i=0;i<N;i++) {
    const a=OFF+i*SEG;
    ctx.beginPath();
    ctx.moveTo(CX+R_IN*Math.cos(a),CY+R_IN*Math.sin(a));
    ctx.lineTo(CX+(R_OUT+14)*Math.cos(a),CY+(R_OUT+14)*Math.sin(a));
    ctx.strokeStyle='rgba(0,0,0,0.88)'; ctx.lineWidth=5; ctx.stroke();
  }

  // Outer ring
  ctx.beginPath(); ctx.arc(CX,CY,R_OUT,0,Math.PI*2);
  ctx.strokeStyle='rgba(255,255,255,0.09)'; ctx.lineWidth=1.5; ctx.stroke();

  // Inner dark glass circle
  const ig=ctx.createRadialGradient(CX-20,CY-20,0,CX,CY,R_IN);
  ig.addColorStop(0,'#1c1c2e'); ig.addColorStop(0.7,'#111120'); ig.addColorStop(1,'#0a0a16');
  ctx.beginPath(); ctx.arc(CX,CY,R_IN,0,Math.PI*2); ctx.fillStyle=ig; ctx.fill();
  ctx.beginPath(); ctx.arc(CX,CY,R_IN,0,Math.PI*2);
  ctx.strokeStyle='rgba(255,255,255,0.13)'; ctx.lineWidth=1.5; ctx.stroke();

  // Primary triangle (solid)
  const tr=R_IN-22;
  const tp=idx=>{const a=segMid(idx);return{x:CX+tr*Math.cos(a),y:CY+tr*Math.sin(a)};};
  ctx.save(); ctx.setLineDash([]);
  const[a,b,c]=[tp(3),tp(7),tp(10)];
  ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.lineTo(c.x,c.y); ctx.closePath();
  ctx.strokeStyle='rgba(255,255,255,0.28)'; ctx.lineWidth=1.5; ctx.stroke();
  // Secondary triangle (dashed)
  ctx.setLineDash([4,5]);
  const[d,e,f]=[tp(0),tp(5),tp(9)];
  ctx.beginPath(); ctx.moveTo(d.x,d.y); ctx.lineTo(e.x,e.y); ctx.lineTo(f.x,f.y); ctx.closePath();
  ctx.strokeStyle='rgba(255,255,255,0.15)'; ctx.lineWidth=1.2; ctx.stroke();
  ctx.setLineDash([]); ctx.restore();

  // Labels
  SEGS.forEach((seg,i)=>{
    const isAct=!activeArr||activeArr.includes(i);
    const isH=hoverIdx===i, isS=selIdx===i;
    const alpha = isH||isS ? 1.0 : isAct ? 0.92 : 0.08;
    const mid=segMid(i);
    const lr=(R_IN+R_OUT)/2+(isH?5:isS?3:0);
    const lx=CX+lr*Math.cos(mid), ly=CY+lr*Math.sin(mid);
    ctx.save();
    ctx.translate(lx,ly);
    let rot=mid+Math.PI/2; if(Math.cos(mid)<-0.001) rot=mid-Math.PI/2;
    ctx.rotate(rot);
    ctx.shadowColor='rgba(0,0,0,1)'; ctx.shadowBlur=12;
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillStyle='rgba(255,255,255,'+alpha+')';
    ctx.font='bold '+(isH?12.5:11.5)+'px "Space Grotesk",sans-serif';
    ctx.fillText(seg.name.toUpperCase(),0,-7.5);
    const tc=seg.type==='primary'
      ?'rgba(232,255,71,'+(alpha*0.9)+')'
      :seg.type==='secondary'
        ?'rgba(160,225,255,'+(alpha*0.85)+')'
        :'rgba(180,180,180,'+(alpha*0.6)+')';
    ctx.fillStyle=tc; ctx.font='9px "Space Grotesk",sans-serif';
    ctx.fillText(seg.type,0,6.5); ctx.shadowBlur=0; ctx.restore();
  });

  // Selector dot on selected segment
  if (selIdx >= 0) {
    const mid = segMid(selIdx);
    const dr  = (R_IN + R_OUT) / 2;
    const dx  = CX + dr * Math.cos(mid);
    const dy2 = CY + dr * Math.sin(mid);
    ctx.beginPath(); ctx.arc(dx, dy2, 7 + Math.sin(pulse)*1.5, 0, Math.PI*2);
    ctx.fillStyle = 'white';
    ctx.shadowColor = SEGS[selIdx].color;
    ctx.shadowBlur  = 16;
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

const SCHEME_DESC = {
  none:          'Hover any segment to preview. Click to select. Then choose a harmony scheme.',
  complementary: '<b style="color:#fff">Complementary</b> â€” directly opposite (180Â°). Maximum contrast. Bold CTAs and highlights.',
  analogous:     '<b style="color:#fff">Analogous</b> â€” neighboring hues (Â±30Â°). Natural harmony. Calm, cohesive interfaces.',
  triadic:       '<b style="color:#fff">Triadic</b> â€” three hues 120Â° apart. Vibrant and balanced. One dominant, two accents.',
  split:         '<b style="color:#fff">Split-Complementary</b> â€” base + two near-complement neighbors. Softer than complementary.',
};

const HARMONY_KEYS = ['none','complementary','analogous','triadic','split'];
const HARMONY_LABELS = { none:'Free Explore', complementary:'Complementary', analogous:'Analogous', triadic:'Triadic', split:'Split-Comp' };
const DOT_R = R_OUT + 32, DOT_W = 32;

function getTints(hex) {
  const r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5),16);
  return Array.from({length:7},(_,i)=>{
    const t=(i+1)/8;
    const lr=Math.round(r+(255-r)*t), lg=Math.round(g+(255-g)*t), lb=Math.round(b+(255-b)*t);
    return '#'+[lr,lg,lb].map(v=>v.toString(16).padStart(2,'0')).join('');
  }).reverse();
}
function getShades(hex) {
  const r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5),16);
  return Array.from({length:7},(_,i)=>{
    const t=(i+1)/8;
    return '#'+[r,g,b].map(v=>Math.round(v*(1-t)).toString(16).padStart(2,'0')).join('');
  });
}

export default function ColorWheel() {
  const canvasRef   = useRef(null);
  const animRef     = useRef(null);
  const pulseRef    = useRef(0);
  const hoverRef    = useRef(-1);
  const dragRef     = useRef(false);
  const dragScaleRef= useRef(1);

  const [selIdx,   setSelIdx]   = useState(-1);
  const [hoverIdx, setHoverIdx] = useState(-1);
  const [scheme,   setScheme]   = useState('none');
  const [color,    setColor]    = useState(null);
  const [copied,   setCopied]   = useState(false);
  const [ripples,  setRipples]  = useState([]);
  const [particles,setParticles]= useState([]);

  const activeArr = scheme==='none'||selIdx<0 ? null : HARMONIES[scheme]?.(selIdx);
  const harmonyColors = activeArr ? activeArr.map(i=>SEGS[i]) : [];

  // 60fps loop
  useEffect(()=>{
    const loop=()=>{
      pulseRef.current += 0.065;
      // drag scale bounce back
      if (dragScaleRef.current < 1) dragScaleRef.current = Math.min(1, dragScaleRef.current + 0.015);
      const c = canvasRef.current;
      if (c) drawWheel(c.getContext('2d'), hoverRef.current, selIdx, activeArr, pulseRef.current, dragScaleRef.current);
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return ()=>cancelAnimationFrame(animRef.current);
  },[selIdx, scheme]);

  const pickSeg = useCallback((i, cx, cy, rect)=>{
    if (i < 0) return;
    const seg = SEGS[i];
    setSelIdx(i);
    setColor(seg);
    // Ripple
    if (rect) {
      const x=((cx-rect.left)/rect.width)*100, y=((cy-rect.top)/rect.height)*100;
      const id=Date.now();
      setRipples(p=>[...p,{id,x,y,color:seg.color}]);
      setTimeout(()=>setRipples(p=>p.filter(r=>r.id!==id)),700);
    }
    // Particles
    if (rect) {
      const px=((cx-rect.left)/rect.width)*100, py=((cy-rect.top)/rect.height)*100;
      const id2=Date.now()+1;
      const pts=Array.from({length:8},(_,k)=>({angle:k*(Math.PI*2/8),dist:30+Math.random()*25}));
      setParticles(p=>[...p,{id:id2,x:px,y:py,color:seg.color,pts}]);
      setTimeout(()=>setParticles(p=>p.filter(r=>r.id!==id2)),600);
    }
    dragScaleRef.current = 0.965;
  },[]);

  const getCanvasXY = (e, canvas)=>{
    const rect=canvas.getBoundingClientRect();
    const scx=SIZE/rect.width, scy=SIZE/rect.height;
    return [(e.clientX-rect.left)*scx, (e.clientY-rect.top)*scy, rect];
  };

  const onMouseMove = useCallback(e=>{
    const c=canvasRef.current; if(!c) return;
    const [mx,my]=getCanvasXY(e,c);
    const i=getSegAt(mx,my);
    hoverRef.current=i; setHoverIdx(i);
    if (i>=0) { setColor(SEGS[i]); }
    c.style.cursor=i>=0?'pointer':'default';
    if (dragRef.current && i>=0) pickSeg(i, e.clientX, e.clientY, c.getBoundingClientRect());
  },[pickSeg]);

  const onMouseLeave=useCallback(()=>{
    hoverRef.current=-1; setHoverIdx(-1);
    if (selIdx>=0) setColor(SEGS[selIdx]); else setColor(null);
  },[selIdx]);

  const onMouseDown=useCallback(e=>{
    dragRef.current=true;
    const c=canvasRef.current; if(!c) return;
    const [mx,my,rect]=getCanvasXY(e,c);
    const i=getSegAt(mx,my);
    pickSeg(i,e.clientX,e.clientY,rect);
  },[pickSeg]);

  const onMouseUp=useCallback(()=>{ dragRef.current=false; },[]);

  useEffect(()=>{
    window.addEventListener('mouseup',onMouseUp);
    return ()=>window.removeEventListener('mouseup',onMouseUp);
  },[onMouseUp]);

  const copyHex=()=>{
    if(!color) return;
    navigator.clipboard.writeText(color.color).catch(()=>{});
    setCopied(true); setTimeout(()=>setCopied(false),1800);
  };

  const tints  = color ? getTints(color.color)  : [];
  const shades = color ? getShades(color.color) : [];

  const typeTag = color
    ? color.type==='primary' ? '#RGB Primary'
      : color.type==='secondary' ? '#RGB Secondary'
      : '#Intermediate'
    : '';

  return (
    <section id="wheel-section" style={{ textAlign:'center', paddingBottom:'5rem' }}>
      <div className="section-label" style={{display:'inline-block'}}>Part 01 â€” Color Wheel</div>
      <h2 className="section-title">Pick a color.<br />See its family.</h2>
      <p className="section-desc" style={{margin:'0 auto 2rem'}}>
        Hover to preview Â· Click or drag to select Â· Choose a harmony scheme below
      </p>

      {/* Harmony scheme tabs */}
      <div style={{display:'flex',gap:'0.5rem',justifyContent:'center',flexWrap:'wrap',marginBottom:'2rem'}}>
        {HARMONY_KEYS.map(k=>(
          <button key={k}
            onClick={()=>setScheme(k)}
            style={{
              padding:'0.45rem 1.1rem', borderRadius:'999px', cursor:'pointer',
              border: scheme===k ? '1.5px solid var(--accent)' : '1px solid rgba(255,255,255,0.1)',
              background: scheme===k ? 'rgba(232,255,71,0.12)' : 'rgba(255,255,255,0.04)',
              color: scheme===k ? 'var(--accent)' : 'rgba(255,255,255,0.5)',
              fontSize:'0.78rem', fontWeight: scheme===k?700:400,
              backdropFilter:'blur(12px)', transition:'all 0.2s',
              fontFamily:"'Space Grotesk',sans-serif", letterSpacing:'0.04em',
            }}
          >{HARMONY_LABELS[k]}</button>
        ))}
      </div>

      {/* Main layout: wheel left + info right */}
      <div style={{display:'flex',gap:'2.5rem',alignItems:'flex-start',justifyContent:'center',flexWrap:'wrap',maxWidth:'1100px',margin:'0 auto'}}>

        {/* Wheel */}
        <div style={{position:'relative',flexShrink:0,width:SIZE+'px',height:SIZE+'px'}}>
          {/* Ambient glow behind wheel based on selected color */}
          {color && (
            <div style={{
              position:'absolute',top:'50%',left:'50%',
              transform:'translate(-50%,-50%)',
              width:'340px',height:'340px',borderRadius:'50%',
              background:'radial-gradient(circle, '+color.color+'18 0%, transparent 70%)',
              pointerEvents:'none', transition:'background 0.4s',
            }}/>
          )}

          {/* Ripple effects */}
          {ripples.map(r=>(
            <div key={r.id} style={{
              position:'absolute',left:r.x+'%',top:r.y+'%',
              transform:'translate(-50%,-50%)',
              width:'16px',height:'16px',borderRadius:'50%',
              border:'2px solid '+r.color,
              animation:'rippleOut 0.6s ease-out forwards',
              pointerEvents:'none',zIndex:20,
            }}/>
          ))}

          {/* Particle burst */}
          {particles.map(p=>(
            <div key={p.id} style={{position:'absolute',left:p.x+'%',top:p.y+'%',pointerEvents:'none',zIndex:21}}>
              {p.pts.map((pt,k)=>(
                <div key={k} style={{
                  position:'absolute',
                  width:'5px',height:'5px',borderRadius:'50%',
                  background:p.color,
                  transform:'translate(-50%,-50%)',
                  animation:'particleFly 0.55s ease-out forwards',
                  animationDelay:(k*0.02)+'s',
                  '--tx': Math.cos(pt.angle)*pt.dist+'px',
                  '--ty': Math.sin(pt.angle)*pt.dist+'px',
                }}/>
              ))}
            </div>
          ))}

          <canvas ref={canvasRef} width={SIZE} height={SIZE}
            style={{width:SIZE+'px',height:SIZE+'px',display:'block'}}
            onMouseMove={onMouseMove} onMouseLeave={onMouseLeave} onMouseDown={onMouseDown}
          />

          {/* Outer dots */}
          {SEGS.map((seg,i)=>{
            const mid=segMid(i);
            const dotX=CX+DOT_R*Math.cos(mid)-DOT_W/2;
            const dotY=CY+DOT_R*Math.sin(mid)-DOT_W/2;
            const isAct=activeArr?activeArr.includes(i):selIdx===i;
            const isDim=activeArr?!activeArr.includes(i):false;
            return (
              <div key={i} title={seg.name}
                onClick={()=>pickSeg(i)}
                onMouseEnter={()=>{hoverRef.current=i;setColor(seg);}}
                onMouseLeave={()=>{hoverRef.current=selIdx;if(selIdx>=0)setColor(SEGS[selIdx]);else setColor(null);}}
                style={{
                  position:'absolute',left:dotX+'px',top:dotY+'px',
                  width:DOT_W+'px',height:DOT_W+'px',
                  borderRadius:'50%',background:seg.color,cursor:'pointer',
                  border:isAct?'3px solid white':'2px solid rgba(255,255,255,0.28)',
                  boxShadow:isAct?'0 0 0 4px rgba(255,255,255,0.1),0 0 20px 6px '+seg.color+'88':'0 2px 8px rgba(0,0,0,0.5)',
                  opacity:isDim?0.08:1,
                  transform:isAct?'scale(1.4)':'scale(1)',
                  transition:'transform 0.2s cubic-bezier(.34,1.56,.64,1),opacity 0.2s,box-shadow 0.2s',
                  zIndex:isAct?10:1,
                }}
              />
            );
          })}

          {/* Center info circle */}
          <div style={{
            position:'absolute',top:'50%',left:'50%',
            transform:'translate(-50%,-50%)',
            width:'120px',height:'120px',borderRadius:'50%',
            background:color?color.color+'15':'rgba(12,12,22,0.9)',
            border:'1.5px solid '+(color?color.color+'55':'rgba(255,255,255,0.1)'),
            boxShadow:color?'0 0 32px 8px '+color.color+'25,inset 0 1px 0 rgba(255,255,255,0.1)':'none',
            display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'3px',
            pointerEvents:'none',transition:'all 0.3s ease',backdropFilter:'blur(20px)',
          }}>
            {color ? (
              <>
                <div style={{width:28,height:28,borderRadius:'50%',background:color.color,border:'2px solid rgba(255,255,255,0.3)',boxShadow:'0 0 12px '+color.color+'88',marginBottom:'2px'}}/>
                <span style={{fontSize:'0.65rem',fontWeight:700,color:'white',lineHeight:1.1,textAlign:'center',padding:'0 6px'}}>{color.name}</span>
                <span style={{fontFamily:'monospace',fontSize:'0.5rem',color:'rgba(255,255,255,0.38)',letterSpacing:'.05em'}}>{color.color}</span>
              </>
            ) : (
              <span style={{fontSize:'0.65rem',color:'rgba(255,255,255,0.3)',textAlign:'center',padding:'0 10px',lineHeight:1.5}}>Hover<br/>a segment</span>
            )}
          </div>
        </div>

        {/* Right panel */}
        <div style={{flex:'0 0 320px',minWidth:'280px',textAlign:'left',display:'flex',flexDirection:'column',gap:'1rem'}}>

          {/* Selected color card */}
          <div style={{
            borderRadius:'20px',overflow:'hidden',
            border:'1px solid '+(color?color.color+'40':'rgba(255,255,255,0.08)'),
            background:color?color.color+'0e':'rgba(16,16,26,0.7)',
            backdropFilter:'blur(16px)',
            transition:'all 0.35s ease',
            boxShadow:color?'0 8px 32px '+color.color+'18':'none',
          }}>
            {/* Color swatch */}
            <div style={{
              height:'100px',
              background:color?color.color:'rgba(255,255,255,0.04)',
              transition:'background 0.35s ease',
              position:'relative',
            }}>
              {color && (
                <div style={{position:'absolute',inset:0,background:'linear-gradient(135deg,rgba(255,255,255,0.15) 0%,transparent 50%)'}}/>
              )}
              {color && (
                <div style={{position:'absolute',bottom:'0.6rem',left:'0.8rem',fontSize:'0.65rem',fontWeight:600,color:'rgba(255,255,255,0.6)',letterSpacing:'.1em',textTransform:'uppercase'}}>{typeTag}</div>
              )}
            </div>

            <div style={{padding:'1.1rem 1.2rem'}}>
              {color ? (
                <>
                  <div style={{fontFamily:"'Clash Display',sans-serif",fontSize:'1.3rem',color:'white',marginBottom:'0.15rem'}}>{color.name}</div>
                  <div style={{fontFamily:'monospace',fontSize:'0.78rem',color:'rgba(255,255,255,0.45)',marginBottom:'0.9rem'}}>{color.color} Â· rgb({color.rgb})</div>
                  <button onClick={copyHex} style={{
                    width:'100%',padding:'0.6rem',borderRadius:'10px',border:'none',
                    background:copied?'rgba(100,255,150,0.15)':'rgba(255,255,255,0.08)',
                    color:copied?'#6fffaa':'rgba(255,255,255,0.7)',
                    fontSize:'0.75rem',fontWeight:600,cursor:'pointer',
                    transition:'all 0.2s',letterSpacing:'.06em',fontFamily:"'Space Grotesk',sans-serif",
                    border:'1px solid '+(copied?'rgba(100,255,150,0.3)':'rgba(255,255,255,0.1)'),
                  }}>
                    {copied ? 'âœ“ COPIED TO CLIPBOARD' : 'COPY HEX ' + color.color}
                  </button>
                </>
              ) : (
                <div style={{color:'rgba(255,255,255,0.25)',fontSize:'0.82rem',textAlign:'center',padding:'0.5rem 0'}}>Select a color from the wheel</div>
              )}
            </div>
          </div>

          {/* Harmony palette */}
          {harmonyColors.length > 0 && (
            <div style={{borderRadius:'16px',border:'1px solid rgba(255,255,255,0.08)',background:'rgba(16,16,26,0.7)',backdropFilter:'blur(14px)',padding:'1rem 1.1rem'}}>
              <div style={{fontSize:'0.62rem',color:'rgba(255,255,255,0.35)',letterSpacing:'.12em',textTransform:'uppercase',marginBottom:'0.75rem'}}>{scheme} palette</div>
              <div style={{display:'flex',gap:'0.5rem'}}>
                {harmonyColors.map((seg,k)=>(
                  <div key={k} onClick={()=>pickSeg(activeArr[k])} style={{flex:1,cursor:'pointer',borderRadius:'10px',overflow:'hidden',border:'1px solid rgba(255,255,255,0.1)',transition:'transform 0.2s'}}>
                    <div style={{height:'52px',background:seg.color,position:'relative'}}>
                      <div style={{position:'absolute',inset:0,background:'linear-gradient(135deg,rgba(255,255,255,0.15) 0%,transparent 60%)'}}/>
                    </div>
                    <div style={{padding:'0.35rem 0.4rem',background:'rgba(0,0,0,0.3)'}}>
                      <div style={{fontSize:'0.6rem',fontWeight:600,color:'white',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{seg.name}</div>
                      <div style={{fontFamily:'monospace',fontSize:'0.52rem',color:'rgba(255,255,255,0.35)'}}>{seg.color}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tints + shades strip */}
          {color && (
            <div style={{borderRadius:'16px',border:'1px solid rgba(255,255,255,0.08)',background:'rgba(16,16,26,0.7)',backdropFilter:'blur(14px)',padding:'1rem 1.1rem'}}>
              <div style={{fontSize:'0.62rem',color:'rgba(255,255,255,0.35)',letterSpacing:'.12em',textTransform:'uppercase',marginBottom:'0.6rem'}}>Tints &amp; Shades</div>
              <div style={{display:'flex',gap:'3px',borderRadius:'8px',overflow:'hidden',height:'28px'}}>
                {[...tints.slice().reverse(),...[color.color],...shades].map((h,k)=>(
                  <div key={k} style={{flex:1,background:h,cursor:'pointer',transition:'flex 0.2s'}}
                    title={h}
                    onMouseEnter={e=>e.currentTarget.style.flex='2'}
                    onMouseLeave={e=>e.currentTarget.style.flex='1'}
                  />
                ))}
              </div>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.56rem',color:'rgba(255,255,255,0.2)',marginTop:'0.3rem'}}>
                <span>lighter</span><span>pure</span><span>darker</span>
              </div>
            </div>
          )}

          {/* Scheme description */}
          <div style={{borderRadius:'14px',padding:'0.9rem 1rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',fontSize:'0.8rem',color:'#999',lineHeight:1.75}}
            dangerouslySetInnerHTML={{__html: SCHEME_DESC[scheme]||''}}
          />
        </div>
      </div>

      {/* Legend */}
      <div style={{display:'flex',gap:'2rem',justifyContent:'center',marginTop:'2rem',flexWrap:'wrap'}}>
        <div style={{display:'flex',alignItems:'center',gap:'0.4rem',fontSize:'0.68rem',color:'#888'}}>
          <div style={{width:11,height:11,borderRadius:'50%',background:'rgba(255,255,255,0.6)'}}/>Solid = Primaries (R, G, B)
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'0.4rem',fontSize:'0.68rem',color:'#666'}}>
          <div style={{width:11,height:3,background:'rgba(255,255,255,0.3)',borderRadius:2}}/>Dashed = Secondaries (Y, C, M)
        </div>
      </div>

      <style>{`
        @keyframes rippleOut {
          0%   { width:16px; height:16px; opacity:0.9; }
          100% { width:110px; height:110px; opacity:0; }
        }
        @keyframes particleFly {
          0%   { transform:translate(-50%,-50%) translate(0,0) scale(1); opacity:1; }
          100% { transform:translate(-50%,-50%) translate(var(--tx),var(--ty)) scale(0); opacity:0; }
        }
      `}</style>
    </section>
  );
}
