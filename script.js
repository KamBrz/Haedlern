
// THEME (persisted across pages)
let dark = (typeof localStorage !== 'undefined' && localStorage.getItem('themePref') === 'dark');
(function initTheme(){
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('themeBtn');
    if (btn) btn.textContent = dark ? '☀️' : '🌙';
  });
})();
function toggleTheme(){
  dark = !dark;
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  const btn = document.getElementById('themeBtn');
  if (btn) btn.textContent = dark ? '☀️' : '🌙';
  try { localStorage.setItem('themePref', dark ? 'dark' : 'light'); } catch(e) {}
  window.dispatchEvent(new Event('scroll'));
}

// TYPING
const phrases=['Microsoft Teams','Microsoft Copilot','Microsoft Excel','Microsoft Outlook','Microsoft SharePoint','Microsoft Word','Microsoft Loop','Microsoft Planner','Microsoft OneDrive','Microsoft Forms','Microsoft To Do','Microsoft Power Automate','Microsoft Power BI','Microsoft OneNote','Microsoft Whiteboard','Microsoft Lists','Microsoft Visio','Microsoft Edge','Microsoft Clipchamp','Microsoft PowerPoint'];
let pi=0,ci=0,del=false;
const tel=document.getElementById('typing-text');
function type(){if(!tel)return;const w=phrases[pi];tel.textContent=del?w.substring(0,ci--):w.substring(0,ci++);if(!del&&ci>w.length){setTimeout(()=>{del=true;},2000);setTimeout(type,100);return;}if(del&&ci<0){del=false;pi=(pi+1)%phrases.length;setTimeout(type,400);return;}setTimeout(type,del?55:85);}
if(tel)type();

// COUNTER
function counter(el){const t=parseInt(el.dataset.target),suf=el.dataset.suffix||'';let c=0;const inc=t/60;const iv=setInterval(()=>{c=Math.min(c+inc,t);el.textContent=Math.floor(c)+suf;if(c>=t)clearInterval(iv);},24);}

// SCROLL PROGRESS BAR
window.addEventListener('scroll',()=>{
  const doc=document.documentElement;
  const pct=(doc.scrollTop/(doc.scrollHeight-doc.clientHeight))*100;
  document.getElementById('progress-bar').style.width=pct+'%';
  document.getElementById('mainNav').classList.toggle('scrolled',doc.scrollTop>80);
},{passive:true});

// PARALLAX for orbs
window.addEventListener('scroll',()=>{
  const s=window.scrollY;
  const o1=document.querySelector('.orb1'),o2=document.querySelector('.orb2'),o3=document.querySelector('.orb3');
  if(o1)o1.style.transform=`translateY(${s*0.12}px)`;
  if(o2)o2.style.transform=`translateY(${s*-0.08}px)`;
  if(o3)o3.style.transform=`translateY(${s*0.06}px)`;
  // floating icons subtle parallax
  document.querySelectorAll('.fi').forEach((el,i)=>{
    const rates=[0.05,0.08,0.04,0.09,0.06,0.07];
    el.style.transform=`translateY(${s*rates[i%rates.length]}px)`;
  });
},{passive:true});

// INTERSECTION OBSERVER — scroll animations
const io=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.classList.add('in');
      // counters
      e.target.querySelectorAll('[data-target]').forEach(el=>{if(!el.dataset.done){el.dataset.done=1;counter(el);}});
      // steps line
      if(e.target.classList.contains('steps')||e.target.closest('.steps')){
        document.getElementById('stepsLineFill')?.classList.add('in');
      }
    }
  });
},{threshold:0.12});
document.querySelectorAll('.sa,.sa-left,.sa-right,.sa-scale').forEach(el=>io.observe(el));
// also observe steps container for line animation
const stepsEl=document.querySelector('.steps');
if(stepsEl){const so=new IntersectionObserver(entries=>{if(entries[0].isIntersecting)document.getElementById('stepsLineFill')?.classList.add('in');},{threshold:0.3});so.observe(stepsEl);}
// hero stats
setTimeout(()=>document.querySelectorAll('.stat-num[data-target]').forEach(el=>{if(!el.dataset.done){el.dataset.done=1;counter(el);}}),700);

// CURRENCY TOGGLE
function setCurrency(cur){
  document.querySelectorAll('.cur-btn').forEach(b=>b.classList.toggle('active',b.dataset.cur===cur));
  // All elements with data-gbp / data-eur swap their text content
  document.querySelectorAll('[data-gbp][data-eur]').forEach(el=>{
    el.textContent=cur==='gbp'?el.dataset.gbp:el.dataset.eur;
  });
  localStorage.setItem('pricingCur',cur);
}
document.addEventListener('DOMContentLoaded',()=>{
  const saved=localStorage.getItem('pricingCur')||'gbp';
  setCurrency(saved);
  document.querySelectorAll('.cur-btn').forEach(b=>{
    b.addEventListener('click',()=>setCurrency(b.dataset.cur));
  });
});

