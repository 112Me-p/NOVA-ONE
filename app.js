const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const state={env:'Home',area:240,intensity:'Medium',finish:'black',xray:false,sound:false,orbit:false};

// Year, reveal, scroll progress
$('#year').textContent=new Date().getFullYear();
const revealObs=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');if(e.target.matches('.metric-card')) animateCounter(e.target);}}),{threshold:.16});
$$('.reveal').forEach(el=>revealObs.observe(el));
addEventListener('scroll',()=>{const max=document.documentElement.scrollHeight-innerHeight;$('#scrollProgress').style.width=`${(scrollY/max)*100}%`;},{passive:true});

// Cursor + magnetic
const cursor=$('#cursor');
addEventListener('pointermove',e=>{document.documentElement.style.setProperty('--mx',`${e.clientX}px`);document.documentElement.style.setProperty('--my',`${e.clientY}px`);cursor.style.left=e.clientX+'px';cursor.style.top=e.clientY+'px';});
$$('a,button,.hotspot').forEach(el=>{el.addEventListener('pointerenter',()=>{cursor.classList.add('active');cursor.querySelector('span').textContent=el.dataset.cursor||'OPEN'});el.addEventListener('pointerleave',()=>cursor.classList.remove('active'));});
$$('.magnetic').forEach(el=>{el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();const x=(e.clientX-r.left-r.width/2)*.16,y=(e.clientY-r.top-r.height/2)*.16;el.style.transform=`translate(${x}px,${y}px)`});el.addEventListener('pointerleave',()=>el.style.transform='');});

