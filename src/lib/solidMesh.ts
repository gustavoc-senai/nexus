import { baseSides, isPrism, isPyramid, type ExplorerShape } from './explorerCatalog.ts'
export type Point3 = [number, number, number]
export interface Face3 { points: Point3[]; kind: 'base' | 'top' | 'lateral' }
export function rotatePoint([x, y, z]: Point3, yaw: number, pitch: number): Point3 {
  const a = yaw * Math.PI / 180, b = pitch * Math.PI / 180
  const rx = x * Math.cos(a) + z * Math.sin(a), rz = -x * Math.sin(a) + z * Math.cos(a)
  return [rx, y * Math.cos(b) - rz * Math.sin(b), y * Math.sin(b) + rz * Math.cos(b)]
}
export function solidMesh(shape: ExplorerShape): Face3[] {
  if (['octahedron', 'icosahedron', 'dodecahedron'].includes(shape)) return regularMesh(shape)
  if ((isPrism(shape) || isPyramid(shape)) && !['cube', 'prism', 'pyramid'].includes(shape)) {
    const n = baseSides(shape), r = 0.85, h = shape === 'tetrahedron' ? Math.SQRT2 * r / 2 : 0.85
    const base: Point3[] = Array.from({ length: n }, (_, i) => [r * Math.cos(i * 2 * Math.PI / n), -h, r * Math.sin(i * 2 * Math.PI / n)])
    const top: Point3[] = base.map(([x, , z]) => [x, h, z])
    return [{ points: base, kind: 'base' }, ...(isPrism(shape) ? [{ points: top, kind: 'top' as const }] : []), ...base.map((point, i) => ({ points: isPrism(shape) ? [point, base[(i + 1) % n], top[(i + 1) % n], top[i]] : [point, base[(i + 1) % n], [0, h, 0] as Point3], kind: 'lateral' as const }))]
  }
  if (shape === 'cube' || shape === 'prism' || shape === 'pyramid') {
    const h = shape === 'cube' ? 0.7 : 1, d = shape === 'prism' ? 0.5 : 0.7
    const bottom: Point3[] = [[-0.7, -h, -d], [0.7, -h, -d], [0.7, -h, d], [-0.7, -h, d]]
    const top: Point3[] = bottom.map(([x, , z]) => [x, h, z])
    const faces: Face3[] = [{ points: bottom, kind: 'base' }]
    if (shape !== 'pyramid') faces.push({ points: top, kind: 'top' })
    for (let i = 0; i < 4; i++) faces.push({ points: shape === 'pyramid' ? [bottom[i], bottom[(i + 1) % 4], [0, h, 0]] : [bottom[i], bottom[(i + 1) % 4], top[(i + 1) % 4], top[i]], kind: 'lateral' })
    return faces
  }
  const n = 32, radius = 0.85, h = 0.9
  const ring = (y: number, r: number): Point3[] => Array.from({ length: n }, (_, i) => [r * Math.cos(i * 2 * Math.PI / n), y, r * Math.sin(i * 2 * Math.PI / n)])
  const faces: Face3[] = []
  if (shape === 'sphere') {
    for (let row = 0; row < 16; row++) {
      const a = -Math.PI / 2 + row * Math.PI / 16, b = a + Math.PI / 16
      const bottom = ring(Math.sin(a), Math.cos(a)), top = ring(Math.sin(b), Math.cos(b))
      for (let i = 0; i < n; i++) faces.push({ points: [bottom[i], bottom[(i + 1) % n], top[(i + 1) % n], top[i]], kind: 'lateral' })
    }
    return faces
  }
  const bottom = ring(-h, radius), top = ring(h, radius)
  faces.push({ points: bottom, kind: 'base' })
  if (shape === 'cylinder') faces.push({ points: top, kind: 'top' })
  for (let i = 0; i < n; i++) faces.push({ points: shape === 'cone' ? [bottom[i], bottom[(i + 1) % n], [0, h, 0]] : [bottom[i], bottom[(i + 1) % n], top[(i + 1) % n], top[i]], kind: 'lateral' })
  return faces
}
function regularMesh(shape: ExplorerShape): Face3[] {
  const phi = (1 + Math.sqrt(5)) / 2
  const vertices: Point3[] = shape === 'octahedron' ? [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]] : []
  if (shape !== 'octahedron') for (const a of [-1,1]) for (const b of [-phi,phi]) vertices.push([0,a,b],[a,b,0],[b,0,a])
  const cross = (a: Point3,b: Point3): Point3 => [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]
  const sub = (a: Point3,b: Point3): Point3 => [a[0]-b[0],a[1]-b[1],a[2]-b[2]]
  const dot = (a: Point3,b: Point3) => a.reduce((sum,v,i) => sum+v*b[i],0)
  const triangles: number[][] = []
  for (let i=0;i<vertices.length;i++) for(let j=i+1;j<vertices.length;j++) for(let k=j+1;k<vertices.length;k++) {
    const normal=cross(sub(vertices[j],vertices[i]),sub(vertices[k],vertices[i]))
    if(Math.hypot(...normal)<1e-9) continue
    const sides=vertices.map(v=>dot(normal,sub(v,vertices[i])))
    if(sides.every(v=>v>=-1e-9)||sides.every(v=>v<=1e-9)) triangles.push([i,j,k])
  }
  let faces: Point3[][] = triangles.map(t=>t.map(i=>vertices[i]))
  if(shape==='dodecahedron') {
    const centers=faces.map(points=>points.reduce<Point3>((sum,p)=>[sum[0]+p[0]/3,sum[1]+p[1]/3,sum[2]+p[2]/3],[0,0,0]))
    faces=vertices.map((v,i)=>{
      const unit=v.map(x=>x/Math.hypot(...v)) as Point3
      const tangent=cross(unit,Math.abs(unit[1])<0.9?[0,1,0]:[1,0,0]), bitangent=cross(unit,tangent)
      return triangles.map((t,j)=>t.includes(i)?centers[j]:null).filter((p):p is Point3=>p!==null).sort((a,b)=>Math.atan2(dot(a,bitangent),dot(a,tangent))-Math.atan2(dot(b,bitangent),dot(b,tangent)))
    })
  }
  const scale=1.12/Math.hypot(...faces[0][0])
  return faces.map(points=>({points:points.map(p=>p.map(v=>v*scale) as Point3),kind:'lateral'}))
}
