import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,readdirSync,statSync} from 'node:fs';
import {resolve,join,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const root=fileURLToPath(new URL('..',import.meta.url));
const hash=b=>createHash('sha256').update(b).digest('hex');
const files=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(join(dir,e.name)):[join(dir,e.name)]).sort();
const run=dir=>{const r=spawnSync(process.execPath,['main.ts'],{cwd:root,env:{...process.env,MAKEFUN_OUTPUT_DIR:join(root,dir)},encoding:'utf8'});assert.equal(r.status,0,r.stderr);return r.stdout;};
const first=run('out'),second=run('.verify-output');assert.equal(first,second);
const a=files(join(root,'out')),b=files(join(root,'.verify-output'));
assert.deepEqual(a.map(p=>relative(join(root,'out'),p)),b.map(p=>relative(join(root,'.verify-output'),p)));
for(let i=0;i<a.length;i++)assert.deepEqual(readFileSync(a[i]),readFileSync(b[i]));
assert.equal(a.length,11,'Only game files, four screenshots, and dossier are expected');
function imageSize(buf){
 if(buf.readUInt32BE(0)===0x89504e47)return {width:buf.readUInt32BE(16),height:buf.readUInt32BE(20)};
 assert.equal(buf.readUInt16BE(0),0xffd8);let i=2;
 while(i<buf.length){while(buf[i]===0xff)i++;const marker=buf[i++];if(marker===0xd9||marker===0xda)break;if(marker===0x01||(marker>=0xd0&&marker<=0xd7))continue;const n=buf.readUInt16BE(i);if([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker))return {width:buf.readUInt16BE(i+5),height:buf.readUInt16BE(i+3)};i+=n;}
 throw Error('Image dimensions missing');
}
const shots=files(join(root,'screenshots')).map(p=>{const bytes=readFileSync(p);const size=imageSize(bytes);assert.ok(bytes.length<=262144);assert.ok(Math.max(size.width,size.height)<=1280);assert.ok(Math.min(size.width,size.height)>=480);return {file:relative(root,p),...size,bytes:bytes.length,sha256:hash(bytes)};});
assert.ok(shots.length>=3&&shots.length<=4);
const game=files(join(root,'game'));const gameBytes=game.reduce((n,p)=>n+statSync(p).size,0);
assert.ok(game.length<=993);assert.ok(gameBytes<=50331648);assert.ok(statSync(join(root,'game/index.html')).size<=1048576);
for(const p of game){assert.ok(Buffer.byteLength(relative(join(root,'game'),p))<=1000);const text=readFileSync(p,'utf8').replaceAll('http://www.w3.org/2000/svg','');assert.doesNotMatch(text,/https?:\/\/|\bfetch\s*\(|\bXMLHttpRequest\b|\bWebSocket\b|\bimport\s*\(/);}
const offline=readFileSync(join(root,'dist/downloads/reedlight-offline.html'),'utf8');
assert.doesNotMatch(offline,/<script[^>]+src=|<link[^>]+rel="stylesheet"/i);assert.ok(offline.includes("connect-src 'none'"));
const dossier=readFileSync(join(root,'out/dossier.json'));assert.ok(dossier.length<=1572864);JSON.parse(dossier);
const vendorHash=hash(readFileSync(join(root,'vendor/makefun-game.ts')));assert.equal(vendorHash,'dc67187521b24025ff952f8c231485a6eb92d6d71d29edd2a08154ffb4376129');
const report={status:'passed',node:process.version,scope:'Local output-format and determinism checks, not official competition acceptance',deterministic_all_output_files:true,identical_stdout:true,output_file_count:a.length,game_files:game.length,game_bytes:gameBytes,index_bytes:statSync(join(root,'game/index.html')).size,offline_html_bytes:Buffer.byteLength(offline),external_runtime_references:0,dossier_bytes:dossier.length,dossier_sha256:hash(dossier),official_adapter_sha256:vendorHash,screenshots:shots};
writeFileSync(join(root,'docs/validation.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,game_files:report.game_files,game_bytes:gameBytes,offline_html_bytes:report.offline_html_bytes,dossier_bytes:dossier.length,dossier_sha256:report.dossier_sha256,screenshots:shots.length,deterministic:true}));
