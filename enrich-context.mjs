import fs from 'node:fs';

// Editorial context is explicit: no unknown accession/death is inferred from a bar endpoint.
const path='dist/history.json';
const D=JSON.parse(fs.readFileSync(path,'utf8'));
const P=JSON.parse(fs.readFileSync('dist/people.json','utf8')).ministers;
const source=(n,title)=>({title:'《史记》·'+title,url:'https://zh.wikisource.org/zh-hans/史記/卷'+String(n).padStart(3,'0')});
const certain='所采用年表的年份定位较稳定；“较确定”不表示人物生平与结局已全部核实。';
const inferred='采用约年、传统推定或年表拟定值，不能据此认定确切日期。';
function dating(level,reason,alternatives=[]){return {level,reason,alternatives};}
function option(label,year,explanation,sources=[]){return {label,year,explanation,sources};}
const eventOpinions={
 e0:[option('本图采用',1046,'采用夏商周断代工程一系的拟定年份。',[D.sources[4]]),option('另说',1045,'其他纪年方案采用前1045年；周本纪叙事本身不直接给出公元前年份。',[D.sources[4]])],
 e73:[option('本图采用',342,'按现有事件表定位在前342年。',[D.sources[1]]),option('另说',341,'另一常见换算将此战置于前341年；战国年表存在校订问题。',[D.sources[1],source(5,'秦本纪'),source(65,'孙子吴起列传')])],
 e84:[option('本图采用',306,'采用较晚的中心王国瓦解口径；这不是越地所有政权的共同终点。',[D.sources[5]]),option('传世叙事对应的另说',334,'《越王勾践世家》将无疆败亡置于楚威王时期，常被换算到前334年前后。',[source(41,'越王勾践世家')])]
};
const keyEvents=new Set(['e0','e1','e5','e8','e9','e13','e15','e19','e20','e25','e31','e37','e39','e45','e54','e57','e58','e59','e61','e62','e65','e66','e68','e70','e71','e73','e75','e83','e84','e88','e89','e90','e91','e92','e93','e94','e97','e98','e101','e102','e103','e104']);
P['王龁']={name:'王龁',role:'秦国将领',summary:'长平之战初期率秦军作战；秦任命白起为上将军后，他改任裨将。',sources:[source(73,'白起王翦列传')]};
P['荆轲']={name:'荆轲',role:'刺客',summary:'受燕太子丹委托入秦，以献图为名行刺秦王，失败后被杀。',sources:[source(86,'刺客列传')]};
const participantMap={
 e0:[['姜尚','zhou','协助周武王作战']],
 e13:[['管仲','qi','辅政'],['鲍叔牙','qi','举荐管仲']],
 e25:[['先轸','jin','晋军统帅'],['狐偃','jin','晋国谋臣'],['子玉','chu','楚军统帅']],
 e39:[['子产','zheng','主持铸刑书']],
 e45:[['伍子胥','wu','参与伐楚'],['孙武','wu','兵法与军事辅佐；具体战场职掌记载有限']],
 e58:[['范蠡','yue','协助越王灭吴']],
 e68:[['商鞅','qin','主持变法']],e71:[['商鞅','qin','推行县制与土地制度改革']],
 e70:[['田忌','qi','齐军统帅'],['孙膑','qi','军事谋划'],['庞涓','liang','魏军将领']],
 e73:[['田忌','qi','齐军统帅'],['孙膑','qi','军事谋划'],['庞涓','liang','魏军将领']],
 e83:[['肥义','zhao','赞同改革并辅佐国政']],
 e88:[['乐毅','yan','联军统帅']],e89:[['田单','qi','主持齐国反攻']],
 e90:[['白起','qin','率秦军攻楚']],
 e91:[['廉颇','zhao','赵军前期主将'],['赵括','zhao','继任赵军主将'],['王龁','qin','秦军前期主将，后为裨将'],['白起','qin','秦军后期主将'],['范雎','qin','主持反间；政治谋划']],
 e92:[['平原君赵胜','zhao','组织抗秦与求援'],['信陵君魏无忌','liang','率魏军救赵'],['春申君黄歇','chu','率楚军救赵']],
 e99:[['荆轲','yan','行刺秦王']],e98:[['王翦','qin','率军攻赵']],e102:[['王翦','qin','率军攻楚']],e104:[['王贲','qin','率军攻齐']]
};
for(const e of D.events){
 e.key=keyEvents.has(e.id);
 e.dating=dating(eventOpinions[e.id]?'disputed':e.approx?'inferred':'certain',eventOpinions[e.id]?'此事件有不同纪年或解释口径，展开查看本图采用值与另说。':e.approx?inferred:certain,eventOpinions[e.id]||[]);
 e.participants=(participantMap[e.id]||[]).map(([name,state,relation])=>{if(!P[name])throw new Error('Missing profile: '+name);return {...P[name],state,relation};});
 e.participantCoverage=e.participants.length?'只列已收录并能与本事件相联系的人物，角色以卡片说明为准。':'具体参与人物尚未逐条核实；当年在位君主另列，不能据此认定亲自参战。';
}
const disputedRulers={
 'liang-r2':[option('本图采用',445,'采用开始掌魏氏的一系纪年，不能直接等同正式列侯。',[D.sources[2]]),option('《魏世家》元年口径',424,'《魏世家》将文侯元年与秦灵公元年对应；由该口径换算约为前424年。',[source(44,'魏世家')])],
 'wei-r39':[option('本图采用',229,'图示采用前229年改元口径。',[D.sources[2]]),option('另一君主表起点',241,'另有前241年起的列表口径；即位与纪年起点仍待校勘。',[D.sources[2]])],
 'jin-r33':[option('本图采用的终点',357,'沿用现有校订表的前357年终点，与晋晚期不同世系方案有关。',[D.sources[2]]),option('另一整体终结口径',376,'前376年常作为三家分晋余地、晋公室终结的节点，不能直接套用到本图晚期世系。',[source(39,'晋世家'),D.sources[1]])],
 'jin-r34':[option('本图采用的終点',349,'采用晋公室延续至前349年的一系。',[D.sources[2]]),option('另一终结口径',376,'采用前376年三分晋余地的终结口径；不同方案的君主世系也须整体对照。',[source(39,'晋世家'),D.sources[1]])]
};
const milestones={
 'qin-r29':{accession:362,death:338,sources:[source(5,'秦本纪')]},
 'qin-r30':{accession:338,death:311,changes:[{year:325,label:'称王'},{year:324,label:'称王后更元'}],sources:[source(5,'秦本纪')]},
 'qin-r31':{accession:311,death:307,sources:[source(5,'秦本纪')]},
 'qin-r32':{accession:307,death:251,sources:[source(5,'秦本纪')]},
 'qin-r33':{accession:251,death:250,note:'昭襄王卒后继承王位；除丧正式即位仪式与次年元年另行区分。',changes:[{year:250,label:'除丧后正式即位仪式'}],sources:[source(5,'秦本纪')]},
 'qin-r34':{accession:250,death:247,sources:[source(5,'秦本纪')]},
 'qin-r35':{accession:247,death:210,changes:[{year:221,label:'称帝；诸侯国阶段结束'}],endKind:'身份转变',sources:[source(5,'秦本纪'),source(6,'秦始皇本纪')]},
 'zhao-r8':{abdication:299,death:295,endKind:'传位',sources:[source(43,'赵世家')]},
 'qi-r24':{death:481,endKind:'遇害',sources:[source(46,'田敬仲完世家')]},
 'lu-r23':{death:510,changes:[{year:517,label:'出奔；并非同年去世'}],sources:[source(33,'鲁周公世家')]},
 'chu-r28':{death:296,endKind:'被拘后另立新王',changes:[{year:299,label:'入秦被拘'}],sources:[source(40,'楚世家')]}
};
for(const s of D.states){
 s.dating=dating(['jin','yue','liang','wei'].includes(s.id)?'disputed':s.approxStart||s.approxEnd?'inferred':'certain',s.note);
 if(s.id==='jin')s.dating.alternatives=disputedRulers['jin-r34'];
 if(s.id==='yue')s.dating.alternatives=eventOpinions.e84;
 if(s.id==='liang')s.dating.alternatives=disputedRulers['liang-r2'];
 if(s.id==='wei')s.dating.alternatives=disputedRulers['wei-r39'];
 for(const r of s.rulers){
  const known=milestones[r.id]||{};
  const disputed=disputedRulers[r.id]||[];
  const ownDispute=disputed.length||((s.id==='qi'&&r.lane===1&&['齐威王','齐宣王'].includes(r.name))||(s.id==='yan'&&r.approx&&r.start<841));
  r.dating=dating(ownDispute?'disputed':r.approx?'inferred':'certain',ownDispute?'不同年表的起讫或世系方案存在差异；以下说明不把各方案混为一表。':r.approx?inferred:certain,disputed);
  if(ownDispute&&!disputed.length)r.dating.alternatives=[{label:'校勘说明',year:null,explanation:s.note,sources:[D.sources[2],D.sources[1]]}];
  r.chronology={accession:null,regnalStart:r.start,abdication:null,death:null,changes:[],endKind:r.id==='qin-r35'?'身份转变':'在位区间结束；具体性质待核实',...known};
  if(known.death===r.end&&!known.endKind)r.chronology.endKind='去世';
  r.chronology.sources||=[{title:'图示采用的年表',url:r.source}];
 }
}
D.version='第三版 · 缩放分层 / 事件联动 / 纪年辨析 / 研究组合';
fs.writeFileSync(path,JSON.stringify(D,null,2)+'\n');
console.log(JSON.stringify({events:D.events.length,eventsWithParticipants:D.events.filter(e=>e.participants.length).length,disputedEvents:D.events.filter(e=>e.dating.level==='disputed').length,explicitChronologies:Object.keys(milestones).length}));
