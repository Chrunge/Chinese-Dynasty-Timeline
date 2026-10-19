(function(root){
 'use strict';
 const Zhou=root.Zhou||(root.Zhou={});
 // Resolve storage lazily: merely accessing localStorage can throw in file/private contexts.
 Zhou.createStorage=function(getStorage,namespace=''){
  const scoped=key=>namespace?namespace+':'+key:key;
  return {
   read(key,fallback){try{const raw=getStorage().getItem(scoped(key));return raw===null?fallback:JSON.parse(raw);}catch{return fallback;}},
   write(key,value){try{getStorage().setItem(scoped(key),JSON.stringify(value));return true;}catch{return false;}}
  };
 };
})(globalThis);
