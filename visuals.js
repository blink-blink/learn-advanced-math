// CS130 visualizations — vanilla canvas, no dependencies.
// keep=true leaves the existing pixels alone (for per-frame animation loops that
// clear themselves); otherwise the canvas is wiped, as every one-shot draw expects.
function fitCanvas(c, h, keep){
  var dpr = window.devicePixelRatio || 1;
  var w = c.clientWidth || 600, H = h || 300;
  // assigning width/height reallocates the backing store even when unchanged,
  // so only do it on a real resize.
  var bw = Math.max(300, Math.floor(w * dpr)), bh = Math.floor(H * dpr);
  if(c.width !== bw || c.height !== bh){ c.width = bw; c.height = bh; }
  var ctx = c.getContext('2d');
  ctx.setTransform(dpr,0,0,dpr,0,0);
  if(!keep) ctx.clearRect(0,0,w,H);
  return {ctx:ctx, W:w, H:H};
}
function arrow(ctx,x1,y1,x2,y2,color){
  ctx.strokeStyle=color; ctx.fillStyle=color; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
  var a=Math.atan2(y2-y1,x2-x1), s=8;
  ctx.beginPath(); ctx.moveTo(x2,y2);
  ctx.lineTo(x2-s*Math.cos(a-0.45),y2-s*Math.sin(a-0.45));
  ctx.lineTo(x2-s*Math.cos(a+0.45),y2-s*Math.sin(a+0.45));
  ctx.closePath(); ctx.fill();
}
function gridBG(ctx,W,H,ox,oy,scale,color){
  ctx.strokeStyle=color||'#1b2542'; ctx.lineWidth=1;
  ctx.beginPath();
  for(var x=ox%scale;x<W;x+=scale){ctx.moveTo(x,0);ctx.lineTo(x,H);}
  for(var y=oy%scale;y<H;y+=scale){ctx.moveTo(0,y);ctx.lineTo(W,y);}
  ctx.stroke();
  ctx.strokeStyle='#33406a'; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.moveTo(0,oy); ctx.lineTo(W,oy); ctx.moveTo(ox,0); ctx.lineTo(ox,H); ctx.stroke();
}
function num(id,def){var e=document.getElementById(id);if(!e)return def;var v=parseFloat(e.value);return isFinite(v)?v:def;}
function eigen2(a,b,c2,d){
  var tr=a+d, det=a*d-b*c2, disc=tr*tr-4*det;
  if(disc>=0){
    var s=Math.sqrt(disc), l1=(tr+s)/2, l2=(tr-s)/2;
    function vec(l){
      var eps=1e-9, vx,vy;
      if(Math.abs(b)>eps){vx=b;vy=l-a;}
      else if(Math.abs(c2)>eps){vx=l-d;vy=c2;}
      else{vx=(Math.abs(a-l)<Math.abs(d-l))?1:0;vy=(vx===1)?0:1;}
      var n=Math.hypot(vx,vy)||1; return [vx/n,vy/n];
    }
    return {real:true,l1:l1,l2:l2,v1:vec(l1),v2:vec(l2),tr:tr,det:det,disc:disc};
  }
  return {real:false,tr:tr,det:det,disc:disc,re:tr/2,im:Math.sqrt(-disc)/2};
}

/* ============ 1. Span explorer ============ */
function initSpan(){
  var c=document.getElementById('spanCanvas'); if(!c)return;
  function draw(){
    var ax=num('spanAx',2),ay=num('spanAy',1),bx=num('spanBx',-1),by=num('spanBy',2);
    var s=num('spanS',1),st=num('spanT',0.5);
    var o=fitCanvas(c,300),ctx=o.ctx,W=o.W,H=o.H;
    var ox=W/2,oy=H/2,sc=28;
    gridBG(ctx,W,H,ox,oy,sc);
    var det=ax*by-ay*bx;
    if(Math.abs(det)>1e-9){ ctx.fillStyle='rgba(125,227,168,0.06)'; ctx.fillRect(0,0,W,H); }
    arrow(ctx,ox,oy,ox+ax*sc,oy-ay*sc,'#6aa8ff');
    arrow(ctx,ox,oy,ox+bx*sc,oy-by*sc,'#ffcf6a');
    var wx=s*ax+st*bx, wy=s*ay+st*by;
    arrow(ctx,ox,oy,ox+wx*sc,oy-wy*sc,'#7de3a8');
    ctx.fillStyle='#e9edf6';ctx.font='13px sans-serif';
    ctx.fillText('a=(' + ax + ',' + ay + ')',10,18);
    ctx.fillText('b=(' + bx + ',' + by + ')',10,36);
    ctx.fillText('w = '+s+'a + '+st+'b = ('+wx.toFixed(2)+','+wy.toFixed(2)+')',10,H-12);
    var out=document.getElementById('spanOut');
    if(out)out.textContent = Math.abs(det)<1e-9
      ? 'Dependent (det=0): a and b sit on the same line, so span{a,b} collapses from a plane to a line — w can never leave it. This is exactly what a singular matrix does to R^2.'
      : 'Independent (det='+det.toFixed(2)+'): span{a,b} = all of R^2 — every target vector w is hit by exactly one pair (s,t).';
  }
  ['spanAx','spanAy','spanBx','spanBy','spanS','spanT'].forEach(function(id){
    var e=document.getElementById(id); if(e) e.addEventListener('input',draw);
  });
  window.addEventListener('resize',draw); draw();
}

