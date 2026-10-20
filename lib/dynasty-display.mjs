// Pure presentation metadata for compiled projections, never authoring records.
// Each line is an explicit tenure ID | short title | personal name binding.
// A blank title is deliberate: the source describes multiple offices or names.
const labels = `
tk-tenure-sima-yan|晋武帝|司马炎
wj-tenure-jin-huidi|晋惠帝|司马衷
wj-tenure-jin-huaidi|晋怀帝|司马炽
wj-tenure-jin-mindi|晋愍帝|司马邺
wj-tenure-jin-yuandi|晋元帝|司马睿
wj-tenure-jin-mingdi|晋明帝|司马绍
wj-tenure-jin-chengdi|晋成帝|司马衍
wj-tenure-jin-kangdi|晋康帝|司马岳
wj-tenure-jin-mudi|晋穆帝|司马聃
wj-tenure-jin-aidi|晋哀帝|司马丕
wj-tenure-jin-haixigong|海西公|司马奕
wj-tenure-jin-jianwendi|晋简文帝|司马昱
wj-tenure-jin-xiaowudi|晋孝武帝|司马曜
wj-tenure-jin-andi|晋安帝|司马德宗
wj-tenure-jin-gongdi|晋恭帝|司马德文
wj-tenure-formerliang-zhanggui||张轨
wj-tenure-formerliang-zhangjun||张骏
wj-tenure-formerliang-zhangtianxi||张天锡
wj-tenure-chenghan-lixiong|成汉武帝|李雄
wj-tenure-chenghan-lishi|成汉后主|李势
wj-tenure-hanzhao-liuyuan|汉赵高祖|刘渊
wj-tenure-hanzhao-liucong|汉赵昭武帝|刘聪
wj-tenure-hanzhao-liuyao||刘曜
wj-tenure-laterzhao-shile|后赵明帝|石勒
wj-tenure-laterzhao-shihu|后赵武帝|石虎
wj-tenure-formeryan-muronghuang||慕容皝
wj-tenure-formeryan-murongjun|前燕景昭帝|慕容儁
wj-tenure-formeryan-murongwei|前燕幽帝|慕容暐
wj-tenure-formerqin-fujian-founder|前秦景明帝|苻健
wj-tenure-formerqin-fujian||苻坚
wj-tenure-lateryan-murongchui|后燕成武帝|慕容垂
wj-tenure-lateryan-murongbao|后燕惠愍帝|慕容宝
wj-tenure-laterqin-yaochang|后秦武昭帝|姚苌
wj-tenure-laterqin-yaoxing|后秦文桓帝|姚兴
wj-tenure-laterqin-yaohong|后秦末主|姚泓
wj-tenure-westernqin-qifuguoren||乞伏国仁
wj-tenure-westernqin-qifuchipan|西秦文昭王|乞伏炽磐
wj-tenure-laterliang-lvguang||吕光
wj-tenure-southernliang-tufawugu||秃发乌孤
wj-tenure-northernliang-juqumengxun||沮渠蒙逊
wj-tenure-northernliang-juqumujian|北凉哀王|沮渠牧犍
wj-tenure-southernyan-murongde|南燕献武帝|慕容德
wj-tenure-southernyan-murongchao|南燕末主|慕容超
wj-tenure-westernliang-ligao||李暠
wj-tenure-huxia-helianbobo|胡夏武烈帝|赫连勃勃
wj-tenure-northernyan-fengba||冯跋
wj-tenure-song-wudi|宋武帝|刘裕
wj-tenure-song-shaodi|宋少帝|刘义符
wj-tenure-song-wendi|宋文帝|刘义隆
wj-tenure-song-xiaowudi|宋孝武帝|刘骏
wj-tenure-song-qianfeidi|宋前废帝|刘子业
wj-tenure-song-mingdi|宋明帝|刘彧
wj-tenure-song-houfeidi|宋后废帝|刘昱
wj-tenure-song-shundi|宋顺帝|刘准
wj-tenure-qi-gaodi|齐高帝|萧道成
wj-tenure-qi-wudi|齐武帝|萧赜
wj-tenure-qi-yulinwang|郁林王|萧昭业
wj-tenure-qi-hailingwang|海陵王|萧昭文
wj-tenure-qi-mingdi|齐明帝|萧鸾
wj-tenure-qi-donghunhou|东昏侯|萧宝卷
wj-tenure-qi-hedi|齐和帝|萧宝融
wj-tenure-liang-wudi|梁武帝|萧衍
wj-tenure-liang-jianwendi|梁简文帝|萧纲
wj-tenure-liang-yuandi|梁元帝|萧绎
wj-tenure-liang-jingdi|梁敬帝|萧方智
wj-tenure-chen-wudi|陈武帝|陈霸先
wj-tenure-chen-wendi|陈文帝|陈蒨
wj-tenure-chen-feidi|陈废帝|陈伯宗
wj-tenure-chen-xuandi|陈宣帝|陈顼
wj-tenure-chen-houzhu|陈后主|陈叔宝
wj-tenure-wei-daowudi|北魏道武帝|拓跋珪
wj-tenure-wei-mingyuandi|北魏明元帝|拓跋嗣
wj-tenure-wei-taiwudi|北魏太武帝|拓跋焘
wj-tenure-wei-wenchengdi|北魏文成帝|拓跋濬
wj-tenure-wei-xianwendi|北魏献文帝|拓跋弘
wj-tenure-wei-fengtaihou||冯太后
wj-tenure-wei-xiaowendi|北魏孝文帝|元宏
wj-tenure-wei-xuanwudi|北魏宣武帝|元恪
wj-tenure-wei-xiaomingdi|北魏孝明帝|元诩
wj-tenure-wei-xiaozhuangdi|北魏孝庄帝|元子攸
wj-tenure-wei-jiemindi|北魏节闵帝|元恭
wj-tenure-wei-xiaowudi|北魏孝武帝|元修
wj-tenure-ewei-xiaojingdi|东魏孝静帝|元善见
wj-tenure-ewei-gaohuan||高欢
wj-tenure-wwei-wendi|西魏文帝|元宝炬
wj-tenure-wwei-feidi|西魏废帝|元钦
wj-tenure-wwei-gongdi|西魏恭帝|拓跋廓
wj-tenure-wwei-yuwentai||宇文泰
wj-tenure-nqi-wenxuandi|北齐文宣帝|高洋
wj-tenure-nqi-feidi|北齐废帝|高殷
wj-tenure-nqi-xiaozhaodi|北齐孝昭帝|高演
wj-tenure-nqi-wuchengdi|北齐武成帝|高湛
wj-tenure-nqi-houzhu|北齐后主|高纬
wj-tenure-nzhou-xiaomindi|北周孝闵帝|宇文觉
wj-tenure-nzhou-mingdi|北周明帝|宇文毓
wj-tenure-nzhou-wudi|北周武帝|宇文邕
wj-tenure-nzhou-xuandi|北周宣帝|宇文赟
wj-tenure-nzhou-jingdi|北周静帝|宇文阐
st-tenure-sui-wendi|隋文帝|杨坚
st-tenure-sui-yangdi|隋炀帝|杨广
st-tenure-sui-gongdi|隋恭帝|杨侑
st-tenure-wagang-limi|魏公|李密
st-tenure-xia-doujiande||窦建德
st-tenure-zheng-wangshichong|郑帝|王世充
st-tenure-tang-gaozu|唐高祖|李渊
st-tenure-tang-taizong|唐太宗|李世民
st-tenure-tang-gaozong|唐高宗|李治
st-tenure-tang-zhongzong-1|唐中宗（初任）|李显
st-tenure-tang-ruizong-1|唐睿宗（初任）|李旦
st-tenure-tang-wuhou-regency|武太后|武则天
st-tenure-wuzhou-wuzetian|圣神皇帝|武则天
st-tenure-tang-zhongzong-2|唐中宗（复位）|李显
st-tenure-tang-ruizong-2|唐睿宗（复位）|李旦
st-tenure-tang-xuanzong|唐玄宗|李隆基
st-tenure-tang-suzong|唐肃宗|李亨
st-tenure-tang-daizong|唐代宗|李豫
st-tenure-tang-dezong|唐德宗|李适
st-tenure-tang-shunzong|唐顺宗|李诵
st-tenure-tang-xianzong|唐宪宗|李纯
st-tenure-tang-muzong|唐穆宗|李恒
st-tenure-tang-jingzong|唐敬宗|李湛
st-tenure-tang-wenzong|唐文宗|李昂
st-tenure-tang-wuzong|唐武宗|李炎
st-tenure-tang-xuanzong-late|唐宣宗|李忱
st-tenure-tang-yizong|唐懿宗|李漼
st-tenure-tang-xizong|唐僖宗|李儇
st-tenure-tang-zhaozong|唐昭宗|李晔
st-tenure-tang-aidi|唐哀帝|李柷
st-tenure-tufan-songtsen|赞普|松赞干布
st-tenure-tufan-trisong|赞普|赤松德赞
st-tenure-yan-anlushan||安禄山
st-tenure-yan-shisiming||史思明
st-tenure-qi-huangchao||黄巢
sl-tenure-liao-taizu|辽太祖|耶律阿保机
sl-tenure-liao-taizong|辽太宗|耶律德光
sl-tenure-liao-shizong|辽世宗|耶律阮
sl-tenure-liao-muzong|辽穆宗|耶律璟
sl-tenure-liao-jingzong|辽景宗|耶律贤
sl-tenure-liao-shengzong|辽圣宗|耶律隆绪
sl-tenure-liao-xingzong|辽兴宗|耶律宗真
sl-tenure-liao-daozong|辽道宗|耶律洪基
sl-tenure-liao-tianzuodi|辽天祚帝|耶律延禧
sl-tenure-wliao-dezong||耶律大石
sl-tenure-dali-duansiping|大理太祖|段思平
sl-tenure-dali-duanzhengchun|大理中宗|段正淳
sl-tenure-dali-duanheyu|大理宪宗|段和誉
sl-tenure-dali-duanxingzhi|大理末帝|段兴智
sl-tenure-xia-jiqian||李继迁
sl-tenure-xia-deming||李德明
sl-tenure-xia-jingzong|西夏景宗|李元昊
sl-tenure-xia-yizong|西夏毅宗|李谅祚
sl-tenure-xia-huizong|西夏惠宗|李秉常
sl-tenure-xia-chongzong|西夏崇宗|李乾顺
sl-tenure-xia-renzong|西夏仁宗|李仁孝
sl-tenure-xia-huanzong|西夏桓宗|李纯佑
sl-tenure-xia-xiangzong|西夏襄宗|李安全
sl-tenure-xia-shenzong|西夏神宗|李遵顼
sl-tenure-xia-xianzong|西夏献宗|李德旺
sl-tenure-xia-modi|西夏末帝|李睍
sl-tenure-nsong-taizu|宋太祖|赵匡胤
sl-tenure-nsong-taizong|宋太宗|赵光义
sl-tenure-nsong-zhenzong|宋真宗|赵恒
sl-tenure-nsong-renzong|宋仁宗|赵祯
sl-tenure-nsong-yingzong|宋英宗|赵曙
sl-tenure-nsong-shenzong|宋神宗|赵顼
sl-tenure-nsong-zhezong|宋哲宗|赵煦
sl-tenure-nsong-huizong|宋徽宗|赵佶
sl-tenure-nsong-qinzong|宋钦宗|赵桓
sl-tenure-jin-taizu|金太祖|完颜阿骨打
sl-tenure-jin-taizong|金太宗|完颜晟
sl-tenure-jin-xizong|金熙宗|完颜亶
sl-tenure-jin-hailing|海陵王|完颜亮
sl-tenure-jin-shizong|金世宗|完颜雍
sl-tenure-jin-zhangzong|金章宗|完颜璟
sl-tenure-jin-weishaowang|卫绍王|完颜永济
sl-tenure-jin-xuanzong|金宣宗|完颜珣
sl-tenure-jin-aizong|金哀宗|完颜守绪
sl-tenure-jin-modi|金末帝|完颜承麟
sl-tenure-ssong-gaozong|宋高宗|赵构
sl-tenure-ssong-xiaozong|宋孝宗|赵昚
sl-tenure-ssong-guangzong|宋光宗|赵惇
sl-tenure-ssong-ningzong|宋宁宗|赵扩
sl-tenure-ssong-lizong|宋理宗|赵昀
sl-tenure-ssong-duzong|宋度宗|赵禥
sl-tenure-ssong-gongdi|宋恭帝|赵㬎
sl-tenure-ssong-duanzong|宋端宗|赵昰
sl-tenure-ssong-modi|宋末帝|赵昺
ymq-tenure-temujin|成吉思汗|铁木真
ymq-tenure-ogedei|大汗|窝阔台
ymq-tenure-mongke|大汗|蒙哥
ymq-tenure-kublai|元世祖|忽必烈
ymq-tenure-ming-hongwu|洪武帝|朱元璋
ymq-tenure-ming-jianwen|建文帝|朱允炆
ymq-tenure-ming-yongle|永乐帝|朱棣
ymq-tenure-ming-hongxi|洪熙帝|朱高炽
ymq-tenure-ming-xuande|宣德帝|朱瞻基
ymq-tenure-ming-zhengtong|正统帝|朱祁镇
ymq-tenure-ming-jingtai|景泰帝|朱祁钰
ymq-tenure-ming-tianshun|天顺帝|朱祁镇
ming-tenure-ming-chenghua|成化帝|朱见深
ymq-tenure-ming-hongzhi|弘治帝|朱祐樘
ming-tenure-ming-zhengde|正德帝|朱厚照
ymq-tenure-ming-jiajing|嘉靖帝|朱厚熜
ming-tenure-ming-longqing|隆庆帝|朱载坖
ymq-tenure-ming-wanli|万历帝|朱翊钧
ming-tenure-ming-taichang|泰昌帝|朱常洛
ming-tenure-ming-tianqi|天启帝|朱由校
ymq-tenure-ming-chongzhen|崇祯帝|朱由检
ymq-tenure-toghon-temur-ny|北元惠宗|妥懽贴睦尔
ming-tenure-ny-esen||也先
ming-tenure-ny-altan||俺答汗
ymq-tenure-dashun-lizicheng|永昌帝|李自成
ming-tenure-daxi-zhangxianzhong||张献忠
ymq-tenure-sming-hongguang|弘光帝|朱由崧
ming-tenure-sming-longwu|隆武帝|朱聿键
ming-tenure-sming-luwang|鲁王监国|朱以海
ymq-tenure-sming-yongli|永历帝|朱由榔
ming-tenure-zheng-chenggong|延平王|郑成功
ming-tenure-zheng-jing|延平王|郑经
ming-tenure-zheng-keshuang|延平王|郑克塽
ymq-tenure-qing-nurhaci|天命汗|努尔哈赤
ymq-tenure-qing-hongtaiji|清太宗|皇太极
`.trim().split('\n').map(line => line.split('|'));
const byTenure = new Map(labels.map(([id,shortTitle,personalName]) => [id,{shortTitle,personalName}]));
if (byTenure.size !== labels.length) throw new Error('Duplicate explicit dynasty tenure display ID');

