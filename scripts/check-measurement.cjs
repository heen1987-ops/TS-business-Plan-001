const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const impact=require('../src/impact.json'),m=require('../src/measurement-data.cjs'),depts=require('../src/data.json').departments,{getDeck}=require('../src/slide-data.cjs');
const expected=Object.values(impact.departments).flatMap(d=>d.metrics);
assert.equal(expected.length,39);assert.deepEqual(Object.keys(m.metrics).sort(),expected.map(x=>x.id).sort());
for(const item of expected){
 const p=m.metrics[item.id];
 assert.equal(p.formula,item.formula);assert.equal(p.target,item.target);assert.equal(p.mode,item.mode);
 for(const key of ['baseline','observed','requiredSample'])assert.equal(p[key],null,item.id+' 미실측 상태 보존');
 for(const [key]of m.fields)assert.ok(typeof p[key]==='string'&&p[key].trim().length>4,item.id+' '+key);
 assert.ok(p.profile.uncertainty&&p.profile.missing);
 const d=depts.find(d=>d.code===p.code);
 const deck=getDeck(d.folder+'/01_사업정의.html?view=impact&metric='+p.id);
 for(let i=1;i<=4;i++)assert.ok(deck.slides.some(s=>s.id===p.id+'-method-'+i),'측정명세 진입 '+p.id);
 const text=deck.slides.flatMap(s=>s.cards.flatMap(c=>c.bullets)).join('\n');
 assert.ok(text.includes(p.population));assert.ok(text.includes(p.evidence));assert.ok(text.includes(p.profile.uncertainty));
}
assert.equal(m.metrics['DF-E01'].type,'ratio');assert.ok(m.metrics['DF-E01'].exceptions.includes('미추적'));
assert.equal(m.metrics['MR-E02'].type,'elapsed');assert.ok(m.metrics['MR-E02'].profile.uncertainty.includes('추정불가'));
assert.equal(m.metrics['QE-E02'].mode,'point');assert.equal(m.metrics['DV-E01'].type,'density');assert.equal(m.metrics['SI-E01'].type,'count');
const base=path.resolve(__dirname,'../dist/downloads');
for(const file of ['TS_정량평가_측정명세.md','TS_정량평가_측정명세.json','TS_정량평가_결과기록표.csv'])assert.ok(fs.existsSync(path.join(base,file)));
const result=fs.readFileSync(path.join(base,'TS_정량평가_결과기록표.csv'),'utf8').trim().replace(/^\ufeff/,'').split(/\r?\n/);
assert.equal(result.length,118); // 헤더 + 지표 39개 × 3개 군의 빈 기록행
assert.ok(result.slice(1).every(row=>row.split(',').slice(5).every(v=>v==='""')),'실측 수치를 기록표에 생성하지 않음');
const exported=JSON.parse(fs.readFileSync(path.join(base,'TS_정량평가_측정명세.json'),'utf8'));
assert.deepEqual(exported.metrics,m.metrics,'화면과 다운로드의 동일 명세');
assert.deepEqual(exported.rubrics,m.rubrics);assert.equal(exported.scoreGuide,m.scoreGuide);assert.ok(m.scoreGuide.includes('0점이 아닌 결측'));
assert.ok(m.metrics['AD-E03'].aggregation.includes('재현 시도 세션 수'));assert.ok(m.metrics['RD-E02'].aggregation.includes('재현 시도 수'));
assert.ok(m.metrics['DV-E01'].profile.uncertainty.includes('1−U'));assert.ok(m.resultColumns.includes('A효과95CI하한')&&m.resultColumns.includes('B효과95CI하한'));
console.log(JSON.stringify({result:'통과',metric_protocols:39,measurement_sections:156,blank_result_rows:117,actual_measurements:0}));