/* ============ 1b. Gram–Schmidt ============ */
function initGS(){
  var c=document.getElementById('gsCanvas'); if(!c)return;
  function draw(){
    var ax=num('gsAx',3),ay=num('gsAy',1),bx=num('gsBx',1),by=num('gsBy',3);
    var o=fitCanvas(c,300),ctx=o.ctx,W=o.W,H=o.H;
    var ox=W*0.36,oy=H/2,sc=32;
    gridBG(ctx,W,H,ox,oy,sc);
    var k=(bx*ax+by*ay)/(ax*ax+ay*ay);
    var u2x=bx-k*ax, u2y=by-k*ay;
    var px=k*ax, py=k*ay;
    ctx.strokeStyle='#5b678c';ctx.setLineDash([6,4]);
    ctx.beginPath();ctx.moveTo(ox+bx*sc,oy-by*sc);ctx.lineTo(ox+px*sc,oy-py*sc);ctx.stroke();
    ctx.setLineDash([]);
    arrow(ctx,ox,oy,ox+ax*sc,oy-ay*sc,'#6aa8ff');
    arrow(ctx,ox,oy,ox+bx*sc,oy-by*sc,'#ffcf6a');
    arrow(ctx,ox,oy,ox+px*sc,oy-py*sc,'#5b678c');
    arrow(ctx,ox,oy,ox+u2x*sc,oy-u2y*sc,'#c9a6ff');
    ctx.fillStyle='#e9edf6';ctx.font='13px sans-serif';
    ctx.fillText('v1 (blue), v2 (gold)',10,18);
    ctx.fillText('proj_v1(v2) (grey) = '+k.toFixed(2)+' v1',10,36);
    ctx.fillText('u2 (purple) = v2 - proj   [u1 = v1 overlaps the blue arrow]',10,54);
    var out=document.getElementById('gsOut');
    if(out){
      var dot=u2x*ax+u2y*ay;
      out.textContent='Check u1 . u2 = '+dot.toFixed(6)+(Math.abs(dot)<1e-9?' = 0, orthogonal.':' (should be 0.)')+
        '  Normalize: |u1|='+Math.hypot(ax,ay).toFixed(2)+', |u2|='+Math.hypot(u2x,u2y).toFixed(2)+
        '. Run this column-by-column on a matrix and it IS QR factorization — the stable route to least-squares fitting.';
    }
  }
  ['gsAx','gsAy','gsBx','gsBy'].forEach(function(id){var e=document.getElementById(id);if(e)e.addEventListener('input',draw);});
  window.addEventListener('resize',draw); draw();
}

/* ============ 2. Matrix as deformation (+ eigen preview) ============ */
function initMatrix(){
  var c=document.getElementById('matCanvas'); if(!c)return;
  function draw(){
    var a=num('mA',2),b=num('mB',1),cc=num('mC',0),d=num('mD',1.5);
    var o=fitCanvas(c,320),ctx=o.ctx,W=o.W,H=o.H;
    var ox=W/2,oy=H/2,sc=30;
    gridBG(ctx,W,H,ox,oy,sc);
    ctx.strokeStyle='rgba(106,168,255,0.35)';ctx.lineWidth=1;
    ctx.beginPath();
    for(var gx=-6;gx<=6;gx++){
      ctx.moveTo(ox+(a*gx+b*-6)*sc, oy-((cc*gx+d*-6))*sc);
      ctx.lineTo(ox+(a*gx+b*6)*sc, oy-((cc*gx+d*6))*sc);
      ctx.moveTo(ox+(a*-6+b*gx)*sc, oy-((cc*-6+d*gx))*sc);
      ctx.lineTo(ox+(a*6+b*gx)*sc, oy-((cc*6+d*gx))*sc);
    }
    ctx.stroke();
    function P(x,y){return [ox+(a*x+b*y)*sc, oy-(cc*x+d*y)*sc];}
    var p0=P(0,0),p1=P(1,0),p2=P(1,1),p3=P(0,1);
    ctx.fillStyle='rgba(106,168,255,0.25)';ctx.strokeStyle='#6aa8ff';ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(p0[0],p0[1]);ctx.lineTo(p1[0],p1[1]);ctx.lineTo(p2[0],p2[1]);ctx.lineTo(p3[0],p3[1]);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.strokeStyle='#3a466e';ctx.setLineDash([5,4]);ctx.beginPath();
    ctx.moveTo(ox,oy);ctx.lineTo(ox+sc,oy);ctx.lineTo(ox+sc,oy-sc);ctx.lineTo(ox,oy-sc);ctx.closePath();ctx.stroke();ctx.setLineDash([]);
    arrow(ctx,ox,oy,ox+a*sc,oy-cc*sc,'#7de3a8');
    arrow(ctx,ox,oy,ox+b*sc,oy-d*sc,'#ff8fa3');
    var e=eigen2(a,b,cc,d), out=document.getElementById('eigenOut');
    var info='det='+(a*d-b*cc).toFixed(2)+'  tr='+(a+d).toFixed(2)+'  |  ';
    if(e.real){
      ctx.strokeStyle='#7de3a8';ctx.setLineDash([6,4]);ctx.beginPath();
      ctx.moveTo(ox-e.v1[0]*6*sc,oy+e.v1[1]*6*sc);ctx.lineTo(ox+e.v1[0]*6*sc,oy-e.v1[1]*6*sc);ctx.stroke();
      ctx.strokeStyle='#ffcf6a';ctx.beginPath();
      ctx.moveTo(ox-e.v2[0]*6*sc,oy+e.v2[1]*6*sc);ctx.lineTo(ox+e.v2[0]*6*sc,oy-e.v2[1]*6*sc);ctx.stroke();ctx.setLineDash([]);
      info+='lambda1='+e.l1.toFixed(3)+' v1=(' + e.v1[0].toFixed(2)+','+e.v1[1].toFixed(2)+')   lambda2='+e.l2.toFixed(3)+' v2=(' + e.v2[0].toFixed(2)+','+e.v2[1].toFixed(2)+')';
    } else {
      info+='complex lambda = '+e.re.toFixed(3)+' +/- i '+e.im.toFixed(3)+'  (rotation+scale: no real direction survives)';
    }
    if(out) out.textContent=info;
    var detEl=document.getElementById('matDet');
    var D=a*d-b*cc;
    if(detEl) detEl.textContent='det = '+D.toFixed(3)+(Math.abs(D)<1e-9
      ? '  ->  SINGULAR: the unit square is crushed onto a line (image area 0, no inverse).'
      : '  ->  the unit square becomes a parallelogram of area |det| = '+Math.abs(D).toFixed(3)+(D<0?' — the negative sign means the map mirrored orientation.':' (orientation preserved).'));
  }
  ['mA','mB','mC','mD'].forEach(function(id){var e=document.getElementById(id);if(e)e.addEventListener('input',draw);});
  document.querySelectorAll('[data-preset]').forEach(function(btn){
    btn.addEventListener('click',function(){
      var p=btn.getAttribute('data-preset').split(',').map(Number);
      document.getElementById('mA').value=p[0];document.getElementById('mB').value=p[1];
      document.getElementById('mC').value=p[2];document.getElementById('mD').value=p[3];draw();
    });
  });
  window.addEventListener('resize',draw); draw();
}

