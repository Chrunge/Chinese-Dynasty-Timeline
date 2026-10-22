(function(Zhou){
 'use strict';
 const formalTopics = {
  'xia-shang': {
   order: ['xia','shang','zhou','youqiong-han','ancient-shu','guifang-qiang'],
   coreIds: ['xia','shang','zhou','youqiong-han','ancient-shu','guifang-qiang'],
   all: true,
   cursor: 1600,
   minorInfo: {
    'youqiong-han': '东夷有穷氏 / 寒浞代夏政权',
    'ancient-shu': '宝墩—三星堆青铜方国',
    'guifang-qiang': '西北方国部落联盟'
   }
  },
  'zhou': {
   order: [
    'zhou','qi','jin','qin','chu','yan','lu','wu','yue','han','zhao','liang',
    'song','wei','zheng','chen','cai','cao'
   ],
   coreIds: ['zhou','qi','jin','qin','chu','yan','lu','wu','yue','han','zhao','liang'],
   cursor: 770,
   minorInfo: {
    'song': '商丘 · 子姓宋国',
    'wei': '朝歌/帝丘 · 卫国',
    'zheng': '新郑 · 郑国',
    'chen': '宛丘 · 陈国',
    'cai': '上蔡/下蔡 · 蔡国',
    'cao': '陶丘 · 曹国'
   }
  },
  'qin-han': {
   order: ['qin','western-han','xin','gengshi-han','eastern-han','western-chu','zhang-chu','wei'],
   coreIds: ['qin','western-han','xin','gengshi-han','eastern-han','western-chu','zhang-chu','wei'],
   all: true,
   cursor: 140,
   minorInfo: {
    'western-chu': '西楚霸王项羽政权',
    'zhang-chu': '陈胜起义大楚政权',
    'wei': '战国末至秦末卫君角'
   }
  },
  'three-kingdoms': {
   order: ['cao-wei','shu-han','sun-wu','eastern-han','western-jin'],
   coreIds: ['cao-wei','shu-han','sun-wu','eastern-han','western-jin'],
   all: true,
   cursor: -228,
   minorInfo: {
    'eastern-han': '汉末建安执政阶段',
    'western-jin': '西晋受禅代魏'
   }
  },
  'wei-jin-nan-bei': {
   order: [
    'western-jin','eastern-jin','liu-song','southern-qi','southern-liang-dynasty','southern-chen',
    'northern-wei','eastern-wei','northern-qi','western-wei','northern-zhou','former-qin',
    'former-liang','cheng-han','han-zhao','later-zhao','former-yan','later-yan','later-qin',
    'western-qin','later-liang','southern-liang','northern-liang','southern-yan','western-liang',
    'hu-xia','northern-yan','sui'
   ],
   coreIds: [
    'western-jin','eastern-jin','liu-song','southern-qi','southern-liang-dynasty','southern-chen',
    'northern-wei','eastern-wei','northern-qi','western-wei','northern-zhou','former-qin'
   ],
   cursor: -382,
   minorInfo: {
    'former-liang': '河西 · 张氏前凉',
    'cheng-han': '巴蜀 · 李氏成汉',
    'han-zhao': '平阳 · 刘氏汉赵',
    'later-zhao': '襄国/邺城 · 石氏后赵',
    'former-yan': '邺城 · 慕容前燕',
    'later-yan': '中山 · 慕容后燕',
    'later-qin': '关中长安 · 姚氏后秦',
    'western-qin': '陇西 · 乞伏西秦',
    'later-liang': '姑臧 · 吕氏后凉',
    'southern-liang': '乐都 · 秃发南凉',
    'northern-liang': '张掖 · 沮渠北凉',
    'southern-yan': '广固 · 慕容南燕',
    'western-liang': '酒泉 · 李氏西凉',
    'hu-xia': '统万城 · 赫连胡夏',
    'northern-yan': '龙城 · 冯氏北燕',
    'sui': '杨坚受禅建立隋朝'
   }
  },
  'sui-tang': {
   order: [
    'sui','tang','wu-zhou',
    'southern-chen','wagang-wei','xia-dou','zheng-wang','tufan','yan-an-shi','qi-huang-chao'
   ],
   coreIds: ['sui','tang','wu-zhou'],
   cursor: -617,
   minorInfo: {
    'southern-chen': '江南建康 · 南陈',
    'wagang-wei': '瓦岗 · 李密魏公',
    'xia-dou': '河北乐寿 · 窦建德夏',
    'zheng-wang': '洛阳 · 王世充郑',
    'tufan': '青藏高原 · 吐蕃赞普',
    'yan-an-shi': '范阳 · 安史之乱大燕',
    'qi-huang-chao': '长安 · 黄巢大齐'
   }
  },
  'five-dynasties': {
   order: [
    'later-liang','later-tang','later-jin','later-han','later-zhou','northern-song',
    'wu-yang','wuyue','former-shu','ma-chu','min','southern-han','jingnan','later-shu',
    'southern-tang','northern-han','liao'
   ],
   coreIds: ['later-liang','later-tang','later-jin','later-han','later-zhou','northern-song'],
   cursor: -922,
   minorInfo: {
    'wu-yang': '广陵 · 杨吴',
    'wuyue': '钱塘 · 钱氏吴越',
    'former-shu': '成都 · 王氏前蜀',
    'ma-chu': '长沙 · 马楚',
    'min': '福州 · 王氏闽',
    'southern-han': '番禺 · 刘氏南汉',
    'jingnan': '江陵 · 荆南（南平）',
    'later-shu': '成都 · 孟氏后蜀',
    'southern-tang': '金陵 · 李氏南唐',
    'northern-han': '太原 · 刘氏北汉',
    'liao': '塞北 · 契丹/辽朝'
   }
  },
  'liao-jin-song': {
   order: [
    'northern-song','southern-song','liao','jin-jurchen','western-xia',
    'dali','western-liao','mongol-yuan'
   ],
   coreIds: ['northern-song','southern-song','liao','jin-jurchen','western-xia'],
   cursor: -959,
   minorInfo: {
    'dali': '大理城 · 段氏大理国',
    'western-liao': '虎思斡耳朵 · 耶律大石西辽',
    'mongol-yuan': '漠北/开平 · 大蒙古国与元朝'
   }
  },
  'yuan': {
   order: [
    'mongol-yuan','southern-song','jin-jurchen','ming',
    'western-xia','dali','tianwan-xu','zhang-zhou','red-turban-song','chen-han','ming-xia'
   ],
   coreIds: ['mongol-yuan','southern-song','jin-jurchen','ming'],
   cursor: -1270,
   minorInfo: {
    'western-xia': '中兴府 · 西夏',
    'dali': '大理城 · 大理国',
    'tianwan-xu': '江州 · 徐寿辉天完',
    'zhang-zhou': '平江 · 张士诚大周',
    'red-turban-song': '安丰 · 韩林儿韩宋',
    'chen-han': '江州 · 陈友谅大汉',
    'ming-xia': '重庆 · 明玉珍大夏'
   }
  },
  'ming': {
   order: ['ming','southern-ming','later-jin-qing','northern-yuan','dashun','daxi'],
   coreIds: ['ming','southern-ming','later-jin-qing'],
   cursor: -1367,
   minorInfo: {
    'northern-yuan': '漠北草原 · 瓦剌与鞑靼北元政权',
    'dashun': '西安/北京 · 李自成大顺',
    'daxi': '成都 · 张献忠大西'
   }
  },
  'qing': {
   order: ['later-jin-qing','ming','southern-ming','dashun','wu-zhou','dzungar','taiping'],
   coreIds: ['later-jin-qing','ming'],
   cursor: -1643,
   minorInfo: {
    'southern-ming': '南明抗清诸王及明郑台湾东宁',
    'dashun': '西安/北京 · 李自成大顺',
    'wu-zhou': '云南/衡州 · 吴三桂吴周',
    'dzungar': '伊犁河谷 · 准噶尔汗国',
    'taiping': '金田/天京 · 洪秀全太平天国'
   }
  }
 };

 // Explicit, additive presentation contract. It never changes domain records or IDs.
 Zhou.Presentation={
  topic(data) {
   const rawOrder = (data?.states || []).map(s => s.id);
   const datasetId = data?.datasetId;
   const isZhou = (!datasetId && data?.timeline?.topic === 'zhou') || datasetId === 'zhou';
   const topicId = isZhou ? 'zhou' : datasetId;
   const policy = (topicId && Object.hasOwn(formalTopics, topicId)) ? formalTopics[topicId] : null;
    let defaultCursor=policy?.cursor;
    const from=data?.timeline?.start,to=data?.timeline?.defaultEnd??data?.timeline?.end;
    if(policy&&Number.isSafeInteger(from)&&Number.isSafeInteger(to)&&(defaultCursor>from||defaultCursor<to)){
     const supplied=data?.timeline?.cursor;
     defaultCursor=Number.isSafeInteger(supplied)&&supplied<=from&&supplied>=to?supplied:Math.max(to,Math.min(from,defaultCursor));
    }

   if (!policy) {
    const rawCursor = data?.timeline?.cursor ?? (rawOrder.length ? Math.max(...data.states.map(s => s.start)) : 0);
    return {
     order: [...rawOrder],
     coreIds: [...rawOrder],
     cursor: rawCursor,
     minorInfo: {}
    };
   }

   let order;
   let coreIds;
   if (rawOrder.length > 0) {
    const existing = new Set(rawOrder);
    const matched = policy.order.filter(id => existing.has(id));
    const rest = rawOrder.filter(id => !matched.includes(id));
    order = [...matched, ...rest];
    coreIds = policy.all ? [...order] : policy.coreIds.filter(id => existing.has(id));
   } else {
    order = []; // Empty projections must not gain invented polity IDs.
    coreIds = [];
   }

   return {
    order,
    coreIds,
    cursor: defaultCursor,
    minorInfo: {...policy.minorInfo}
   };
  },
  // Only an unversioned, exact former default is migrated. Explicit links and
  // versioned custom orders retain their requested sequence.
  migrateLayout(data,layout){
   if(!layout||layout.orderVersion===1||(data.datasetId||data.timeline?.topic)!=='liao-jin-song')return layout;
   const former=data.states.map(s=>s.id),order=layout.order;
   if(!Array.isArray(order)||order.length!==former.length||order.some((id,i)=>id!==former[i]))return layout;
   return {...layout,order:this.topic(data).order};
  },
  polityLabel(s,data){
    const id=data?.datasetId||data?.timeline?.topic;
    const names={zhou:{zhou:'周王室'},'xia-shang':{xia:'夏朝',shang:'商朝',zhou:'周'},'qin-han':{qin:'秦', 'western-han':'西汉',xin:'新','gengshi-han':'玄汉','eastern-han':'东汉'},'sui-tang':{sui:'隋朝',tang:'唐朝','wu-zhou':'武周'},'liao-jin-song':{'northern-song':'北宋','southern-song':'南宋',liao:'辽朝','jin-jurchen':'金朝','western-xia':'西夏'},ming:{ming:'明朝','southern-ming':'南明','later-jin-qing':'后金 / 清'},qing:{'later-jin-qing':'清朝',ming:'明朝','southern-ming':'南明'},yuan:{'mongol-yuan':'蒙元','southern-song':'南宋','jin-jurchen':'金朝',ming:'明朝'}};
    return names[id]?.[s.id]||s.display?.shortName||s.name;
   },
   polityColor(s,data){
    const id=data?.datasetId||data?.timeline?.topic;if(!Object.hasOwn(formalTopics,id||''))return s.color;
    const core=this.topic(data).coreIds;if(!core.includes(s.id))return s.color;
    const fixed={tang:'#C04851','wu-zhou':'#7a3028',ming:'#C04851','southern-ming':'#C04851','later-jin-qing':'#2C3E50','northern-song':'#355E68','southern-song':'#355E68','mongol-yuan':'#2C3E50'};
    return fixed[s.id]||['#2C3E50','#C04851','#355E68','#A58444'][core.indexOf(s.id)%4];
   },
   rulerLabel(r){
   if(r?.display?.label)return r.display.label;
   return r?.display?[r.display.shortTitle,r.display.personalName].filter(Boolean).join(' '):r?.name;
  },
  // Shapes, not colour alone, distinguish the five source categories. Unknown
  // categories stay unknown; this adapter never reclassifies a historical event.
  eventIcon(kind){
   return ({
    '政治':{token:'politics',path:'M2 6L8 2L14 6M3 7H13M4 7V13M8 7V13M12 7V13M2 14H14'},
    '战争':{token:'war',path:'M3 2L13 12M2 4L4 2M10 14L14 10M13 2L3 12M12 2L14 4M2 10L6 14'},
    '改革':{token:'reform',path:'M2 4H14M5 2V6M2 8H14M11 6V10M2 12H14M7 10V14'},
    '外交':{token:'diplomacy',path:'M6 4H5A4 4 0 0 0 5 12H7M10 4H11A4 4 0 0 1 11 12H9M5 8H11'},
    '文化':{token:'culture',path:'M8 4C5 2 3 2 1 3V13C4 12 6 12 8 14C10 12 12 12 15 13V3C13 2 11 2 8 4V14'}
   })[kind]||{token:'other',path:'M8 2A6 6 0 1 0 8 14A6 6 0 1 0 8 2'};
  },
  eventKinds(events){return [...new Set(events.map(e=>e.kind).filter(Boolean))];},
  // A short label is only a prefix of the original title, never a guessed name.
  eventLabel(event,limit=10){const name=Array.from(event.name||'');return name.length>limit?name.slice(0,limit).join('')+'…':name.join('');},
  // Aggregate visible *rows*, while counting missing original polity IDs. Two
  // members of one succession row produce one dot, not invented separate lanes.
  eventLinks(events,rows,{position,rowPosition}){
   return events.filter(e=>new Set(e.states).size>1).map(event=>{
    const visible=new Set(),points=[];
    for(const row of rows){
     const states=row.members.filter(s=>event.states.includes(s.id)),y=rowPosition(row);
     if(!states.length||!Number.isFinite(y))continue;
     states.forEach(s=>visible.add(s.id));points.push({rowKey:row.key,states:states.map(s=>s.id),y});
    }
    const hidden=[...new Set(event.states)].filter(id=>!visible.has(id));
    return {event,left:position(event),points:points.sort((a,b)=>a.y-b.y),hidden};
   });
  },
  // Inclusive year precision: equality is an overlap, not permission to trim dates.
  pack(records,from,to,laneKey='displayLane'){
   const ends=[],items=[];
   for(const r of records.filter(r=>r.start>=to&&r.end<=from).sort((a,b)=>b.start-a.start||(a.lane||0)-(b.lane||0))){
    let lane=r.lane||0;while(ends[lane]!=null&&r.start>=ends[lane])lane++;
    ends[lane]=r.end;items.push({...r,[laneKey]:lane});
   }
   return {items,lanes:Math.max(1,ends.length)};
  },
  // Screen-space adapters never assign fractional historical years. Keep the
  // inclusive pack above intact; only short-year controls receive micro-slots.
  tenureSlots(records,{position,scale=1,measure=r=>(r.start-r.end+1)*scale,order=records,minWidth=14,gap=2,limit=Infinity}={}){
   const source=new Map(order.map((r,i)=>[r.id,i])),placed=[],drafts=[];
   for(const r of records){
    const anchor=position(r),rawWidth=Math.max(0,measure(r)),short=rawWidth<minWidth;
    const peers=short?order.filter(p=>p.stateId===r.stateId&&(p.start===r.start||p.end===r.start)):[];
    const sequence=[...peers].sort((a,b)=>(source.get(a.id)??0)-(source.get(b.id)??0)),ordinal=Math.max(0,sequence.findIndex(p=>p.id===r.id));
    const width=Math.max(minWidth,rawWidth),offset=short&&sequence.length>1?ordinal*(minWidth+gap):0;
    const left=Math.max(0,Math.min(anchor+offset,Math.max(0,limit-width)));
    drafts.push({...r,anchor,visualLeft:left,visualWidth:width,subyearSlot:short,slotOrder:ordinal+1,slotCount:sequence.length||1});
   }
   // Reserve unchanged long bars first. A short hit control may reuse a free
   // original lane, rather than displacing a later long reign and cascading rows.
   const baseLanes=Math.max(1,...records.map(r=>(r.displayLane||0)+1));
   for(const r of [...drafts.filter(r=>!r.subyearSlot),...drafts.filter(r=>r.subyearSlot)]){
    const clear=lane=>!placed.some(p=>p.displayLane===lane&&r.visualLeft<p.visualLeft+p.visualWidth&&r.visualLeft+r.visualWidth>p.visualLeft);
    const candidates=[r.displayLane||0,...Array.from({length:baseLanes},(_,i)=>i).filter(i=>i!==(r.displayLane||0))];
    let lane=candidates.find(clear);
    if(lane===undefined){lane=baseLanes;while(!clear(lane))lane++;}
    r.displayLane=lane;placed.push(r);
   }
   return {items:drafts,lanes:Math.max(1,...drafts.map(r=>r.displayLane+1))};
  },
  // Pixel-space event packing: spend available height before folding neighbours.
  // Obstacles are rendered tenure rectangles, not altered historical intervals.
  events(records,{position,measure,measureGroup,extent,top,bottom,focusedId,obstacles=[]}){
   const lanes=Math.max(1,Math.floor((bottom-top)/22)+1),groups=[];
   const widthFor=events=>{const span=events.length===1&&extent?.(events[0]);return Number.isFinite(span)&&span>0?Math.max(1,span):Math.max(18,Math.min(210,measureGroup?measureGroup(events):measure(events[0])));};
   const ordered=[...records].sort((a,b)=>position(a)-position(b)),focused=ordered.find(e=>e.id===focusedId);
   // Reserve the selected event before placing its neighbours, including earlier
   // years. With spare lanes it remains independently actionable.
   for(const ev of focused?[focused,...ordered.filter(e=>e!==focused)]:ordered){
    const left=position(ev),width=widthFor([ev]);
    const intersects=g=>left<g.left+g.width+8&&left+width+8>g.left;
    const lane=Array.from({length:lanes},(_,i)=>i).find(i=>!groups.some(g=>g.lane===i&&intersects(g))&&!obstacles.some(o=>left<o.right+2&&left+width>o.left-2&&bottom-i*22<o.bottom+1&&bottom-i*22+18>o.top-1));
    if(lane!==undefined){groups.push({events:[ev],left,width,top:bottom-lane*22,lane});continue;}
    // The caller reserves the bottom lane for events. When all usable slots are
    // occupied, fold into a neighbouring marker, preserving every event ID.
    const neighbours=groups.filter(intersects),ordinary=neighbours.filter(g=>!g.events.some(e=>e.id===focusedId));
    const group=(ordinary.length?ordinary:neighbours).at(-1);
    // The UI reserves an obstacle-free bottom slot. Impossible external
     // bands are flagged, but keep every original ID instead of crashing.
     if(!group){groups.push({events:[ev],left,width,top:bottom,lane:0,blocked:true});continue;}
     group.events.push(ev);group.events.sort((a,b)=>position(a)-position(b));group.left=position(group.events[0]);
     if(measureGroup||extent)group.width=widthFor(group.events);
   }
   if(measureGroup||extent){
     // A compact singleton can grow when its cluster gains categories/counts.
     // Recheck actual widths against peers and tenure obstacles. Every retry
     // merges two groups, so dates stay anchored and the process terminates.
     const overlap=(a,b)=>a.left<b.left+b.width+8&&a.left+a.width+8>b.left;
     let retry=true;
     while(retry){
      retry=false;const placed=[];
      const order=[...groups].sort((a,b)=>Number(b.events.some(e=>e.id===focusedId))-Number(a.events.some(e=>e.id===focusedId))||a.left-b.left||a.lane-b.lane);
      for(const group of order){
       const candidates=[group.lane,...Array.from({length:lanes},(_,i)=>i).filter(i=>i!==group.lane)];
       const lane=candidates.find(i=>!placed.some(other=>other.lane===i&&overlap(group,other))&&!obstacles.some(o=>group.left<o.right+2&&group.left+group.width>o.left-2&&bottom-i*22<o.bottom+1&&bottom-i*22+18>o.top-1));
       if(lane!==undefined){group.lane=lane;group.top=bottom-lane*22;delete group.blocked;placed.push(group);continue;}
       const neighbours=placed.filter(other=>overlap(group,other)),ordinary=neighbours.filter(other=>!other.events.some(e=>e.id===focusedId)),target=(ordinary.length?ordinary:neighbours).at(-1);
       if(!target){group.blocked=true;placed.push(group);continue;}
       target.events.push(...group.events);target.events.sort((a,b)=>position(a)-position(b));target.left=position(target.events[0]);target.width=widthFor(target.events);
       groups.splice(groups.indexOf(group),1);retry=true;break;
      }
     }
    }
    return {groups:groups.sort((a,b)=>a.left-b.left||a.lane-b.lane),lanes};
  },
  rows(states,presentation,pins=new Set()){
   const definitions=presentation?.version===1?presentation.rowGroups||[]:[],rows=[],seen=new Set();
   for(const s of states){
    const group=definitions.find(g=>g.stateIds.includes(s.id)),key=group?'group:'+group.id:'state:'+s.id;
    if(seen.has(key))continue;seen.add(key);
    const members=group?states.filter(v=>group.stateIds.includes(v.id)):[s];
    rows.push({key,name:group?.name||s.name,note:group?.note||'',grouped:Boolean(group),members,pinned:members.some(v=>pins.has(v.id))});
   }
   return [...rows.filter(r=>r.pinned),...rows.filter(r=>!r.pinned)];
  }
 };
})(globalThis.Zhou ||= {});
