import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { addDiveInput, DIVE_PACING, DiveReadingGate } from '../src/first-stage/DiveNavigation.js';

// Execute the actual browser event handlers, with only their DOM boundary stubbed.
function browserInput(progress = .18, reading = true) {
  const source = readFileSync(new URL('../src/film.js', import.meta.url), 'utf8');
  const start = source.indexOf('let touchY=null;');
  const end = source.indexOf('function keys(e)', start);
  assert.ok(start >= 0 && end > start);
  const gate = new DiveReadingGate();
  if (reading) gate.enter(1, 0);
  return new Function('addDiveInput', 'DIVE_PACING', 'readingGate', `
    let phase='underwater',underProgress=${progress},underTarget=${progress},deepTime=.1,curHeight=844;
    const el={film:{setPointerCapture(){}}};
    ${source.slice(start, end)}
    return {start:onExploreStart,move:onExploreMove,target:()=>underTarget};
  `)(addDiveInput, DIVE_PACING, gate);
}
const pointer = y => ({clientY:y,clientX:190,isPrimary:true,pointerId:1,target:{closest:()=>null}});

test('an upward phone swipe immediately descends even during the new skill reading window', () => {
  const input=browserInput();
  input.start(pointer(640));input.move(pointer(280));
  assert.ok(input.target()>.18, 'upward swipe must move deeper instead of reversing or stalling');
  assert.ok(input.target()<=.32,'one swipe must not skip a skill');
});
test('dragging downward revisits shallower water', () => {
  const input=browserInput(.18,false);
  input.start(pointer(280));input.move(pointer(640));
  assert.ok(input.target()<.18);
});
test('touching a button or a non-primary pointer does not start exploration', () => {
  for(const event of [{...pointer(640),isPrimary:false},{...pointer(640),target:{closest:()=>({})}}]){
    const input=browserInput();input.start(event);input.move(pointer(280));assert.equal(input.target(),.18);
  }
});

import { renderPixelRatio } from '../src/first-stage/PixelDensity.js';
test('high-density phones get 2x detail; large viewports and slow devices stay within the pixel budget', () => {
  assert.equal(renderPixelRatio(390,844,3),2);
  assert.equal(renderPixelRatio(320,568,2),2);
  assert.equal(renderPixelRatio(390,844,3,true),1.35);
  assert.equal(renderPixelRatio(1440,900,2),1.5);
  assert.equal(renderPixelRatio(390,844,1),1);
  const ratio=renderPixelRatio(620,1800,3);
  assert.ok(620*1800*ratio*ratio<=2000000.0001);
});