// Ambient canvas
const ac=$('#ambientCanvas'),actx=ac.getContext('2d');let particles=[];
function resizeAmbient(){const d=Math.min(devicePixelRatio||1,2);ac.width=innerWidth*d;ac.height=innerHeight*d;ac.style.width=innerWidth+'px';ac.style.height=innerHeight+'px';actx.setTransform(d,0,0,d,0,0);particles=Array.from({length:Math.min(90,Math.floor(innerWidth/14))},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:Math.random()*1.5+.2,vx:(Math.random()-.5)*.15,vy:(Math.random()-.5)*.15}));}
function ambientLoop(){actx.clearRect(0,0,innerWidth,innerHeight);actx.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--acid').trim()||'#c8ff38';for(const p of particles){p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>innerWidth)p.vx*=-1;if(p.y<0||p.y>innerHeight)p.vy*=-1;actx.globalAlpha=.18;actx.beginPath();actx.arc(p.x,p.y,p.r,0,Math.PI*2);actx.fill()}requestAnimationFrame(ambientLoop)}
addEventListener('resize',resizeAmbient);resizeAmbient();ambientLoop();

// Tilt stages
$$('[data-tilt]').forEach(stage=>{stage.addEventListener('pointermove',e=>{const r=stage.getBoundingClientRect(),rx=((e.clientY-r.top)/r.height-.5)*-10,ry=((e.clientX-r.left)/r.width-.5)*12;const p=stage.querySelector('.product-model');if(p&&!state.orbit)p.style.transform=`rotateX(${rx}deg) rotateY(${ry}deg) translateZ(15px)`});stage.addEventListener('pointerleave',()=>{const p=stage.querySelector('.product-model');if(p&&!state.orbit)p.style.transform=''});});

// Product finish/xray/orbit
function applyFinish(){['#viewerProduct','#heroProduct'].forEach(sel=>{const p=$(sel);p.classList.remove('product-black','product-silver','product-acid');p.classList.add('product-'+state.finish);p.classList.toggle('xray',state.xray)});$$('.swatch').forEach(s=>s.classList.toggle('active',s.dataset.finish===state.finish));$('#debugState').textContent=state.xray?'xray':'normal';}
$$('.swatch').forEach(s=>s.onclick=()=>{state.finish=s.dataset.finish;applyFinish();tone(360,.03);});
function toggleXray(){state.xray=!state.xray;applyFinish();$('#xrayBtn b').textContent=state.xray?'ON':'X';toast(state.xray?'X‑Ray mode enabled':'X‑Ray mode disabled');tone(state.xray?520:280,.05)}
$('#xrayBtn').onclick=toggleXray;
$('#motionBtn').onclick=()=>{state.orbit=!state.orbit;$('#motionBtn b').textContent=state.orbit?'ON':'OFF';if(state.orbit) orbitLoop();else $$('#viewerProduct,#heroProduct').forEach(p=>p.style.transform='')};
let orbitT=0;function orbitLoop(){if(!state.orbit)return;orbitT+=.012;$$('#viewerProduct,#heroProduct').forEach((p,i)=>p.style.transform=`rotateY(${Math.sin(orbitT+i)*18}deg) rotateX(${Math.cos(orbitT*.7)*3}deg)`);requestAnimationFrame(orbitLoop)}
const hotspotCopy={FORMULA:['Formula layer','Hotspots can open ingredient logic, diagrams, explainers or technical media.'],PACKAGING:['Packaging system','Use this for exploded views, recyclable-material stories or component specifications.'],CONTROL:['Control interface','This point can connect to dosage, settings, usage modes or interactive configuration.']};
$$('.hotspot').forEach(h=>h.onclick=()=>{const [t,p]=hotspotCopy[h.dataset.hotspot];$('#hotspotInfo').innerHTML=`<span>${h.dataset.hotspot}</span><h3>${t}</h3><p>${p}</p>`;tone(460,.03)});

// Simulation canvas
const sc=$('#simCanvas'),sctx=sc.getContext('2d');let simParticles=[],simTarget=72,simActive=0;
function resizeSim(){const r=sc.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);sc.width=r.width*d;sc.height=r.height*d;sctx.setTransform(d,0,0,d,0,0);simParticles=Array.from({length:260},()=>({x:Math.random()*r.width,y:Math.random()*r.height,vx:(Math.random()-.5)*1.2,vy:(Math.random()-.5)*1.2,r:Math.random()*3+1}));}
function drawSim(){const r=sc.getBoundingClientRect();sctx.fillStyle='rgba(7,8,11,.18)';sctx.fillRect(0,0,r.width,r.height);const targetCount=Math.floor(simParticles.length*(simTarget/100)*(1-simActive*.78));for(let i=0;i<targetCount;i++){const p=simParticles[i];p.x+=p.vx*(1+simTarget/80);p.y+=p.vy*(1+simTarget/80);if(p.x<0||p.x>r.width)p.vx*=-1;if(p.y<0||p.y>r.height)p.vy*=-1;const alpha=.15+(simTarget/100)*.5;sctx.fillStyle=`rgba(${180+Math.floor(simTarget*.6)},${70+Math.floor((100-simTarget)*.8)},90,${alpha})`;sctx.beginPath();sctx.arc(p.x,p.y,p.r,0,Math.PI*2);sctx.fill()}if(simActive>0){sctx.strokeStyle=`rgba(200,255,56,${simActive*.6})`;sctx.lineWidth=2;for(let j=0;j<4;j++){sctx.beginPath();sctx.arc(r.width/2,r.height/2,50+j*55+Math.sin(performance.now()/700+j)*10,0,Math.PI*2);sctx.stroke()}simActive*=.994;if(simActive<.02)simActive=0}requestAnimationFrame(drawSim)}
resizeSim();addEventListener('resize',resizeSim);drawSim();
function updateLoad(v){simTarget=+v;$('#loadValue').textContent=v;$('#rangeLabel').textContent=v+'%';$('#densityMetric').textContent=(v/10).toFixed(1)+'×';$('#noiseMetric').textContent=v>70?'HIGH':v>35?'MED':'LOW'}
$('#loadRange').oninput=e=>updateLoad(e.target.value);
$('#activateBtn').onclick=()=>{simActive=1;$('#systemMetric').textContent='ACTIVE';tone(120,.08);setTimeout(()=>tone(520,.12),100);setTimeout(()=>{$('#systemMetric').textContent='STABLE';$('#loadRange').value=Math.max(8,Math.round(simTarget*.22));updateLoad($('#loadRange').value)},850)};

