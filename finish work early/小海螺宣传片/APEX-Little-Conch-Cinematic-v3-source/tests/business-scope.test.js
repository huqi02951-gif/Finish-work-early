import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CHAPTERS,SCENARIOS,SCENARIO_COUNT,FINALE_INDEX,chapterKicker} from '../src/StoryChapters.js';

test('the shipped story contains the four confirmed credit tasks and separates research from current abilities',()=>{
 assert.equal(SCENARIO_COUNT,4);
 assert.deepEqual(SCENARIOS.map(ch=>ch.cn),['外部风险信息查询','财报转换','企业股权分析','受益所有人一键识别']);
 for(const [i,ch] of SCENARIOS.entries()){
  assert.ok(ch.steps&&ch.deliverable&&ch.desc);
  assert.match(chapterKicker(ch,i+1),/\/ 04/);
  assert.ok(ch.start<CHAPTERS.find(ch=>ch.kind==='research').start);
 }
 assert.match(SCENARIOS[0].steps,/工商异常.*行政处罚.*司法涉诉/);
 assert.match(SCENARIOS[1].steps,/OCR/);assert.match(SCENARIOS[1].deliverable,/导入信贷系统/);
 assert.match(SCENARIOS[2].deliverable,/授信报告/);
 assert.match(SCENARIOS[3].steps,/持股比例.*生成材料/);
 assert.match(CHAPTERS.find(ch=>ch.kind==='research').kicker,/正在研究/);
 assert.equal(CHAPTERS[FINALE_INDEX].kind,'credits');
});
