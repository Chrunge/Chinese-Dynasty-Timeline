// Presentation-only annotations keyed by tenure identity, never by a person's name.
// Empty shortTitle deliberately avoids choosing among multiple titles/offices.
const labels = [
 ['wei-r39','卫君','角'],
 ['qin-r35','秦王政','嬴政'],
 ['qh-tenure-qin-shihuang','始皇帝','嬴政'],
 ['qh-tenure-qin-ershi','秦二世','胡亥'],
 ['qh-tenure-qin-ziying','秦王','子婴'],
 ['qh-tenure-chen-sheng','','陈胜'],
 ['qh-tenure-xiang-yu','西楚霸王','项羽'],
 ['qh-tenure-han-gaozu','汉高祖','刘邦'],
 ['qh-tenure-han-huidi','汉惠帝','刘盈'],
 ['qh-tenure-han-qianshaodi','前少帝',''],
 ['qh-tenure-han-houshaodi','后少帝','刘弘'],
 ['qh-tenure-lv-hou','吕后','吕雉'],
 ['qh-tenure-han-wendi','汉文帝','刘恒'],
 ['qh-tenure-han-jingdi','汉景帝','刘启'],
 ['qh-tenure-han-wudi','汉武帝','刘彻'],
 ['qh-tenure-han-zhaodi','汉昭帝','刘弗陵'],
 ['qh-tenure-liu-he','','刘贺'],
 ['qh-tenure-han-xuandi','汉宣帝','刘询'],
 ['qh-tenure-han-yuandi','汉元帝','刘奭'],
 ['qh-tenure-han-chengdi','汉成帝','刘骜'],
 ['qh-tenure-han-aidi','汉哀帝','刘欣'],
 ['qh-tenure-han-pingdi','汉平帝','刘衎'],
 ['qh-tenure-ruzi-ying','孺子','刘婴'],
 ['qh-tenure-wang-mang','','王莽'],
 ['qh-tenure-gengshi','更始帝','刘玄'],
 ['qh-tenure-han-guangwudi','汉光武帝','刘秀'],
 ['qh-tenure-han-mingdi','汉明帝','刘庄'],
 ['qh-tenure-han-zhangdi','汉章帝','刘炟'],
 ['qh-tenure-han-hedi','汉和帝','刘肇'],
 ['qh-tenure-han-shangdi','汉殇帝','刘隆'],
 ['qh-tenure-han-andi','汉安帝','刘祜'],
 ['qh-tenure-beixianghou','','刘懿'],
 ['qh-tenure-han-shundi','汉顺帝','刘保'],
 ['qh-tenure-han-chongdi','汉冲帝','刘炳'],
 ['qh-tenure-han-zhidi','汉质帝','刘缵'],
 ['qh-tenure-han-huandi','汉桓帝','刘志'],
 ['qh-tenure-han-lingdi','汉灵帝','刘宏'],
 ['qh-tenure-liu-bian','','刘辩'],
 ['qh-tenure-han-xiandi','汉献帝','刘协'],
 ['tk-tenure-caocao-foundation','','曹操'],
 ['tk-tenure-liubei-hanzhong','','刘备'],
 ['tk-tenure-sunce-jiangdong','','孙策'],
 ['tk-tenure-sunquan-early','','孙权'],
 ['tk-tenure-cao-pi','魏文帝','曹丕'],
 ['tk-tenure-cao-rui','魏明帝','曹叡'],
 ['tk-tenure-cao-fang','魏齐王','曹芳'],
 ['tk-tenure-cao-mao','高贵乡公','曹髦'],
 ['tk-tenure-cao-huan','魏元帝','曹奂'],
 ['tk-tenure-liu-bei','汉昭烈帝','刘备'],
 ['tk-tenure-liu-shan','后主','刘禅'],
 ['tk-tenure-sun-quan','吴大帝','孙权'],
 ['tk-tenure-sun-liang','会稽王','孙亮'],
 ['tk-tenure-sun-xiu','吴景帝','孙休'],
 ['tk-tenure-sun-hao','吴末帝','孙皓'],
 ['tk-tenure-sima-yan','晋武帝','司马炎']
];
const byTenure = new Map(labels.map(([id,shortTitle,personalName])=>[id,{shortTitle,personalName}]));
export function annotateDisplay(data,id){
 const stateLabels={qin:'秦',wei:'卫','gengshi-han':'玄汉','eastern-han':'东汉'};
 for(const s of [...data.states,...data.polities])if(stateLabels[s.id])s.display={shortName:stateLabels[s.id]};
 for(const t of [...data.tenures,...data.states.flatMap(s=>s.rulers)]){
  const display=byTenure.get(t.id);
  if(display)t.display={...display};
  else if(t.personId)throw new Error('Missing explicit tenure display: '+t.id);
 }
 data.presentation={version:1,rowGroups:id==='qin-han'?[{
  id:'qin-han-succession',name:'秦汉接续',
  stateIds:['qin','western-han','xin','gengshi-han','eastern-han'],
  note:'秦 → 西汉 → 新 → 玄汉 → 东汉共用主行；原始日期与同年重叠均保留，重叠分层。卫、张楚、西楚为并存政权，另行显示。固定任一分段时主行整体置顶；筛选、排序与导出仍使用原政权身份。'
 }]:[]};
 return data;
}
