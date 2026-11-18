// Deterministic best-game-01 output adapter. No network, shell, or transcript access.
import { cpSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, join } from 'node:path';
import { buildDossier } from './vendor/makefun-game.ts';
const root=fileURLToPath(new URL('.',import.meta.url));
const out=resolve(process.env.MAKEFUN_OUTPUT_DIR ?? '/output');
if(out===resolve(root)||out===join(root,'game')||out===join(root,'screenshots'))throw new Error('Choose a separate output directory.');
const shots=readdirSync(join(root,'screenshots')).filter(p=>/\.(png|jpe?g)$/i.test(p));
if(shots.length<3||shots.length>4)throw new Error('Three or four real browser screenshots are required.');
mkdirSync(out,{recursive:true});
cpSync(join(root,'game'),join(out,'game'),{recursive:true});
cpSync(join(root,'screenshots'),join(out,'screenshots'),{recursive:true});
const bytes=buildDossier(out,{text_max_bytes:163840,screenshots:{max:4,max_bytes:262144},game_max_files:993,game_max_bytes:50331648,game_path_max_bytes:1000});
if(bytes.length>1572864)throw new Error('Dossier exceeds competition cap.');
writeFileSync(join(out,'dossier.json'),bytes);
console.log('Reedlight Atlas: deterministic game, screenshots, and dossier written.');
