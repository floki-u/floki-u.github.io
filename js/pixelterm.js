(() => {
  const root = document.documentElement;
  const toggle = document.querySelector('[data-theme-toggle]');
  let theme = root.dataset.theme || 'dark';
  try { theme = localStorage.getItem('pt-theme') || 'dark'; } catch (_) {}
  function applyTheme(value) {
    root.dataset.theme = value;
    toggle.textContent = value === 'dark' ? '☀' : '☾';
    toggle.setAttribute('aria-label', value === 'dark' ? '切换到浅色主题' : '切换到深色主题');
    document.dispatchEvent(new CustomEvent('floki:theme', { detail:value }));
  }
  applyTheme(theme);
  toggle.addEventListener('click', () => {
    theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(theme);
    try { localStorage.setItem('pt-theme',theme); } catch (_) {}
  });

  document.querySelectorAll('[data-pangdou-card]').forEach(button => {
    const message=document.querySelector('[data-pangdou-message]');
    const initial=message ? message.textContent : '';
    let reset=0;
    button.addEventListener('click',()=>{
      const phrases=window.PT_CAT_BUDDY?.phrases||['MEOW.EXE','RUA~'];
      if(message)message.textContent=phrases[Math.floor(Math.random()*phrases.length)];
      button.classList.remove('jump');
      if(!matchMedia('(prefers-reduced-motion: reduce)').matches)requestAnimationFrame(()=>button.classList.add('jump'));
      clearTimeout(reset);reset=setTimeout(()=>{button.classList.remove('jump');if(message)message.textContent=initial;},1700);
    });
  });
  const menu = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('#main-nav');
  function closeMenu() {
    nav.classList.remove('open'); menu.setAttribute('aria-expanded','false'); menu.textContent='菜单';
  }
  menu.addEventListener('click', () => {
    const open = !nav.classList.contains('open'); nav.classList.toggle('open',open);
    menu.setAttribute('aria-expanded',String(open)); menu.textContent=open ? '关闭' : '菜单';
  });
  document.addEventListener('keydown',event => { if (event.key==='Escape') closeMenu(); });
  document.addEventListener('click',event => { if (!event.target.closest('.site-header')) closeMenu(); });
  window.matchMedia('(min-width:681px)').addEventListener('change',closeMenu);
  document.querySelectorAll('[data-filter-group]').forEach(group => {
    const target=document.querySelector(group.dataset.filterTarget);
    group.addEventListener('click',event => {
      const button=event.target.closest('[data-filter]'); if (!button) return;
      group.querySelectorAll('[data-filter]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
      target.querySelectorAll('[data-category]').forEach(item=>{
        item.hidden=button.dataset.filter!=='all' && item.dataset.category!==button.dataset.filter;
      });
      // Filtered content stays visible without waiting for a second reveal animation.
      target.querySelectorAll('.reveal-pending').forEach(item=>item.classList.remove('reveal-pending'));
    });
  });
})();

(() => {
  const root=document.documentElement;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const canvas=document.querySelector('#rain');
  const context=canvas?.getContext('2d',{alpha:false});
  const clock=document.querySelector('[data-clock]');
  const characters='01ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿｦABCDEFGH#$%&*';
  let drops=[],spacing=18,rainTimer=0,rainFrame=0,scrollTimer=0,cloudTimer=0,clockTimer=0;
  let scrolling=false;
  function isPaused(){return document.hidden||reduced.matches||scrolling;}
  function resizeRain(){
    if(!canvas||!context)return;
    canvas.width=innerWidth;canvas.height=innerHeight;
    spacing=innerWidth<681?26:18;
    drops=Array.from({length:Math.ceil(innerWidth/spacing)},()=>Math.random()*(canvas.height/18));
    context.fillStyle='#0b0f14';context.fillRect(0,0,canvas.width,canvas.height);
    context.font='14px ui-monospace,monospace';
  }
  function stopRain(){clearTimeout(rainTimer);cancelAnimationFrame(rainFrame);rainTimer=0;rainFrame=0;}
  function scheduleRain(){
    if(!context||isPaused()||root.dataset.theme!=='dark'||rainTimer||rainFrame)return;
    rainTimer=setTimeout(()=>{rainTimer=0;rainFrame=requestAnimationFrame(drawRain);},80);
  }
  function drawRain(){
    rainFrame=0;
    if(isPaused()||root.dataset.theme!=='dark')return;
    context.fillStyle='rgba(11,15,20,.1)';context.fillRect(0,0,canvas.width,canvas.height);
    context.fillStyle='#22c55e';
    drops.forEach((y,index)=>{
      context.fillText(characters[Math.floor(Math.random()*characters.length)],index*spacing,y*18);
      drops[index]=y*18>canvas.height&&Math.random()>.97?0:y+1;
    });
    scheduleRain();
  }
  function makeCloud(){
    if(isPaused()||root.dataset.theme!=='light')return;
    const cloud=document.createElement('div');cloud.className='cloud';cloud.setAttribute('aria-hidden','true');
    cloud.style.top=(8+Math.random()*24)+'%';cloud.style.animationDuration=(30+Math.random()*12)+'s';
    cloud.addEventListener('animationiteration',()=>cloud.remove(),{once:true});document.body.append(cloud);
  }
  function syncClouds(){
    clearInterval(cloudTimer);cloudTimer=0;
    if(document.hidden||reduced.matches||root.dataset.theme!=='light'){
      document.querySelectorAll('.cloud').forEach(cloud=>cloud.remove());return;
    }
    if(!document.querySelector('.cloud'))makeCloud();
    cloudTimer=setInterval(()=>{if(document.querySelectorAll('.cloud').length<3)makeCloud();},14000);
  }
  function updateClock(){
    clearTimeout(clockTimer);
    if(!clock||document.hidden)return;
    clock.textContent=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Shanghai',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date());
    clockTimer=setTimeout(updateClock,1000-Date.now()%1000);
  }
  function syncMotion(){
    root.dataset.motionState=isPaused()?'paused':'running';
    stopRain();scheduleRain();
  }
  function onScroll(){
    if(!scrolling){scrolling=true;syncMotion();}
    clearTimeout(scrollTimer);
    scrollTimer=setTimeout(()=>{scrolling=false;syncMotion();},140);
  }
  // Wheel and touch scrolling remain fully native: no preventDefault or scripted scrollTo.
  addEventListener('scroll',onScroll,{passive:true});
  addEventListener('resize',()=>{stopRain();resizeRain();scheduleRain();},{passive:true});
  document.addEventListener('visibilitychange',()=>{syncMotion();syncClouds();updateClock();});
  document.addEventListener('floki:theme',()=>{syncMotion();syncClouds();});
  reduced.addEventListener('change',()=>{
    document.querySelectorAll('.reveal-pending').forEach(el=>el.classList.remove('reveal-pending'));
    syncMotion();syncClouds();
  });
  resizeRain();syncMotion();syncClouds();updateClock();
  const boot=document.querySelector('[data-boot]');
  if(boot&&!reduced.matches){
    let lines=[];try{lines=JSON.parse(boot.dataset.boot);}catch(_){}
    const nodes=lines.map(html=>{const el=document.createElement('div');el.innerHTML=html;return{el,text:el.textContent,html};});
    if(nodes.length){
      boot.replaceChildren(...nodes.map(item=>{item.el.textContent='';return item.el;}));
      let line=0,position=0;
      function type(){
        if(document.hidden){setTimeout(type,150);return;}
        if(reduced.matches){nodes.forEach(item=>item.el.innerHTML=item.html);return;}
        const item=nodes[line];position=Math.min(position+3,item.text.length);item.el.textContent=item.text.slice(0,position);
        if(position===item.text.length){item.el.innerHTML=item.html;line++;position=0;}
        if(line<nodes.length){setTimeout(type,25);return;}
        const cursor=document.createElement('span');cursor.className='cursor';cursor.setAttribute('aria-hidden','true');boot.append(cursor);
      }
      type();
    }
  }
  if(!reduced.matches&&'IntersectionObserver'in window){
    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.remove('reveal-pending');observer.unobserve(entry.target);}});
    },{rootMargin:'0px 0px 80px 0px',threshold:0});
    document.querySelectorAll('.fade').forEach(el=>{
      // Above-the-fold content is readable immediately; only later sections reveal.
      if(el.getBoundingClientRect().top>innerHeight+80){el.classList.add('reveal-pending');observer.observe(el);}
    });
  }
})();
