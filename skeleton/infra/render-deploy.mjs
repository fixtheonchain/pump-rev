// Render only. This program never invokes Docker, kubectl, a registry, a cloud API, or Solana.
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
const root=path.resolve(import.meta.dirname,'..');
const namespace='pumpfun-skeleton';
function inside(value,label){const target=path.resolve(root,value);const relative=path.relative(root,target);if(relative.startsWith('..')||path.isAbsolute(relative))throw new Error(`${label} must stay inside the workspace`);return target;}
function readLocal(value,label){try{return fs.readFileSync(inside(value,label),'utf8').replace(/^\uFEFF/,'');}catch(error){if(error.message?.includes('inside the workspace'))throw error;throw new Error(`${label} is unavailable`);}}
function json(text,label){try{return JSON.parse(text);}catch{throw new Error(`Invalid JSON configuration: ${label}`);}}
const args=process.argv.slice(2);const check=args.length===1&&args[0]==='--check';let supplied={};
if(args.length&&!check){if(args.length!==2||args[0]!=='--env-file')throw new Error('Usage: node infra/render-deploy.mjs [--env-file .local/deploy.env | --check]');supplied=dotenv.parse(readLocal(args[1],'Deployment env file'));}
const env={...supplied,...process.env};
function need(name){const value=env[name];if(typeof value!=='string'||!value.trim()||/\$\{[^}]+\}/.test(value))throw new Error(`Missing deployment configuration: ${name}`);return value;}
function integer(value,label,min=1){const n=Number(value);if(!Number.isSafeInteger(n)||n<min)throw new Error(`Invalid deployment integer: ${label}`);return n;}
function bool(name){const value=need(name);if(!['true','false'].includes(value))throw new Error(`Invalid deployment boolean: ${name}`);return value==='true';}
function loadTemplate(name){return json(readLocal(`infra/k8s/${name}`,'Manifest template'),name);}
function substitute(value,values){if(Array.isArray(value))return value.map(x=>substitute(x,values));if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,substitute(v,values)]));if(typeof value!=='string')return value;const exact=/^\$\{([A-Z0-9_]+)\}$/.exec(value);if(exact){if(values[exact[1]]===undefined||values[exact[1]]===null||(typeof values[exact[1]]==='string'&&!values[exact[1]].trim()))throw new Error(`Missing manifest variable: ${exact[1]}`);return values[exact[1]];}return value.replace(/\$\{([A-Z0-9_]+)\}/g,(_m,key)=>{if(values[key]===undefined||values[key]===null||(typeof values[key]==='string'&&!values[key].trim()))throw new Error(`Missing manifest variable: ${key}`);return String(values[key]);});}
function metadata(name,extra={}){return {name,namespace,...extra};}
function secret(name,stringData){return {apiVersion:'v1',kind:'Secret',metadata:metadata(name),type:'Opaque',stringData};}
function list(items){return {apiVersion:'v1',kind:'List',items};}
function main(){
  const catalog=loadTemplate('catalog.json'),base=loadTemplate('deployment.template.json');
  const app=dotenv.parse(readLocal(need('PUMPSKEL_APP_ENV_FILE'),'Application env file'));
  const resources=json(need('PUMPSKEL_RESOURCES_JSON'),'PUMPSKEL_RESOURCES_JSON');
  const replicas=json(need('PUMPSKEL_REPLICAS_JSON'),'PUMPSKEL_REPLICAS_JSON');
  const probes=json(need('PUMPSKEL_PROBES_JSON'),'PUMPSKEL_PROBES_JSON');
  for(const name of ['periodSeconds','timeoutSeconds','failureThreshold','startupFailureThreshold','terminationGracePeriodSeconds'])probes[name]=integer(probes[name],`PUMPSKEL_PROBES_JSON.${name}`);
  integer(need('AWS_ALB_IDLE_TIMEOUT_SECONDS'),'AWS_ALB_IDLE_TIMEOUT_SECONDS');
  const ingress=need('AWS_ALB_SCHEME');if(!['internet-facing','internal'].includes(ingress))throw new Error('AWS_ALB_SCHEME must be internet-facing or internal');
  if(!['Always','IfNotPresent','Never'].includes(need('PUMPSKEL_IMAGE_PULL_POLICY')))throw new Error('Invalid PUMPSKEL_IMAGE_PULL_POLICY');
  const imageRegistry=need('IMAGE_REGISTRY').replace(/\/$/,'');if(/\s/.test(imageRegistry)||imageRegistry.includes('://'))throw new Error('IMAGE_REGISTRY must be a registry/repository prefix');
  const imageTag=need('IMAGE_TAG');if(!/^[A-Za-z0-9_][A-Za-z0-9_.-]{0,127}$/.test(imageTag))throw new Error('Invalid IMAGE_TAG');
  const release=need('PUMPSKEL_RELEASE');if(!/^[a-z0-9][a-z0-9-]{0,30}$/.test(release))throw new Error('Invalid PUMPSKEL_RELEASE');
  for(const name of ['PUMPSKEL_BFF_HOST','PUMPSKEL_KEYED_HOST'])if(!/^[A-Za-z0-9.-]+$/.test(need(name)))throw new Error(`Invalid hostname: ${name}`);
  const natsMode=need('PUMPSKEL_NATS_MODE');if(!['embedded','external'].includes(natsMode))throw new Error('PUMPSKEL_NATS_MODE must be embedded or external');
  const natsUrl=natsMode==='embedded'?'nats://nats:4222':need('PUMPSKEL_NATS_URL');
  if(new URL(natsUrl).username||new URL(natsUrl).password)throw new Error('NATS URL must not contain credentials');
  const serviceRoles=env.PUMPSKEL_SERVICE_ROLES_JSON?json(env.PUMPSKEL_SERVICE_ROLES_JSON,'PUMPSKEL_SERVICE_ROLES_JSON'):{};
  function role(name){const value=serviceRoles[name]??need('AWS_SERVICE_ROLE_ARN');if(typeof value!=='string'||!/^arn:aws:iam::\d{12}:role\//.test(value))throw new Error(`Missing or invalid IAM role for ${name}`);return value;}
  function budget(name){const value=resources[name];if(!value?.requests?.cpu||!value.requests.memory||!value?.limits?.cpu||!value.limits.memory)throw new Error(`Missing CPU/memory requests and limits for ${name}`);return value;}
  function appNeed(name){const value=app[name];if(typeof value!=='string'||!value.trim())throw new Error(`Missing application configuration: ${name}`);return value;}
  const classified=loadTemplate('application-env.json');
  const managed={BIND_HOST:'0.0.0.0',BFF_PORT:'4345',KEYED_PORT:'4353',STREAM_PORT:'4346',TRADING_GRPC_URL:'trading:4347',COMMUNITIES_GRPC_URL:'communities:4348',COINS_GRPC_URL:'coins:4349',TRADING_GRPC_BIND:'0.0.0.0:4347',COMMUNITIES_GRPC_BIND:'0.0.0.0:4348',COINS_GRPC_BIND:'0.0.0.0:4349',TX_BUILDER_PORT:'4350',LIMIT_PORT:'4351',PROFILE_PORT:'4352',NOTIFY_PORT:'4354',LIVE_PORT:'4355',BRIDGE_PORT:'4356',HOLDER_REWARDS_PORT:'4358',TX_BUILDER_URL:'http://tx-builder:4350',LIMIT_URL:'http://limit:4351',PROFILE_URL:'http://profile:4352',NOTIFY_URL:'http://notify:4354',LIVE_URL:'http://live:4355',BRIDGE_URL:'http://bridge:4356',HOLDER_REWARDS_URL:'http://holder-rewards:4358',COOKIE_SECURE:'true',STREAM_TLS_CERT_PATH:'',STREAM_TLS_KEY_PATH:'',NATS_AUTH_MODE:'on',NATS_URL:natsUrl,NATS_PUBLIC_URL:need('PUMPSKEL_NATS_PUBLIC_URL'),NATS_CREDENTIALS_FILE:'/run/nats/clients.json',NATS_AUTH_ISSUER_SEED_FILE:'/run/nats-issuer/issuer.seed',NATS_AUTH_CURVE_SEED_FILE:'/run/nats-curve/curve.seed',NATS_AUTH_HEALTH_HOST:'0.0.0.0',NATS_AUTH_HEALTH_PORT:'4357',INGEST_SOURCE:'geyser',GEYSER_ASSET_METADATA:'/run/ingest/asset-metadata.json',HEALTHCHECK_TIMEOUT_MS:String(integer(need('PUMPSKEL_HEALTHCHECK_TIMEOUT_MS'),'PUMPSKEL_HEALTHCHECK_TIMEOUT_MS'))};
  if(Number(managed.HEALTHCHECK_TIMEOUT_MS)>=probes.timeoutSeconds*1000)throw new Error('Probe timeoutSeconds must exceed PUMPSKEL_HEALTHCHECK_TIMEOUT_MS');
  const publicNats=new URL(managed.NATS_PUBLIC_URL);if(publicNats.username||publicNats.password)throw new Error('Public NATS URL must not contain credentials');
  const publicEnv={};for(const name of classified.public){if(name in managed)continue;if(classified.optional.includes(name)){if(app[name])publicEnv[name]=app[name];}else publicEnv[name]=appNeed(name);}
  Object.assign(publicEnv,managed);
  const secrets=[];
  const storeData={DATABASE_URL:need('PUMPSKEL_DATABASE_URL'),CLICKHOUSE_URL:need('PUMPSKEL_CLICKHOUSE_URL'),CLICKHOUSE_USER:need('PUMPSKEL_CLICKHOUSE_USER'),CLICKHOUSE_PASSWORD:need('PUMPSKEL_CLICKHOUSE_PASSWORD'),REDIS_URL:need('PUMPSKEL_REDIS_URL')};
  secrets.push(secret('pumpskel-stores',storeData));
  function secretGroup(name,keys,requiredKeys=keys){const data={};for(const key of keys){if(requiredKeys.includes(key))data[key]=appNeed(key);else if(app[key])data[key]=app[key];}if(Object.keys(data).length)secrets.push(secret(name,data));return name;}
  secretGroup('pumpskel-internal',['INTERNAL_SERVICE_TOKEN']);
  secretGroup('pumpskel-sessions',['SESSION_JWT_SECRET']);
  const identityRequired=appNeed('IDENTITY_ADAPTER')==='local'?['LOCAL_IDENTITY_TOKEN']:[];
  secretGroup('pumpskel-identity',['LOCAL_IDENTITY_TOKEN','LOCAL_MONEY_IDENTITY_TOKEN','PRIVY_APP_SECRET'],identityRequired);
  secretGroup('pumpskel-notify',['NOTIFY_TOKEN_ENCRYPTION_KEY']);
  secretGroup('pumpskel-transaction',['SOLANA_RPC_URL','TX_SEND_URL','JITO_SEND_URL','NOZOMI_SEND_URL'],[]);
  secretGroup('pumpskel-holder',['HOLDER_REWARDS_SIGNER_URL','HOLDER_REWARDS_SIGNER_TOKEN'],[]);
  if(appNeed('HOLDER_REWARDS_SIGNER_ADAPTER')==='file'){const signer=readLocal(need('PUMPSKEL_HOLDER_SIGNER_FILE'),'Holder signer file');const bytes=json(signer,'Holder signer file');if(!Array.isArray(bytes)||bytes.length!==64||bytes.some(value=>!Number.isInteger(value)||value<0||value>255))throw new Error('Invalid holder signer file');secrets.push(secret('pumpskel-holder-signer',{'signer.json':signer}));publicEnv.HOLDER_REWARDS_SIGNER_KEYPAIR_FILE='/run/holder-signer/signer.json';appNeed('HOLDER_REWARDS_AUTHORITY');}
  const manifest=json(readLocal(need('PUMPSKEL_NATS_CLIENTS_FILE'),'NATS client manifest'),'NATS client manifest');
  const identities=new Set(catalog.filter(x=>x.nats).map(x=>x.nats));identities.add('operator');
  for(const identity of identities){const credentials=manifest.clients?.[identity];if(!credentials||typeof credentials.user!=='string'||typeof credentials.password!=='string'||!credentials.password)throw new Error(`NATS credential missing for ${identity}`);secrets.push(secret(`pumpskel-nats-${identity}`,{'clients.json':JSON.stringify({clients:{[identity]:credentials}})}));}
  const issuer=readLocal(need('PUMPSKEL_NATS_ISSUER_FILE'),'NATS issuer seed').trim(),curve=readLocal(need('PUMPSKEL_NATS_CURVE_FILE'),'NATS curve seed').trim();if(!issuer.startsWith('SA')||!curve.startsWith('SX'))throw new Error('Invalid NATS seed file kind');
  secrets.push(secret('pumpskel-nats-issuer',{'issuer.seed':issuer}),secret('pumpskel-nats-curve',{'curve.seed':curve}));
  const accounts=[];for(const name of [...catalog.map(x=>x.name),'migrate','provision-bus','replay-fixture'])accounts.push({apiVersion:'v1',kind:'ServiceAccount',metadata:metadata(name,{annotations:{'eks.amazonaws.com/role-arn':role(name)}}),automountServiceAccountToken:false});
  const config={apiVersion:'v1',kind:'ConfigMap',metadata:metadata('pumpskel-config'),data:publicEnv};
  function envSecret(container,name){if(secrets.some(x=>x.metadata.name===name))container.envFrom.push({secretRef:{name}});}
  function mount(spec,container,name,mountPath,secretName,file){spec.volumes.push({name,secret:{secretName,defaultMode:288,...(file?{items:[{key:file,path:file}]}:{})}});container.volumeMounts.push({name,mountPath,readOnly:true});}
  const deployments=[],services=[];
  for(const service of catalog){
    const count=integer(replicas[service.name],`replicas.${service.name}`,0);if(service.singleton&&count>1)throw new Error(`${service.name} is a singleton in this skeleton`);
    const b=budget(service.name),values={...env,IMAGE_REGISTRY:imageRegistry,IMAGE_TAG:imageTag,NAME:service.name,IMAGE:service.image,REPLICAS:count,REQUEST_CPU:b.requests.cpu,REQUEST_MEMORY:b.requests.memory,LIMIT_CPU:b.limits.cpu,LIMIT_MEMORY:b.limits.memory,TERMINATION_GRACE_SECONDS:probes.terminationGracePeriodSeconds};
    const deployment=substitute(base,values),spec=deployment.spec.template.spec,container=spec.containers[0];
    if(service.singleton)deployment.spec.strategy={type:'Recreate'};
    container.command=service.rust?['/usr/local/bin/pump-ingest']:['node',service.entry];container.args=service.rust?['run']:(service.args??[]);
    container.env=[];if(service.name==='keyed-api')container.env.push({name:'PUMPSKEL_API_HOST_MODE',value:'keyed'});if(service.nats){container.env.push({name:'NATS_SERVICE_IDENTITY',value:service.nats});mount(spec,container,'nats-credentials','/run/nats',`pumpskel-nats-${service.nats}`);}
    for(const [flag,name] of [['internal','pumpskel-internal'],['session','pumpskel-sessions'],['identity','pumpskel-identity'],['notification','pumpskel-notify'],['transaction','pumpskel-transaction'],['holder','pumpskel-holder']])if(service[flag])envSecret(container,name);
    if(service.issuer)mount(spec,container,'nats-issuer','/run/nats-issuer','pumpskel-nats-issuer');
    if(service.curve)mount(spec,container,'nats-curve','/run/nats-curve','pumpskel-nats-curve');
    if(service.holder&&app.HOLDER_REWARDS_SIGNER_ADAPTER==='file')mount(spec,container,'holder-signer','/run/holder-signer','pumpskel-holder-signer');
    const command=service.rust?['/usr/local/bin/pump-ingest','health']:['node','tools/probe.cjs',service.name];
    const probe={exec:{command},periodSeconds:probes.periodSeconds,timeoutSeconds:probes.timeoutSeconds,failureThreshold:probes.failureThreshold};
    container.readinessProbe=probe;container.livenessProbe=probe;container.startupProbe={...probe,failureThreshold:probes.startupFailureThreshold};
    if(service.rust){spec.securityContext.runAsUser=10001;spec.securityContext.runAsGroup=10001;spec.securityContext.fsGroup=10001;
      if(count>0){const ingestSecrets={GEYSER_ENDPOINT:need('PUMPSKEL_GEYSER_ENDPOINT'),GEYSER_TOKEN:need('PUMPSKEL_GEYSER_TOKEN')};secrets.push(secret('pumpskel-ingest-source',ingestSecrets));envSecret(container,'pumpskel-ingest-source');publicEnv.GEYSER_QUEUE_CAPACITY=need('PUMPSKEL_GEYSER_QUEUE_CAPACITY');publicEnv.GEYSER_MAX_FRAME_BYTES=need('PUMPSKEL_GEYSER_MAX_FRAME_BYTES');const data=readLocal(need('PUMPSKEL_INGEST_METADATA_FILE'),'Ingest asset metadata');const assetMetadata=json(data,'Ingest asset metadata');if(!assetMetadata?.assets||typeof assetMetadata.assets!=='object'||Array.isArray(assetMetadata.assets)||Object.keys(assetMetadata).some(key=>!['assets','pools'].includes(key)))throw new Error('Ingest metadata must contain only public assets and pools mappings');accounts.push({apiVersion:'v1',kind:'ConfigMap',metadata:metadata('pumpskel-ingest-metadata'),data:{'asset-metadata.json':data}});}
      spec.volumes.push({name:'ingest-metadata',configMap:{name:'pumpskel-ingest-metadata'}});container.volumeMounts.push({name:'ingest-metadata',mountPath:'/run/ingest',readOnly:true});
    }else{container.ports=[{name:'service',containerPort:service.port}];services.push({apiVersion:'v1',kind:'Service',metadata:metadata(service.name),spec:{type:'ClusterIP',selector:{'app.kubernetes.io/name':service.name},ports:[{name:'service',port:service.port,targetPort:service.port}]}});}
    deployments.push(deployment);
  }
  const registrySecret=env.PUMPSKEL_IMAGE_PULL_SECRET;if(registrySecret)for(const deployment of deployments)deployment.spec.template.spec.imagePullSecrets=[{name:registrySecret}];
  function job(name,image,command,identity,fixture=false){const b=budget(name);const serviceAccountName=name;const spec={serviceAccountName,automountServiceAccountToken:false,restartPolicy:'Never',nodeSelector:{'topology.kubernetes.io/region':'us-east-1'},securityContext:{runAsNonRoot:true,runAsUser:fixture?10001:1000,runAsGroup:fixture?10001:1000,fsGroup:fixture?10001:1000},containers:[{name,imagePullPolicy:need('PUMPSKEL_IMAGE_PULL_POLICY'),image:`${imageRegistry}/${image}:${imageTag}`,command,envFrom:[{configMapRef:{name:'pumpskel-config'}},{secretRef:{name:'pumpskel-stores'}}],resources:b,securityContext:{allowPrivilegeEscalation:false,readOnlyRootFilesystem:true,capabilities:{drop:['ALL']}},volumeMounts:[{name:'tmp',mountPath:'/tmp'}]}],volumes:[{name:'tmp',emptyDir:{}}]};if(identity)mount(spec,spec.containers[0],'nats-credentials','/run/nats',`pumpskel-nats-${identity}`);if(registrySecret)spec.imagePullSecrets=[{name:registrySecret}];return {apiVersion:'batch/v1',kind:'Job',metadata:metadata(`pumpskel-${name}-${release}`),spec:{backoffLimit:integer(need('PUMPSKEL_JOB_BACKOFF_LIMIT'),'PUMPSKEL_JOB_BACKOFF_LIMIT',0),...(fixture?{suspend:true}:{}),template:{metadata:{labels:{'app.kubernetes.io/name':name}},spec}}};}
  const migrate=job('migrate','client-server',['node','tools/dist/migrate.js']);
  const provision=job('provision-bus','client-server',['node','infra/k8s/provision-bus.cjs'],'operator');
  const replay=job('replay-fixture','ingest',['/usr/local/bin/pump-ingest','replay','/app/fixtures/replay.jsonl'],'ingest',true);
  const outputs={'00-namespace.json':list([{apiVersion:'v1',kind:'Namespace',metadata:{name:namespace}}]),'10-config-secrets.json':list([config,...secrets,...accounts]),'30-bootstrap-jobs.json':list([migrate,provision]),'40-workloads.json':list([...deployments,...services]),'50-ingress.json':list([substitute(loadTemplate('ingress.template.json'),env)]),'60-network-policy.json':list([{apiVersion:'networking.k8s.io/v1',kind:'NetworkPolicy',metadata:metadata('internal-and-edge-ingress'),spec:{podSelector:{},policyTypes:['Ingress'],ingress:[{from:[{namespaceSelector:{matchLabels:{'kubernetes.io/metadata.name':namespace}}}]},{ports:[{protocol:'TCP',port:4345},{protocol:'TCP',port:4353},{protocol:'TCP',port:4346}]}]}}]),'80-replay-fixture-job.json':list([replay])};
  if(natsMode==='embedded'){
    const serverConfig=readLocal(need('PUMPSKEL_NATS_SERVER_CONFIG_FILE'),'NATS server config'),b=budget('nats');
    const natsSecret=secret('pumpskel-nats-server',{'server.conf':serverConfig});
    const service={apiVersion:'v1',kind:'Service',metadata:metadata('nats'),spec:{selector:{'app.kubernetes.io/name':'nats'},ports:[{name:'client',port:4222,targetPort:4222},{name:'monitor',port:8222,targetPort:8222}]}};
    const headless={...service,metadata:metadata('nats-internal'),spec:{...service.spec,clusterIP:'None'}};
    const stateful={apiVersion:'apps/v1',kind:'StatefulSet',metadata:metadata('nats'),spec:{serviceName:'nats-internal',replicas:1,selector:{matchLabels:{'app.kubernetes.io/name':'nats'}},template:{metadata:{labels:{'app.kubernetes.io/name':'nats'}},spec:{automountServiceAccountToken:false,nodeSelector:{'topology.kubernetes.io/region':'us-east-1'},securityContext:{runAsNonRoot:true,runAsUser:1000,runAsGroup:1000,fsGroup:1000},containers:[{name:'nats',image:'nats:2.11-alpine',args:['-c','/etc/nats/server.conf'],ports:[{name:'client',containerPort:4222},{name:'monitor',containerPort:8222}],resources:b,securityContext:{allowPrivilegeEscalation:false,readOnlyRootFilesystem:true,capabilities:{drop:['ALL']}},volumeMounts:[{name:'config',mountPath:'/etc/nats',readOnly:true},{name:'data',mountPath:'/data'}],readinessProbe:{httpGet:{path:'/healthz',port:8222},periodSeconds:probes.periodSeconds,timeoutSeconds:probes.timeoutSeconds,failureThreshold:probes.failureThreshold},livenessProbe:{httpGet:{path:'/healthz',port:8222},periodSeconds:probes.periodSeconds,timeoutSeconds:probes.timeoutSeconds,failureThreshold:probes.failureThreshold}}],volumes:[{name:'config',secret:{secretName:'pumpskel-nats-server',defaultMode:288}}]}},volumeClaimTemplates:[{metadata:{name:'data'},spec:{accessModes:['ReadWriteOnce'],storageClassName:need('PUMPSKEL_STORAGE_CLASS'),resources:{requests:{storage:need('PUMPSKEL_NATS_STORAGE_SIZE')}}}}]}};
    outputs['20-nats.json']=list([natsSecret,service,headless,stateful]);
  }
  const directory=inside('.local/k8s','Manifest output');fs.mkdirSync(directory,{recursive:true});
  if(!outputs['20-nats.json']){const old=path.join(directory,'20-nats.json');if(fs.existsSync(old))fs.unlinkSync(old);}
  for(const [name,document] of Object.entries(outputs))fs.writeFileSync(path.join(directory,name),JSON.stringify(document,null,2)+'\n',{mode:0o600});
  fs.writeFileSync(path.join(directory,'manifest-index.json'),JSON.stringify({namespace,release,files:Object.keys(outputs)},null,2)+'\n',{mode:0o600});
  process.stdout.write(`Rendered ${Object.keys(outputs).length} manifest files to .local/k8s. Secret values were not printed.\n`);
}
try{if(check){const directory=inside('infra/k8s','Template directory');for(const name of fs.readdirSync(directory).filter(name=>name.endsWith('.json')))json(fs.readFileSync(path.join(directory,name),'utf8'),name);const catalog=loadTemplate('catalog.json');for(const name of new Set(catalog.map(service=>service.image)))if(!fs.existsSync(inside('infra/images/'+name+'/Dockerfile','Image source')))throw new Error('Missing Dockerfile: '+name);process.stdout.write('Kubernetes JSON templates and all image sources are present; no environment or network was used.\n');}else main();}catch(error){process.stderr.write(`Deployment rendering failed: ${error.message}\n`);process.exitCode=1;}