// THEMES COLLAPSIBLE
function toggleThemes(btn){
  const body=btn.nextElementSibling;
  const expanded=btn.getAttribute('aria-expanded')==='true';
  btn.setAttribute('aria-expanded',!expanded);
  if(expanded){body.hidden=true;}else{body.hidden=false;}
}

// FORM
const fieldRules=[
  {id:'fn',errId:'fn-err',test:v=>/^[A-Za-z\u00C0-\u024F][\u00C0-\u024FA-Za-z\s\-\']{1,}$/.test(v)},
  {id:'jt',errId:'jt-err',test:v=>v.length>=2},
  {id:'co',errId:'co-err',test:v=>v.length>=2},
  {id:'em',errId:'em-err',test:v=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)},
];
function validateField(rule,showError){
  const el=document.getElementById(rule.id);
  const err=document.getElementById(rule.errId);
  const ok=rule.test(el.value.trim());
  el.classList.toggle('input-valid',ok&&el.value.trim().length>0);
  el.classList.toggle('input-error',!ok&&showError);
  if(err)err.classList.toggle('visible',!ok&&showError);
  return ok;
}
document.addEventListener('DOMContentLoaded',()=>{
  fieldRules.forEach(rule=>{
    const el=document.getElementById(rule.id);
    if(!el)return;
    // Validate on blur (leaving the field)
    el.addEventListener('blur',()=>{if(el.value.trim().length>0)validateField(rule,true);});
    // Re-validate live while typing so errors clear as soon as input is valid
    el.addEventListener('input',()=>{
      if(el.classList.contains('input-error')||el.classList.contains('input-valid'))validateField(rule,el.value.trim().length>0);
    });
  });
});
function send(e){
  e.preventDefault();
  let valid=true;
  fieldRules.forEach(rule=>{if(!validateField(rule,true))valid=false;});
  if(!valid){const first=fieldRules.find(r=>!document.getElementById(r.id).classList.contains('input-valid'));if(first)document.getElementById(first.id).focus();return false;}
  const form=e.target;
  fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(new FormData(form)).toString()})
    .finally(()=>{document.getElementById('fw').style.display='none';document.getElementById('sm').style.display='block';});
  return false;
}


// HOW IT WORKS — pinned scrollytelling driver
(function(){
  const wrap=document.querySelector('.how-wrap');
  if(!wrap) return;
  const pin=document.querySelector('.how-pin');
  const scenes=document.querySelectorAll('.how-scene');
  const tlSteps=document.querySelectorAll('.how-tl-step');
  const scrollCue=document.getElementById('howScrollCue');
  const N=scenes.length||3;

  // Step background colours — interpolated continuously as the user scrolls
  const BG_LIGHT=[
    [220,235,255,0.55],  // step 1: soft blue wash
    [210,245,255,0.55],  // step 2: soft cyan wash
    [215,225,255,0.55],  // step 3: soft indigo wash
  ];
  const BG_DARK=[
    [0, 80,180,0.18],    // step 1: deep blue
    [0,120,190,0.18],    // step 2: deep cyan-blue
    [30, 20,160,0.18],   // step 3: deep indigo
  ];
  const lerp=(a,b,t)=>a+(b-a)*t;
  const applyBg=(progress)=>{
    if(!pin) return;
    const BG=document.documentElement.dataset.theme==='dark'?BG_DARK:BG_LIGHT;
    const seg=progress*(N-1);
    const i=Math.min(N-2,Math.floor(seg));
    const t=seg-i;
    const [r,g,b,a]=BG[i].map((v,j)=>j<3?Math.round(lerp(BG[i][j],BG[i+1][j],t)):lerp(BG[i][j],BG[i+1][j],t));
    pin.style.backgroundColor=`rgba(${r},${g},${b},${a.toFixed(2)})`;
  };

  let currentStep='';
  const setActive=(num)=>{
    if(num===currentStep) return;
    currentStep=num;
    scenes.forEach(s=>s.classList.toggle('active',s.dataset.step===num));
    tlSteps.forEach(r=>r.classList.toggle('active',r.dataset.step===num));
  };
  let ticking=false;
  const onScroll=()=>{
    if(ticking) return;
    ticking=true;
    requestAnimationFrame(()=>{
      // Mobile: show all scenes stacked, no pin
      if(window.matchMedia('(max-width:960px)').matches){
        scenes.forEach(s=>s.classList.add('active'));
        ticking=false;
        return;
      }
      const rect=wrap.getBoundingClientRect();
      const total=wrap.offsetHeight-window.innerHeight;
      if(total>0){
        const progress=Math.max(0,Math.min(1,-rect.top/total));
        const idx=Math.min(N-1,Math.floor(progress*N*0.999));
        setActive(String(idx+1));
        applyBg(progress);
        if(scrollCue) scrollCue.classList.toggle('hidden',progress>0.04);
      }
      ticking=false;
    });
  };
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',onScroll,{passive:true});
  onScroll();
})();
