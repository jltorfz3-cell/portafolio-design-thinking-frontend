// API real de Spring Boot desplegado en Render
const API_BASE = 'https://portafolio-design-thinking-springboot.onrender.com/api';

let token=localStorage.getItem('dt_token')||'';
let demo=localStorage.getItem('dt_demo')==='true';
let projects=[];

const demoProjects=[
{id:1,equipoId:1,titulo:'Cuidemos nuestros espacios comunes',descripcion:'Propuesta para mejorar el cuidado de salones y patios.',problemaInicial:'Poco cuidado de los espacios comunes.',retoDiseno:'¿Cómo podemos lograr que los estudiantes cuiden los espacios comunes?',estado:'EN_PROCESO',progreso:60},
{id:2,equipoId:1,titulo:'Patio escolar sostenible',descripcion:'Ideas para un patio más limpio.',problemaInicial:'Acumulación de residuos.',estado:'EN_PROCESO',progreso:35},
{id:3,equipoId:2,titulo:'Aulas más organizadas',descripcion:'Hábitos para mantener las aulas organizadas.',problemaInicial:'Desorden en los salones.',estado:'FINALIZADO',progreso:100}
];

async function api(path,opt={}){
 const headers={'Content-Type':'application/json',...(opt.headers||{})};
 if(token)headers.Authorization='Bearer '+token;
 const r=await fetch(API_BASE+path,{...opt,headers});
 if(!r.ok) throw new Error((await r.text())||`HTTP ${r.status}`);
 return r.status===204?null:r.json();
}
function showApp(){$('#login').classList.add('hidden');$('#app').classList.remove('hidden');loadProjects()}
function showLogin(){$('#app').classList.add('hidden');$('#login').classList.remove('hidden')}
function $(s){return document.querySelector(s)}
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function page(n){
 document.querySelectorAll('.section').forEach(x=>x.classList.add('hidden'));
 $('#'+n).classList.remove('hidden');
 document.querySelectorAll('.nav').forEach(x=>x.classList.toggle('active',x.dataset.page===n));
 $('#pageTitle').textContent={dashboard:'Dashboard',proyectos:'Mis proyectos',etapas:'Etapas'}[n];
 if(n==='etapas')renderStages();
}
function status(t,ok){$('#apiStatus').textContent=t;$('#apiStatus').previousElementSibling.style.background=ok?'#35b779':'#f0ad4e'}
async function loadProjects(){
 if(demo){projects=demoProjects.map(x=>({...x}));status('Modo demo',true);render();return}
 try{projects=await api('/proyectos');status('API conectada',true);render()}
 catch(e){projects=[];status('API sin conexión',false);render();console.error(e)}
}
function render(){
 const avg=projects.length?Math.round(projects.reduce((a,p)=>a+(Number(p.progreso)||0),0)/projects.length):0;
 $('#total').textContent=projects.length;
 $('#active').textContent=projects.filter(p=>p.estado==='EN_PROCESO').length;
 $('#done').textContent=projects.filter(p=>p.estado==='FINALIZADO').length;
 $('#average').textContent=avg+'%';
 $('#dashboardProjects').innerHTML=projects.slice(0,3).map(card).join('')||'<div class="empty"><h3>No hay proyectos</h3><p>Crea tu primer proyecto.</p></div>';
 $('#projects').innerHTML=projects.map(row).join('')||'<div class="empty"><h3>No hay proyectos</h3><p>Crea tu primer proyecto.</p></div>';
}
function card(p){return `<article class="card"><span class="tag">${esc(p.estado||'BORRADOR')}</span><h3>${esc(p.titulo)}</h3><p>${esc(p.descripcion||p.problemaInicial||'Sin descripción')}</p><div class="progress"><i style="width:${Number(p.progreso)||0}%"></i></div><small>${Number(p.progreso)||0}% completado</small></article>`}
function row(p){return `<article class="row"><div><h3>${esc(p.titulo)}</h3><p>${esc(p.problemaInicial||p.descripcion||'')}</p></div><div><div class="progress"><i style="width:${Number(p.progreso)||0}%"></i></div><small>${Number(p.progreso)||0}%</small></div><span class="status ${p.estado==='EN_PROCESO'?'active':''}">${esc(p.estado||'BORRADOR')}</span></article>`}

