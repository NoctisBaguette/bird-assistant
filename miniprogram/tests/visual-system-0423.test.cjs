const {test}=require('node:test');
const assert=require('node:assert/strict');
const {conversationViewport,nearConversationEnd}=require('../.test-build/services/conversation-layout.js');

test('conversation keyboard geometry handles overlays, resized windows and partial resize without subtracting twice',()=>{
  assert.deepEqual(conversationViewport(814,814,88,0),{height:726,keyboardOpen:false});
  assert.deepEqual(conversationViewport(814,814,88,300),{height:426,keyboardOpen:true});
  assert.deepEqual(conversationViewport(514,814,88,300),{height:426,keyboardOpen:true});
  assert.deepEqual(conversationViewport(650,814,88,300),{height:426,keyboardOpen:true});
  assert.deepEqual(conversationViewport(320,320,88,280),{height:0,keyboardOpen:true});
  assert.equal(nearConversationEnd(0,1600,600),false);
  assert.equal(nearConversationEnd(950,1600,600),true);
});

function page(){let definition;global.Page=value=>definition=value;const file=require.resolve('../.test-build/field/social/index.js');delete require.cache[file];require(file);
  const p={data:structuredClone(definition.data),setData(value,done){Object.assign(this.data,value);done?.();}};
  for(const [key,value]of Object.entries(definition))if(key!=='data')p[key]=typeof value==='function'?value.bind(p):structuredClone(value);
  return p;
}
function environment(t){
  const store=new Map();global.wx={getStorageSync:key=>store.get(key),setStorageSync:(key,value)=>store.set(key,value),setNavigationBarTitle(){}};
  const api=require('../.test-build/services/community.js');api.setSession(true);
  const p=page();p.data.screen='chat';p.data.id='peer';p.data.self='owner';p.data.registered=true;p._visible=true;
  let incoming=[];const reads=[];
  t.mock.method(api,'api',async path=>{
    if(path.endsWith('/members/peer'))return {profile:{nickname:'Peer'},canMessage:true};
    if(path.includes('/read/')){reads.push(path);return {};}
    if(path.includes('/messages/peer'))return {items:structuredClone(incoming)};
    throw Error(path);
  });
  return {p,reads,setIncoming:value=>{incoming=value;}};
}
const message=(id,sender='peer')=>({id,sender,body:'Message '+id,created:'2026-11-28T12:00:'+id.padStart(2,'0')+'Z'});

test('polling preserves a scrolled conversation and counts only genuinely new arrivals until the reader jumps down',async t=>{
  const env=environment(t),{p}=env;env.setIncoming([message('1')]);await p.refresh();
  assert.match(p.data.messageAnchor,/message-end-/);assert.equal(env.reads.length,1);
  p._messageHeight=500;p.messageScrolled({detail:{scrollTop:0,scrollHeight:1800}});
  const anchor=p.data.messageAnchor;env.setIncoming([message('1'),message('2')]);await p.refresh();
  assert.equal(p.data.messageAnchor,anchor);assert.equal(p.data.newMessages,1);assert.equal(env.reads.length,1);
  await p.refresh();assert.equal(p.data.newMessages,1);
  p.latestMessages();assert.notEqual(p.data.messageAnchor,anchor);assert.equal(p.data.newMessages,0);
  await p.refresh();assert.equal(env.reads.length,2);
});

test('loading older messages preserves an existing anchor and does not count history as unread arrivals',async t=>{
  const {p,setIncoming}=environment(t);p.data.lines=[message('3'),message('4')];p._followMessages=false;
  setIncoming([message('1'),message('2')]);await p.refresh(true);
  assert.deepEqual(p.data.lines.map(row=>row.id),['1','2','3','4']);assert.equal(p.data.messageAnchor,'message-3');
  assert.equal(p.data.newMessages,0);
});

test('hiding/unloading a conversation retains the account-scoped draft and ignores late keyboard events',()=>{
  const store=new Map();let keyboard,removed;
  global.wx={getStorageSync:key=>store.get(key),setStorageSync:(key,value)=>store.set(key,value),setNavigationBarTitle(){},onKeyboardHeightChange:fn=>{keyboard=fn;},offKeyboardHeightChange:fn=>{removed=fn;}};
  const api=require('../.test-build/services/community.js');api.setSession(true);const p=page();p.onLoad({screen:'chat',id:'peer'});
  p.data.self='owner';p._visible=true;p.restoreDraft();p.data.text='Keep my unfinished message';p.onHide();
  const prefs=require('../.test-build/services/social-local.js').conversationPrefs('owner','chat','peer');assert.equal(prefs.draft,p.data.text);
  const before=structuredClone(p.data);keyboard({height:280});assert.deepEqual(p.data,before);p.onUnload();assert.equal(removed,keyboard);
  p.clearPrivate();assert.equal(p.data.newMessages,0);assert.equal(p.data.messageAnchor,'');assert.equal(p.data.text,'');
});


test('a friend profile keeps the map tab during refresh and distinguishes an older server from an empty public list',async t=>{
  const store=new Map();global.wx={getStorageSync:key=>store.get(key),setStorageSync:(key,value)=>store.set(key,value)};
  const api=require('../.test-build/services/community.js');api.setSession(true);
  const p=page();Object.assign(p.data,{screen:'member',id:'peer',self:'owner',registered:true,memberTab:'map'});p._visible=true;
  let response={profile:{nickname:'Peer'},showBookmarks:false,posts:[],mapRecords:[]};
  t.mock.method(api,'api',async()=>structuredClone(response));
  await p.refresh();assert.equal(p.data.memberTab,'map');assert.equal(p.data.member.mapAvailable,true);
  delete response.mapRecords;
  await p.refresh();assert.equal(p.data.memberTab,'map');assert.equal(p.data.member.mapAvailable,false);
  assert.deepEqual(p.data.member.mapRecords,[]);
  p.data.memberTab='bookmarks';await p.refresh();assert.equal(p.data.memberTab,'posts');
});
