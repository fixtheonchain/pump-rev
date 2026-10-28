import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
import path from 'node:path';
import {ComputeBudgetProgram,SystemProgram,TransactionMessage} from '@solana/web3.js';
import {loadEnv,pg,workspaceRoot} from '@pump/runtime';
import {PUMP,PUMP_AMM,LIGHTHOUSE,TOKEN_PROGRAM,TOKEN_2022_PROGRAM,pumpIdl,pumpAmmIdl,pumpFeesIdl,PublicKey,TransactionInstruction,VersionedTransaction,fixtureSigner,fixtureKey,pda,ata,compileTransaction,verifySignedMessage} from '@pump/solana';
import {TransactionBuilder,FixtureChain,FIXTURE_MINT,FIXTURE_QUOTE,swapInstruction,holderDistributeInstruction,type SenderAdapter} from './index';
loadEnv();
after(async()=>{await pg().end();});
const signer=fixtureSigner();
class TestChain extends FixtureChain {
 complete=false;
 override async coin(mint:string){const creator=signer.publicKey.toBase58(),pool=fixtureKey('pool');return {mint,quoteMint:FIXTURE_QUOTE,baseTokenProgram:TOKEN_2022_PROGRAM.toBase58(),quoteTokenProgram:TOKEN_PROGRAM.toBase58(),creator,pool:pool.toBase58(),poolBaseTokenAccount:ata(pool,new PublicKey(mint),TOKEN_2022_PROGRAM).toBase58(),poolQuoteTokenAccount:ata(pool,new PublicKey(FIXTURE_QUOTE),TOKEN_PROGRAM).toBase58(),protocolFeeRecipient:fixtureKey('fee-recipient').toBase58(),buybackFeeRecipient:fixtureKey('buyback').toBase58(),curveSweepRequired:true,poolSweepRequired:this.complete,complete:this.complete,poolExists:this.complete,claimableAtomic:'100000'};}
}
const input={user:signer.publicKey.toBase58(),mint:FIXTURE_MINT,quote_mint:FIXTURE_QUOTE,side:'buy' as const,amount_in:'1000000',min_out:'1'};
function assertSpec(ix:TransactionInstruction,idl:any,name:string){
 const spec=idl.instructions.find((value:any)=>value.name===name);
 assert.equal(ix.programId.toBase58(),idl.address);
 assert.deepEqual([...ix.data.subarray(0,8)],spec.discriminator);
 assert.equal(ix.keys.length>=spec.accounts.length,true);
 const named:Record<string,PublicKey>=Object.fromEntries(spec.accounts.map((item:any,index:number)=>[item.name,ix.keys[index]!.pubkey]));
 const actor=signer.publicKey,base=new PublicKey(FIXTURE_MINT),quote=new PublicKey(FIXTURE_QUOTE),pool=fixtureKey('pool');
 const associated=new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');
 const deriveAta=(owner:PublicKey,mint:PublicKey,program:PublicKey)=>PublicKey.findProgramAddressSync([owner.toBuffer(),program.toBuffer(),mint.toBuffer()],associated)[0];
 const creatorVault=PublicKey.findProgramAddressSync([Buffer.from(idl.address===PUMP.toBase58()?'creator-vault':'creator_vault'),actor.toBuffer()],new PublicKey(idl.address))[0];
 const holder=PublicKey.findProgramAddressSync([Buffer.from('holder-rewards'),base.toBuffer()],PUMP)[0];
 const known:Record<string,PublicKey>={user:actor,creator:actor,coin_creator:actor,payer:actor,mint:base,base_mint:base,quote_mint:quote,base_token_program:TOKEN_2022_PROGRAM,quote_token_program:TOKEN_PROGRAM,associated_token_program:associated,system_program:SystemProgram.programId,program:new PublicKey(idl.address),pool,protocol_fee_recipient:fixtureKey('fee-recipient'),buyback_fee_recipient:fixtureKey('buyback'),associated_base_user:deriveAta(actor,base,TOKEN_2022_PROGRAM),associated_quote_user:deriveAta(actor,quote,TOKEN_PROGRAM),user_base_token_account:deriveAta(actor,base,TOKEN_2022_PROGRAM),user_quote_token_account:deriveAta(actor,quote,TOKEN_PROGRAM),pool_base_token_account:deriveAta(pool,base,TOKEN_2022_PROGRAM),pool_quote_token_account:deriveAta(pool,quote,TOKEN_PROGRAM),recipient:creatorVault,coin_creator_token_account:deriveAta(actor,quote,TOKEN_PROGRAM),holder_reward_claim_authority:actor,holder_rewards_token_account:deriveAta(holder,quote,TOKEN_PROGRAM)};
 const fields:Record<string,PublicKey>={'bonding_curve.creator':actor,'pool.coin_creator':actor,'pool.base_mint':base,'pool.quote_mint':quote,'pool.pool_base_token_account':known.pool_base_token_account!,'pool.pool_quote_token_account':known.pool_quote_token_account!,'global.holder_reward_claim_authority':actor};
 // Read seed expressions independently from the original source IDL. No production PDA helper is used here.
 const sourceSeed=(seed:any):Buffer=>{if(seed.kind==='const')return Buffer.from(seed.value);if(seed.kind==='account'){const value=fields[seed.path]??known[seed.path]??named[seed.path];assert.ok(value,`trusted seed ${seed.path}`);return value.toBuffer();}throw new Error(`Unsupported source seed ${seed.kind}`);};
 for(let index=0;index<spec.accounts.length;index++){
  const account=spec.accounts[index],meta=ix.keys[index]!;
  assert.equal(meta.isSigner,Boolean(account.signer),`${name}.${account.name} signer`);
  assert.equal(meta.isWritable,Boolean(account.writable),`${name}.${account.name} writable`);
  if(account.address)assert.equal(meta.pubkey.toBase58(),account.address,`${name}.${account.name} fixed`);
  if(known[account.name])assert.equal(meta.pubkey.toBase58(),known[account.name]!.toBase58(),`${name}.${account.name} account order`);
  const sourcePda=account.pda??(account.name==='global_config'?idl.instructions.flatMap((item:any)=>item.accounts).find((item:any)=>item.name===account.name&&item.pda)?.pda:undefined);
  if(sourcePda){const program=sourcePda.program?new PublicKey(sourceSeed(sourcePda.program)):new PublicKey(idl.address);const derived=PublicKey.findProgramAddressSync(sourcePda.seeds.map(sourceSeed),program)[0];assert.equal(meta.pubkey.toBase58(),derived.toBase58(),`${name}.${account.name} source PDA`);}
  for(const relation of account.relations??[])assert.equal(meta.pubkey.toBase58(),fields[`${relation}.${account.name}`]!.toBase58(),`${name}.${account.name} trusted relation`);
 }
}
test('frozen instruction layouts match source IDLs; every supported swap preserves account order and PDAs',async()=>{
 for(const [name,frozen] of [['pump',pumpIdl],['pump_amm',pumpAmmIdl],['pump_fees',pumpFeesIdl]] as const)assert.deepEqual(frozen,JSON.parse(readFileSync(path.resolve(workspaceRoot(),'../idl',`${name}.json`),'utf8')));
 const chain=new TestChain();const coin=await chain.coin(FIXTURE_MINT);
 for(const venue of ['pump','pumpswap'] as const)for(const side of ['buy','sell'] as const){const ix=swapInstruction(coin,{...input,venue,side});assertSpec(ix,venue==='pump'?pumpIdl:pumpAmmIdl,venue==='pump'?side==='buy'?'buy_exact_quote_in_v3':'sell_v3':side==='buy'?'buy_exact_quote_in':'sell');if(venue==='pump'){assert.equal(ix.keys[5]!.pubkey.toBase58(),pda(PUMP,'bonding-curve',new PublicKey(FIXTURE_MINT)).toBase58());assert.equal(ix.keys[6]!.pubkey.toBase58(),ata(ix.keys[5]!.pubkey,new PublicKey(FIXTURE_MINT),TOKEN_2022_PROGRAM).toBase58());}else assert.equal(ix.keys[0]!.pubkey.toBase58(),coin.pool);}
 const holder=holderDistributeInstruction({mint:FIXTURE_MINT,quoteMint:FIXTURE_QUOTE,quoteTokenProgram:TOKEN_PROGRAM.toBase58(),authority:signer.publicKey.toBase58(),recipients:[{wallet:fixtureKey('holder-test').toBase58(),amount:'7'}]});assertSpec(holder,pumpIdl,'distribute_fee_to_holders');assert.equal(holder.data.readUInt32LE(8),1);assert.equal(holder.data.readBigUInt64LE(12),7n);
});
test('wallet rewrites allow compute and trailing readonly Lighthouse while rejecting asset changes and bad signatures',async()=>{
 const chain=new TestChain(),builder=new TransactionBuilder(chain,chain);const prepared=await builder.buildSwap(input);const original=VersionedTransaction.deserialize(Buffer.from(prepared.transaction,'base64'));const tables=await chain.lookupTables();const message=TransactionMessage.decompile(original.message,{addressLookupTableAccounts:tables});
 const guard=new TransactionInstruction({programId:LIGHTHOUSE,keys:[{pubkey:fixtureKey('readonly-guard'),isSigner:false,isWritable:false}],data:Buffer.from([1])});
 const rewritten=compileTransaction(signer.publicKey,[ComputeBudgetProgram.setComputeUnitLimit({units:300000}),...message.instructions.filter(ix=>!ix.programId.equals(ComputeBudgetProgram.programId)),guard],message.recentBlockhash,tables);rewritten.sign([signer]);assert.doesNotThrow(()=>verifySignedMessage(original,rewritten,tables));
 const extra=compileTransaction(signer.publicKey,[...message.instructions,SystemProgram.transfer({fromPubkey:signer.publicKey,toPubkey:fixtureKey('attacker'),lamports:1n})],message.recentBlockhash,tables);extra.sign([signer]);assert.throws(()=>verifySignedMessage(original,extra,tables),/writable|trailing|changed/);
 const changed=compileTransaction(signer.publicKey,[...message.instructions.slice(0,-1),new TransactionInstruction({...message.instructions.at(-1)!,data:Buffer.concat([message.instructions.at(-1)!.data,Buffer.from([9])])})],message.recentBlockhash,tables);changed.sign([signer]);assert.throws(()=>verifySignedMessage(original,changed,tables),/changed/);
 rewritten.signatures[0]![0]^=1;assert.throws(()=>verifySignedMessage(original,rewritten,tables),/signature/);
});
test('phase controls builder venue, creator claims prepend both trusted sweep buckets, and vault claim builds',async()=>{
 const chain=new TestChain(),builder=new TransactionBuilder(chain,chain);let rawInstructions:TransactionInstruction[]=[];const prepare=builder.prepareInstructions.bind(builder);builder.prepareInstructions=async value=>{rawInstructions=value.instructions;return prepare(value);};await assert.rejects(builder.buildSwap({...input,venue:'pumpswap'}),/venue_phase_mismatch/);
 chain.complete=true;const pool=await builder.buildSwap(input);const tables=await chain.lookupTables();const poolIx=TransactionMessage.decompile(VersionedTransaction.deserialize(Buffer.from(pool.transaction,'base64')).message,{addressLookupTableAccounts:tables}).instructions.find(ix=>ix.programId.equals(PUMP_AMM));assert.ok(poolIx);
 const fees=await builder.buildCreatorFees({wallet:input.user,mint:input.mint});for(const ix of rawInstructions.filter(item=>item.programId.equals(PUMP)||item.programId.equals(PUMP_AMM))){const idl=ix.programId.equals(PUMP)?pumpIdl:pumpAmmIdl;const spec=idl.instructions.find((item:any)=>Buffer.from(item.discriminator).equals(ix.data.subarray(0,8)));assertSpec(ix,idl,spec.name);}const claims=TransactionMessage.decompile(VersionedTransaction.deserialize(Buffer.from(fees.fees.claim_transaction,'base64')).message,{addressLookupTableAccounts:tables}).instructions.filter(ix=>ix.programId.equals(PUMP)||ix.programId.equals(PUMP_AMM));assert.equal(claims.length,4);assert.deepEqual([...claims[0]!.data],pumpIdl.instructions.find((ix:any)=>ix.name==='sweep_creator_fee').discriminator);assert.deepEqual([...claims[2]!.data],pumpAmmIdl.instructions.find((ix:any)=>ix.name==='sweep_creator_fee').discriminator);
 const vault=await builder.buildCreatorVault({wallet:input.user,quote_mint:FIXTURE_QUOTE});assert.ok(vault.fees.collect_transaction);for(const ix of rawInstructions){const idl=ix.programId.equals(PUMP)?pumpIdl:pumpAmmIdl;const spec=idl.instructions.find((item:any)=>Buffer.from(item.discriminator).equals(ix.data.subarray(0,8)));assertSpec(ix,idl,spec.name);}
});
test('a sender that lands then loses its response reconciles the persisted signature without another payout',async()=>{
 const chain=new TestChain();let calls=0;const sender:SenderAdapter={async send(tx,nonce){calls++;await chain.send(tx,nonce);throw new Error('lost response after landing');}};const builder=new TransactionBuilder(chain,sender);const prepared=await builder.buildSwap(input);const tx=VersionedTransaction.deserialize(Buffer.from(prepared.transaction,'base64'));tx.sign([signer]);const request={preparedId:prepared.preparedId,transaction:Buffer.from(tx.serialize()).toString('base64'),idempotencyKey:randomUUID(),user:input.user};assert.equal((await builder.sendStored(request)).status,'unknown');assert.equal((await builder.sendStored(request)).status,'confirmed');assert.equal(calls,1);assert.equal((await pg().query('SELECT count(*)::int AS count FROM transaction_sends WHERE prepared_id=$1',[prepared.preparedId])).rows[0].count,1);
});
test('durable nonce bytes start with advance, outlive ordinary prepared TTL and reject advanced nonce',async()=>{
 const chain=new TestChain(),builder=new TransactionBuilder(chain,chain);const nonceAccount=fixtureKey(randomUUID()).toBase58(),state=await chain.nonce(nonceAccount);const nonce={nonce_account:nonceAccount,nonce_value:state.nonce,nonce_authority:state.authority,nonce_landed_slot:state.slot};const prepared=await builder.buildSwap(input,nonce);assert.equal(prepared.expiresAt,null);const tx=VersionedTransaction.deserialize(Buffer.from(prepared.transaction,'base64'));const decoded=TransactionMessage.decompile(tx.message,{addressLookupTableAccounts:await chain.lookupTables()});assert.equal(decoded.instructions[0]!.programId.toBase58(),SystemProgram.programId.toBase58());assert.equal(decoded.instructions[0]!.data.readUInt32LE(0),4);tx.sign([signer]);await builder.verifyPrepared(prepared.preparedId,Buffer.from(tx.serialize()).toString('base64'),input.user);await pg().query('UPDATE fixture_chain_nonces SET nonce=$2 WHERE address=$1',[nonceAccount,fixtureKey(randomUUID()).toBase58()]);await assert.rejects(builder.verifyPrepared(prepared.preparedId,Buffer.from(tx.serialize()).toString('base64'),input.user),/nonce_changed/);
});