/* ============ 2b. Eigen probe (canvas #eigCanvas) ============ */
function readProbeMatrix(){return [num('eA',4),num('eB',1),num('eC',2),num('eD',3)];}
function initEigProbe(){
  var c=document.getElementById('eigCanvas'); if(!c)return;
  function draw(){
    var _m=readProbeMatrix(),a=_m[0],b=_m[1],cc=_m[2],d=_m[3];
    var o=fitCanvas(c,300),ctx=o.ctx,W=o.W,H=o.H;
    var ox=W/2,oy=H/2,sc=Math.min(W,H)*0.34;
    gridBG(ctx,W,H,ox,oy,sc/1.6);
    ctx.strokeStyle='#3a466e';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(ox,oy,sc,0,2*Math.PI);ctx.stroke();
    var e=eigen2(a,b,cc,d), N=64;
    for(var i=0;i<N;i++){
      var th=i/N*2*Math.PI, vx=Math.cos(th), vy=Math.sin(th);
      var wx=a*vx+b*vy, wy=cc*vx+d*vy;
      var col='#4a5680';
      if(e.real){
        var d1=Math.abs(vx*e.v1[1]-vy*e.v1[0]), d2=Math.abs(vx*e.v2[1]-vy*e.v2[0]);
        if(d1<0.05)col='#7de3a8'; else if(d2<0.05)col='#ffcf6a';
      }
      ctx.strokeStyle=col;ctx.lineWidth=1.4;
      ctx.beginPath();ctx.moveTo(ox+vx*sc,oy-vy*sc);ctx.lineTo(ox+wx*sc*0.5,oy-wy*sc*0.5);ctx.stroke();
      ctx.fillStyle=col;ctx.beginPath();ctx.arc(ox+wx*sc*0.5,oy-wy*sc*0.5,2.4,0,7);ctx.fill();
    }
    if(e.real){
      ctx.strokeStyle='#7de3a8';ctx.setLineDash([6,4]);ctx.beginPath();
      ctx.moveTo(ox-e.v1[0]*sc*1.8,oy+e.v1[1]*sc*1.8);ctx.lineTo(ox+e.v1[0]*sc*1.8,oy-e.v1[1]*sc*1.8);ctx.stroke();
      ctx.strokeStyle='#ffcf6a';ctx.beginPath();
      ctx.moveTo(ox-e.v2[0]*sc*1.8,oy+e.v2[1]*sc*1.8);ctx.lineTo(ox+e.v2[0]*sc*1.8,oy-e.v2[1]*sc*1.8);ctx.stroke();ctx.setLineDash([]);
      var out=document.getElementById('eigOut2');
      if(out)out.textContent='Each grey segment joins a unit vector (on the circle) to a shrunk copy of its image. Green/gold dashed = the two eigenvector lines: inputs on them leave their own line, scaled by λ₁='+e.l1.toFixed(2)+' / λ₂='+e.l2.toFixed(2)+'. Negative λ flips the arrow through the origin. (Use Visual 5 below to run power iteration on this same matrix.)';
    } else {
      var out2=document.getElementById('eigOut2');
      if(out2)out2.textContent='No highlighted directions and no dashed lines: λ='+e.re.toFixed(2)+'±i'+e.im.toFixed(2)+' is complex, so NO real direction survives this map — it is a rotation (× a uniform scale √'+(e.re*e.re+e.im*e.im).toFixed(2)+'). The probe confirms the definition, not the recipe.';
    }
  }
  ['eA','eB','eC','eD'].forEach(function(id){var e=document.getElementById(id);if(e)e.addEventListener('input',draw);});
  window.addEventListener('resize',draw); draw();
  window.__eigProbeDraw=draw;
}

/* ============ 2c. Power iteration (canvas #eigCanvas2) ============ */
function initPower(){
  var c=document.getElementById('eigCanvas2'); if(!c)return;
  var anim=null, xk=[0.6,0.8], k=0;
  function draw(){
    var _m=readProbeMatrix(),a=_m[0],b=_m[1],cc=_m[2],d=_m[3];
    var o=fitCanvas(c,300),ctx=o.ctx,W=o.W,H=o.H;
    var ox=W/2,oy=H/2,sc=Math.min(W,H)*0.34;
    gridBG(ctx,W,H,ox,oy,sc/1.6);
    ctx.strokeStyle='#3a466e';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(ox,oy,sc,0,2*Math.PI);ctx.stroke();
    var e=eigen2(a,b,cc,d);
    // history of iterates as a faint trail
    if(e.real){
      ctx.strokeStyle='#26304e';ctx.setLineDash([5,4]);ctx.beginPath();
      ctx.moveTo(ox-e.v1[0]*sc,oy+e.v1[1]*sc);ctx.lineTo(ox+e.v1[0]*sc,oy-e.v1[1]*sc);ctx.stroke();ctx.setLineDash([]);
    }
    if(k>0){
      ctx.strokeStyle='#ff8fa3';ctx.lineWidth=2.5;
      ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(ox+xk[0]*sc,oy-xk[1]*sc);ctx.stroke();
      ctx.fillStyle='#ff8fa3';ctx.beginPath();ctx.arc(ox+xk[0]*sc,oy-xk[1]*sc,5,0,7);ctx.fill();
    }
    ctx.fillStyle='#a4aec6';ctx.font='12px sans-serif';
    ctx.fillText('power iteration:  x ← A x / ‖A x‖    (shared matrix with Visual 4)',10,16);
    var dom = e.real?Math.max(Math.abs(e.l1),Math.abs(e.l2)):Math.hypot(e.re,e.im);
    var ratio = e.real?Math.min(Math.abs(e.l1),Math.abs(e.l2))/(Math.max(Math.abs(e.l1),Math.abs(e.l2))||1e-9):1;
    ctx.fillText('iteration k = '+k+'   |λ_dom| = '+dom.toFixed(2)+'   |λ₂/λ₁| = '+ratio.toFixed(3)+(e.real?(ratio<1?'  → x → dominant eigenvector':'  → tie, x spins'):('  → complex: x rotates')),10,H-8);
    var out=document.getElementById('piOut');
    if(out)out.textContent = e.real ? ('λ = '+e.l1.toFixed(2)+', '+e.l2.toFixed(2)+'. Press Step/auto-run: x snaps onto the λ='+e.l1.toFixed(2)+' direction (the longer dashed line, if |λ₁|>|λ₂|). Error shrinks by ×'+ratio.toFixed(2)+' each step — that gap is everything.') : ('λ = '+e.re.toFixed(2)+'±i'+e.im.toFixed(2)+'. No dominant real direction: x just rotates and never settles — the rotation-preset experiment below.');
  }
  function step(){
    var m=readProbeMatrix(),a=m[0],b=m[1],cc=m[2],d=m[3];
    var nx=a*xk[0]+b*xk[1], ny=cc*xk[0]+d*xk[1];
    var n=Math.hypot(nx,ny)||1; xk=[nx/n,ny/n]; k++;
    draw();
    if(window.__eigProbeDraw) window.__eigProbeDraw();
  }
  function sync(){k=0;draw();if(window.__eigProbeDraw)window.__eigProbeDraw();}
  var s1=document.getElementById('piStep'),s5=document.getElementById('piRun'),rs=document.getElementById('piReset');
  if(s1)s1.addEventListener('click',step);
  if(rs)rs.addEventListener('click',function(){k=0;xk=[0.6,0.8];if(anim){clearInterval(anim);anim=null;}if(s5)s5.textContent='auto-run';sync();});
  if(s5)s5.addEventListener('click',function(){ if(anim){clearInterval(anim);anim=null;s5.textContent='auto-run';return;} step(); s5.textContent='stop'; anim=setInterval(step,200); });
  var p1=document.getElementById('piExA'),p2=document.getElementById('piRot');
  if(p1)p1.addEventListener('click',function(){['eA','eB','eC','eD'].forEach(function(id,i){document.getElementById(id).value=[4,1,2,3][i];});sync();});
  if(p2)p2.addEventListener('click',function(){['eA','eB','eC','eD'].forEach(function(id,i){document.getElementById(id).value=[0,-1,1,0][i];});sync();});
  ['eA','eB','eC','eD'].forEach(function(id){var e=document.getElementById(id);if(e)e.addEventListener('input',function(){k=0;draw();});});
  window.addEventListener('resize',draw); draw();
}

