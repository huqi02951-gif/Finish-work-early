import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import config from './config/adsense.json';
import { adsTxt, verificationTag, validateAdSenseConfig } from './src/AdSenseConfig.js';
const adConfig=validateAdSenseConfig(config);
export default defineConfig({
  base: './',
  plugins:[{
    name:'owner-adsense-verification',
    transformIndexHtml(html){return html.replace('</head>',`${verificationTag(adConfig)}</head>`);},
    generateBundle(){const source=adsTxt(adConfig);if(source)this.emitFile({type:'asset',fileName:'ads.txt',source});},
    configureServer(server){server.middlewares.use('/ads.txt',(_req,res)=>{const source=adsTxt(adConfig);res.statusCode=source?200:404;res.setHeader('Content-Type','text/plain; charset=utf-8');res.end(source||'AdSense publisher not configured.');});}
  }],
  build: { assetsInlineLimit: 0, rollupOptions: { input:{film:resolve(import.meta.dirname,'index.html'),about:resolve(import.meta.dirname,'about.html'),privacy:resolve(import.meta.dirname,'privacy.html')},output: { manualChunks: { three: ['three'] } } } },
});
