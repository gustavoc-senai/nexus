import test from 'node:test'
import assert from 'node:assert/strict'
import { validDraft, recommendMission } from '../src/lib/learning.ts'
import { rotatePoint, solidMesh } from '../src/lib/solidMesh.ts'
import { missions } from '../src/services/missions.ts'
import { explorerGroups, baseSides, isPrism, isPyramid } from '../src/lib/explorerCatalog.ts'
const draft = { step: 2, answer: null, numericInput: '1,5', notes: 'V = A × h', checked: false, correct: 1, mistakes: [0], responses: [2, 4], hints: 2, updatedAt: '2026-10-08T10:00:00Z' }
test('resume accepts complete drafts and rejects corrupted or out-of-range data', () => {
  assert.equal(validDraft(draft, 6), true)
  for (const invalid of [null, [], { ...draft, step: 6 }, { ...draft, step: -1 }, { ...draft, correct: 3 }, { ...draft, responses: [Infinity] }, { ...draft, mistakes: [9] }, { ...draft, notes: 'x'.repeat(4001) }, { ...draft, hints: 4 }]) assert.equal(validDraft(invalid, 6), false)
})
test('recommendations prioritize latest low accuracy without suggesting locked sectors', () => {
  const attempt = (missionId, correct) => ({ missionId, correct, total: 6, date: '2026-10-08' })
  const completed = new Set(['energia'])
  assert.equal(recommendMission(missions, [], new Set()).mission.id, 'energia')
  assert.equal(recommendMission(missions, [attempt('energia', 4)], completed).review, true)
  assert.equal(recommendMission(missions, [attempt('energia', 4), attempt('energia', 6)], completed).mission.id, 'hangar')
  assert.equal(recommendMission(missions, [attempt('oficina', 0)], completed).mission.id, 'hangar')
})
test('3D rotation preserves lengths and applies a right-angle rotation correctly', () => {
  const rotated = rotatePoint([1, 0, 0], 90, 0)
  assert.ok(Math.abs(rotated[0]) < 1e-10); assert.ok(Math.abs(rotated[2] + 1) < 1e-10)
  const p = [1.5, -2, 0.7], result = rotatePoint(p, 147, 38)
  assert.ok(Math.abs(Math.hypot(...p) - Math.hypot(...result)) < 1e-10)
})
test('meshes have correct face counts, coplanar rectangular faces and finite geometry', () => {
  assert.equal(solidMesh('cube').length, 6); assert.equal(solidMesh('prism').length, 6); assert.equal(solidMesh('pyramid').length, 5)
  assert.equal(solidMesh('cylinder').filter(f => f.kind === 'base' || f.kind === 'top').length, 2)
  assert.equal(solidMesh('cone').filter(f => f.kind === 'base').length, 1)
  for (const shape of ['cube','prism','pyramid','cylinder','cone','sphere']) for (const face of solidMesh(shape)) assert.ok(face.points.every(p => p.length === 3 && p.every(Number.isFinite)))
})
test('expanded polyhedra are closed, satisfy Euler and have the expected topology', () => {
  const counts = { tetrahedron:[4,6,4],octahedron:[8,12,6],icosahedron:[20,30,12],dodecahedron:[12,30,20] }
  for(const shape of explorerGroups.flatMap(group=>group.shapes).filter(s=>!['sphere','cylinder','cone'].includes(s))) {
    const mesh=solidMesh(shape),vertices=new Set(),edges=new Map()
    for(const face of mesh) {
      assert.ok(face.points.every(p=>p.every(Number.isFinite)))
      for(let i=0;i<face.points.length;i++) {
        const a=face.points[i].join(','),b=face.points[(i+1)%face.points.length].join(',');vertices.add(a)
        const edge=[a,b].sort().join('|');edges.set(edge,(edges.get(edge)??0)+1)
      }
    }
    assert.ok([...edges.values()].every(n=>n===2),shape+' must have exactly two faces at every edge')
    assert.equal(vertices.size-edges.size+mesh.length,2,shape+' Euler relation')
    const n=baseSides(shape), expected=counts[shape]??(isPrism(shape)?[n+2,3*n,2*n]:isPyramid(shape)?[n+1,2*n,n+1]:null)
    assert.deepEqual([mesh.length,edges.size,vertices.size],expected,shape)
    if(shape==='dodecahedron')assert.ok(mesh.every(f=>f.points.length===5))
    if(['tetrahedron','octahedron','icosahedron','dodecahedron'].includes(shape)) {
      const lengths=mesh.flatMap(f=>f.points.map((p,i)=>Math.hypot(...p.map((v,j)=>v-f.points[(i+1)%f.points.length][j]))))
      assert.ok(Math.max(...lengths)-Math.min(...lengths)<1e-9,shape+' must have equal edges')
    }
  }
})