/* ============ 3. SVD morph stages ============ */
function initSVD(){
  var c=document.getElementById('svdCanvas'); if(!c)return;
  function lerp(M,N,t){return [[M[0][0]+(N[0][0]-M[0][0])*t, M[0][1]+(N[0][1]-M[0][1])*t],
                              [M[1][0]+(N[1][0]-M[1][0])*t, M[1][1]+(N[1][1]-M[1][1])*t]];}
  function mm(M,x,y){return [M[0][0]*x+M[0][1]*y, M[1][0]*x+M[1][1]*y];}
  function draw(){
    var a=num('sA',3),b=num('sB',1),cc=num('sC',1),d=num('sD',2);
    var stage=num('svdStage',2);
    var at=a*a+cc*cc, bt=a*b+cc*d, dt=b*b+d*d;
    var e=eigen2(at,bt,bt,dt);
    var o=fitCanvas(c,300),ctx=o.ctx,W=o.W,H=o.H;
    var ox=W/2,oy=H/2,sc=26;
    gridBG(ctx,W,H,ox,oy,sc);
    var s1=Math.sqrt(Math.max(e.l1,0)), s2=Math.sqrt(Math.max(e.l2,0));
    var VT=[[e.v1[0],e.v1[1]],[e.v2[0],e.v2[1]]];
    var SIGVT=[[s1*VT[0][0], s1*VT[0][1]],[s2*VT[1][0], s2*VT[1][1]]];
    var A=[[a,b],[cc,d]];
    var M = stage<=1 ? lerp([[1,0],[0,1]],SIGVT,Math.min(1,Math.max(0,stage))) : lerp(SIGVT,A,Math.min(1,Math.max(0,stage-1)));
    ctx.strokeStyle='#3a466e';ctx.lineWidth=1.5;ctx.beginPath();
    for(var t=0;t<=Math.PI*2+0.02;t+=0.06){var X=ox+Math.cos(t)*sc,Y=oy-Math.sin(t)*sc;if(t===0)ctx.moveTo(X,Y);else ctx.lineTo(X,Y);}
    ctx.stroke();
    ctx.strokeStyle='#6aa8ff';ctx.lineWidth=2.4;ctx.beginPath();
    for(var t2=0;t2<=Math.PI*2+0.02;t2+=0.06){
      var p=mm(M,Math.cos(t2),Math.sin(t2));
      var X2=ox+p[0]*sc,Y2=oy-p[1]*sc;
      if(t2===0)ctx.moveTo(X2,Y2);else ctx.lineTo(X2,Y2);
    }
    ctx.stroke();
    arrow(ctx,ox,oy,ox+e.v1[0]*sc,oy-e.v1[1]*sc,'#ffcf6a');
    arrow(ctx,ox,oy,ox+e.v2[0]*sc,oy-e.v2[1]*sc,'#ff8fa3');
    var u1=mm(A,e.v1), u2=mm(A,e.v2);
    arrow(ctx,ox,oy,ox+u1[0]*sc,oy-u1[1]*sc,'#7de3a8');
    arrow(ctx,ox,oy,ox+u2[0]*sc,oy-u2[1]*sc,'#c9a6ff');
    ctx.fillStyle='#e9edf6';ctx.font='12.5px sans-serif';
    ctx.fillText(stage<1?'stage 1/3  V^T: rotate input into the singular-vector frame'
             :(stage<2?'stage 2/3  Sigma: stretch along the axes by sigma1, sigma2'
                      :'stage 3/3  U: rotate the axis-aligned ellipse into its final tilt'),10,H-12);
    var out=document.getElementById('svdOut');
    if(out)out.textContent='sigma1='+s1.toFixed(3)+' (gold v1 -> green sigma1 u1), sigma2='+s2.toFixed(3)+' (rose v2 -> purple sigma2 u2). Any matrix = rotate, stretch, rotate: the unit circle ALWAYS lands on an ellipse. Symmetric preset: V=U up to signs, so this collapses to eigen-decomposition. Rotation preset: sigma1=sigma2=1 (stretches nothing). Projection preset: sigma2=0 — one axis is crushed: the rank shows up as the number of nonzero singular values.';
  }
  ['sA','sB','sC','sD','svdStage'].forEach(function(id){var e=document.getElementById(id);if(e)e.addEventListener('input',draw);});
  document.querySelectorAll('[data-svpreset]').forEach(function(btn){
    btn.addEventListener('click',function(){
      var p=btn.getAttribute('data-svpreset').split(',').map(Number);
      document.getElementById('sA').value=p[0];document.getElementById('sB').value=p[1];
      document.getElementById('sC').value=p[2];document.getElementById('sD').value=p[3];
      draw();
    });
  });
  window.addEventListener('resize',draw); draw();
}

