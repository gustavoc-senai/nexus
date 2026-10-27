import { baseSides, isPrism, isPyramid, type ExplorerShape } from './explorerCatalog.ts'
export function solidMeasures(shape: ExplorerShape, edge: number, height: number, width: number) {
  if (![edge,height,width].every(v => Number.isFinite(v) && v > 0 && v <= 10000)) return null
  let base: number | null = null, apothem: number | null = null, lateral: number | null = null, total = 0, volume = 0, h: number | null = height, slant: number | null = null
  let baseFormula = '', lateralFormula = '', totalFormula = '', volumeFormula = '', apothemFormula = ''
  if (isPrism(shape) || isPyramid(shape)) {
    const n = baseSides(shape), perimeter = n * edge
    apothem = n === 4 ? edge / 2 : edge / (2 * Math.tan(Math.PI / n)); apothemFormula = 'aᵦ = lado / [2 tan(π/n)]'
    base = perimeter * apothem / 2; baseFormula = 'Aᵦ = perímetro × aᵦ / 2'
    if (shape === 'prism') { apothem = null; base = edge * width; baseFormula = 'Aᵦ = comprimento × largura' }
    if (shape === 'cube') h = edge
    if (shape === 'tetrahedron') h = edge * Math.sqrt(2/3)
    if (isPrism(shape)) {
      lateral = (shape === 'prism' ? 2*(edge+width) : perimeter) * h
      lateralFormula = 'Aₗ = perímetro × h'; total = 2*base+lateral; totalFormula = 'Aₜ = 2Aᵦ + Aₗ'; volume = base*h; volumeFormula = 'V = Aᵦ × h'
    } else {
      slant = Math.hypot(h, apothem!); lateral = perimeter*slant/2; lateralFormula = 'Aₗ = perímetro × aₗ / 2'; total = base+lateral; totalFormula = 'Aₜ = Aᵦ + Aₗ'; volume = base*h/3; volumeFormula = 'V = Aᵦ × h / 3'
    }
  } else if (shape === 'cylinder' || shape === 'cone') {
    base = Math.PI*edge**2; baseFormula = 'Aᵦ = πr²'
    slant = shape === 'cone' ? Math.hypot(edge,height) : null
    lateral = shape === 'cone' ? Math.PI*edge*slant! : 2*Math.PI*edge*height
    lateralFormula = shape === 'cone' ? 'Aₗ = πrg' : 'Aₗ = 2πrh'
    total = lateral+(shape === 'cone' ? base : 2*base); totalFormula = shape === 'cone' ? 'Aₜ = Aᵦ + Aₗ' : 'Aₜ = 2Aᵦ + Aₗ'
    volume = base*height/(shape === 'cone' ? 3 : 1); volumeFormula = shape === 'cone' ? 'V = πr²h / 3' : 'V = πr²h'
  } else {
    h = null
    if (shape === 'sphere') { total = 4*Math.PI*edge**2; volume = 4*Math.PI*edge**3/3; totalFormula = 'A = 4πr²'; volumeFormula = 'V = 4πr³ / 3' }
    if (shape === 'octahedron') { total = 2*Math.sqrt(3)*edge**2; volume = Math.SQRT2*edge**3/3; totalFormula = 'Aₜ = 2√3 × lado²'; volumeFormula = 'V = √2 × lado³ / 3' }
    if (shape === 'icosahedron') { total = 5*Math.sqrt(3)*edge**2; volume = 5*(3+Math.sqrt(5))*edge**3/12; totalFormula = 'Aₜ = 5√3 × lado²'; volumeFormula = 'V = 5(3+√5) × lado³ / 12' }
    if (shape === 'dodecahedron') { total = 3*Math.sqrt(25+10*Math.sqrt(5))*edge**2; volume = (15+7*Math.sqrt(5))*edge**3/4; totalFormula = 'Aₜ = 3√(25+10√5) × lado²'; volumeFormula = 'V = (15+7√5) × lado³ / 4' }
  }
  return { base, apothem, lateral, total, volume, height:h, slant, baseFormula, apothemFormula, lateralFormula, totalFormula, volumeFormula }
}
export const measureLabel = (value: number) => value.toLocaleString('pt-BR', {maximumFractionDigits: 3})