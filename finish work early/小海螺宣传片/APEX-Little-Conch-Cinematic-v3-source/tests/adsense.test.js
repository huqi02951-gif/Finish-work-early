import {test} from 'node:test';
import assert from 'node:assert/strict';
import {adsTxt,verificationTag,validateAdSenseConfig} from '../src/AdSenseConfig.js';
const owner={publisherId:'ca-pub-1234567890123456',adSlot:'1234567890',siteStatus:'ready',consentConfigured:true,enabled:true};
test('unconfigured and placeholder publisher IDs never emit ownership claims or activate ads',()=>{
 assert.equal(adsTxt({}),null);assert.equal(verificationTag({}),'');
 for(const publisherId of ['ca-pub-8888888888888888','ca-pub-0000000000000000','bad','ca-pub-1234567890123456" onload="alert(1)'])assert.throws(()=>validateAdSenseConfig({publisherId}));
});
test('the same validated owner ID generates metadata and ads.txt',()=>{
 assert.equal(adsTxt(owner),'google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0\n');
 assert.equal(verificationTag(owner),'<meta name="google-adsense-account" content="ca-pub-1234567890123456">');
});
test('real publisher IDs allow review verification before ads are enabled',()=>{
 assert.ok(adsTxt({...owner,adSlot:'',siteStatus:'getting-ready',consentConfigured:false,enabled:false}));
 for(const override of [{publisherId:''},{adSlot:''},{siteStatus:'getting-ready'},{consentConfigured:false}])assert.throws(()=>validateAdSenseConfig({...owner,...override}));
});
