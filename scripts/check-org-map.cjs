const assert=require('node:assert/strict');
const {nodes,parents,ancestry,proposals,documents,departmentByCode,edgeKind}=require('../src/org-map-data.cjs');
const {routes}=require('../site-routes.json');
const found=new Set();
for(const node of Object.values(nodes)){
 const chain=ancestry(node.id);assert.equal(chain[0].id,'TS');assert.equal(new Set(chain.map(x=>x.id)).size,chain.length,'순환 조직: '+node.id);
 for(const child of node.children)assert.equal(parents[child.id],node.id);
 if(node.code){assert(!found.has(node.code));found.add(node.code);assert.equal(documents(node).length,6);assert.equal(departmentByCode[node.code].name,node.name);}
 for(const link of documents(node)){assert(routes.includes(link.to.split('?')[0]),'없는 페이지: '+link.to);assert(!/undefined|null/.test(link.to));}
}
assert.equal(found.size,13);assert.equal(proposals(nodes.TS).length,13);
assert.deepEqual(ancestry('DF').map(n=>n.id),['TS','mobility','mobility-lab','DF']);
assert.deepEqual(ancestry('AD').map(n=>n.id),['TS','inspection','advanced-center','AD']);
assert.equal(parents.KATRI,'TS');assert.equal(nodes['KA-01'].kind,'case');
assert.equal(nodes.field.kind,'group');assert.equal(parents['audit-office'],'audit');assert(!ancestry('audit-dept').some(n=>n.id==='chair'));
assert.equal(edgeKind(nodes.field,nodes.regions),'related');assert.equal(edgeKind(nodes.chair,nodes['ai-strategy']),'related');assert.equal(edgeKind(nodes.KATRI,nodes['KA-01']),'related');assert.equal(edgeKind(nodes['mobility-lab'],nodes.DF),'organization');
assert.equal(proposals(nodes.mobility).length,8);assert.equal(proposals(nodes.inspection).length,5);
console.log(JSON.stringify({result:'통과',navigation_nodes:Object.keys(nodes).length,connected_departments:found.size,document_links:Object.values(nodes).reduce((n,v)=>n+documents(v).length,0),orphan_nodes:0,cycles:0}));
