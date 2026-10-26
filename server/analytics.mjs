const kinds=new Set(['visit','active','complete']);
const uuid=/^[a-zA-Z0-9_-]{16,100}$/;
export function dateAt(now=new Date()){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);}
export function offset(day,n){return new Date(Date.parse(day+'T00:00:00Z')+n*86400000).toISOString().slice(0,10);}
export function validateEvent(v){return v&&uuid.test(v.deviceId||'')&&kinds.has(v.kind)&&(v.kind!=='complete'||uuid.test(v.sessionId||''));}
export function ownerStatus(request,env){const email=request.headers.get('oai-authenticated-user-email');if(!request.headers.get('oai-authenticated-user-id')||!email)return 401;return email.toLowerCase()===String(env.CIJIAN_OWNER_EMAIL||'').toLowerCase()?200:403;}
export async function digest(value,salt){if(!salt)throw Error('Analytics salt missing');const enc=new TextEncoder();const key=await crypto.subtle.importKey('raw',enc.encode(salt),{name:'HMAC',hash:'SHA-256'},false,['sign']);const hash=await crypto.subtle.sign('HMAC',key,enc.encode(value));return [...new Uint8Array(hash)].map(x=>x.toString(16).padStart(2,'0')).join('');}
export function json(v,status=200){return Response.json(v,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});}
export async function collect(request,env){
 if(request.method!=='POST')return json({error:'Method not allowed'},405);
 if(request.headers.get('origin')!==new URL(request.url).origin)return json({error:'Origin rejected'},403);
 if(!request.headers.get('content-type')?.startsWith('application/json'))return json({error:'JSON required'},415);
 if(Number(request.headers.get('content-length')||0)>2048)return json({error:'Too large'},413);
 const raw=await request.text();if(raw.length>2048)return json({error:'Too large'},413);
 let body;try{body=JSON.parse(raw);}catch{return json({error:'Invalid JSON'},400);}
 if(!validateEvent(body))return json({error:'Invalid event'},400);
 if(ownerStatus(request,env)===200)return json({ignored:'owner'});
 const day=dateAt(),id=await digest(body.deviceId,env.ANALYTICS_SALT);
 const eventId=await digest(id+':'+body.kind+':'+(body.kind==='complete'?body.sessionId:day),env.ANALYTICS_SALT);
 const source=['bilibili','github','poster','share'].includes(body.source)?body.source:'direct';
 const db=env.DB;if(!db)return json({error:'Storage unavailable'},503);
 // Event IDs are deterministic: page reloads, retries and duplicate completion screens cannot inflate totals.
 await db.batch([
  db.prepare('INSERT OR IGNORE INTO analytics_devices (id,first_day,source,excluded) VALUES (?,?,?,0)').bind(id,day,source),
  db.prepare(`INSERT OR IGNORE INTO analytics_events (id,device_id,day,kind,received_at)
   SELECT ?,?,?,?,? WHERE NOT EXISTS (SELECT 1 FROM analytics_devices WHERE id=? AND excluded=1)
   AND (SELECT COUNT(*) FROM analytics_events WHERE device_id=? AND day=?) < 102`).bind(eventId,id,day,body.kind,new Date().toISOString(),id,id,day),
 ]);
 return json({ok:true});
}
export async function excludeDevice(request,env){
 const auth=ownerStatus(request,env);if(auth!==200)return json({error:'Owner only'},auth);
 if(request.headers.get('origin')!==new URL(request.url).origin)return json({error:'Origin rejected'},403);
 let body;try{body=await request.json();}catch{return json({error:'Invalid JSON'},400);}
 if(!uuid.test(body.deviceId||''))return json({error:'Invalid device'},400);
 const id=await digest(body.deviceId,env.ANALYTICS_SALT);
 await env.DB.prepare('INSERT INTO analytics_devices (id,first_day,source,excluded) VALUES (?,?,?,1) ON CONFLICT(id) DO UPDATE SET excluded=1').bind(id,dateAt(),'direct').run();
 return json({ok:true});
}
export async function statistics(request,env){
 const auth=ownerStatus(request,env);if(auth!==200)return json({error:'Owner only'},auth);
 const today=dateAt(),week=offset(today,-6),month=offset(today,-29),mature=offset(today,-7);
 const active=`FROM analytics_events e JOIN analytics_devices d ON d.id=e.device_id WHERE d.excluded=0`;
 const queries=[
  env.DB.prepare('SELECT COUNT(*) AS n FROM analytics_devices WHERE excluded=0'),
  env.DB.prepare(`SELECT COUNT(DISTINCT e.device_id) AS n ${active} AND e.kind='complete'`),
  env.DB.prepare(`SELECT COUNT(DISTINCT e.device_id) AS n ${active} AND e.kind='active' AND e.day>=?`).bind(week),
  env.DB.prepare(`SELECT COUNT(*) AS n ${active} AND e.kind='complete'`),
  env.DB.prepare(`SELECT e.day,COUNT(DISTINCT CASE WHEN e.kind='visit' THEN e.device_id END) AS visitors,COUNT(DISTINCT CASE WHEN e.kind='active' THEN e.device_id END) AS active,COUNT(CASE WHEN e.kind='complete' THEN 1 END) AS completions ${active} AND e.day>=? GROUP BY e.day ORDER BY e.day`).bind(month),
  env.DB.prepare('SELECT source,COUNT(*) AS devices FROM analytics_devices WHERE excluded=0 GROUP BY source ORDER BY devices DESC'),
  env.DB.prepare(`WITH first_completion AS (SELECT e.device_id,MIN(e.day) AS first_day ${active} AND e.kind='complete' GROUP BY e.device_id)
   SELECT COUNT(*) AS eligible,SUM(CASE WHEN EXISTS(SELECT 1 FROM analytics_events r WHERE r.device_id=f.device_id AND r.kind='active' AND r.day=date(f.first_day,'+7 days')) THEN 1 ELSE 0 END) AS returned FROM first_completion f WHERE first_day<=?`).bind(mature),
  env.DB.prepare('SELECT MIN(first_day) AS firstDay FROM analytics_devices WHERE excluded=0'),
 ];
 const rows=await env.DB.batch(queries);const value=i=>rows[i].results?.[0]||{};
 const retention=value(6);
 return json({today,timezone:'Asia/Shanghai',since:value(7).firstDay||null,visitors:value(0).n||0,completedDevices:value(1).n||0,weeklyActive:value(2).n||0,completedQuizzes:value(3).n||0,daily:rows[4].results||[],sources:rows[5].results||[],retention:{eligible:retention.eligible||0,returned:retention.returned||0,rate:retention.eligible?Number(retention.returned||0)/retention.eligible:null}});
}
