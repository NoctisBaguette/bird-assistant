const {test}=require('node:test');
const assert=require('node:assert/strict');
const UX=require('../dist/experience.js');

test('recentring the actual location point lands at the viewport midpoint at every zoom and size',()=>{
  for(const [width,height] of [[400,640],[510,816],[373.75,598]])for(const zoom of [.7,1,1.8,2.5]){
    const offset=UX.offsetFor(UX.currentPoint,width,height,zoom);
    const screenX=width/2+(UX.currentPoint.x/100-.5)*width*zoom+offset.x;
    const screenY=height/2+(UX.currentPoint.y/100-.5)*height*zoom+offset.y;
    assert.ok(Math.abs(screenX-width/2)<1e-9);assert.ok(Math.abs(screenY-height/2)<1e-9);
    const point=UX.centerAt(offset,width,height,zoom);
    assert.ok(Math.abs(point.x-UX.currentPoint.x)<1e-9);assert.ok(Math.abs(point.y-UX.currentPoint.y)<1e-9);
  }
});
test('area selection resists boundary jitter but switches when the map centre moves clearly into another area',()=>{
  const mid={x:54,y:33.5};
  assert.equal(UX.regionAt(mid,'lake'),'lake');assert.equal(UX.regionAt(mid,'wood'),'wood');
  assert.equal(UX.regionAt({x:54.5,y:33.2},'lake'),'lake');
  assert.equal(UX.regionAt({x:73,y:24},'lake'),'wood');
  assert.equal(UX.regionAt({x:35,y:43},'wood'),'lake');
});
test('place suggestions support Chinese and English, empty-query recommendations and no invented match',()=>{
  assert.equal(UX.search('').length,6);assert.equal(UX.search('湖畔').length,2);
  assert.equal(UX.search('WOODLAND').length,2);assert.equal(UX.search('not a real place').length,0);
});
test('avatar crop always stays square and inside the image after rotation, zoom and extreme positioning',()=>{
  for(const [width,height]of[[1600,900],[900,1600],[600,600]])for(const rotation of[0,90,180,270])for(const zoom of[1,1.7,3])for(const x of[0,.5,1])for(const y of[0,.5,1]){
    const r=UX.cropRect(width,height,{rotation,zoom,x,y});
    assert.ok(r.side>0);assert.ok(r.x>=0&&r.y>=0);
    assert.ok(r.x+r.side<=r.width+1e-8);assert.ok(r.y+r.side<=r.height+1e-8);
    assert.equal(r.width,rotation%180?height:width);
    if(zoom===1)assert.equal(r.side,Math.min(r.width,r.height));
  }
});
