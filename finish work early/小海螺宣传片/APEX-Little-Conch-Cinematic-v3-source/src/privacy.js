import config from '../config/adsense.json';
import { validateAdSenseConfig } from './AdSenseConfig.js';
const { enabled }=validateAdSenseConfig(config);
document.getElementById('advertising-state').textContent=enabled?'广告已配置：仅在小海螺介绍页的独立广告位置加载 Google AdSense；实际广告展示由 Google 决定。':'广告尚未启用：正在完成网站审核与必要配置，不加载 Google 广告脚本。';
