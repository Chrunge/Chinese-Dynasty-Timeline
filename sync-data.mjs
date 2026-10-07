import {readFileSync,writeFileSync} from 'node:fs';
const data=JSON.parse(readFileSync(new URL('./dist/history.json',import.meta.url),'utf8'));
const peopleData=JSON.parse(readFileSync(new URL('./dist/people.json',import.meta.url),'utf8'));
const research=JSON.parse(readFileSync(new URL('./dist/research.json',import.meta.url),'utf8'));
// Include independent profiles as well as embedded ruler/event links for global search.
const people=new Map(Object.entries(peopleData.ministers).map(([name,p])=>[name,{...p,states:[],relatedEvents:[]}]));
for(const p of peopleData.profiles){for(const name of p.ministerNames||[]){const person=people.get(name);if(person&&!person.states.includes(p.state))person.states.push(p.state);}}
// These independent profiles explicitly describe service in Jin but have no embedded ruler link.
for(const name of ['赵衰','赵盾','士会','郤克','韩厥','荀罃','叔向']){const person=people.get(name);if(person&&!person.states.includes('jin'))person.states.push('jin');}
for(const e of data.events){for(const p of e.participants||[]){let person=people.get(p.name);if(!person){person={...p,states:[],relatedEvents:[]};people.set(p.name,person);}if(!person.states.includes(p.state))person.states.push(p.state);if(!person.relatedEvents.includes(e.id))person.relatedEvents.push(e.id);}}
const mencius=data.events.find(e=>e.id==='e78');
if(mencius&&!people.has('孟子'))people.set('孟子',{name:'孟子',role:'事件涉及人物',summary:mencius.description,sources:mencius.sources,states:mencius.states,relatedEvents:[mencius.id]});
data.people=[...people.values()];
for(const p of data.people){const extra=research.people[p.name];if(extra){Object.assign(p,{journey:extra.journey,origin:extra.origin,aliases:extra.aliases||[]});p.sources=[...p.sources,...extra.sources].filter((s,i,a)=>a.findIndex(v=>v.url===s.url)===i);for(const j of p.journey)if(!p.states.includes(j.state))p.states.push(j.state);}}
for(const e of data.events){e.narrative=research.events[e.id]||null;if(e.narrative?.sources)e.sources=[...e.sources,...e.narrative.sources].filter((s,i,a)=>a.findIndex(v=>v.url===s.url)===i);}
data.researchCoverage={journeys:Object.keys(research.people).length,narratives:Object.keys(research.events).length,note:research.note};
const ids=new Set(data.states.map(s=>s.id));
const eventIds=new Set(data.events.map(e=>e.id));
for(const [id,n] of Object.entries(research.events)){if(!eventIds.has(id)||n.related.some(id=>!eventIds.has(id)))throw new Error('未知研究事件：'+id);}
for(const p of data.people){for(const j of p.journey||[]){if(!ids.has(j.state)||j.event&&!eventIds.has(j.event))throw new Error('未知人物轨迹：'+p.name);}}
for(const s of data.states){for(const r of s.rulers){if(r.start<r.end)throw new Error('倒置区间：'+r.name);}}
for(const e of data.events){if(e.states.some(id=>!ids.has(id)))throw new Error('未知国家：'+e.name);}
writeFileSync(new URL('./dist/data.js',import.meta.url),'window.ZHOU_DATA = '+JSON.stringify(data)+';\n');
console.log('数据同步完成：'+data.states.length+'行，'+data.events.length+'条事件。');
