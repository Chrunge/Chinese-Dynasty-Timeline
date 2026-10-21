import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {catalog, compileProduction} from '../lib/production.mjs';
import {buildCorpus} from '../lib/corpus.mjs';
import {buildEntityLinks} from '../lib/entity-links.mjs';

const originals = catalog.map(topic => ({...topic, atlas:JSON.parse(fs.readFileSync(new URL('../data/' + topic.file, import.meta.url))), sourceSha256:'entity-links-test'}));
const entries = originals.map(topic => ({...topic, data:compileProduction(topic.atlas, topic.id)}));
const corpus = buildCorpus(originals);
const index = buildEntityLinks(corpus, entries);
const plain = value => JSON.parse(JSON.stringify(value));
const target = (collection,id,datasetId) => index.entities[collection].find(entity => entity.id === id)?.links.find(link => link.datasetId === datasetId);
const params = link => new URLSearchParams(link.href.split('#')[1]);
function runtime(data) {
  const context = vm.createContext({URLSearchParams});
  for (const file of ['time','search','view-link','entity-links']) vm.runInContext(fs.readFileSync(new URL('../src/core/' + file + '.js', import.meta.url),'utf8'), context);
  const search = context.Zhou.createSearch(data);
  return {context, search, codec:context.Zhou.createViewLinkCodec(data, search), helper:context.Zhou.createEntityLinks({index,data,search})};
}

test('navigation-only index derives same-type stable IDs, not names/facts; all inputs remain untouched', () => {
  const before = JSON.stringify({corpus,entries});
  const rebuilt = buildEntityLinks(corpus, entries);
  assert.deepEqual(rebuilt, index);
  assert.equal(JSON.stringify({corpus,entries}), before);
  assert.deepEqual(Object.keys(index), ['schemaVersion','entities']);
  assert.deepEqual(Object.keys(index.entities), ['polities','people']);
  for (const collection of ['polities','people']) {
    const eligible = corpus.entities[collection].filter(entity => entity.identityScope === 'stable-id' && entity.appearances.length > 1);
    assert.equal(index.entities[collection].length, eligible.length);
    for (const entity of index.entities[collection]) {
      assert.deepEqual(Object.keys(entity), ['id','links']);
      assert(entity.links.length > 1);
      assert.equal(new Set(entity.links.map(link => link.datasetId)).size, entity.links.length);
      for (const link of entity.links) assert.deepEqual(Object.keys(link), ['datasetId','name','href']);
    }
  }
  assert(!index.entities.polities.some(entity => ['later-liang','wu-zhou'].includes(entity.id)));
  assert(!index.entities.people.some(entity => ['tk-person-sima-yi','ymq-person-yelv-chucai'].includes(entity.id)), 'missing authored appearances must not be invented');
});

test('every real offline destination round-trips through that topic\'s real Time/search/v1-v2 codec', () => {
  const runtimes = new Map(entries.map(entry => [entry.id,runtime(entry.data)]));
  for (const collection of ['polities','people']) for (const entity of index.entities[collection]) for (const link of entity.links) {
    const entry = entries.find(entry => entry.id === link.datasetId), {context,codec,search} = runtimes.get(entry.id);
    const expectedKey = (collection === 'polities' ? 'country:' : 'person:') + entity.id;
    assert.equal(link.name, entry.name);
    assert.equal(link.href.split('#')[0], entry.page);
    const parsed = plain(codec.parse('#' + link.href.split('#')[1]));
    assert(parsed,link.href);
    assert.equal(parsed.item, expectedKey);
    assert.equal(parsed.view.searchTarget, expectedKey);
    assert(search.index.some(entry => entry.key === expectedKey));
    const bounds = context.Zhou.Time.bounds(entry.data), p = params(link);
    assert(parsed.view.cursor >= bounds.end && parsed.view.cursor <= bounds.start);
    assert.equal(parsed.view.end,bounds.end);
    assert.equal(p.get('dataset'), entry.id);
    assert.equal(p.get('v'), parsed.view.cursor <= 0 || bounds.end <= 0 ? '2' : '1');
    if(p.get('v') === '2') assert.equal(p.get('time'),'bce-axis');
    assert(parsed.view.selected.every(id => entry.data.states.some(state => state.id === id)));
    if(collection === 'polities') assert.deepEqual(parsed.view.selected,[entity.id]);
    assert.equal(parsed.view.query,'');assert.equal(parsed.view.category,'all');
    assert.equal(parsed.view.searchScope,'all');assert.equal(parsed.view.searchDescriptions,false);
    assert.equal(parsed.view.activeEventId,null);assert.deepEqual(parsed.pinned,[]);
    const encoded = codec.encode({...parsed,pinned:parsed.pinned,order:parsed.order});
    assert.equal(codec.parse(encoded).item, expectedKey);
  }
});

