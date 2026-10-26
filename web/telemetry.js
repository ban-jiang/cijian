const prefix='cijian-analytics-';
let device=null,source='direct',enabled=false;
const waiting=new Map(),sent=new Set();
try{
 device=localStorage.getItem(prefix+'device')||crypto.randomUUID();localStorage.setItem(prefix+'device',device);
 const from=new URL(location.href).searchParams.get('from');
 if(['bilibili','github','poster','share'].includes(from)&&!localStorage.getItem(prefix+'source'))localStorage.setItem(prefix+'source',from);
 source=localStorage.getItem(prefix+'source')||'direct';
 enabled=localStorage.getItem(prefix+'disabled')!=='1'&&!navigator.webdriver;
}catch{}
export function analyticsEnabled(){return enabled;}
export function setAnalytics(value){enabled=!!value;try{localStorage.setItem(prefix+'disabled',enabled?'0':'1');}catch{}if(enabled)track('visit');else waiting.clear();}
export function track(kind,sessionId){
 if(!enabled||!device)return;
 const key=kind+':'+(sessionId||new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai'}).format(new Date()));
 if(sent.has(key))return;
 waiting.set(key,{deviceId:device,kind,source,...(sessionId?{sessionId}:{})});
 if(!navigator.onLine)return;
 send(key);
}
async function send(key){
 const body=waiting.get(key);if(!body||!enabled||sent.has(key))return;
 sent.add(key);
 try{const response=await fetch('/api/event',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),keepalive:true});if(!response.ok)throw Error('not accepted');waiting.delete(key);}catch{sent.delete(key);}
}
window.addEventListener('online',()=>{for(const key of waiting.keys())send(key);});
track('visit');
