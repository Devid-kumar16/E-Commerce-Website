import http from 'http';
const srv = http.createServer((req,res)=>{ res.writeHead(200,{'Content-Type':'text/plain'}); res.end('ok');});
srv.listen(5000, ()=>console.log('tiny ES module server listening on 5000'));