test('real cross-topic polity/person boundaries, both directions and no return-to-source/unknown links', () => {
  for (const [topic,type,id,other] of [
    ['zhou','country','qin','qin-han'],['qin-han','country','wei','zhou'],
    ['three-kingdoms','country','western-jin','wei-jin-nan-bei'],
    ['wei-jin-nan-bei','person','tk-person-sima-yan','three-kingdoms'],
    ['liao-jin-song','person','ymq-person-kublai','yuan'],
    ['ming','person','ymq-person-zheng-chenggong','qing'],
    ['xia-shang','person','person-003','zhou']
  ]) {
    const entry = entries.find(entry => entry.id === topic), {helper} = runtime(entry.data);
    const links = plain(helper.links(type,id));
    assert(links.some(link => link.datasetId === other));
    assert(links.every(link => link.datasetId !== topic));
    links[0].name = 'mutated';
    assert.notEqual(helper.links(type,id)[0].name,'mutated','callers cannot mutate resource');
    assert.deepEqual(plain(helper.links('event',id)),[]);
    assert.deepEqual(plain(helper.links(type,'unknown')),[]);
    assert.deepEqual(plain(helper.links('country','later-liang')),[]);
    assert.deepEqual(plain(helper.links('country','wu-zhou')),[]);
  }
  const zhou = entries.find(entry => entry.id === 'zhou');
  assert.equal(zhou.data.datasetId,undefined);
  assert(runtime(zhou.data).helper.links('person','person-033').length > 0,'legacy Zhou timeline.topic identifies current topic');
  assert.equal(params(target('polities','qin','qin-han')).get('year'),'247','out-of-window state start is clipped to target window');
  const undated = params(target('people','person-033','qin-han'));
  assert.equal(undated.get('year'),'0','undated target uses target default CE1 view, not source person dates');
  assert.equal(undated.get('time'),'bce-axis');
  assert.equal(params(target('people','person-094','qin-han')).get('states'),'','no fabricated polity for an unassociated person');
});

function sample(id, page = id + '.html') {
  return {id,name:id,page,data:{datasetId:id,timeline:{start:500,end:200,defaultEnd:250,cursor:400},states:[{id:'s',name:'同名',start:500,end:200,rulers:[],undated:[]}],people:[{id:'p',name:'同名',states:['s'],relatedEvents:[]}],events:[]}};
}
const shared = (collection,id,datasets,identityScope='stable-id') => ({id,identityScope,appearances:datasets.map(datasetId => ({datasetId}))});

test('unknown/scoped/colliding/single-topic identities and missing compiled appearances fail closed', () => {
  const a = sample('a'), b = sample('b');
  const c = {entities:{polities:[shared('polities','s',['a','b']), shared('polities','later-liang',['a','b']),shared('polities','wu-zhou',['a','b'])],people:[shared('people','p',['a','b']), shared('people','p2',['a','b'],'dataset'),shared('people','same-name-not-same-id',['a','b']),shared('people','p3',['a','a'])]}};
  assert.deepEqual(buildEntityLinks(c,[a,b]).entities.people.map(entity => entity.id),['p']);
  assert.deepEqual(buildEntityLinks(c,[a,b]).entities.polities.map(entity => entity.id),['s']);
  b.data.people=[];
  assert.deepEqual(buildEntityLinks(c,[a,b]).entities.people,[]);
  assert.throws(() => buildEntityLinks(c,[a,a]),/duplicate/);
  for (const page of ['https://evil.test/x.html','//evil.test/x.html','javascript:alert(1)','../a.html','a.html#bad','a.html?x=1','a".html']) assert.throws(() => buildEntityLinks(c,[sample('a',page)]),/Invalid entity-link target/);
});

test('URLSearchParams keeps IDs opaque; null/out-of-window dates never become inferred personal dates', () => {
  const a = sample('a'), b = sample('b'), id = 'person&item=country:evil/#中文';
  for(const entry of [a,b]) {
    entry.data.people=[{id,name:'同名',states:['s'],relatedEvents:['out-of-range'],journey:[{state:'s',year:null}]}];
    entry.data.states[0].rulers=[{id:'r',name:'r',start:499,end:450,ministers:[{id,name:'同名'}]}];
    entry.data.events=[{id:'out-of-range',name:'event',year:600,states:['s'],participants:[{id,state:'s'}]}];
  }
  const c = {entities:{people:[shared('people',id,['a','b'])]}};
  const output = buildEntityLinks(c,[a,b]);
  for(const link of output.entities.people[0].links) {
    const p = params(link);
    assert.equal(p.get('item'),'person:' + id);assert.equal(p.get('target'),'person:' + id);
    assert.equal(p.get('year'),'400');assert.equal(p.get('states'),'s');
    assert.equal(p.getAll('item').length,1);
  }
  b.data.people[0].journey.push({year:333,state:'s'});
  assert.equal(params(buildEntityLinks(c,[a,b]).entities.people[0].links[1]).get('year'),'333');
  b.data.events[0].year=300;
  assert.equal(params(buildEntityLinks(c,[a,b]).entities.people[0].links[1]).get('year'),'300');
});

test('browser adapter is optional, identity-scoped, safe under malformed hrefs, and uses explicit datasetId first', () => {
  const a=sample('a'),b=sample('b'), c={entities:{people:[shared('people','p',['a','b'])]}};
  const resource=buildEntityLinks(c,[a,b]);
  const {context,search}=runtime(a.data), make=index=>context.Zhou.createEntityLinks({index,data:a.data,search});
  for(const absent of [undefined,null,{}, {schemaVersion:99}, {schemaVersion:1}]) assert.deepEqual(plain(make(absent).links('person','p')),[]);
  assert.equal(make(resource).links('people','p').length,1);
  const wrongTopic={...a.data,datasetId:'not-present',timeline:{...a.data.timeline,topic:'a'}};
  assert.deepEqual(plain(context.Zhou.createEntityLinks({index:resource,data:wrongTopic,search}).links('person','p')),[]);
  assert.deepEqual(plain(context.Zhou.createEntityLinks({index:resource,data:a.data}).links('person','p')),[]);
  for(const href of ['javascript:alert(1)','https://evil.test/b.html#v=1','//evil.test/b.html#v=1','../b.html#v=1','b.html#v=2&dataset=b&item=person%3Ap&target=person%3Ap','b.html#v=1&dataset=a&item=person%3Ap&target=person%3Ap','b.html#v=1&dataset=b&item=country%3Ap&target=country%3Ap']) {
    const bad=structuredClone(resource);bad.entities.people[0].links[1].href=href;
    assert.deepEqual(plain(make(bad).links('person','p')),[],href);
  }
});