/* ============ 4. ODE slope field ============ */
function initSlope(){
  var c=document.getElementById('slopeCanvas'); if(!c)return;
  var F={
    'y - x':{f:function(x,y){return y-x;},gen:'y = C e^x - x - 1  (linear equation; integrating factor e^-x)'},
    'x*y':{f:function(x,y){return x*y;},gen:'y = C e^(x^2/2)  (separable: dy/y = x dx)'},
    'y(1-y)':{f:function(x,y){return y*(1-y);},gen:'y = 1/(1+C e^-x)  — logistic: y=0 and y=1 are the equilibrium solutions the rest approach'},
    'sin(x)*y':{f:function(x,y){return Math.sin(x)*y;},gen:'y = C e^(1-cos x)  (separable — every solution is a scalar multiple of one shape)'}
  };
  function draw(){
    var key=(document.getElementById('slopeF')||{}).value||'y - x';
    var fn=F[key].f;
    var o=fitCanvas(c,300),ctx=o.ctx,W=o.W,H=o.H;
    var ox=W/2,oy=H/2,sc=30;
    gridBG(ctx,W,H,ox,oy,sc);
    var xmax=(W/2)/sc, ymax=(H/2)/sc;
    for(var gx=-Math.ceil(xmax);gx<=Math.ceil(xmax);gx+=0.5){
      for(var gy=-Math.ceil(ymax);gy<=Math.ceil(ymax);gy+=0.5){
        var dy=fn(gx,gy);
        var len=0.2, ang=Math.atan2(dy,1);
        var x1=ox+(gx-Math.cos(ang)*len)*sc, y1=oy-(gy+Math.sin(ang)*len)*sc;
        var x2=ox+(gx+Math.cos(ang)*len)*sc, y2=oy-(gy-Math.sin(ang)*len)*sc;
        var m=Math.min(1,0.2+Math.abs(dy)*0.35);
        ctx.strokeStyle='rgba(106,168,255,'+(0.2+m*0.4)+')';ctx.lineWidth=1.1;
        ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
      }
    }
    var seeds=[-1.5,-0.7,0.3,1.1,2];
    var cols=['#7de3a8','#ffcf6a','#ff8fa3','#c9a6ff','#8fe3ff'];
    seeds.forEach(function(y0,i){
      var x=-xmax+0.2,y=y0,dt=0.02;
      ctx.strokeStyle=cols[i];ctx.lineWidth=2;ctx.beginPath();
      ctx.moveTo(ox+x*sc,oy-y*sc);
      while(x<xmax){
        var k1=fn(x,y),k2=fn(x+dt/2,y+dt/2*k1),k3=fn(x+dt/2,y+dt/2*k2),k4=fn(x+dt,y+dt*k3);
        y+=dt*(k1+2*k2+2*k3+k4)/6; x+=dt;
        if(Math.abs(y)>ymax+2)y=Math.sign(y)*(ymax+2);
        ctx.lineTo(ox+x*sc,oy-y*sc);
      }
      ctx.stroke();
    });
    var out=document.getElementById('slopeOut');
    if(out)out.textContent='y = '+key+'   general solution: '+F[key].gen+'. The slope field encodes the whole family WITHOUT solving: at each (x,y) draw a tick of slope y. Curves can never cross (Picard-Lindelof uniqueness). Euler/RK4 are just robots walking this field — see demo_ode.py in section 6.';
  }
  var e=document.getElementById('slopeF');if(e)e.addEventListener('change',draw);
  window.addEventListener('resize',draw); draw();
}

/* ============ 5. Damped oscillator + pole map ============ */
function initOsc(){
  var ct=document.getElementById('oscCanvas'),cp=document.getElementById('oscPlaneCanvas');
  if(!ct||!cp)return;
  function cross(ctx,x,y){ctx.strokeStyle='#ff8fa3';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x-6,y-6);ctx.lineTo(x+6,y+6);ctx.moveTo(x+6,y-6);ctx.lineTo(x-6,y+6);ctx.stroke();}
  function draw(){
    var z=num('oscZ',0.25), w=num('oscW',2);
    var t=fitCanvas(ct,240),ctx=t.ctx,W=t.W,H=t.H;
    var ox=12,oy=H/2,scx=(W-24)/10,scy=H*0.34;
    gridBG(ctx,W,H,ox,oy,24);
    var y=1,v=0,dt=0.004;
    ctx.strokeStyle='#7de3a8';ctx.lineWidth=2.5;ctx.beginPath();
    ctx.moveTo(ox,oy-y*scy);
    var X=ox;
    for(var i=0;i<10/dt;i++){
      var a1=v, b1=-2*z*w*v-w*w*y;
      var y2=y+dt/2*a1, v2=v+dt/2*b1;
      var a2=v2, b2=-2*z*w*v2-w*w*y2;
      var y3=y+dt/2*a2, v3=v+dt/2*b2;
      var a3=v3, b3=-2*z*w*v3-w*w*y3;
      var y4=y+dt*a3, v4=v+dt*b3;
      var a4=v4, b4=-2*z*w*v4-w*w*y4;
      y+=dt*(a1+2*a2+2*a3+a4)/6; v+=dt*(b1+2*b2+2*b3+b4)/6;
      X=ox+i*dt*scx;
      ctx.lineTo(X,oy-y*scy);
      if(X>W-12)break;
    }
    ctx.stroke();
    ctx.fillStyle='#a4aec6';ctx.font='12px sans-serif';
    ctx.fillText('y(0)=1, y(0)=0, t in [0,10]   zeta='+z.toFixed(2)+'  omega0='+w.toFixed(2),ox,14);
    var p=fitCanvas(cp,240),c2=p.ctx,W2=p.W,H2=p.H;
    var pox=W2*0.42,poy=H2/2,psc=26;
    gridBG(c2,W2,H2,pox,poy,psc);
    c2.strokeStyle='#ffcf6a';c2.lineWidth=1.5;c2.beginPath();c2.moveTo(pox,0);c2.lineTo(pox,H2);c2.stroke();
    c2.fillStyle='#a4aec6';c2.font='12px sans-serif';c2.fillText('s-plane (poles x)',pox+8,14);
    c2.fillText('left half = stable',10,H2-8);
    var disc=z*z-1;
    if(Math.abs(disc)<1e-6){ cross(c2,pox-z*w*psc,poy); }
    else if(disc>0){ var r=Math.sqrt(disc); cross(c2,pox-z*w*psc,poy+w*r*psc); cross(c2,pox-z*w*psc,poy-w*r*psc); }
    else { var im=w*Math.sqrt(-disc); cross(c2,pox-z*w*psc,poy+im*psc); cross(c2,pox-z*w*psc,poy-im*psc); }
    var out=document.getElementById('oscOut');
    if(out){
      var regime = z<0.999?'UNDERDAMPED: complex pair -zeta w0 +/- i w0 sqrt(1-zeta^2) — oscillates while decaying (the spiral of section 7)'
                   :(z>1.001?'OVERDAMPED: two distinct real negative poles — slow creep, zero overshoot (the stable node of section 7)'
                            :'CRITICALLY DAMPED (zeta=1): repeated real pole — fastest return with NO overshoot. What engineers tune doors, suspensions and drone controllers for.');
      out.textContent='y + 2 zeta w0 y + w0^2 y = 0  ->  '+regime+'  One equation, one parameter zeta: all three eigen-regimes of section 7 in a single slider — and the jw axis here is section 8 stability boundary (the same -Re lambda you read off in the phase portrait).';
    }
  }
  ['oscZ','oscW'].forEach(function(id){var e=document.getElementById(id);if(e)e.addEventListener('input',draw);});
  window.addEventListener('resize',draw); draw();
}

