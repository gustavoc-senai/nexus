import { useId, useState } from 'react'
import { isPrism, isPyramid, type ExplorerShape } from '../../lib/explorerCatalog'
import { measureLabel, solidMeasures } from '../../lib/solidMeasures'
export function SolidCalculator({shape, onHighlight}: {shape: ExplorerShape; onHighlight: (part: string) => void}) {
  const uid = useId(), [edge,setEdge] = useState('6'), [height,setHeight] = useState('8'), [width,setWidth] = useState('4')
  const measures = solidMeasures(shape,Number(edge.replace(',','.')),Number(height.replace(',','.')),Number(width.replace(',','.')))
  const rounded = ['sphere','cone','cylinder'].includes(shape), independentHeight = (isPrism(shape)||isPyramid(shape)||rounded) && !['cube','tetrahedron','sphere'].includes(shape)
  const rows = measures ? [
    ['Apótema da base',measures.apothem,'cm',measures.apothemFormula,'apothem'],
    ['Área da base',measures.base,'cm²',measures.baseFormula,'base'],
    ['Área lateral',measures.lateral,'cm²',measures.lateralFormula,'lateral'],
    ['Altura perpendicular',measures.height,'cm',shape==='cube'?'h = lado':shape==='tetrahedron'?'h = lado × √(2/3)':'h: distância perpendicular à base','height'],
    ['Área total',measures.total,'cm²',measures.totalFormula,'all'],
    ['Volume',measures.volume,'cm³',measures.volumeFormula,'all'],
  ] as const : []
  return <div className="solid-calculator"><h2>Medidas e cálculos</h2><p>Informe medidas em centímetros. Selecione um resultado para localizar sua parte no modelo.</p><div className="measure-inputs"><label htmlFor={uid+'-edge'}>{rounded?'Raio':'Lado / aresta'} (cm)<input id={uid+'-edge'} inputMode="decimal" value={edge} onChange={e=>setEdge(e.target.value)} /></label>{shape==='prism'&&<label htmlFor={uid+'-width'}>Largura da base (cm)<input id={uid+'-width'} inputMode="decimal" value={width} onChange={e=>setWidth(e.target.value)} /></label>}{independentHeight&&<label htmlFor={uid+'-height'}>Altura (cm)<input id={uid+'-height'} inputMode="decimal" value={height} onChange={e=>setHeight(e.target.value)} /></label>}</div>{!measures?<p role="alert">Informe medidas positivas de até 10.000 cm.</p>:<><div className="measure-results" aria-live="polite">{rows.map(([name,value,unit,formula,part])=><button type="button" key={name} disabled={value===null} onClick={()=>onHighlight(part)}><span>{name}</span><strong>{value===null?'Não se aplica':`${measureLabel(value)} ${unit}`}</strong><small>{value===null?'Sem uma base regular definida nesta exploração.':formula}</small></button>)}</div>{measures.slant!==null&&<p>Medida inclinada {shape==='cone'?'(geratriz g)':'(apótema lateral aₗ)'}: <strong>{measureLabel(measures.slant)} cm</strong>. {shape==='cone'?'g² = h² + r²':'aₗ² = h² + aᵦ²'}. Ela difere da altura perpendicular.</p>}<p className="explorer-caption">Resultados arredondados a 3 casas; cálculos usam precisão completa e π real. Modelo ilustrativo, sem escala. Nos prismas poligonais e nas pirâmides, a base é regular e o sólido é reto. No paralelepípedo retângulo, as duas dimensões da base podem ser diferentes.</p></>}</div>
}