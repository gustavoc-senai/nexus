import { BookOpen, Ruler } from 'lucide-react'
import type { Mission } from '../../types/database'

export function MissionBriefing({ mission }: { mission: Mission }) {
  return (
    <div className="mission-briefing">
      <section><h3><BookOpen size={17} />O que você vai aprender</h3><ul>{mission.objectives.map(objective => <li key={objective}>{objective}</li>)}</ul></section>
      <section><h3><Ruler size={17} />Referências para a missão</h3><ul className="formula-list">{mission.formulas.map(formula => <li key={formula}>{formula}</li>)}</ul><p>Nas fórmulas: a é a aresta; r, o raio; h, a altura perpendicular; g, a geratriz. Área usa unidades quadradas e volume, unidades cúbicas.</p></section>
    </div>
  )
}
