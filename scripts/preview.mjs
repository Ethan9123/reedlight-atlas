import {createServer} from 'node:http';
import {readFileSync,statSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve,extname,sep} from 'node:path';
const root=fileURLToPath(new URL('../game/',import.meta.url));
const at=process.argv.indexOf('--port');
const port=Number(at>=0?process.argv[at+1]:(process.env.PORT||4173));
if(!Number.isInteger(port)||port<1||port>65535)throw Error('Choose a port from 1 to 65535.');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.jpg':'image/jpeg','.png':'image/png'};
createServer((req,res)=>{
  if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);res.end();return;}
  try{
    let path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    if(path.endsWith('/'))path+='index.html';
    const file=resolve(root,'.'+path);
    if(!file.startsWith(resolve(root)+sep)||!statSync(file).isFile())throw Error('Not found');
    const data=readFileSync(file);
    res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream','Content-Length':data.length,'Cache-Control':'no-store'});
    res.end(req.method==='HEAD'?undefined:data);
  }catch{res.writeHead(404);res.end('Not found');}
}).listen(port,'0.0.0.0',()=>console.log(`Reedlight Atlas: http://localhost:${port}`));
