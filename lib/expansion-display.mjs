// Display-only additions to compiled projections. Every binding is a tenure ID,
// not a name/person lookup; blank titles retain attested names without invention.
const labels = `
xs-tenure-xia-01-yu||禹
xs-tenure-xia-02-qi||启
xs-tenure-xia-03-taikang||太康
xs-tenure-xia-04-zhongkang||仲康
xs-tenure-xia-05-xiang||相
xs-tenure-yq-houyi||后羿
xs-tenure-yq-hanzhuo||寒浞
xs-tenure-xia-06-shaokang||少康
xs-tenure-xia-07-zhu||予
xs-tenure-xia-08-huai||槐
xs-tenure-xia-09-mang||芒
xs-tenure-xia-10-xie||泄
xs-tenure-xia-11-bujiang||不降
xs-tenure-xia-12-jiong||扃
xs-tenure-xia-13-jin||廑
xs-tenure-xia-14-kongjia||孔甲
xs-tenure-xia-15-gao||皋
xs-tenure-xia-16-fa||发
xs-tenure-xia-17-jie||桀
xs-tenure-shang-01-tang||汤
xs-tenure-shang-02-waibing||外丙
xs-tenure-shang-03-zhongren||仲壬
xs-tenure-shang-04-taijia||太甲
xs-tenure-shang-05-woding||沃丁
xs-tenure-shang-06-taigeng||太庚
xs-tenure-shang-07-xiaojia||小甲
xs-tenure-shang-08-yongji||雍己
xs-tenure-shang-09-taiwu||太戊
xs-tenure-shang-10-zhongding||仲丁
xs-tenure-shang-11-wairen||外壬
xs-tenure-shang-12-hedanjia||河亶甲
xs-tenure-shang-13-zuyi||祖乙
xs-tenure-shang-14-zuxin||祖辛
xs-tenure-shang-15-wojia||沃甲
xs-tenure-shang-16-zuding||祖丁
xs-tenure-shang-17-nangeng||南庚
xs-tenure-shang-18-yangjia||阳甲
xs-tenure-shang-19-pangeng||盘庚
xs-tenure-shang-20-xiaoxin||小辛
xs-tenure-shang-21-xiaoyi||小乙
xs-tenure-shang-22-wuding||武丁
xs-tenure-shang-23-zugeng||祖庚
xs-tenure-shang-24-zujia||祖甲
xs-tenure-shang-25-linxin||廪辛
xs-tenure-shang-26-gengding||庚丁
xs-tenure-shang-27-wuyi||武乙
xs-tenure-shang-28-wending||文丁
xs-tenure-shang-29-diyi||帝乙
xs-tenure-shang-30-dixin||帝辛
xs-tenure-zhou-taiwang|周太王|古公亶父
xs-tenure-zhou-jili|王季|季历
xs-tenure-zhou-wenwang|周文王|姬昌
zhou-r0|周武王|姬发
sl-tenure-liang-taizu|后梁太祖|朱温
wd-tenure-liang-yougui|郢王|朱友珪
sl-tenure-liang-modi|后梁末帝|朱友贞
sl-tenure-tang-zhuangzong|后唐庄宗|李存勖
sl-tenure-tang-mingzong|后唐明宗|李嗣源
wd-tenure-tang-mindi|后唐愍帝|李从厚
sl-tenure-tang-modi|后唐末帝|李从珂
sl-tenure-jin-gaozu|后晋高祖|石敬瑭
sl-tenure-jin-chudi|后晋出帝|石重贵
sl-tenure-han-gaozu|后汉高祖|刘知远
sl-tenure-han-yindi|后汉隐帝|刘承祐
sl-tenure-zhou-taizu|后周太祖|郭威
sl-tenure-zhou-shizong|后周世宗|柴荣
sl-tenure-zhou-gongdi|后周恭帝|柴宗训
wd-tenure-wu-yangxingmi|吴王|杨行密
wd-tenure-wu-yangwo|弘农郡王|杨渥
wd-tenure-wu-yanglongyan|吴国王|杨隆演
wd-tenure-wu-yangpu|吴睿帝|杨溥
sl-tenure-stang-libian|南唐烈祖|李昪
wd-tenure-stang-lijing|南唐元宗|李璟
sl-tenure-stang-liyu|南唐后主|李煜
sl-tenure-wuyue-qianliu|武肃王|钱镠
wd-tenure-wuyue-yuanguan|文穆王|钱元瓘
wd-tenure-wuyue-hongzuo|忠献王|钱弘佐
wd-tenure-wuyue-hongzong|忠逊王|钱弘倧
sl-tenure-wuyue-qianchu|忠懿王|钱俶
sl-tenure-fshu-wangjian|前蜀高祖|王建
wd-tenure-fshu-wangyan|前蜀后主|王衍
wd-tenure-lshu-mengzhixiang|后蜀高祖|孟知祥
sl-tenure-lshu-mengchang|后蜀后主|孟昶
wd-tenure-shan-liuyan|南汉高祖|刘龑
wd-tenure-shan-liubin|南汉殇帝|刘玢
wd-tenure-shan-liusheng|南汉中宗|刘晟
wd-tenure-shan-liuchang|南汉后主|刘鋹
wd-tenure-chu-mayin|楚武穆王|马殷
wd-tenure-chu-maxisheng||马希声
wd-tenure-chu-maxifan|楚文昭王|马希范
wd-tenure-chu-maxiguang|楚废王|马希广
wd-tenure-chu-maxie|楚恭孝王|马希萼
wd-tenure-chu-maxichong||马希崇
wd-tenure-min-shenzhi|闽王|王审知
wd-tenure-min-yanhan|闽嗣王|王延翰
wd-tenure-min-yanjun|闽惠宗|王延钧
wd-tenure-min-jipeng|闽康宗|王继鹏
wd-tenure-min-yanxi|闽景宗|王延羲
wd-tenure-min-yanzheng|闽天德帝|王延政
wd-tenure-jn-gaojixing|武信王|高季兴
wd-tenure-jn-gaoconghui|文献王|高从诲
wd-tenure-jn-gaobaorong|贞懿王|高保融
wd-tenure-jn-gaobaoxu||高保勖
wd-tenure-jn-gaojichong||高继冲
sl-tenure-nhan-liuchong|北汉世祖|刘崇
wd-tenure-nhan-liuchengjun|北汉睿宗|刘承钧
wd-tenure-nhan-liujien|北汉少主|刘继恩
sl-tenure-nhan-liujiyuan|北汉英武帝|刘继元
sl-tenure-liao-taizu|辽太祖|耶律阿保机
sl-tenure-liao-taizong|辽太宗|耶律德光
sl-tenure-nsong-taizu|宋太祖|赵匡胤
sl-tenure-nsong-taizong|宋太宗|赵光义
ymq-tenure-temujin|成吉思汗|铁木真
yuan-tenure-tolui|监国|拖雷
ymq-tenure-ogedei|元太宗|窝阔台
yuan-tenure-toregene|称制皇后|乃马真后
yuan-tenure-guyuk|元定宗|贵由
yuan-tenure-qaimish|称制皇后|海迷失后
ymq-tenure-mongke|元宪宗|蒙哥
ymq-tenure-kublai|元世祖|忽必烈
ymq-tenure-temur|元成宗|铁穆耳
yuan-tenure-haishan|元武宗|海山
ymq-tenure-ayurbarwada|元仁宗|爱育黎拔力八达
yuan-tenure-shidebala|元英宗|硕德八剌
yuan-tenure-yesun-temur|泰定帝|也孙铁木儿
yuan-tenure-ragibagh|天顺帝|阿速吉八
yuan-tenure-wenzong-1|元文宗（初任）|图帖睦尔
yuan-tenure-kusala|元明宗|和世琜
yuan-tenure-wenzong-2|元文宗（复辟）|图帖睦尔
yuan-tenure-rinchinbal|元宁宗|懿璘质班
ymq-tenure-toghon-temur|元顺帝|妥懽贴睦尔
yuan-tenure-xushouhui||徐寿辉
yuan-tenure-zhangshicheng||张士诚
ymq-tenure-han-liner|小明王|韩林儿
ymq-tenure-chen-youliang||陈友谅
yuan-tenure-mingyuzhen|明夏太祖|明玉珍
yuan-tenure-zhuyuanzhang-wu||朱元璋
ymq-tenure-qing-nurhaci|天命汗|努尔哈赤
ymq-tenure-qing-hongtaiji|清太宗|皇太极
ymq-tenure-qing-shunzhi|顺治帝|福临
ymq-tenure-qing-kangxi|康熙帝|玄烨
ymq-tenure-qing-yongzheng|雍正帝|胤禛
ymq-tenure-qing-qianlong|乾隆帝|弘历
ymq-tenure-qing-jiaqing|嘉庆帝|颙琰
ymq-tenure-qing-daoguang|道光帝|旻宁
ymq-tenure-qing-xianfeng|咸丰帝|奕詝
ymq-tenure-qing-tongzhi|同治帝|载淳
ymq-tenure-qing-guangxu|光绪帝|载湉
ymq-tenure-qing-xuantong|宣统帝|溥仪
ymq-tenure-ming-chongzhen|崇祯帝|朱由检
ymq-tenure-dashun-lizicheng|永昌帝|李自成
ming-tenure-zheng-chenggong|延平王|郑成功
qing-tenure-wuzhou-wusangui||吴三桂
qing-tenure-dzungar-galdan||噶尔丹
qing-tenure-dzungar-tseren|浑台吉|噶尔丹策零
qing-tenure-taiping-hongxiuquan|天王|洪秀全
`.trim().split('\n').map(line => line.split('|'));
const byTenure = new Map(labels.map(([id,shortTitle,personalName]) => [id,{shortTitle,personalName}]));
if (byTenure.size !== labels.length) throw new Error('Duplicate explicit expansion tenure display ID');
// Scoped to the current volume: an ID collision with another volume is not
// permission to share labels or merge entities. No name parsing or inference.
const polityNames = {
  'xia-shang': {
    xia:'夏','youqiong-han':'有穷',shang:'商','ancient-shu':'古蜀','guifang-qiang':'鬼方',zhou:'周'
  },
  'five-dynasties': {
    'later-liang':'后梁','later-tang':'后唐','later-jin':'后晋','later-han':'后汉','later-zhou':'后周',
    'wu-yang':'杨吴',wuyue:'吴越','former-shu':'前蜀','ma-chu':'马楚',min:'闽',
    'southern-han':'南汉',jingnan:'荆南','later-shu':'后蜀','southern-tang':'南唐','northern-han':'北汉',
    liao:'辽','northern-song':'北宋'
  },
  yuan: {
    'mongol-yuan':'元','western-xia':'西夏','jin-jurchen':'金',dali:'大理','southern-song':'南宋',
    'tianwan-xu':'徐宋','zhang-zhou':'张周','red-turban-song':'韩宋','chen-han':'陈汉','ming-xia':'明夏',ming:'明'
  },
  qing: {
    'later-jin-qing':'清',ming:'明',dashun:'大顺','southern-ming':'南明','wu-zhou':'吴周',
    dzungar:'准噶尔',taiping:'太平天国'
  }
};
const sharedNote = '仅共用展示行，实体ID不变；原名称、日期、来源及关系不变，同年及真实重叠保留分层，不裁日期；筛选、详情与导出仍按原实体。';
const rowGroups = {
  'xia-shang': [{id:'xia-shang-succession',name:'夏商接续',stateIds:['xia','shang'],
    note:'夏 → 商共行；有穷/寒浞与夏的并存另行保留，古蜀、鬼方/羌方、周方邦均另行。不据展示分组裁定夏商年代异说。'}],
  'five-dynasties': [
    {id:'five-dynasties-song-succession',name:'五代—北宋接续',stateIds:['later-liang','later-tang','later-jin','later-han','later-zhou','northern-song'],
      note:'后梁 → 后唐 → 后晋 → 后汉 → 后周 → 北宋接续；辽与十国均不归入主行。'},
    {id:'wu-southern-tang-succession',name:'杨吴—南唐接续',stateIds:['wu-yang','southern-tang'],
      note:'杨吴 → 南唐接续；吴越、前蜀、后蜀、马楚、闽、南汉、荆南与北汉各按并立政权另行。'}
  ],
  yuan: [],
  qing: [{id:'qing-volume-ming-succession',name:'明与南明延续',stateIds:['ming','southern-ming'],
    note:'明 → 南明（原实体已含明郑东宁）接续；与后金/清、大顺、吴周、准噶尔、太平天国分行。清朝原实体跨后金/大清，不拆分或合并身份。'}]
};

