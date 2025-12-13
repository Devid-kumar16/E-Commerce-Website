const http = require('http');
const srv = http.createServer((req,res)=>{ res.writeHead(200,{'Content-Type':'text/plain'}); res.end('ok');});
srv.listen(5000, ()=>console.log('tiny server listening on 5000'));
