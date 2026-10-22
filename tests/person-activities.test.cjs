const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const ctx=vm.createContext({});for(const file of ['time','person-activities'])vm.runInContext(fs.readFileSync('src/core/'+file+'.js','utf8'),ctx);
const activities=ctx.Zhou.PersonActivities,plain=v=>JSON.parse(JSON.stringify(v));
test('AR02: explicit activities from chapters, stages and journeys share one year axis',()=>{
 const person={stageActivities:[{sequence:1,year:{era:'CE',year:1070},polityId:'song',label:'改革'}],journey:[{year:-1068,state:'song',label:'前一年'}]};
 assert.equal(activities.at(person,-1069)[0].label,'改革');assert.equal(activities.at(person,-1068)[0].label,'前一年');
 assert.equal(activities.narrative(person).length,1);
});
test('AR02: duplicate records retain every authored source without duplicating the activity',()=>{
 const person={stageActivities:[{id:'s',sequence:1,year:356,polityId:'qin',label:'改革',sourceIds:['a']}],biographyPlan:{chapters:[{chapterNo:1,year:356,polityId:'qin',title:'改革',sourceIds:['b']}]},journey:[{id:'s',year:356,state:'qin',label:'改革',sourceIds:['c']}]};
 const before=JSON.stringify(person),records=activities.records(person);
 assert.equal(records.length,1);assert.equal(records[0].provenance.length,3);
 assert.deepEqual(plain(records[0].sourceIds),['a','b','c']);assert.equal(JSON.stringify(person),before);
});
test('AR02: conflicting dates and polities remain separate; unknown dates never become CE1',()=>{
 const person={stageActivities:[{id:'s',sequence:1,year:null,polityId:'a'},{id:'same',year:5,polityId:'a'}],journey:[{id:'same',year:4,state:'a'},{id:'same',year:5,state:'b'}]};
 assert.equal(activities.records(person).length,4);assert.equal(activities.at(person,0).length,0);assert.equal(activities.at(person,5).length,2);
});
test('AR02: no continuous activity is inferred from lifespan or scattered records',()=>{
 const person={birth:10,death:-10,journey:[{year:2,state:'s'},{year:-2,state:'s'}]};
 assert.equal(activities.at(person,0).length,0);assert.equal(activities.at(person,2).length,1);
 assert.deepEqual(plain(activities.records({birth:5,death:0})),[]);
});
test('AR02: Wang Anshi 1070 appears in the same-year board and trajectory',()=>{
 const {boot}=require('./helpers/browser.cjs'),app=boot({},1200,undefined,'data-liao-jin-song.js');
 const id='sl-person-wang-anshi',year=1-1070;
 assert(app.run('Zhou.createTimeSliceModel({data:D,history:historyService}).at('+year+').people.some(row=>row.person.id==='+JSON.stringify(id)+')'));
 const points=app.run('Zhou.Biography.getTrajectoryPoints(historyService.person('+JSON.stringify(id)+'),new Map(D.states.map(s=>[s.id,{offset:0,height:60}])),y=>y,0)');
 assert(points.some(point=>point.year===year));
});

test('AR02: identical wording never merges distinct explicit activities',()=>{
 const person={stageActivities:[{id:'one',year:356,polityId:'qin',label:'改革',text:'相同记述'}],journey:[{id:'two',year:356,state:'qin',label:'改革',text:'相同记述'}]};
 const records=activities.records(person);assert.equal(records.length,2);
 assert.deepEqual(plain(records.map(record=>record.id)),['one','two']);
});
