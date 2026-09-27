// App chrome: reading progress, video facades, copy buttons, active-nav tracking.
(function(){
  var bar=document.getElementById('progress');
  function onScroll(){
    if(bar){
      var h=document.documentElement;
      var max=h.scrollHeight-h.clientHeight;
      bar.style.width=(max>0?(h.scrollTop||document.body.scrollTop)/max*100:0)+'%';
    }
    var t=document.getElementById('toTop');
    if(t) t.style.display=(window.scrollY>600)?'block':'none';
  }
  window.addEventListener('scroll',onScroll,{passive:true});

  // Video facades: click (or Enter) -> swap in a privacy-respecting youtube-nocookie iframe.
  // referrerpolicy is REQUIRED: without it YouTube's embed rejects the request with
  // "Error 153 - player configuration error" because the HTTP Referer is missing.
  document.querySelectorAll('.vid[data-yt]').forEach(function(v){
    function label(){
      var cap=v.querySelector('.vcap');
      return v.getAttribute('aria-label') || (cap&&cap.textContent.trim()) || 'YouTube video';
    }
    function load(){
      var id=v.getAttribute('data-yt');
      var f=document.createElement('iframe');
      f.src='https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1&rel=0&playsinline=1';
      f.setAttribute('referrerpolicy','strict-origin-when-cross-origin');
      f.setAttribute('allow','accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen');
      f.setAttribute('allowfullscreen','');
      f.setAttribute('frameborder','0');
      f.title=label();
      v.innerHTML='';
      v.appendChild(f);
    }
    v.addEventListener('click',load);
    v.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){e.preventDefault();load();} });
  });

  // Copy buttons for code blocks.
  document.querySelectorAll('.cbcopy').forEach(function(btn){
    btn.addEventListener('click',function(){
      var code=btn.closest('pre').querySelector('code');
      var text=code?code.innerText:'';
      function done(){ var o=btn.textContent; btn.textContent='copied ✓'; setTimeout(function(){btn.textContent=o;},1400); }
      if(navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(text).then(done,function(){fallback();}); }
      else fallback();
      function fallback(){ var ta=document.createElement('textarea'); ta.value=text; document.body.appendChild(ta); ta.select(); try{document.execCommand('copy');done();}catch(e){} document.body.removeChild(ta); }
    });
  });

  // Inline term tooltips. One shared popover, event-delegated, so a term
  // added anywhere in the markup needs no wiring. Fires on hover AND on
  // click/tap, because touch has no hover -- the tap would otherwise do
  // nothing. Esc and outside-tap dismiss. The gloss is an aid, not the
  // source: the term itself is always written out in full in the prose.
  (function(){
    var tip=document.createElement('div');
    tip.id='tip';
    tip.setAttribute('role','tooltip');
    document.body.appendChild(tip);
    var host=null;

    function show(el){
      var text=el.getAttribute('data-tip');
      if(!text) return;
      host=el;
      tip.innerHTML=text;
      tip.classList.add('on');
      var r=el.getBoundingClientRect();
      // Lay out off-screen first so the measured width is the real one.
      tip.style.left='0px';
      tip.style.top='0px';
      var w=tip.offsetWidth, h=tip.offsetHeight;
      var left=r.left+window.scrollX+(r.width/2)-(w/2);
      var below=r.bottom+window.scrollY+8;
      var above=r.top+window.scrollY-h-8;
      // Prefer below; flip above only when below doesn't fit AND above has
      // real room -- otherwise a term near the top of the page would put the
      // tip underneath the sticky header. Then clamp, so it never leaves the page.
      var fitsBelow=r.bottom+h+16<=window.innerHeight;
      var top=(!fitsBelow&&r.top-h-16>0)?above:below;
      left=Math.max(8,Math.min(left,window.scrollX+window.innerWidth-w-8));
      top=Math.max(window.scrollY+8,Math.min(top,window.scrollY+window.innerHeight-h-8));
      tip.style.left=Math.round(left)+'px';
      tip.style.top=Math.round(top)+'px';
      el.classList.add('on');
    }
    function hide(){
      tip.classList.remove('on');
      if(host) host.classList.remove('on');
      host=null;
    }
    function target(e){
      var t=e.target;
      return t&&t.closest?t.closest('.term[data-tip]'):null;
    }

    document.addEventListener('mouseover',function(e){
      var el=target(e);
      if(el) show(el); else if(host) hide();
    });
    document.addEventListener('click',function(e){
      var el=target(e);
      if(el){ e.preventDefault(); (el===host)?hide():show(el); }
      else hide();
    });
    document.addEventListener('keydown',function(e){ if(e.key==='Escape') hide(); });
    window.addEventListener('scroll',hide,{passive:true});
    window.addEventListener('resize',hide);
  })();

  // Active-section highlight in the sidebar (IntersectionObserver).
  var links=[];
  document.querySelectorAll('nav.side a[href^="#"]').forEach(function(a){ links.push({a:a, id:a.getAttribute('href').slice(1)}); });
  var byId={};
  links.forEach(function(l){ (byId[l.id]=byId[l.id]||[]).push(l.a); });
  function setActive(id){
    links.forEach(function(l){ l.a.classList.toggle('active', l.id===id); });
    links.forEach(function(l){ if(l.id===id){ var d=l.a.closest('details.grp'); if(d) d.setAttribute('open',''); } });
  }
  if('IntersectionObserver' in window){
    var visible={};
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        visible[en.target.id]=en.isIntersecting;
      });
      var order=Array.prototype.slice.call(document.querySelectorAll('main section.card'));
      for(var i=0;i<order.length;i++){ if(visible[order[i].id]){ setActive(order[i].id); break; } }
    },{rootMargin:'-140px 0px -60% 0px'});
    document.querySelectorAll('main section.card').forEach(function(s){ io.observe(s); });
  }

  // Publish the real header height so the sticky sidebar and scroll margins line up
  // without a hardcoded guess (the subtitle wraps differently at every width).
  var hdr=document.querySelector('header.site');
  function syncHeaderVar(){
    if(!hdr) return;
    document.documentElement.style.setProperty('--header-h',
      window.innerWidth>980 ? hdr.offsetHeight+'px' : '0px');
  }
  syncHeaderVar();
  window.addEventListener('resize',syncHeaderVar);

  var t=document.getElementById('toTop');
  if(t) t.addEventListener('click',function(){ window.scrollTo({top:0,behavior:'smooth'}); });

  onScroll();
})();