/* ============ 6. Phase portrait + trace-det classification map ============ */
function initPhase(){
  var c=document.getElementById('phaseCanvas'); if(!c)return;
  var td=document.getElementById('tdCanvas');
  function drawTd(tr,det){
    if(!td)return;
    var o=fitCanvas(td,320),ctx=o.ctx,W=o.W,H=o.H;
    var ox=W/2,oy=H/2,scx=(W-24)/8,scy=(H-24)/6;
    var cell=5;
    for(var px=0;px<W;px+=cell){for(var py=0;py<H;py+=cell){
      var x=(px-ox)/scx, y=(oy-py)/scy;
      var col;
      if(y<-0.03)col='rgba(255,143,163,0.20)';
      else if(x*x-4*y<-0.03)col=y>=0?(x<0?'rgba(125,227,168,0.22)':'rgba(255,207,106,0.22)'):'rgba(255,143,163,0.22)';
      else col=y>=0?(x<0?'rgba(125,227,168,0.10)':'rgba(255,207,106,0.10)'):'rgba(255,143,163,0.10)';
      ctx.fillStyle=col;ctx.fillRect(px,py,cell,cell);
    }}
    ctx.strokeStyle='#33406a';ctx.beginPath();ctx.moveTo(0,oy);ctx.lineTo(W,oy);ctx.moveTo(ox,0);ctx.lineTo(ox,H);ctx.stroke();
    ctx.strokeStyle='#6aa8ff';ctx.lineWidth=1.5;ctx.beginPath();
    for(var t=-4.5;t<=4.5;t+=0.1){var X=ox+t*scx,Y=oy-t*t/4*scy;if(t===-4.5)ctx.moveTo(X,Y);else ctx.lineTo(X,Y);}ctx.stroke();
    ctx.fillStyle='#a4aec6';ctx.font='12px sans-serif';
    ctx.fillText('tr',W-22,oy-6);ctx.fillText('det',ox+6,14);
    ctx.fillText('saddle (det<0)',10,H-8);
    ctx.fillStyle='#7de3a8';ctx.fillText('stable spiral',10,26);
    ctx.fillStyle='#ffcf6a';ctx.fillText('unstable spiral',W-92,26);
    ctx.fillStyle='#6aa8ff';ctx.fillText('parabola tr^2=4det: repeated eigenvalues',10,42);
    ctx.fillStyle='#ff8fa3';ctx.beginPath();ctx.arc(ox+Math.max(-4,Math.min(4,tr))*scx,oy-Math.max(-3,Math.min(3,det))*scy,6,0,7);ctx.fill();
    ctx.fillStyle='#e9edf6';ctx.fillText('(tr,det)=('+tr.toFixed(2)+','+det.toFixed(2)+')',Math.min(ox+tr*scx+9,W-140),oy-Math.max(-3,Math.min(3,det))*scy-6);
  }
  function draw(){
    var a=num('pA',-1),b=num('pB',2),cc=num('pC',-2),d=num('pD',-1);
    var o=fitCanvas(c,320),ctx=o.ctx,W=o.W,H=o.H;
    var ox=W/2,oy=H/2,sc=26;
    gridBG(ctx,W,H,ox,oy,sc);
    for(var gx=-6;gx<=6;gx++){for(var gy=-4;gy<=4;gy++){
      var vx=a*gx+b*gy, vy=cc*gx+d*gy;
      var n=Math.hypot(vx,vy); if(n<1e-6)continue;
      var L=0.32; vx=vx/n*L; vy=vy/n*L;
      ctx.strokeStyle='rgba(106,168,255,0.5)';ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(ox+gx*sc,oy-gy*sc);ctx.lineTo(ox+(gx+vx)*sc,oy-(gy+vy)*sc);ctx.stroke();
    }}
    var seeds=[[2,0],[-2,0],[0,2],[0,-2],[2,2],[-2,-2],[2,-2],[-2,2]];
    var cols=['#7de3a8','#ffcf6a','#ff8fa3','#6aa8ff','#c9a6ff','#8fe3ff','#ffd18f','#b8ff9e'];
    seeds.forEach(function(sd,idx){
      var x=sd[0],y=sd[1],dt=0.03;
      ctx.strokeStyle=cols[idx%cols.length];ctx.lineWidth=2;ctx.beginPath();
      ctx.moveTo(ox+x*sc,oy-y*sc);
      for(var i=0;i<600;i++){
        var dx=(a*x+b*y)*dt, dy=(cc*x+d*y)*dt;
        x+=dx;y+=dy;
        if(Math.abs(x)>8||Math.abs(y)>8)break;
        ctx.lineTo(ox+x*sc,oy-y*sc);
      }
      ctx.stroke();
    });
    var e=eigen2(a,b,cc,d),out=document.getElementById('phaseOut');
    var tr=a+d,det=a*d-b*cc,disc=tr*tr-4*det,cls;
    if(det<0)cls='saddle (unstable)';
    else if(Math.abs(tr)<1e-9&&disc<0)cls='center (neutral closed orbits)';
    else if(disc>=0)cls=(tr<0?'stable node (sink)':'unstable node (source)');
    else cls=(tr<0?'stable spiral (sink)':'unstable spiral (source)');
    if(e.real){
      [[e.v1,'#7de3a8'],[e.v2,'#ffcf6a']].forEach(function(p){
        var v=p[0];
        ctx.strokeStyle=p[1];ctx.setLineDash([6,4]);ctx.beginPath();
        ctx.moveTo(ox-v[0]*6*sc,oy+v[1]*6*sc);ctx.lineTo(ox+v[0]*6*sc,oy-v[1]*6*sc);ctx.stroke();ctx.setLineDash([]);
      });
    }
    if(out)out.textContent='tr='+tr.toFixed(2)+'  det='+det.toFixed(2)+'  disc='+disc.toFixed(2)+'  ->  '+cls+(e.real?('   lambda1='+e.l1.toFixed(2)+', lambda2='+e.l2.toFixed(2)):('   lambda='+e.re.toFixed(2)+' +/- i'+e.im.toFixed(2)));
    drawTd(tr,det);
  }
  ['pA','pB','pC','pD'].forEach(function(id){var el=document.getElementById(id);if(el)el.addEventListener('input',draw);});
  window.addEventListener('resize',draw); draw();
}

