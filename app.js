(()=>{
const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];

/* Filters */
const filters=$$('[data-filter]');
filters.forEach(button=>button.addEventListener('click',()=>{
  filters.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  let count=0;
  $$('[data-category]').forEach(card=>{card.hidden=button.dataset.filter!=='all'&&card.dataset.category!==button.dataset.filter;if(!card.hidden)count++});
  const status=$('#filter-status');if(status)status.textContent=`${count} projects shown`;
}));

/* Artwork viewer — gallery structures remain unchanged */
const dialog=$('#viewer'),art=$$('[data-image]');let current=0,opener=null;
if(dialog&&art.length){
  const image=$('#viewer-image'),label=$('#viewer-label'),original=$('#original');
  const show=i=>{current=(i+art.length)%art.length;const a=art[current];image.src=a.dataset.image;image.alt=a.dataset.caption;label.textContent=`${current+1} / ${art.length} — ${a.dataset.caption}`;original.href=a.dataset.image};
  art.forEach((a,i)=>a.addEventListener('click',()=>{opener=a;show(i);dialog.showModal();document.body.style.overflow='hidden';$('#close-viewer')?.focus()}));
  $('#close-viewer')?.addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{document.body.style.overflow='';opener?.focus()});
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
  $('#previous')?.addEventListener('click',()=>show(current-1));$('#next')?.addEventListener('click',()=>show(current+1));
  dialog.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();show(current+1)}if(e.key==='ArrowLeft'){e.preventDefault();show(current-1)}});
}

const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
if(reduce)return;

/* Page transition */
const wipe=document.createElement('div');wipe.className='page-wipe';wipe.setAttribute('aria-hidden','true');document.body.appendChild(wipe);
document.body.classList.add('page-enter');setTimeout(()=>document.body.classList.remove('page-enter'),850);
$$('a[href]').forEach(a=>a.addEventListener('click',e=>{
  const href=a.getAttribute('href');if(!href||href.startsWith('#')||href.startsWith('mailto:')||href.startsWith('tel:')||href.startsWith('https://wa.me')||a.target==='_blank'||e.metaKey||e.ctrlKey||e.shiftKey)return;
  const url=new URL(a.href,location.href);if(url.origin!==location.origin)return;
  e.preventDefault();document.body.classList.add('page-leave');setTimeout(()=>location.href=a.href,500);
}));

/* Scroll progress */
const progress=document.createElement('div');progress.className='scroll-progress';progress.setAttribute('aria-hidden','true');document.body.appendChild(progress);
const setProgress=()=>{const h=document.documentElement.scrollHeight-innerHeight;progress.style.setProperty('--progress',`${h>0?(scrollY/h)*100:0}%`)};setProgress();addEventListener('scroll',setProgress,{passive:true});

/* Cursor */
if(matchMedia('(pointer:fine)').matches){
  const cursor=document.createElement('div');cursor.className='play-cursor';cursor.setAttribute('aria-hidden','true');document.body.appendChild(cursor);
  let x=innerWidth/2,y=innerHeight/2,tx=x,ty=y;
  addEventListener('pointermove',e=>{tx=e.clientX;ty=e.clientY;document.body.style.setProperty('--mx',`${tx}px`);document.body.style.setProperty('--my',`${ty}px`)},{passive:true});
  const loop=()=>{x+=(tx-x)*.2;y+=(ty-y)*.2;cursor.style.transform=`translate3d(${x}px,${y}px,0) translate(-50%,-50%)`;requestAnimationFrame(loop)};loop();
  $$('a,button').forEach(el=>{el.addEventListener('pointerenter',()=>cursor.classList.add('is-link'));el.addEventListener('pointerleave',()=>cursor.classList.remove('is-link'))});
  $$('.project-cover').forEach(el=>{el.addEventListener('pointerenter',()=>{cursor.classList.remove('is-link');cursor.classList.add('is-project')});el.addEventListener('pointerleave',()=>cursor.classList.remove('is-project'))});
}

/* Scroll reveals */
const targets=$$('.section-heading,.project,.about-preview>*,.contact>*,.about-page>*,.about-details>*,.page-intro>*,.project-intro>*,.next-project,.specialties span,.capability-list article,.filters,.studio-page .reveal');
targets.forEach((el,i)=>{el.classList.add('reveal');if(el.classList.contains('project'))el.classList.add(i%2?'from-right':'from-left');else if(i%6===0)el.classList.add('zoom-in')});
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target)}}),{threshold:.1,rootMargin:'0px 0px -6% 0px'});targets.forEach(el=>io.observe(el));
$$('.hero-top,.hero-body>div,.hero-footer,.hero-chips').forEach((el,i)=>{el.classList.add('reveal');el.style.transitionDelay=`${i*.09}s`;requestAnimationFrame(()=>requestAnimationFrame(()=>el.classList.add('is-visible')))});

