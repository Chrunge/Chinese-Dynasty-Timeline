(function(root){
 'use strict';
 const Zhou=root.Zhou||(root.Zhou={});
 // Resolve storage lazily: merely accessing localStorage can throw in file/private contexts.
 Zhou.createStorage=function(getStorage){
  return {
   read(key,fallback){try{const raw=getStorage().getItem(key);return raw===null?fallback:JSON.parse(raw);}catch{return fallback;}},
   write(key,value){try{getStorage().setItem(key,JSON.stringify(value));return true;}catch{return false;}}
  };
 };
})(globalThis);