/* ============ 7. Laplace pole <-> decay ============ */
function initLaplace(){
  var ct=document.getElementById('lapTimeCanvas'),cp=document.getElementById('lapPlaneCanvas');
  if(!ct||!cp)return;
  function draw(){
    var a=num('lapA',1.5);
    var t=fitCanvas(ct,240),ctx=t.ctx,W=t.W,H=t.H;
    gridBG(ctx,W,H,10,H-24,24);
    ctx.strokeStyle='#7de3a8';ctx.lineWidth=2.5;ctx.beginPath();
    for(var px=0;px<=W-20;px++){
      var tt=px/(W-20)*5, y=Math.exp(-a*tt);
      if(y>3)y=3; if(y<-2)y=-2;
      var X=10+px, Y=(H-24)-y*(H-60)/2.5;
      if(px===0)ctx.moveTo(X,Y);else ctx.lineTo(X,Y);
    }
    ctx.stroke();
    ctx.fillStyle='#a4aec6';ctx.font='12px sans-serif';ctx.fillText('f(t)=e^(-'+a.toFixed(2)+'t) u(t),  t in [0,5]',10,16);
    if(a>0.05){
      var tHalf=Math.log(2)/a;
      if(tHalf<=5){
        var hx=10+tHalf/5*(W-20);
        ctx.strokeStyle='rgba(255,207,106,0.7)';ctx.setLineDash([4,4]);
        ctx.beginPath();ctx.moveTo(hx,18);ctx.lineTo(hx,H-24);ctx.stroke();ctx.setLineDash([]);
        ctx.fillStyle='#ffcf6a';ctx.fillText('half-life ln2/a = '+tHalf.toFixed(2)+' s',Math.min(hx+4,W-150),32);
      }
    }
    var p=fitCanvas(cp,240),c2=p.ctx,W2=p.W,H2=p.H;
    var ox=W2/2,oy=H2/2,sc=28;
    gridBG(c2,W2,H2,ox,oy,sc);
    c2.fillStyle='#a4aec6';c2.font='12px sans-serif';c2.fillText('s-plane: sigma ->,  j omega up',10,16);
    c2.strokeStyle='#ffcf6a';c2.lineWidth=1.5;c2.beginPath();c2.moveTo(ox,0);c2.lineTo(ox,H2);c2.stroke();
    c2.fillStyle='#7de3a8';c2.fillText('LEFT half-plane = stable',10,H2-10);
    c2.fillStyle='#ff8fa3';c2.fillText('RIGHT = unstable',W2-110,H2-10);
    var poleX=ox+Math.max(-6,Math.min(6,-a))*sc;
    c2.strokeStyle='#ff8fa3';c2.lineWidth=3;
    c2.beginPath();c2.moveTo(poleX-8,oy-8);c2.lineTo(poleX+8,oy+8);c2.moveTo(poleX+8,oy-8);c2.lineTo(poleX-8,oy+8);c2.stroke();
    c2.fillStyle='#e9edf6';c2.fillText('pole s = '+((-a).toFixed(2)),Math.min(Math.max(poleX+10,8),W2-110),oy-12);
    var out=document.getElementById('lapOut');
    if(out)out.textContent='F(s)=1/(s+'+a.toFixed(2)+'). '+
      (a>0?'Pole sits in the LEFT half-plane -> e^(-at) decays -> stable. As a shrinks toward 0 the pole approaches the jw axis and decay slows: the distance from the axis IS the decay rate -Re lambda, the same number you read off a phase portrait in section 7.'
          :(a<0?'a<0 pushes the pole into the RIGHT half-plane -> e^(-at) GROWS -> unstable. Control theory\'s whole stability question in one drag: are all poles on the left?'
                :'a=0: pole exactly ON the axis -> marginal: no decay, no growth.'));
  }
  var e=document.getElementById('lapA');if(e)e.addEventListener('input',draw);
  window.addEventListener('resize',draw); draw();
}

