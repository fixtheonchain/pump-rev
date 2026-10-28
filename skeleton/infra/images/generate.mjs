// Regenerate the deliberately parallel per-service Dockerfiles after changing the shared recipe.
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'../..');
const catalog=JSON.parse(fs.readFileSync(path.join(root,'infra/k8s/catalog.json'),'utf8'));
for(const service of catalog.filter(x=>!x.rust&&x.name!=='keyed-api')){
  const source=`# syntax=docker/dockerfile:1\nFROM node:22-bookworm AS build\nWORKDIR /app\nCOPY . .\nRUN npm ci && npm run build && npm prune --omit=dev\n\nFROM node:22-bookworm-slim AS runtime\nENV NODE_ENV=production\nWORKDIR /app\nCOPY --from=build --chown=node:node /app /app\nUSER node\nEXPOSE ${service.port}\nHEALTHCHECK CMD ["node", "tools/probe.cjs", "${service.name}"]\nCMD ["node", "${service.entry}"]\n`;
  const folder=path.join(root,'infra/images',service.name);fs.mkdirSync(folder,{recursive:true});fs.writeFileSync(path.join(folder,'Dockerfile'),source);
}