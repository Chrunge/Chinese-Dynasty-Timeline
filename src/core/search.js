(function (Zhou) {
'use strict';
const traditionalSearch={'國':'国','齊':'齐','晉':'晋','衛':'卫','魯':'鲁','韓':'韩','趙':'赵','鄭':'郑','陳':'陈','吳':'吴','劉':'刘','孫':'孙','臏':'膑','龐':'庞','轂':'毂','穎':'颖','張':'张','儀':'仪','馮':'冯','樂':'乐','轲':'轲','軻':'轲','勝':'胜','無':'无','忌':'忌','黃':'黄','諸':'诸','處':'处','壽':'寿','靈':'灵','獻':'献','厲':'厉','莊':'庄','襄':'襄','惠':'惠','懷':'怀','簡':'简','肅':'肃','閔':'闵','負':'负','芻':'刍','讓':'让','湣':'湣','繆':'缪','祿':'禄','戰':'战','長':'长','圍':'围','變':'变','遷':'迁','書':'书','東':'东','會':'会','復':'复','師':'师','陸':'陆','陽':'阳','陰':'阴','關':'关','軍':'军','荊':'荆','龁':'龁','齕':'龁','豐':'丰','寧':'宁','顯':'显','壯':'壮','權':'权','後':'后','婁':'娄','鞏':'巩','審':'审','稱':'称','興':'兴','滅':'灭','並':'并','賈':'贾','裡':'里','裴':'裴','綱':'纲','綽':'绰','嚴':'严','費':'费','剋':'克','範':'范'};
const normalizeSearch=t=>String(t??'').normalize('NFKC').toLowerCase().replace(/[\s·，,、—\-]/g,'').replace(/[\u3400-\u9fff]/g,c=>traditionalSearch[c]||c);
const rulerAliases=r=>[r.name,r.person,...(r.name==='秦王政'?['秦始皇','始皇帝','嬴政']:r.name==='秦昭襄王'?['秦昭王']:[])].filter(Boolean);
const personAliases=(name,summary='')=>{const names=[name];for(const title of ['平原君','孟尝君','春申君','信陵君'])if(name.startsWith(title)){names.push(title,name.slice(title.length));}for(const match of summary.matchAll(/(?:又称|亦称|又名|常称)([\u3400-\u9fff]{1,8})/g))names.push(match[1]);return names;};
const countryAliases=s=>[s.name,s.name+'国',...(s.id==='zhou'?['周朝','周王室','周天子']:s.id==='liang'?['魏','魏国','梁','梁国']:[])];
const narrativeText=e=>[e.description,...['background','process','result','impact'].map(key=>e.narrative?.[key])].filter(Boolean).join(' ');
Zhou.createSearch = function(D) {
 const byId=id=>D.states.find(s=>s.id===id);
function buildSearchIndex(){
 const entries=[];
 for(const s of D.states){
  entries.push({key:'country:'+s.id,type:'country',title:s.name+' · '+(s.id==='zhou'?'周王室':'国家'),aliases:countryAliases(s),states:[s.id],data:s,description:s.region+' '+s.note});
  for(const r of s.rulers)entries.push({key:'ruler:'+r.id,type:'ruler',title:r.name+(r.person?' · '+r.person:''),aliases:rulerAliases(r),states:[s.id],year:r.start,until:r.end,data:r,description:[r.description,r.biography?.summary].filter(Boolean).join(' ')});
  s.undated.forEach((r,i)=>entries.push({key:'undated:'+s.id+':'+i,type:'ruler',title:r.name+(r.person?' · '+r.person:''),aliases:rulerAliases(r),states:[s.id],data:r,undated:true,description:r.known||'在位起讫未定位'}));
 }
 const people=new Map((D.people||[]).map(p=>[p.id,{...p,states:[...(p.states||[])],rulerKeys:[],eventIds:[...(p.relatedEvents||[])]}]));
 for(const s of D.states)for(const r of s.rulers)for(const p of r.ministers||[]){if(!people.has(p.id))people.set(p.id,{...p,states:[],rulerKeys:[],eventIds:[]});const person=people.get(p.id);if(!person.states.includes(s.id))person.states.push(s.id);person.rulerKeys.push('ruler:'+r.id);}
 for(const e of D.events)for(const p of e.participants||[]){if(!people.has(p.id))people.set(p.id,{...p,states:[],rulerKeys:[],eventIds:[]});const person=people.get(p.id);if(!person.states.includes(p.state))person.states.push(p.state);if(!person.eventIds.includes(e.id))person.eventIds.push(e.id);}
 for(const p of people.values()){p.states=[...new Set(p.states)].filter(id=>byId(id));p.rulerKeys=[...new Set(p.rulerKeys)];const event=D.events.find(e=>p.eventIds.includes(e.id)),ruler=entries.find(e=>p.rulerKeys.includes(e.key));entries.push({key:'person:'+p.id,type:'person',title:p.name,aliases:[...personAliases(p.name,p.summary),...(p.aliases||[])],states:p.states,year:event?.year??ruler?.year,data:p,description:[p.summary,...(p.journey||[]).flatMap(j=>[j.label,j.text])].filter(Boolean).join(' ')});}
 for(const e of D.events)entries.push({key:'event:'+e.id,type:'event',title:e.name,aliases:[e.name],relatedNames:(e.participants||[]).flatMap(p=>personAliases(p.name)),states:e.states,year:e.year,data:e,description:narrativeText(e)});
 return entries;
}

 const searchIndex=buildSearchIndex();
function searchMatches(q, {scope="all", descriptions=false, states=[]} = {}){
 const selected = new Set(states);
 const needle=normalizeSearch(q);if(!needle)return [];
 const score=text=>{const name=normalizeSearch(text);return name===needle?200:name.startsWith(needle)?120:name.includes(needle)?80:0;};
 const priority={country:0,ruler:1,person:2,event:3};
 return searchIndex.filter(e=>scope!=='selected'||e.states.some(id=>selected.has(id))).map(entry=>{const direct=Math.max(0,...entry.aliases.map(score));const related=entry.relatedNames?.some(n=>score(n))?45:0;const context=descriptions&&needle.length>=2&&normalizeSearch(entry.description).includes(needle)?15:0;return {entry,score:Math.max(direct,related,context),reason:direct?'名称匹配':related?'事件关联人物':'简介中提及'};}).filter(hit=>hit.score>0).sort((a,b)=>b.score-a.score||priority[a.entry.type]-priority[b.entry.type]||(b.entry.year||0)-(a.entry.year||0)||a.entry.key.localeCompare(b.entry.key,'zh-CN'));
}

 function normalizeKey(key) {
  if(typeof key!=='string'||!key.startsWith('person:'))return key;
  const value=key.slice(7);
  if(D.people.some(p=>p.id===value))return key;
  const candidates=D.people.filter(p=>p.name===value||(p.aliases||[]).includes(value));
  return candidates.length===1?'person:'+candidates[0].id:key;
 }
 return Object.freeze({index:searchIndex, search:searchMatches, normalizeKey});
};
Object.assign(Zhou,{normalizeSearch,rulerAliases,personAliases,countryAliases,narrativeText});
})(globalThis.Zhou ||= {});
