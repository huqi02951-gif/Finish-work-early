import assert from 'node:assert/strict';
import {readFile, readdir, stat} from 'node:fs/promises';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const project=fileURLToPath(new URL('../',import.meta.url));
const output=resolve(process.argv[2]||resolve(project,'dist'));
const config=JSON.parse(await readFile(resolve(project,'config/adsense-public.json'),'utf8'));
assert.match(config.publisherId,/^ca-pub-\d{16}$/);
assert.equal(config.enabled,false,'Advertising must stay disabled until approval and consent setup.');
assert.equal(config.placementScope,'public-guides-only');
assert.equal(await readFile(resolve(output,'ads.txt'),'utf8'),`google.com, ${config.publisherId.slice(3)}, DIRECT, f08c47fec0942fa0\n`);
const robots=await readFile(resolve(output,'robots.txt'),'utf8');
assert.doesNotMatch(robots,/<html/i);
assert.match(robots,/^User-agent:\s*\*\s*$/m);
assert.match(robots,/^Allow:\s*\/\s*$/m);
assert.ok(robots.includes(`${config.siteUrl}/sitemap.xml`));
const guideFiles=(await readdir(resolve(output,'guides'))).filter(file=>file.endsWith('.html'));
assert.equal(guideFiles.length,7,'Publish the index, four guides, about and privacy.');
let checkedLinks=0;
for(const relative of ['index.html',...guideFiles.map(file=>`guides/${file}`)]){
  const html=await readFile(resolve(output,relative),'utf8');
  assert.equal((html.match(/name="google-adsense-account"/g)||[]).length,1,`${relative}: exactly one ownership tag`);
  assert.ok(html.includes(`content="${config.publisherId}"`),`${relative}: wrong owner`);
  assert.doesNotMatch(html,/adsbygoogle|pagead2\.googlesyndication\.com/,`${relative}: do not load ads yet`);
  if(relative.startsWith('guides/')){
    assert.match(html,/<h1>/,`${relative}: missing readable content`);
    assert.match(html,/id="main"/);
    assert.ok(html.includes('./privacy.html'),`${relative}: privacy must be reachable`);
    assert.ok(html.includes(`<link rel="canonical" href="${config.siteUrl}/guides/`),`${relative}: wrong canonical host`);
  }
  for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)){
    const reference=match[1];
    if(reference.startsWith('#')||/^(?:https?:|mailto:|data:)/.test(reference))continue;
    const path=reference.split('#')[0].split('?')[0];
    let target=resolve(dirname(resolve(output,relative)),path);
    if((await stat(target)).isDirectory())target=resolve(target,'index.html');
    assert.ok((await stat(target)).isFile(),`${relative}: broken link ${reference}`);
    checkedLinks++;
  }
}
const sitemap=await readFile(resolve(output,'sitemap.xml'),'utf8');
assert.equal((sitemap.match(/<loc>/g)||[]).length,8);
assert.doesNotMatch(sitemap,/#|workspace|login|bbs|customer=/);
for(const match of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)){
  const url=new URL(match[1]);assert.equal(url.origin,config.siteUrl);
  let target=resolve(output,`.${url.pathname}`);
  if((await stat(target)).isDirectory())target=resolve(target,'index.html');
  assert.ok((await stat(target)).isFile(),`Sitemap target missing: ${url.pathname}`);
}
for(const file of await readdir(resolve(output,'assets'))){
  if(!/\.(?:js|json|html|txt)$/.test(file))continue;
  const source=await readFile(resolve(output,'assets',file),'utf8');
  if(/AIza[0-9A-Za-z_-]{35}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|postgres(?:ql)?:\/\/[^\s"']+:[^\s"']+@/.test(source)){
    throw new Error(`Do not publish private service credentials in ${file}. Credential values are not logged.`);
  }
}
console.log(`Public content verified: 8 HTML pages, ${checkedLinks} local references, 8 sitemap URLs, consistent ownership, no ad SDK.`);