// Compare drag
const box=$('#compareBox'),before=$('#beforeScene'),handle=$('#compareHandle');let comparing=false;
function setCompare(clientX){const r=box.getBoundingClientRect();const pct=clamp((clientX-r.left)/r.width*100,4,96);before.style.width=pct+'%';handle.style.left=pct+'%'}
box.addEventListener('pointerdown',e=>{comparing=true;box.setPointerCapture(e.pointerId);setCompare(e.clientX)});box.addEventListener('pointermove',e=>{if(comparing)setCompare(e.clientX)});box.addEventListener('pointerup',()=>comparing=false);

// Configurator
const intensityFactor={Low:.65,Medium:1,High:1.55},envFactor={Home:.9,Retail:1,Industrial:1.35,Outdoor:1.15};
function calc(){const liters=(state.area/100)*intensityFactor[state.intensity]*envFactor[state.env];const sessions=state.intensity==='High'?4:state.intensity==='Medium'?2:1;$('#litersValue').textContent=liters.toFixed(1);$('#resultEnv').textContent=state.env;$('#resultSessions').textContent=sessions;$('#resultCoverage').textContent=state.area+' m²';$('#resultIntensity').textContent=state.intensity;$('#areaValue').textContent=state.area+' m²';$('#debugState').textContent=`${state.env}/${state.intensity}`;}
function selectGroup(id,key){$$(id+' button').forEach(b=>b.onclick=()=>{$$(id+' button').forEach(x=>x.classList.remove('active'));b.classList.add('active');state[key]=b.dataset.value;calc();tone(330,.02)});}
selectGroup('#envOptions','env');selectGroup('#intensityOptions','intensity');
$('#areaRange').oninput=e=>{state.area=+e.target.value;calc()};
$('#resetBtn').onclick=()=>{state.env='Home';state.area=240;state.intensity='Medium';$('#areaRange').value=240;$$('#envOptions button').forEach(b=>b.classList.toggle('active',b.dataset.value==='Home'));$$('#intensityOptions button').forEach(b=>b.classList.toggle('active',b.dataset.value==='Medium'));calc()};
$('#saveBtn').onclick=()=>{localStorage.setItem('nova-config',JSON.stringify({env:state.env,area:state.area,intensity:state.intensity,finish:state.finish}));$('#saveBtn').textContent='♥ SAVED';toast('Configuration saved locally');tone(620,.04)};
function loadSaved(){try{const s=JSON.parse(localStorage.getItem('nova-config'));if(!s)return;Object.assign(state,s);$('#areaRange').value=state.area;$$('#envOptions button').forEach(b=>b.classList.toggle('active',b.dataset.value===state.env));$$('#intensityOptions button').forEach(b=>b.classList.toggle('active',b.dataset.value===state.intensity));applyFinish();calc()}catch{}}
const url=new URL(location.href);if(url.searchParams.has('env')){state.env=url.searchParams.get('env')||state.env;state.area=+url.searchParams.get('area')||state.area;state.intensity=url.searchParams.get('intensity')||state.intensity;$('#areaRange').value=state.area;$$('#envOptions button').forEach(b=>b.classList.toggle('active',b.dataset.value===state.env));$$('#intensityOptions button').forEach(b=>b.classList.toggle('active',b.dataset.value===state.intensity));} else loadSaved();calc();
$('#shareBtn').onclick=async()=>{const u=new URL(location.href);u.searchParams.set('env',state.env);u.searchParams.set('area',state.area);u.searchParams.set('intensity',state.intensity);const data={title:'NOVA ONE configuration',text:`${state.env} · ${state.area} m² · ${state.intensity}`,url:u.toString()};try{if(navigator.share)await navigator.share(data);else{await navigator.clipboard.writeText(u.toString());toast('Share URL copied')}}catch{toast('Share cancelled')}};

