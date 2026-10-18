(function(Zhou){
 'use strict';
 // Rows are keyed independently of their position; moving a row preserves its subtree.
 Zhou.createTimelineDOM=function(container,document){
  const items=new Map();
  return function reconcile(descriptors){
   const wanted=new Set(descriptors.map(item=>item.key));
   for(const [key,item] of items)if(!wanted.has(key)){container.removeChild(item.node);items.delete(key);}
   descriptors.forEach((descriptor,index)=>{
    let item=items.get(descriptor.key);
    if(!item||item.html!==descriptor.html){
     const template=document.createElement('template');template.innerHTML=descriptor.html;
     const node=template.content.firstElementChild;
     if(item)container.replaceChild(node,item.node);
     item={node,html:descriptor.html};items.set(descriptor.key,item);
    }
    if(container.children[index]!==item.node)container.insertBefore(item.node,container.children[index]||null);
    descriptor.update?.(item.node);
   });
  };
 };
})(globalThis.Zhou ||= {});
