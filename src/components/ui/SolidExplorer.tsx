import { SolidCalculator } from './SolidCalculator'
import { explorerNames as solidNames, isPrism, isPyramid, baseSides, hasNet, type ExplorerShape } from '../../lib/explorerCatalog'
import { useId, useMemo, useRef, useState } from 'react'
import { RotateCcw, Move } from 'lucide-react'
import { rotatePoint, solidMesh, type Point3 } from '../../lib/solidMesh'

export function SolidExplorer({ shape }: { shape: ExplorerShape }) {
  const [yaw, setYaw] = useState(35), [pitch, setPitch] = useState(22)
  const [highlight, setHighlight] = useState('none'), [dimension, setDimension] = useState(false), [net, setNet] = useState(false)
  const drag = useRef<{ x: number; y: number; yaw: number; pitch: number } | null>(null)
  const uid = useId()
  const mesh = useMemo(() => solidMesh(shape), [shape])
  const project = (p: Point3) => { const [x, y, z] = rotatePoint(p, yaw, pitch); return { x: 220 + x * 88, y: 160 - y * 88, z } }
  const faces = mesh.map(face => { const points = face.points.map(project); return { ...face, points, depth: points.reduce((sum, p) => sum + p.z, 0) / points.length } }).sort((a, b) => a.depth - b.depth)
  const rounded = shape === 'cylinder' || shape === 'cone' || shape === 'sphere'
  const h = shape === 'cube' ? 0.7 : shape === 'prism' || shape === 'pyramid' ? 1 : shape === 'tetrahedron' ? Math.SQRT2 * 0.85 / 2 : isPrism(shape) || isPyramid(shape) ? 0.85 : 0.9
  const from: Point3 = !rounded && !['cube','prism','pyramid'].includes(shape) ? [0,-h,0] : rounded ? [0, shape === 'sphere' ? 0 : -h, 0] : [0.7, -h, shape === 'prism' ? 0.5 : 0.7]
  const to: Point3 = !rounded && !['cube','prism','pyramid'].includes(shape) ? [0,h,0] : rounded ? [shape === 'sphere' ? 1 : 0.85, from[1], 0] : [0.7, h, from[2]]
  const basePoints = mesh.find(face => face.kind === 'base')?.points
  const midpoint: Point3 | null = basePoints && shape !== 'prism' && !rounded ? basePoints[0].map((v,i)=>(v+basePoints[1][i])/2) as Point3 : null
  const center = project([0,-h,0]), apo = midpoint ? project(midpoint) : null
  const a = project(dimension && !rounded ? [0,-h,0] : from), b = project(dimension && !rounded ? [0,h,0] : to)
  const bottom = project([0, -h, 0]), top = project([0, h, 0])
  return <section className="solid-explorer" aria-label={`Exploração de ${solidNames[shape]}`}>
    <div className="explorer-toolbar"><strong>{solidNames[shape]} · modelo didático</strong><button className="button secondary" type="button" onClick={() => { setYaw(35); setPitch(22); setHighlight('none'); setDimension(false); setNet(false) }}><RotateCcw size={15} />Restaurar</button></div>
    <div className="explorer-grid"><div>
      {net ? <SolidNet shape={shape} /> : <svg className="interactive-solid" viewBox="0 0 440 320" role="img" aria-labelledby={uid + '-title'} onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); drag.current = { x: e.clientX, y: e.clientY, yaw, pitch } }} onPointerMove={e => { if (drag.current) { setYaw(((drag.current.yaw + (e.clientX - drag.current.x) * 0.6) % 360 + 360) % 360); setPitch(Math.max(-80, Math.min(80, drag.current.pitch - (e.clientY - drag.current.y) * 0.4))) } }} onPointerUp={() => { drag.current = null }} onPointerCancel={() => { drag.current = null }}>
        <title id={uid + '-title'}>{solidNames[shape]} em perspectiva. Use os controles abaixo para girar e destacar suas partes.</title>
        {faces.map((face, i) => <polygon key={i} points={face.points.map(p => `${p.x},${p.y}`).join(' ')} fill={highlight === 'all' || highlight === face.kind ? '#f5bf64' : `hsl(174 46% ${22 + (face.depth + 1.5) * 9}%)`} stroke="#72dfd3" strokeWidth={shape === 'sphere' ? 0.3 : 0.8} />)}
        {highlight === 'apothem' && apo && <g stroke="#fff2c6" strokeWidth={3}><line x1={center.x} y1={center.y} x2={apo.x} y2={apo.y} /><circle cx={center.x} cy={center.y} r={3} fill="#fff2c6" /><text x={(center.x+apo.x)/2+8} y={(center.y+apo.y)/2-10} fill="#fff2c6" stroke="none" fontSize={16}>aᵦ</text></g>}
        {dimension && <g stroke="#fff2c6" strokeWidth={2} strokeDasharray="5 3"><line x1={a.x} y1={a.y} x2={b.x} y2={b.y} /><text x={(a.x + b.x) / 2 + 8} y={(a.y + b.y) / 2 - 8} fill="#fff2c6" stroke="none" fontSize={16}>{rounded ? 'r' : 'h'}</text>{shape !== 'sphere' && rounded && <><line x1={bottom.x} y1={bottom.y} x2={top.x} y2={top.y} /><text x={top.x + 10} y={(top.y + bottom.y) / 2} fill="#fff2c6" stroke="none" fontSize={16}>h</text></>}</g>}
      </svg>}
      <p className="explorer-caption"><Move size={14} />Arraste para girar ou use os controles. Selecione um cálculo abaixo para destacar o modelo.</p>
    </div><div className="explorer-controls">
      <label htmlFor={uid + '-yaw'}>Rotação horizontal: {Math.round(yaw)}°</label><input id={uid + '-yaw'} type="range" min="0" max="360" value={yaw} disabled={net} onChange={e => setYaw(Number(e.target.value))} />
      <label htmlFor={uid + '-pitch'}>Inclinação: {Math.round(pitch)}°</label><input id={uid + '-pitch'} type="range" min="-80" max="80" value={pitch} disabled={net} onChange={e => setPitch(Number(e.target.value))} />
      <label htmlFor={uid + '-face'}>Destacar superfície</label><select id={uid + '-face'} value={highlight} disabled={net} onChange={e => setHighlight(e.target.value)}><option value="none">Sem destaque</option><option value="all">Área total / volume</option>{midpoint && <option value="apothem">Apótema da base</option>}{(isPrism(shape) || isPyramid(shape) || shape === 'cylinder' || shape === 'cone') && <option value="base">Base inferior</option>}{(isPrism(shape) || shape === 'cylinder') && <option value="top">Base superior</option>}<option value="lateral">{shape === 'sphere' ? 'Superfície curva' : !isPrism(shape) && !isPyramid(shape) && !rounded ? 'Todas as faces' : 'Superfície lateral'}</option></select>
      <label className="explorer-checkbox"><input type="checkbox" checked={dimension} disabled={net || !hasNet(shape)} onChange={e => setDimension(e.target.checked)} />{shape === 'sphere' ? 'Mostrar raio' : rounded ? 'Mostrar raio e altura' : 'Mostrar altura'}</label>
      <label className="explorer-checkbox"><input type="checkbox" checked={net} disabled={!hasNet(shape)} onChange={e => setNet(e.target.checked)} />Ver planificação</label>{!hasNet(shape) && <p>Observe as faces deste poliedro em 3D. A planificação está disponível para os prismas e as pirâmides.</p>}
    </div></div>
    <SolidCalculator shape={shape} onHighlight={part => { setNet(false); setHighlight(part === 'height' ? 'none' : part); setDimension(part === 'height') }} />
  </section>
}
function SolidNet({ shape }: { shape: ExplorerShape }) {
  const uid = useId()
  if (shape === 'sphere') return <div className="sphere-net-note"><strong>A esfera não possui planificação exata no plano.</strong><p>Sua superfície tem curvatura em todas as direções. Mapas planos da esfera sempre introduzem deformações.</p></div>
  if ((isPrism(shape) || isPyramid(shape)) && !['cube','prism','pyramid'].includes(shape)) return <PolygonNet shape={shape} />
  const style = { fill: '#175650', stroke: '#72dfd3', strokeWidth: 1.5 }
  const widths = shape === 'prism' ? [55, 40, 55, 40] : [55, 55, 55, 55]
  const height = shape === 'cube' ? 55 : 90, depth = shape === 'cube' ? 55 : 40
  return <svg viewBox="0 0 440 320" role="img" aria-labelledby={uid}><title id={uid}>Planificação de {solidNames[shape]}; linhas tracejadas representam dobras.</title>
    {(shape === 'cube' || shape === 'prism') && <g {...style}>{widths.map((width, i) => <rect key={i} x={100 + widths.slice(0, i).reduce((sum, w) => sum + w, 0)} y={120} width={width} height={height} />)}<rect x={100} y={120 - depth} width={55} height={depth} /><rect x={100} y={120 + height} width={55} height={depth} /><path d={`M100 120H155 M100 ${120 + height}H155 ${widths.slice(0, -1).map((_, i) => `M${100 + widths.slice(0, i + 1).reduce((sum, w) => sum + w, 0)} 120V${120 + height}`).join(' ')}`} strokeDasharray="5 4" /><text x={220} y={300} textAnchor="middle" stroke="none" fill="#c9dedb">6 faces retangulares{shape === 'cube' ? ' iguais (quadrados)' : ''}</text></g>}
    {shape === 'cylinder' && <g {...style}><rect x={120} y={124} width={Math.PI * 56} height={64} /><circle cx={180} cy={96} r={28} /><circle cx={180} cy={216} r={28} /><path d="M120 124H296 M120 188H296" strokeDasharray="5 4" /><text x={210} y={160} textAnchor="middle" fill="#d4eeea" stroke="none">2πr × h</text><text x={210} y={283} textAnchor="middle" fill="#c9dedb" stroke="none">Um retângulo e duas bases circulares</text></g>}
    {shape === 'cone' && <g {...style}><path d="M220 80 L122.5 165.8 A130 130 0 0 0 317.5 165.8 Z" /><circle cx={220} cy={245} r={35} /><text x={220} y={140} textAnchor="middle" fill="#d4eeea" stroke="none">g</text><text x={220} y={301} textAnchor="middle" fill="#c9dedb" stroke="none">Setor circular (geratriz g) e base de raio r</text></g>}
    {shape === 'pyramid' && <g {...style}><rect x={180} y={120} width={80} height={80} /><path d="M180 120L220 36L260 120 M260 120L344 160L260 200 M260 200L220 284L180 200 M180 200L96 160L180 120" /><rect x={180} y={120} width={80} height={80} fill="none" strokeDasharray="5 4" /></g>}
  </svg>
}