// Counters/chart
function animateCounter(card){const el=$('[data-counter]',card);if(!el||el.dataset.done)return;el.dataset.done='1';const to=+el.dataset.counter,start=performance.now(),dur=1100;function tick(t){const p=clamp((t-start)/dur,0,1);el.textContent=Math.round(to*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(tick)}requestAnimationFrame(tick)}
const chartObs=new IntersectionObserver(es=>es.forEach(e=>e.target.classList.toggle('visible',e.isIntersecting)),{threshold:.35});chartObs.observe($('.chart-card'));

// Theme / sound / fullscreen
function toggleTheme(){document.body.classList.toggle('alt-theme');$('#themeToggle').setAttribute('aria-pressed',document.body.classList.contains('alt-theme'));$('#debugTheme').textContent=document.body.classList.contains('alt-theme')?'cyan':'acid';localStorage.setItem('nova-theme',document.body.classList.contains('alt-theme')?'alt':'default')}
$('#themeToggle').onclick=toggleTheme;if(localStorage.getItem('nova-theme')==='alt')document.body.classList.add('alt-theme');
function tone(freq=420,dur=.04){if(!state.sound)return;try{const C=window.AudioContext||window.webkitAudioContext;const c=tone.ctx||(tone.ctx=new C());const o=c.createOscillator(),g=c.createGain();o.frequency.value=freq;o.type='sine';g.gain.setValueAtTime(.03,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+dur);o.connect(g).connect(c.destination);o.start();o.stop(c.currentTime+dur)}catch{}}
$('#soundToggle').onclick=()=>{state.sound=!state.sound;$('#soundToggle').setAttribute('aria-pressed',state.sound);$('#soundToggle').textContent=state.sound?'◉':'◌';if(state.sound)tone(480,.05)};
async function fullscreen(){try{if(!document.fullscreenElement)await document.documentElement.requestFullscreen();else await document.exitFullscreen()}catch{toast('Fullscreen unavailable')}}
$('#fullscreenBtn').onclick=fullscreen;

// Command palette
const cb=$('#commandBackdrop'),ci=$('#commandInput');
function openCommand(){cb.classList.add('open');cb.setAttribute('aria-hidden','false');setTimeout(()=>ci.focus(),20)}function closeCommand(){cb.classList.remove('open');cb.setAttribute('aria-hidden','true');ci.value='';filterCommands('')}
$('#commandBtn').onclick=openCommand;cb.addEventListener('pointerdown',e=>{if(e.target===cb)closeCommand()});
function filterCommands(q){$$('#commandList button').forEach(b=>b.hidden=!b.textContent.toLowerCase().includes(q.toLowerCase()))}ci.oninput=e=>filterCommands(e.target.value);
$$('#commandList button').forEach(b=>b.onclick=()=>{if(b.dataset.target)$(b.dataset.target).scrollIntoView({behavior:'smooth'});if(b.dataset.command==='theme')toggleTheme();if(b.dataset.command==='xray')toggleXray();closeCommand()});

// Play cards
$$('.play-card').forEach(b=>b.onclick=()=>{({command:openCommand,xray:toggleXray,save:()=>$('#saveBtn').click(),fullscreen})[b.dataset.action]?.()});

// Keyboard + debug + section theme
addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openCommand()}if(e.key==='Escape')closeCommand();if(!/input|textarea/i.test(document.activeElement?.tagName||'')){if(e.key.toLowerCase()==='x')toggleXray();if(e.key.toLowerCase()==='d')$('#debug').classList.toggle('open');}});
const secObs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)$('#debugTheme').textContent=e.target.dataset.theme||'—'}),{threshold:.55});$$('[data-theme]').forEach(s=>secObs.observe(s));

// FPS monitor
let last=performance.now(),frames=0;function fpsLoop(t){frames++;if(t-last>=1000){$('#fps').textContent=frames;frames=0;last=t}requestAnimationFrame(fpsLoop)}requestAnimationFrame(fpsLoop);

// Toast
let toastTimer;function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),1800)}

// Service worker
if('serviceWorker' in navigator) addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