/* Project depth and light response — only cards, never gallery artwork */
if(matchMedia('(pointer:fine)').matches){
  $$('.site-page .project').forEach(card=>{const cover=$('.project-cover',card);if(!cover)return;
    card.addEventListener('pointermove',e=>{const r=cover.getBoundingClientRect(),px=(e.clientX-r.left)/r.width,py=(e.clientY-r.top)/r.height;cover.style.setProperty('--px',`${px*100}%`);cover.style.setProperty('--py',`${py*100}%`);cover.style.transform=`perspective(1000px) rotateX(${(0.5-py)*3.5}deg) rotateY(${(px-.5)*4}deg) translateY(-7px)`});
    card.addEventListener('pointerleave',()=>{cover.style.transform='';cover.style.setProperty('--px','50%');cover.style.setProperty('--py','50%')});
  });

  /* magnetic buttons / pills */
  $$('.magnetic,.header nav a').forEach(el=>{el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2);el.style.transform=`translate(${dx*.08}px,${dy*.10}px)`});el.addEventListener('pointerleave',()=>el.style.transform='')});
}

/* Hero depth */
const hero=$('.site-page .hero'),portrait=$('.site-page .portrait-shell');
if(hero&&portrait){addEventListener('scroll',()=>{const y=Math.min(scrollY*.055,34);portrait.style.transform=`translate3d(0,${y}px,0)`},{passive:true});}

/* Slight heading drift to create editorial motion */
const drifting=$$('.site-page .section-heading h2,.studio-page .studio-head h2,.work-page .page-intro h1,.about-site-page .about-page h1');
let ticking=false;const drift=()=>{const vh=innerHeight;drifting.forEach(el=>{const r=el.getBoundingClientRect();const p=(r.top-vh*.5)/vh;el.style.transform=`translateX(${Math.max(-12,Math.min(12,-p*12))}px)`});ticking=false};addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(drift);ticking=true}},{passive:true});


/* Studio reference additions */
/* Typewriter heading */
const typeHeads=$$('.type-heading');
const runType=(el)=>{const full=el.dataset.text||el.textContent.trim(); if(!full) return; el.textContent=''; el.classList.add('typing'); let i=0; const tick=()=>{el.textContent=full.slice(0,i); i++; if(i<=full.length){setTimeout(tick,58)} else {el.classList.remove('typing')}}; tick();};
if(reduce){typeHeads.forEach(el=>el.textContent=el.dataset.text||el.textContent);}
else if(typeHeads.length){const typeIO=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){runType(e.target);typeIO.unobserve(e.target)}}),{threshold:.65});typeHeads.forEach(el=>typeIO.observe(el));}

const numberTargets=$$('[data-target]');
if(numberTargets.length){
  const countIO=new IntersectionObserver(entries=>entries.forEach(e=>{if(!e.isIntersecting)return;const el=e.target,t=Number(el.dataset.target)||0;let n=0;const step=Math.max(1,Math.ceil(t/28));const timer=setInterval(()=>{n+=step;if(n>=t){n=t;clearInterval(timer)}el.textContent=n+'+'},45);countIO.unobserve(el)}),{threshold:.65});
  numberTargets.forEach(el=>countIO.observe(el));
}
if(matchMedia('(pointer:fine)').matches){
  $$('.studio-page .showcase-card').forEach(card=>{
    const img=$('img',card);if(!img)return;
    card.addEventListener('pointermove',e=>{const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.style.transform=`perspective(1000px) rotateX(${-y*2.3}deg) rotateY(${x*2.8}deg) translateY(-6px)`;img.style.transform=`scale(1.055) translate(${x*5}px,${y*5}px)`});
    card.addEventListener('pointerleave',()=>{card.style.transform='';img.style.transform=''})
  });
}
const studioStage=$('.studio-page .hero-stage');
if(studioStage&&matchMedia('(pointer:fine)').matches){
  studioStage.addEventListener('pointermove',e=>{const r=studioStage.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;studioStage.style.setProperty('--stage-x',x);studioStage.style.setProperty('--stage-y',y);const person=$('.hero-person',studioStage);if(person)person.style.transform=`translate3d(${x*8}px,${y*6}px,0)`});
  studioStage.addEventListener('pointerleave',()=>{const person=$('.hero-person',studioStage);if(person)person.style.transform=''});
}
})();