function PolygonNet({ shape }: { shape: ExplorerShape }) {
  const uid = useId(), n = baseSides(shape), r = 25.5, edge = 2 * r * Math.sin(Math.PI / n), apothem = r * Math.cos(Math.PI / n)
  const height = shape === 'tetrahedron' ? Math.SQRT2 * r : 51
  const polygons: number[][][] = []
  const folds: number[][] = []
  if (isPrism(shape)) {
    const base = Array.from({ length:n },(_,i) => { const angle = Math.PI/2 + Math.PI/n - i*2*Math.PI/n; return [edge/2+r*Math.cos(angle),-apothem+r*Math.sin(angle)] })
    polygons.push(base,base.map(([x,y])=>[x,height-y]))
    for(let i=0;i<n;i++) { polygons.push([[i*edge,0],[(i+1)*edge,0],[(i+1)*edge,height],[i*edge,height]]); if(i) folds.push([i*edge,0,i*edge,height]) }
    folds.push([0,0,edge,0],[0,height,edge,height])
  } else {
    const base = Array.from({ length:n },(_,i)=>[r*Math.cos(i*2*Math.PI/n),r*Math.sin(i*2*Math.PI/n)])
    polygons.push(base)
    const slant = Math.hypot(height,apothem)
    for(let i=0;i<n;i++) { const a=base[i],b=base[(i+1)%n],mid=[(a[0]+b[0])/2,(a[1]+b[1])/2];const length=Math.hypot(...mid);polygons.push([a,b,[mid[0]+mid[0]/length*slant,mid[1]+mid[1]/length*slant]]);folds.push([...a,...b]) }
  }
  const points=polygons.flat(), xs=points.map(p=>p[0]),ys=points.map(p=>p[1]), minX=Math.min(...xs)-15,minY=Math.min(...ys)-15,w=Math.max(...xs)-minX+15,h=Math.max(...ys)-minY+15
  return <svg className="interactive-solid" viewBox={`${minX} ${minY} ${w} ${h}`} role="img" aria-labelledby={uid}><title id={uid}>Planificação de {solidNames[shape]}. Linhas tracejadas indicam dobras.</title>{polygons.map((p,i)=><polygon key={i} points={p.map(v=>v.join(',')).join(' ')} fill="#175650" stroke="#72dfd3" strokeWidth={1} />)}{folds.map(([x1,y1,x2,y2],i)=><line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fff2c6" strokeWidth={1} strokeDasharray="3 3" />)}</svg>
}