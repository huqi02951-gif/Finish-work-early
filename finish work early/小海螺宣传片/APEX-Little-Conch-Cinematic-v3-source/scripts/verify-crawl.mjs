import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {adsTxt, verificationTag} from '../src/AdSenseConfig.js';

const project=fileURLToPath(new URL('../',import.meta.url));
const output=resolve(process.argv[2]||resolve(project,'dist'));
const config=JSON.parse(await readFile(resolve(project,'config/adsense.json'),'utf8'));
const expected=adsTxt(config);
assert.ok(expected,'A real publisher ID is required for the submitted site.');
assert.equal(await readFile(resolve(output,'ads.txt'),'utf8'),expected,'Published ads.txt must match the configured publisher.');

const robots=await readFile(resolve(output,'robots.txt'),'utf8');
assert.doesNotMatch(robots,/<(?:!doctype|html)/i,'robots.txt must not fall back to the application HTML.');
assert.match(robots,/^User-agent:\s*\*\s*$/mi,'Declare the public crawler group.');
assert.match(robots,/^Allow:\s*\/\s*$/mi,'Keep this public promotional site crawlable.');
assert.doesNotMatch(robots,/^Disallow:\s*\S/m,'Do not publish crawler restrictions on this public site.');

for(const page of ['index.html','about.html','privacy.html']){
  const html=await readFile(resolve(output,page),'utf8');
  assert.ok(html.includes(verificationTag(config)),`${page} must identify the same AdSense publisher.`);
  assert.equal((html.match(/name=["']google-adsense-account["']/g)||[]).length,1,`${page} must have exactly one ownership tag.`);
}
console.log('Crawl artifacts verified: ads.txt, robots.txt and ownership tags on all 3 pages.');
