import { useId } from 'react'
import type { Solid } from '../../types/database'

export function SolidDiagram({ solid }: { solid: Solid }) {
  const titleId = useId()
  const hemisphere = solid.label === 'Hemisfério'
  const triangular = solid.shape === 'prism' && solid.label === 'Prisma triangular'
  const compound = ['cylinder-hemisphere', 'cylinder-cone', 'joined-cubes'].includes(solid.variant ?? '')

  return (
    <figure className="solid-figure">
      <svg viewBox="0 0 240 190" role="img" aria-labelledby={titleId}>
        <title id={titleId}>{solid.label}{solid.dimensions?.length ? `: ${solid.dimensions.join(', ')}` : ''}</title>
        <g stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" fill="none">
          {!compound && (solid.shape === 'cube' || (solid.shape === 'prism' && !triangular)) && <>
            <path className="solid-face" d="M55 68L130 68L130 150L55 150Z" />
            <path className={solid.variant === 'open-cube' ? '' : 'solid-face top-face'} d="M55 68L99 38L174 38L130 68Z" />
            <path className="solid-face side-face" d="M130 68L174 38L174 120L130 150Z" />
            <path className="hidden-edge" d="M55 150L99 120L174 120M99 120V38" />
          </>}
          {triangular && <>
            <path className="solid-face" d="M48 140L128 140L88 65Z" />
            <path className="solid-face side-face" d="M88 65L160 34L200 109L128 140Z" />
            <path d="M48 140L120 109" /><path className="hidden-edge" d="M120 109L160 34M120 109H200" />
          </>}
          {solid.shape === 'pyramid' && <>
            <path className="solid-face" d="M120 28L50 140L145 159Z" />
            <path className="solid-face side-face" d="M120 28L192 120L145 159Z" />
            <path className="hidden-edge" d="M50 140L97 101L192 120M120 28L97 101M120 28L120 128" />
            <path className="measure-line" d="M120 28L98 150" />
          </>}
          {solid.shape === 'cylinder' && !compound && <>
            <path className="solid-face" d="M65 55V140C65 164 175 164 175 140V55" />
            <ellipse className="solid-face top-face" cx="120" cy="55" rx="55" ry="19" />
            <path className="hidden-edge" d="M65 140C65 117 175 117 175 140" />
            <path className="measure-line" d="M120 55H175M193 55V140M188 55H198M188 140H198" />
          </>}
          {solid.shape === 'cone' && <>
            <path className="solid-face" d="M120 26L60 143C60 166 180 166 180 143Z" />
            <path className="hidden-edge" d="M60 143C60 119 180 119 180 143M120 26V143" />
            <path className="measure-line" d="M120 143H180M120 133H130V143" />
          </>}
          {solid.shape === 'sphere' && !hemisphere && <>
            <circle className="solid-face" cx="120" cy="95" r="64" />
            <ellipse cx="120" cy="95" rx="64" ry="20" className="hidden-edge" />
            <ellipse cx="120" cy="95" rx="22" ry="64" className="hidden-edge" />
            <path className="measure-line" d="M120 95H184" /><circle cx="120" cy="95" r="2" fill="currentColor" />
          </>}
          {solid.shape === 'sphere' && hemisphere && <>
            <path className="solid-face" d="M56 112A64 64 0 0 1 184 112C184 141 56 141 56 112Z" />
            <path className="hidden-edge" d="M56 112C56 85 184 85 184 112" />
            <path className="measure-line" d="M120 112H184" /><circle cx="120" cy="112" r="2" fill="currentColor" />
          </>}
          {solid.variant === 'cylinder-hemisphere' && <>
            <path className="solid-face" d="M65 90V149C65 174 175 174 175 149V90" />
            <path className="solid-face top-face" d="M65 90A55 55 0 0 1 175 90C175 111 65 111 65 90Z" />
            <path className="hidden-edge" d="M65 90C65 69 175 69 175 90M65 149C65 124 175 124 175 149" />
          </>}
          {solid.variant === 'cylinder-cone' && <>
            <path className="solid-face" d="M65 90V149C65 174 175 174 175 149V90" />
            <path className="solid-face top-face" d="M120 24L65 90C65 111 175 111 175 90Z" />
            <path className="hidden-edge" d="M65 90C65 69 175 69 175 90M120 24V149M65 149C65 124 175 124 175 149" />
          </>}
          {solid.variant === 'joined-cubes' && <>
            <path className="solid-face" d="M30 70H170V140H30Z" />
            <path className="solid-face top-face" d="M30 70L65 40H205L170 70Z" />
            <path className="solid-face side-face" d="M170 70L205 40V110L170 140Z" />
            <path d="M100 70V140M100 70L135 40" /><path className="hidden-edge" d="M30 140L65 110H205M65 40V110" />
          </>}
          {solid.variant === 'drilled-cube' && <>
            <circle cx="92" cy="110" r="16" fill="#0d1823" /><circle cx="136" cy="80" r="16" className="hidden-edge" /><path className="hidden-edge" d="M81 98L125 68M103 122L147 92" />
          </>}
          {solid.variant === 'hollow-sphere' && <circle cx="120" cy="95" r="43" className="hidden-edge" />}
          {solid.variant === 'hollow-prism' && <>
            <path className="hidden-edge" d="M81 83H109V118H81ZM81 83L96 72H124L109 83M109 118L124 107V72" />
          </>}
          {solid.variant === 'space-diagonal' && <path className="measure-line" d="M55 150L174 38" strokeWidth="2" />}
        </g>
      </svg>
      <figcaption><strong>{solid.label}</strong>{solid.dimensions && <div className="solid-dimensions">{solid.dimensions.map(dimension => <span key={dimension}>{dimension}</span>)}</div>}<small>Representação esquemática, sem escala.</small></figcaption>
    </figure>
  )
}