test('laboratory measurements distinguish base apothem, slant height and perpendicular height', async () => {
 const {solidMeasures}=await import('../src/lib/solidMeasures.ts')
 const p=solidMeasures('pyramid',10,12,4)
 assert.equal(p.apothem,5);assert.equal(p.slant,13);assert.equal(p.base,100);assert.equal(p.lateral,260);assert.equal(p.total,360);assert.equal(p.volume,400)
 const box=solidMeasures('prism',6,8,4)
 assert.equal(box.apothem,null);assert.equal(box.base,24);assert.equal(box.lateral,160);assert.equal(box.total,208);assert.equal(box.volume,192)
 const hex=solidMeasures('prism-hexagonal',6,10,4)
 assert.ok(Math.abs(hex.apothem-3*Math.sqrt(3))<1e-10);assert.ok(Math.abs(hex.base-54*Math.sqrt(3))<1e-10)
 const cone=solidMeasures('cone',3,4,4)
 assert.equal(cone.slant,5);assert.equal(cone.volume,12*Math.PI)
 for(const shape of ['octahedron','dodecahedron','icosahedron','tetrahedron','sphere','cube']) { const a=solidMeasures(shape,2,4,4), b=solidMeasures(shape,4,8,8);assert.ok(Math.abs(b.total/a.total-4)<1e-9);assert.ok(Math.abs(b.volume/a.volume-8)<1e-9) }
 for(const value of [0,-1,NaN,Infinity,10001]) assert.equal(solidMeasures('cube',value,8,4),null)
})


test('basic math has 12 distinct eight-question activities with verified arithmetic', async()=>{
 const {basicMissions}=await import('../src/services/basicMath.ts')
 const expected={
  'basic-addition-1':[2,3,4,5,5,6,7,8], 'basic-addition-2':[13,15,19,19,23,30,25,35], 'basic-addition-3':[45,61,65,92,125,193,375,615],
  'basic-subtraction-1':[1,2,2,2,4,3,5,0], 'basic-subtraction-2':[7,8,9,14,16,18,18,23], 'basic-subtraction-3':[26,34,45,63,119,165,232,335],
  'basic-multiplication-1':[2,4,6,8,10,9,12,20], 'basic-multiplication-2':[12,21,32,30,42,56,72,90], 'basic-multiplication-3':[36,60,66,70,112,144,240,400],
  'basic-division-1':[1,2,3,2,4,3,5,3], 'basic-division-2':[5,6,5,4,7,4,6,9], 'basic-division-3':[8,8,9,9,12,12,12,12],
 }
 assert.equal(basicMissions.length,12);assert.equal(new Set(basicMissions.map(m=>m.id)).size,12)
 for(const m of basicMissions){assert.equal(m.questions.length,8);assert.deepEqual(m.questions.map(q=>q.answer),expected[m.id]);for(const q of m.questions){assert.ok(Number.isSafeInteger(q.answer)&&q.answer>=0);assert.ok(q.prompt&&q.hint&&q.explanation);if(m.operation==='division')assert.ok(q.right>0)}}
})


test('expanded math curriculum uses independent verified answer fixtures across nine subjects', async()=>{
 const {practiceMissions,diagnostic,catalog,topicMetrics}=await import('../src/services/curriculum.ts')
 const expected={
  fractions:[[10,30,3,20,16,.75],[20,60,4,40,32,1.5]],
  decimals:[[3.75,6.25,10,2.5,1.75,3],[5.25,16.25,20,5,1.5,6]],
  percent:[[20,20,80,55,75,15],[40,40,160,110,75,30]],
  measures:[[300,120,1500,2.5,2500,.75],[600,240,3000,5,4500,1.5]],
  plane:[[16,24,20,110,16,12],[32,48,40,80,26,48]],
  powers:[[16,6,16,14,10,100],[25,7,32,21,20,1000]],
  algebra:[[7,5,10,3,3,14],[14,10,20,6,6,26]],
  statistics:[[4,3,2,45,9,5],[8,6,4,90,18,10]],
  probability:[[60,50,50,20,12,100],[60,50,50,20,24,100]],
 }
 assert.equal(practiceMissions.length,18);assert.equal(new Set(catalog.map(m=>m.id)).size,catalog.length)
 for(const m of practiceMissions){assert.deepEqual(m.questions.map(q=>q.answer),expected[m.topic][m.level-1],m.id);assert.ok(m.questions.every(q=>q.prompt&&q.hint&&q.explanation&&Number.isFinite(q.answer)))}
 assert.deepEqual(diagnostic.questions.map(q=>q.answer),[12,24,10,3.75,20,300,7,4])
 const results=topicMetrics([{missionId:'basic-fractions-1',correct:3,total:6,date:'2026-01-01',hintsUsed:2,hintsByQuestion:[1,1,0,0,0,0]},{missionId:'basic-fractions-2',correct:6,total:6,date:'2026-01-02',hintsUsed:0,hintsByQuestion:[0,0,0,0,0,0]},{missionId:'basic-diagnostic',correct:8,total:8,date:'2026-01-03'}])
 const f=results.find(t=>t.id==='fractions');assert.equal(f.accuracy,75);assert.equal(f.first,50);assert.equal(f.last,100);assert.equal(f.hints,2);assert.equal(f.hintQuestions,2);assert.equal(f.tracked,2)
 assert.equal(results.find(t=>t.id==='spatial').accuracy,null)
})
