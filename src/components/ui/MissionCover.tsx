import type { Mission } from '../../types/database'
const missionImages: Record<string,string> = {
  energia:'cube', hangar:'prism', oficina:'cube', navegacao:'pyramid', comunicacao:'cone', suporte:'sphere', observatorio:'pyramid', laboratorio:'prism-hexagonal', doca:'octahedron', modulos:'prism', reservatorios:'cylinder', bases:'prism-hexagonal', antenas:'cone', calibracao:'pyramid', expedicao:'sphere',
}
export function MissionCover({mission,banner=false}: {mission:Mission;banner?:boolean}) {
  return <div className={`mission-cover geometry-cover ${banner?'mission-cover-banner':''} cover-${mission.icon}`}><img src={`/images/geometry-${missionImages[mission.id]??'prism'}.svg`} alt="" loading="lazy" decoding="async" width={1200} height={600}/><div className="mission-cover-caption"><span>GEOMETRIA ESPACIAL · {mission.questions.length} DESAFIOS</span><strong>{mission.subject}</strong></div></div>
}