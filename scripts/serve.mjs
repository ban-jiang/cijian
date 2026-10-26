import http from 'node:http';
import fs from 'node:fs';
const file=new URL('../dist/index.html',import.meta.url);
const server=http.createServer((req,res)=>{
 if(req.url==='/'||req.url==='/index.html'){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end(fs.readFileSync(file));}
 else if(req.url==='/favicon.ico'){res.writeHead(204);res.end();}
 else{res.writeHead(404);res.end('Not found');}
});
server.listen(5181,'127.0.0.1',()=>console.log('Quiz trial: http://127.0.0.1:5181/'));