/** Annotate a caller-owned compiled projection; never pass authoring JSON.
 * Unknown topics are identity no-ops; unknown tenure/polity IDs fail before writes.
 * All additions are display metadata, not a chronology or historical correction.
 */
export function annotateExpansionDisplay(data,id) {
  if (!Object.hasOwn(rowGroups,id)) return data;
  const records = [...data.tenures,...data.states.flatMap(state => state.rulers)];
  for (const tenure of records) {
    if (!byTenure.has(tenure.id)) throw new Error('Missing explicit expansion tenure display: '+tenure.id);
  }
  for (const polity of [...data.states,...data.polities]) {
    if (!Object.hasOwn(polityNames[id],polity.id)) throw new Error('Missing explicit expansion polity display: '+polity.id);
  }
  for (const tenure of records) tenure.display = {...tenure.display,...byTenure.get(tenure.id)};
  // New wrappers and deep-copied display objects also separate aliased state /
  // polity projections. Existing unrelated metadata is retained, not shared.
  const named = polity => ({...polity,display:{...structuredClone(polity.display || {}),shortName:polityNames[id][polity.id]}});
  data.states = data.states.map(named);
  data.polities = data.polities.map(named);
  data.presentation = {...data.presentation,version:1,rowGroups:rowGroups[id].map(group => ({
    ...group,stateIds:[...group.stateIds],note:group.note+sharedNote
  }))};
  return data;
}
