import fs from 'node:fs';import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const definitions=[['pump','pumpIdl'],['pump_amm','pumpAmmIdl'],['pump_fees','pumpFeesIdl']];
const generated=definitions.map(([name,symbol])=>{
 const source=fs.readFileSync(path.resolve(root,'../idl',name+'.json'),'utf8').replace(/^\uFEFF/,'');
 const data=JSON.parse(source);return 'export const '+symbol+': any = '+JSON.stringify(data,null,2)+';';
}).join('\n\n');
fs.writeFileSync(path.join(root,'packages/solana/src/idls.generated.ts'),'// Frozen UTF-8 snapshots of the captured research IDLs. No runtime network loading.\n'+generated+'\n');
console.log(JSON.stringify({event:'idl_snapshots_refreshed',count:definitions.length}));
