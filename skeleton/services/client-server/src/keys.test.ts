import test from 'node:test';
import assert from 'node:assert/strict';
import { issueKey, validKey } from './keys';
test('key format and checksum detect truncation and modified payload',()=>{
  process.env.API_KEY_PAYLOAD_BYTES='32';process.env.API_KEY_CHECKSUM_HEX_LENGTH='8';
  const key=issueKey();assert.equal(validKey(key),true);
  assert.equal(validKey(key.slice(0,-1)),false);
  const changed=key.slice(0,8)+(key[8]==='a'?'b':'a')+key.slice(9);
  assert.equal(validKey(changed),false);
  assert.equal(validKey(key.replace('pf_live_','pf_test_')),false);
});
