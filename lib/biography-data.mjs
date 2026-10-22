// A data-only projection; runtime algorithms are maintained in src/core/biography.js.
const topicToFile={"xia-shang":"xia-shang.json","zhou":"zhou.json","qin-han":"qin-han.json","three-kingdoms":"three-kingdoms.json","wei-jin-nan-bei":"wei-jin-nanbeichao.json","sui-tang":"sui-tang.json","five-dynasties":"wudai-shiguo.json","liao-jin-song":"song-liao-jin.json","yuan":"yuan.json","ming":"ming.json","qing":"qing.json"};
export function projectBiographyBook(book){
 if(!Array.isArray(book?.dynasties))throw new TypeError('传记总集缺少 dynasties');
 const dynasties=book.dynasties.map(d=>({datasetFile:d.datasetFile,figures:d.figures.map(f=>({
  id:f.id,name:f.name,role:f.role,summary:f.summary,biographyPlan:f.biographyPlan,
  servedMonarchs:f.servedMonarchs||[],associatedPolities:f.associatedPolities||[],stageActivities:f.stageActivities||[],sources:f.sources||[]
 }))}));
 return {topicToFile,dynasties};
}