async function renderStages(){
 if(!projects.length){$('#stageArea').innerHTML='<div class="empty"><h3>No hay proyectos</h3><p>Crea un proyecto primero.</p></div>';return}
 const opts=projects.map(p=>`<option value="${p.id}">${esc(p.titulo)}</option>`).join('');
 $('#stageArea').innerHTML=`<div class="stage-select">Proyecto: <select id="stageProject">${opts}</select></div><div id="stages" class="stages"></div>`;
 $('#stageProject').onchange=loadStages;
 await loadStages();
}
async function loadStages(){
 const id=$('#stageProject').value;
 if(demo){renderStageCards(projects.find(p=>String(p.id)===String(id))?.progreso||0,demoProjects);return}
 try{
  const data=await api('/etapas/proyecto/'+id);
  if(!data.length){$('#stages').innerHTML='<div class="empty"><h3>Sin etapas</h3><p>No existen etapas asociadas a este proyecto.</p></div>';return}
  $('#stages').innerHTML=data.map((e,i)=>`<article class="stage"><div class="num">${i+1}</div><h3>${esc(e.tipo||e.titulo||'ETAPA')}</h3><p>${esc(e.descripcion||'Sin descripción')}</p><div class="progress"><i style="width:${Number(e.progreso)||0}%"></i></div><small>${Number(e.progreso)||0}% · ${esc(e.estado||'PENDIENTE')}</small></article>`).join('');
 }catch(e){$('#stages').innerHTML='<div class="empty"><h3>No se pudieron cargar las etapas</h3><p>Revisa el endpoint y CORS del backend.</p></div>';console.error(e)}
}
function renderStageCards(progress){const names=['EMPATIZAR','DEFINIR','IDEAR','PROTOTIPAR','PROBAR'];$('#stages').innerHTML=names.map((n,i)=>{let v=Math.max(0,Math.min(100,Math.round(progress-i*25)));return `<article class="stage"><div class="num">${i+1}</div><h3>${n}</h3><p>Etapa del proceso Design Thinking.</p><div class="progress"><i style="width:${v}%"></i></div><small>${v}% completado</small></article>`}).join('')}

async function createProject(e){
 e.preventDefault();$('#projectMsg').textContent='';
 const p={equipoId:Number($('#teamId').value),titulo:$('#title').value,descripcion:$('#description').value,problemaInicial:$('#problem').value,retoDiseno:$('#challenge').value,estado:'BORRADOR',progreso:0};
 const date=$('#startDate').value;if(date)p.fechaInicio=date;
 if(demo){projects.unshift({id:Date.now(),...p});closeModal();render();return}
 try{await api('/proyectos',{method:'POST',body:JSON.stringify(p)});closeModal();await loadProjects()}
 catch(e){$('#projectMsg').textContent='No se pudo crear el proyecto. Comprueba el backend, CORS y el ID del equipo.';console.error(e)}
}
function closeModal(){$('#modal').classList.add('hidden');$('#projectForm').reset();$('#teamId').value=1}
function openModal(){$('#modal').classList.remove('hidden');$('#title').focus()}

$('#loginForm').onsubmit=async e=>{
 e.preventDefault();$('#loginMsg').textContent='';
 try{
  const x=await api('/auth/login',{method:'POST',body:JSON.stringify({username:$('#username').value,password:$('#password').value})});
  token=x.token;localStorage.setItem('dt_token',token);demo=false;localStorage.removeItem('dt_demo');showApp();
 }catch(e){$('#loginMsg').textContent='Usuario o contraseña incorrectos o API no disponible.'}
};
$('#demo').onclick=()=>{demo=true;localStorage.setItem('dt_demo','true');showApp()};
$('#logout').onclick=()=>{token='';demo=false;localStorage.removeItem('dt_token');localStorage.removeItem('dt_demo');showLogin()};
$('#refresh').onclick=loadProjects;
$('#newProject1').onclick=openModal;$('#newProject2').onclick=openModal;
$('#close').onclick=closeModal;$('#cancel').onclick=closeModal;
$('#projectForm').onsubmit=createProject;
document.querySelectorAll('.nav').forEach(b=>b.onclick=()=>page(b.dataset.page));
document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>page(b.dataset.go));
if(token||demo)showApp();