/* ============ 8-10. Fourier: builder + spectrum + epicycles ============ */
function coefAmp(type,n){
  if(type==='square')return (n%2===1)?4/(n*Math.PI):0;
  if(type==='sawtooth')return 2*Math.pow(-1,n+1)/(n*Math.PI);
  return (n%2===1)?8/(Math.PI*Math.PI*n*n):0;
}
function fourTerm(type,n,x){
  var amp=coefAmp(type,n);
  if(!amp)return 0;
  return amp*(type==='triangle'?Math.cos(n*x):Math.sin(n*x));
}
function initFourier(){
  var c=document.getElementById('fourCanvas'); if(!c)return;
  var cs=document.getElementById('fourSpecCanvas');
  var ce=document.getElementById('epiCanvas');
  var anim=null, tt=0, running=true, visible=true;
  function type(){return ((document.getElementById('fourType')||{}).value||'square');}
  function nCount(){return parseInt((document.getElementById('fourN')||{}).value||9,10);}
  function draw(){
    var o=fitCanvas(c,300),ctx=o.ctx,W=o.W,H=o.H;
    var ox=10,oy=H/2,scx=(W-20)/(2*Math.PI),scy=H*0.32;
    gridBG(ctx,W,H,W/2,oy,24);
    function X(x){return ox+(x+Math.PI)*scx;}
    function Y(y){return oy-y*scy;}
    var ty=type(), Nv=nCount();
    ctx.strokeStyle='#5b678c';ctx.setLineDash([6,5]);ctx.lineWidth=1.5;ctx.beginPath();
    for(var px=-Math.PI;px<=Math.PI+0.001;px+=0.02){
      var tv;
      if(ty==='square')tv=(px>0)?1:-1;
      else if(ty==='sawtooth')tv=px/Math.PI;
      else tv=1-2*Math.abs(px)/Math.PI;
      var cx=X(px),cy=Y(tv);
      if(px===-Math.PI)ctx.moveTo(cx,cy);else ctx.lineTo(cx,cy);
    }
    ctx.stroke();ctx.setLineDash([]);
    ctx.strokeStyle='#7de3a8';ctx.lineWidth=2.5;ctx.beginPath();
    for(var x=-Math.PI;x<=Math.PI;x+=0.02){
      var ssum=0;
      for(var n=1;n<=Nv;n++)ssum+=fourTerm(ty,n,x);
      var Xp=X(x),Yp=Y(ssum);
      if(x===-Math.PI)ctx.moveTo(Xp,Yp);else ctx.lineTo(Xp,Yp);
    }
    ctx.stroke();
    var lab=document.getElementById('fourLabel');
    if(lab){
      lab.textContent=(ty==='square'
        ?'Square wave (odd -> sines only): b_n = 4/(n pi), odd n. '
        :ty==='sawtooth'
          ?'Sawtooth f(x)=x/π (odd -> sines only): b_n = 2(-1)^(n+1)/(nπ), decays like 1/n. '
          :'Triangle wave (even -> cosines only): a_n = 8/(pi^2 n^2), odd n — 1/n^2 decay. ')
        +'N = '+Nv+'. Compare Gibbs: the discontinuous square/saw keep a ~9% overshoot at jumps no matter the N; the continuous triangle converges cleanly (only its corners round off).';
    }
  }
  function spec(){
    if(!cs)return;
    var o=fitCanvas(cs,240),ctx=o.ctx,W=o.W,H=o.H;
    gridBG(ctx,W,H,26,H-22,24);
    var ty=type(), Nv=nCount(), maxN=13;
    for(var n=1;n<=maxN;n++){
      var mag=Math.abs(coefAmp(ty,n));
      var x=26+(n-0.5)/maxN*(W-40);
      var h=mag/1.35*(H-60);
      ctx.strokeStyle=n<=Nv?'#6aa8ff':'rgba(106,168,255,0.22)';
      ctx.lineWidth=4;
      ctx.beginPath();ctx.moveTo(x,H-22);ctx.lineTo(x,H-22-Math.max(1,h));ctx.stroke();
      ctx.fillStyle='#5b678c';ctx.font='10px sans-serif';ctx.fillText(String(n),x-3,H-8);
    }
    ctx.fillStyle='#a4aec6';ctx.font='12px sans-serif';
    ctx.fillText('|coefficient| vs harmonic n — the SPECTRUM (bright bars = the N the curve above uses)',30,12);
    ctx.fillText('heights decay like 1/n for a jump, 1/n^2 for a kink: smoothness is visible in the spectrum',30,26);
  }
  function frame(){
    anim=null;
    if(!ce)return;
    var o=fitCanvas(ce,300,true),ctx=o.ctx,W=o.W,H=o.H;
    ctx.clearRect(0,0,W,H);
    var ty=type(), Nv=nCount();
    var cx0=W*0.20, cy0=H/2, R=H*0.30;
    var x=cx0,y=cy0;
    ctx.lineWidth=1;
    for(var n=1;n<=Nv;n++){
      var amp=coefAmp(ty,n);
      if(!amp)continue;
      var r=Math.abs(amp)*R*1.1;
      var phase=(ty==='triangle'?Math.PI/2:0)+(amp<0?Math.PI:0);
      ctx.strokeStyle='#26304e';ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.stroke();
      // canvas y grows downward, so the vertical step is SUBTRACTED: that makes the
      // tip's height equal the plotted wave's height (same terms, same phase).
      var nx=x+r*Math.cos(n*tt+phase), ny=y-r*Math.sin(n*tt+phase);
      ctx.strokeStyle='#4a5680';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(nx,ny);ctx.stroke();
      x=nx;y=ny;
    }
    ctx.fillStyle='#ff8fa3';ctx.beginPath();ctx.arc(x,y,4,0,7);ctx.fill();
    var start=W*0.44, span=W*0.52;
    ctx.strokeStyle='#5b678c';ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(start,y);ctx.stroke();ctx.setLineDash([]);
    ctx.strokeStyle='#7de3a8';ctx.lineWidth=2;ctx.beginPath();
    for(var s=0;s<=200;s++){
      var t2=tt+s/200*2*Math.PI, v=0;
      for(var n2=1;n2<=Nv;n2++)v+=fourTerm(ty,n2,t2);
      var X2=start+(s/200)*span, Y2=cy0-v*R*1.1;
      if(s===0)ctx.moveTo(X2,Y2);else ctx.lineTo(X2,Y2);
    }
    ctx.stroke();
    ctx.fillStyle='#a4aec6';ctx.font='12px sans-serif';
    ctx.fillText('each term c_n e^(inx) = a rotating phasor; tip-to-tail the chain, the last tip traces f(x)',8,H-8);
    tt+=0.02; if(tt>2*Math.PI)tt-=2*Math.PI;
    if(running&&visible) anim=requestAnimationFrame(frame);
  }
  function start(){ if(ce&&!anim&&running&&visible) anim=requestAnimationFrame(frame); }
  function stop(){ if(anim){cancelAnimationFrame(anim);anim=null;} }
  var eb=document.getElementById('epiTog');
  if(eb)eb.addEventListener('click',function(){
    running=!running;
    if(running)start(); else stop();
    eb.textContent=running?'pause':'run epicycles';
  });
  // don't burn a 60fps rAF loop on a canvas nobody is looking at
  if(ce&&typeof window.IntersectionObserver==='function'){
    new window.IntersectionObserver(function(en){
      visible=en[0].isIntersecting;
      if(visible)start(); else stop();
    },{threshold:0}).observe(ce);
  }
  var n=document.getElementById('fourN'),t=document.getElementById('fourType');
  if(n)n.addEventListener('input',function(){draw();spec();});
  if(t)t.addEventListener('change',function(){draw();spec();});
  window.addEventListener('resize',function(){draw();spec();});
  draw();spec();
  start();
}

document.addEventListener('DOMContentLoaded',function(){
  ['initSpan','initGS','initMatrix','initEigProbe','initPower','initSVD','initSlope','initOsc','initPhase','initLaplace','initFourier'].forEach(function(name){
    try{ window[name](); }catch(e){ console.warn(name,e); }
  });
});
