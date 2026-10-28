const fs=require('node:fs');const path=require('node:path');const protobuf=require('protobufjs');
const root=path.resolve(__dirname,'..');
const descriptor=protobuf.loadSync(['trading.proto','communities.proto','coins.proto'].map(file=>path.join(root,file))).toJSON();
fs.writeFileSync(path.join(root,'src','descriptor.ts'),'// Generated from the local .proto files at build.\nexport const descriptor = '+JSON.stringify(descriptor)+';\n');
