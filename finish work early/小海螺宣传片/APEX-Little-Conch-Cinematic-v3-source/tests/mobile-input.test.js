import { test } from 'node:test';
import assert from 'node:assert/strict';
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
