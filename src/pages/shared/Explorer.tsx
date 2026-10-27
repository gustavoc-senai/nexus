import { useState } from 'react'
import { SolidExplorer } from '../../components/ui/SolidExplorer'
import { explorerGroups, explorerNames, type ExplorerShape } from '../../lib/explorerCatalog'
import { solidMesh } from '../../lib/solidMesh'
import { PageHeading } from '../../components/ui/Primitives'
export default function Explorer() {
  const [shape, setShape] = useState<ExplorerShape>('cube')
  const faces = solidMesh(shape)
  const polyhedron = !['sphere','cone','cylinder'].includes(shape)
  const vertices = new Set(faces.flatMap(f => f.points.map(p => p.join(','))))
  const edges = new Set(faces.flatMap(f => f.points.map((p,i) => [p.join(','),f.points[(i+1)%f.points.length].join(',')].sort().join('|'))))
  return <><PageHeading kicker="LABORATÓRIO DE GEOMETRIA ESPACIAL" title="Enxergue além do desenho." description="Gire sólidos, destaque superfícies e investigue como o espaço se transforma em planificações." /><div className="catalog-controls"><label>Sólido<select value={shape} onChange={e => setShape(e.target.value as ExplorerShape)}>{explorerGroups.map(group => <optgroup key={group.label} label={group.label}>{group.shapes.map(id => <option key={id} value={id}>{explorerNames[id]}</option>)}</optgroup>)}</select></label></div>{polyhedron && <div className="polyhedron-facts" aria-live="polite"><div><strong>{faces.length}</strong><span>Faces</span></div><div><strong>{edges.size}</strong><span>Arestas</span></div><div><strong>{vertices.size}</strong><span>Vértices</span></div><p>Relação de Euler: {vertices.size} − {edges.size} + {faces.length} = 2</p></div>}<SolidExplorer key={shape} shape={shape} /><section className="panel progress-panel"><h2>Da observação ao cálculo</h2><p>Compare a base com a superfície lateral. A altura é sempre perpendicular à base; no cone e na pirâmide, ela difere da medida inclinada. Use o raio para calcular círculos e a altura para calcular volumes.</p><p>A área mede superfícies em unidades quadradas. O volume mede o espaço ocupado em unidades cúbicas.</p></section></>
}
