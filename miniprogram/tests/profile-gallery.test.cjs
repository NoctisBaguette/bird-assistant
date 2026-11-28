const {test} = require('node:test');
const assert = require('node:assert/strict');

test('the profile restores its local cover and private album excludes samples in both tabs', () => {
  const storage = new Map();
  let definition;
  global.Page = page => { definition = page; };
  global.wx = {
    canIUse: () => false,
    getStorageSync: key => storage.get(key),
    setStorageSync: (key,value) => storage.set(key,value),
    showActionSheet: options => options.success({tapIndex:1}),
    showToast() {}
  };
  require('../.test-build/pages/profile/index.js');
  const {localRepository} = require('../.test-build/services/repository.js');
  const repo = localRepository();
  const record = (name, path, kind) => repo.save({birdName:name, notes:'', imagePath:path, source:'album', mediaKind:kind});
  const sound = record('鸟鸣','wxfile://audio','audio');
  const photo = record('观察','wxfile://photo','photo');
  const sample = record('示例','/assets/samples/field-0.png','photo');
  storage.set('bird-assistant.favorites.v1',[sample.id,sound.id]);
  const page = {...definition,data:structuredClone(definition.data),setData(values){Object.assign(this.data,values);}};
  page.onShow();
  assert.deepEqual(page.data.gallery.map(item=>item.id),[photo.id]);
  page.selectGallery({currentTarget:{dataset:{tab:'favorites'}}});
  assert.deepEqual(page.data.gallery,[]);
  page.data.detail = page.data.records.find(item=>item.id===photo.id);
  page.favorite();
  assert.deepEqual(page.data.gallery.map(item=>item.id),[photo.id]);
  page.changeCover();
  page.data.cover = 'woodland';
  page.onShow();
  assert.equal(page.data.cover,'waterside');
});

test('a failed showcase save keeps the selection for a retry', async context => {
  let definition;
  let exits = 0;
  global.Page = page => { definition = page; };
  global.wx = {navigateBack(){exits++;},showToast(){}};
  require('../.test-build/field/studio/index.js');
  const community = require('../.test-build/services/community.js');
  const calls = context.mock.method(community,'api',async () => { throw new Error('网络连接失败'); });
  const page = {...definition,data:structuredClone(definition.data),_owner:'owner',_revision:community.sessionRevision(),
    setData(values){Object.assign(this.data,values);}};
  page.choose({currentTarget:{dataset:{field:'theme',value:'lake'}}});
  await page.save();
  assert.equal(page.data.error,'网络连接失败');
  assert.equal(page.data.saving,false);
  assert.equal(page.data.dirty,true);
  assert.equal(exits,0);
  calls.mock.mockImplementation(async () => ({}));
  await page.save();
  assert.equal(calls.mock.calls[1].arguments[2].theme,'lake');
  assert.equal(exits,1);
});

test('a picked cover is previewed locally, survives a cancelled picker, and uploads only on save',async context=>{
  let definition;
  global.Page=page=>{definition=page;};
  global.wx={navigateBack(){},showToast(){}};
  const studio=require.resolve('../.test-build/field/studio/index.js');
  delete require.cache[studio];require(studio);
  const community=require('../.test-build/services/community.js');
  const media=require('../.test-build/services/media.js');
  const pick=context.mock.method(media,'choosePhoto',async()=> 'wxfile://bird');
  const upload=context.mock.method(community,'saveAlbumCover',async()=>{});
  const page={...definition,data:structuredClone(definition.data),_owner:'owner',_revision:community.sessionRevision(),
    setData(values){Object.assign(this.data,values);}};
  await page.chooseAlbum();
  assert.deepEqual(pick.mock.calls[0].arguments,[['album']]);
  assert.equal(page.data.display.coverImage,'wxfile://bird');
  pick.mock.mockImplementation(async()=>null);
  await page.chooseAlbum();
  page.focus({detail:{value:64}});
  assert.equal(page.data.display.coverImage,'wxfile://bird');
  assert.equal(upload.mock.callCount(),0);
  await page.save();
  assert.equal(upload.mock.calls[0].arguments[0],'wxfile://bird');
  assert.equal(upload.mock.calls[0].arguments[1].focus,64);
  page.choose({currentTarget:{dataset:{field:'landscape',value:'woodland'}}});
  assert.equal(page.data.albumPath,'');
  assert.equal(page.data.display.coverImage,'');
});