const group = (id,name,stateIds,note) => ({id,name,stateIds,note});
const sharedNote = '仅共用展示行；原政权、任期、日期、来源与实体ID不变，同年及实际重叠均分层，不裁剪区间。筛选、详情及导出仍按原实体。';
const rowGroups = {
  'wei-jin-nan-bei':[
    group('two-jin-succession','两晋接续',['western-jin','eastern-jin'],'西晋 → 东晋接续；不把同时期十六国纳入两晋行。'),
    group('southern-dynasties-succession','南朝接续',['liu-song','southern-qi','southern-liang-dynasty','southern-chen'],'宋 → 齐 → 梁 → 陈接续；与北朝及十六国分别显示。'),
    group('northern-eastern-succession','北魏—东魏—北齐',['northern-wei','eastern-wei','northern-qi'],'北魏分裂后，东魏 → 北齐为其中一条分支；此处共行不表示东魏为北魏唯一继承者。西魏与北周分支另行，绝不合并为同一政权。'),
    group('northern-western-succession','西魏—北周—隋',['western-wei','northern-zhou','sui'],'西魏 → 北周 → 隋接续；保留与东魏、北齐及南朝的并立。')
  ],
  'sui-tang':[
    group('sui-tang-succession','隋唐接续',['sui','tang'],'隋 → 唐共用主行；唐原始存续区间完整保留，武周另行，690—705年的真实重叠不折叠。陈、隋末群雄、吐蕃、安史燕与黄巢齐均另行。')
  ],
  'liao-jin-song':[
    group('song-succession','两宋接续',['northern-song','southern-song'],'北宋 → 南宋接续；辽、西辽、金、西夏、大理及蒙古/元均按并存政权另行，不拼成辽金宋单一接续行。')
  ],
  ming:[
    group('ming-succession','明与南明延续',['ming','southern-ming'],'明 → 南明（原实体已含明郑）接续；南明诸任期之间的并存完整分层。北元、后金/清、大顺与大西均另行。')
  ]
};

/**
 * Add display annotations to a caller-owned compileAtlas projection and return it.
 * Authoring JSON is not accepted or modified. Unknown dataset IDs are a no-op.
 * Unknown tenure IDs fail closed rather than guessing titles from personal names.
 */
export function annotateDynastyDisplay(data,id) {
  if (!Object.hasOwn(rowGroups,id)) return data;
  const records = [...data.tenures,...data.states.flatMap(state => state.rulers)];
  // Validate before writing so a newly introduced tenure cannot leave half an annotation.
  for (const tenure of records) {
    if (!byTenure.has(tenure.id)) throw new Error('Missing explicit dynasty tenure display: '+tenure.id);
  }
  for (const tenure of records) tenure.display = {...tenure.display,...byTenure.get(tenure.id)};
  data.presentation = {...data.presentation,version:1,rowGroups:rowGroups[id].map(definition => ({
    ...definition,stateIds:[...definition.stateIds],note:definition.note+sharedNote
  }))};
  return data;
}
