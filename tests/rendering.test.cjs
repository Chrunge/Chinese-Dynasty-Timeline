const assert=require('node:assert/strict');
const {boot}=require('./helpers/browser.cjs');

for(const width of [1200,390]){
 const app=boot({},width),{run,el,action}=app,chart=el('#chart');
 const row=id=>chart.children.find(node=>node.dataset.state===id);
 const axis=()=>chart.children.find(node=>node.className==='axis');
 const cursor=()=>chart.children.find(node=>node.className==='cursorline');
 run("selected=new Set(['qin','qi','chu']);render();vp.scrollLeft=700;vp.scrollTop=90");
 const originals=new Map(['qin','qi','chu'].map(id=>[id,row(id)])),initialAxis=axis(),initialCursor=cursor(),writes=chart.innerHTMLWrites;
 assert.equal(chart.children.filter(node=>node.dataset.state).length,3);assert(axis());assert(cursor()); // Disclosure is a separate keyed footer, not a polity row.
 // This tracks row generation, not just DOM equality: cursor/list changes should
 // avoid ruler packing and event grouping entirely.
 run('globalThis.rowBuilds=0;globalThis.originalPackRulers=packRulers;packRulers=function(s){rowBuilds++;return originalPackRulers(s)}');
 run('setCursor(450);render();searchLimit=36;render()');
 assert.equal(run('rowBuilds'),0);
 for(const [id,node] of originals)assert.strictEqual(row(id),node);
 assert.strictEqual(axis(),initialAxis);assert.strictEqual(cursor(),initialCursor);
 assert.equal(cursor().firstChild.textContent,'前450');assert.equal(cursor().style.left,run('(1046-450)*px+labelWidth()')+'px');
 assert.equal(el('#viewport').scrollLeft,700);assert.equal(el('#viewport').scrollTop,90);
 assert.equal(chart.innerHTMLWrites,writes,'renders must not replace the chart container contents');

 const oldQin=row('qin'),oldHTML=oldQin.outerHTML;
 run("category='改革';render()");
 assert(run('rowBuilds')>0);assert.notEqual(row('qin').outerHTML,oldHTML);assert.notStrictEqual(row('qin'),oldQin);assert.equal(oldQin.isConnected,false);
 assert.strictEqual(axis(),initialAxis);assert.strictEqual(cursor(),initialCursor);
 // Sorting moves intact rows; their children and delegated actions stay attached.
 const sortedNodes=new Map(['qin','qi','chu'].map(id=>[id,row(id)]));
 run("stateOrder=['chu','qi','qin',...D.states.map(s=>s.id).filter(id=>!['chu','qi','qin'].includes(id))];render()");
 assert.deepEqual(chart.children.filter(node=>node.dataset.state).map(node=>node.dataset.state),['chu','qi','qin']);
 for(const [id,node] of sortedNodes)assert.strictEqual(row(id),node);
 const unpinnedQi=row('qi');run("togglePin('qi')");
 assert.equal(chart.children[1].dataset.state,'qi');assert(row('qi').className.includes('pinnedRow'));assert.notStrictEqual(row('qi'),unpinnedQi);
 assert.strictEqual(row('qin'),sortedNodes.get('qin'));assert.strictEqual(row('chu'),sortedNodes.get('chu'));
 const pinnedQi=row('qi');run("stateOrder=['qin','qi','chu',...D.states.map(s=>s.id).filter(id=>!['chu','qi','qin'].includes(id))];render()");
 assert.strictEqual(row('qi'),pinnedQi);
 const removed=row('chu');run("selected.delete('chu');render()");
 assert.equal(row('chu'),undefined);assert.equal(removed.isConnected,false);assert(!chart.innerHTML.includes('data-state="chu"'));
 action('state','qin');assert.equal(run('navigation.key'),'country:qin');el('#close').onclick();

 run("pinned.clear();selected.clear();render()");
 assert.equal(chart.children.filter(node=>node.dataset.state).length,0);assert(chart.children.some(node=>node.className==='empty'));assert.strictEqual(cursor(),initialCursor);
 run("selected.add('qin');render()");assert(row('qin'));assert(!chart.children.some(node=>node.className==='empty'));
 const priorAxis=axis(),priorRow=row('qin');run('px=8;render()');
 assert.notStrictEqual(axis(),priorAxis);assert.notStrictEqual(row('qin'),priorRow);assert.strictEqual(cursor(),initialCursor);
 // Focus uses the same event relations while changing the affected row content.
 action('event','e91');assert(chart.className.includes('hasFocus'));assert(chart.innerHTML.includes('eventRelated'));assert(chart.innerHTML.includes('eventYearShade'));assert(chart.innerHTML.includes('linkedEvent'));
 assert.equal(chart.innerHTMLWrites,writes);
}
console.log('PASS rendering: keyed row identity, cursor/list render cache, category updates, sorting and pins, removal, empty state, zoom, event focus, delegated detail actions, desktop/mobile.');
