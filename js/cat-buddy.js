(() => {
  const options=window.PT_CAT_BUDDY||{};
  if(!options.src)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer=matchMedia('(pointer:fine)');
  const phrases=options.phrases?.length?options.phrases:['MEOW.EXE'];
  const cat=document.createElement('div');cat.id='cat-buddy';cat.tabIndex=0;
  cat.setAttribute('role','button');cat.setAttribute('aria-label','和 Pangdou 互动');
  const jumper=document.createElement('div');jumper.className='cb-jumper';
  const breather=document.createElement('div');breather.className='cb-breather';
  const image=document.createElement('img');image.className='cb-img';image.src=options.src;
  image.alt='Pangdou';image.draggable=false;image.decoding='async';image.loading='lazy';image.fetchPriority='low';
  breather.append(image);jumper.append(breather);
  const shadow=document.createElement('div');shadow.className='cb-shadow';shadow.setAttribute('aria-hidden','true');
  const bubble=document.createElement('div');bubble.className='cb-bubble';bubble.textContent=phrases[0];
  cat.append(jumper,shadow,bubble);document.body.append(cat);
  let bounds=cat.getBoundingClientRect(),frame=0,bubbleTimer=0,jumpTimer=0,chatterTimer=0;
  let position=[0,0,0,1],target=[0,0,0,1],jumping=false;
  function render(){
    image.style.transform=`translate(${position[0].toFixed(2)}px,${position[1].toFixed(2)}px) rotate(${position[2].toFixed(2)}deg) scale(${position[3].toFixed(3)})`;
    shadow.style.transform=`scaleX(${(1-(position[3]-1)*1.9).toFixed(3)})`;
  }
  function animate(){
    frame=0;
    if(document.hidden||reduced.matches)return;
    position=position.map((value,index)=>value+(target[index]-value)*.25);render();
    if(position.some((value,index)=>Math.abs(target[index]-value)>.035))frame=requestAnimationFrame(animate);
    else{position=[...target];render();image.style.willChange='auto';}
  }
  function moveTo(values){
    target=values;
    if(!frame&&position.some((value,index)=>Math.abs(value-target[index])>.035)){
      image.style.willChange='transform';frame=requestAnimationFrame(animate);
    }
  }
  function follow(event){
    if(document.hidden||reduced.matches||!finePointer.matches||options.followMouse===false)return;
    const dx=event.clientX-(bounds.left+bounds.width/2),dy=event.clientY-(bounds.top+bounds.height*.4);
    const distance=Math.hypot(dx,dy);
    if(distance>=500){moveTo([0,0,0,1]);return;}
    let weight=Math.max(0,Math.min(1,(500-distance)/380));weight=weight*weight*(3-2*weight);
    const near=Math.max(0,1-distance/420);
    moveTo([Math.max(-18,Math.min(18,dx/16))*weight,Math.max(-28,Math.min(6,dy/26))*weight,Math.max(-22,Math.min(22,-dx/14))*weight,1+near*.18]);
  }
  addEventListener('pointermove',follow,{passive:true});
  addEventListener('resize',()=>{bounds=cat.getBoundingClientRect();moveTo([0,0,0,1]);},{passive:true});
  function say(text){
    bubble.textContent=text;cat.classList.add('show');clearTimeout(bubbleTimer);
    bubbleTimer=setTimeout(()=>cat.classList.remove('show'),1700);
  }
  function interact(){
    if(jumping)return;
    say(phrases[Math.floor(Math.random()*phrases.length)]);
    if(!reduced.matches){
      jumping=true;cat.classList.add('jump');clearTimeout(jumpTimer);
      jumpTimer=setTimeout(()=>{cat.classList.remove('jump');jumping=false;},570);
    }
  }
  cat.addEventListener('click',interact);
  cat.addEventListener('keydown',event=>{
    if(event.key==='Enter'||event.key===' '){event.preventDefault();interact();}
  });
  document.addEventListener('mouseleave',()=>{moveTo([0,0,0,1]);if(!jumping)say('...zZz');});
  function syncChatter(){
    clearTimeout(chatterTimer);
    if(document.hidden||reduced.matches)return;
    chatterTimer=setTimeout(()=>{
      if(!jumping&&Math.random()<.15)say(phrases[Math.floor(Math.random()*phrases.length)]);
      syncChatter();
    },7500);
  }
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){cancelAnimationFrame(frame);frame=0;position=[0,0,0,1];target=[...position];render();}
    syncChatter();
  });
  reduced.addEventListener('change',()=>{
    cancelAnimationFrame(frame);frame=0;position=[0,0,0,1];target=[...position];render();syncChatter();
  });
  syncChatter();
})();
