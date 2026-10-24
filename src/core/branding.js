(function(Zhou){
 'use strict';
 const entries={
  'xia-shang':{logoChar:'商',title:'夏商周初 · 中国朝代时间线',subtitle:'夏后氏 · 殷商 · 岐周',slogan:'大道之行，家天下始；汤武革命，礼乐初兴。'},
  zhou:{logoChar:'周',title:'周代列国 · 中国朝代时间线',subtitle:'西周 · 春秋 · 战国',slogan:'同一时刻，列国之间。'},
  'qin-han':{logoChar:'汉',title:'秦汉帝国 · 中国朝代时间线',subtitle:'秦朝 · 西汉 · 新朝 · 东汉',slogan:'六合同风，九州共贯；书同文，车同轨。'},
  'three-kingdoms':{logoChar:'三',title:'三国鼎立 · 中国朝代时间线',subtitle:'曹魏 · 蜀汉 · 孙吴',slogan:'汉末分崩，天下三分；一时多少豪杰。'},
  'wei-jin-nan-bei':{logoChar:'晋',title:'魏晋南北朝 · 中国朝代时间线',subtitle:'两晋 · 十六国 · 南北朝',slogan:'衣冠南渡，五胡云扰；南北对峙，终归隋统。'},
  'sui-tang':{logoChar:'唐',title:'隋唐盛世 · 中国朝代时间线',subtitle:'隋朝 · 唐朝（含武周）',slogan:'九天阊阖开宫殿，万国衣冠拜冕旒。'},
  'five-dynasties':{logoChar:'五',title:'五代十国 · 中国朝代时间线',subtitle:'梁唐晋汉周 · 十国割据',slogan:'中原五姓更迭，十国保境安民。'},
  'liao-jin-song':{logoChar:'宋',title:'宋辽金夏 · 中国朝代时间线',subtitle:'北宋 · 南宋 · 辽 · 金 · 西夏',slogan:'两宋文治与辽金夏多极并立，盟战三百年。'},
  yuan:{logoChar:'元',title:'蒙元帝国 · 中国朝代时间线',subtitle:'大蒙古国 · 元朝 · 宋金交替',slogan:'朔漠崛起，混一南北；行省立制，四海测验。'},
  ming:{logoChar:'明',title:'大明王朝 · 中国朝代时间线',subtitle:'明朝 · 后金兴起',slogan:'驱逐胡元，永乐盛世；天子守国门，君王死社稷。'},
  qing:{logoChar:'清',title:'大清帝国 · 中国朝代时间线',subtitle:'后金 · 清朝 · 近代转型',slogan:'康乾盛世奠定版图，晚清百年开启近代转型。'}
 };
 const text=(value,max)=>typeof value==='string'&&value.trim()&&Array.from(value.trim()).length<=max?value.trim():null;
 function resolve(data={},topicId=data.datasetId||data.timeline?.topic){
  const fallback=entries[topicId]||{logoChar:'史',title:'中国朝代时间线',subtitle:'政权 · 人物 · 事件',slogan:'同一时刻，政权之间。'};
  const metadata=data.metadata||{},custom=metadata.branding||metadata.presentation||{};
  const read=(key,max)=>text(custom[key],max)||text(metadata[key],max)||fallback[key];
  const intro=text(custom.intro,99)||text(metadata.intro,99)||'沿共同年代对照政权兴替，点击君主、人物与事件阅读生平和史源；纪年异说可在详情中展开核对。';
  return {logoChar:read('logoChar',1),title:text(custom.title,32)||text(metadata.shortTitle,32)||fallback.title,subtitle:read('subtitle',60),slogan:read('slogan',80),intro,statusLabel:'ⓘ 资料状态：原典与年表整理 · 异说可展开核对'};
 }
 const topicName=topic=>topic?.id==='liao-jin-song'?'宋辽金':topic?.name||topic?.id||'';
 Zhou.Branding=Object.freeze({resolve,topicName});
})(globalThis.Zhou ||= {});
