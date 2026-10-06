import { useState, type FormEvent } from 'react'
import { Link, useParams, useOutletContext, useNavigate } from 'react-router-dom'
import { ArrowRight, CheckCircle, CircleAlert, PencilLine } from 'lucide-react'
import { missions } from '../../services/missions'
import { useDemo } from '../../context/DemoContext'
import { useMissionProgress } from '../../hooks/useMissionProgress'
import { isNumericAnswerCorrect, parseNumericAnswer } from '../../lib/geometryAnswers'
import { Progress, PageHeading, EmptyState } from '../../components/ui/Primitives'
import { SolidDiagram } from '../../components/ui/SolidDiagram'
import { DifficultyBadge } from '../../components/ui/DifficultyBadge'

export default function Challenge() {
  const { id } = useParams()
  return <ChallengeSession key={id} />
}

function ChallengeSession() {
  const { id } = useParams()
  const { base } = useOutletContext<{ base: string }>()
  const navigate = useNavigate()
  const { record } = useDemo()
  const { isUnlocked } = useMissionProgress()
  const index = missions.findIndex(m => m.id === id)
  const mission = missions[index]
  const [step, setStep] = useState(0)
  const [answer, setAnswer] = useState<number | null>(null)
  const [numericInput, setNumericInput] = useState('')
  const [notes, setNotes] = useState('')
  const [checked, setChecked] = useState(false)
  const [correct, setCorrect] = useState(0)

  if (!mission || !isUnlocked(index)) return <EmptyState title="Desafio indisponível"><Link to={`${base}/map`}>Voltar ao mapa da estação</Link></EmptyState>

  const question = mission.questions[step]
  const numeric = question.numericAnswer !== undefined
  const ready = numeric ? parseNumericAnswer(numericInput) !== null : answer !== null
  const answerIsCorrect = numeric ? isNumericAnswerCorrect(numericInput, question.numericAnswer!) : answer === question.answer

  function next(event: FormEvent) {
    event.preventDefault()
    if (!checked) {
      if (!ready) return
      setChecked(true)
      if (answerIsCorrect) setCorrect(v => v + 1)
      return
    }
    if (step + 1 === mission.questions.length) {
      record({ missionId: mission.id, correct, total: mission.questions.length, date: new Date().toISOString() })
      navigate(`${base}/result/${mission.id}`)
    } else {
      setStep(step + 1); setAnswer(null); setNumericInput(''); setNotes(''); setChecked(false)
    }
  }

  return <>
    <PageHeading kicker={mission.title.toUpperCase()} title="Conhecimento em ação." description={`Desafio ${step + 1} de ${mission.questions.length} · ${mission.subject}`} action={<DifficultyBadge level={mission.difficulty} />} />
    <div className="challenge-container">
      <Progress value={(step + (checked ? 1 : 0)) / mission.questions.length * 100} />
      <form className="panel challenge" onSubmit={next}>
        <div className="challenge-kicker"><span className="eyebrow">DESAFIO {String(step + 1).padStart(2, '0')}</span><DifficultyBadge level={mission.difficulty} /><span className="response-type">{numeric ? 'Resposta numérica' : 'Múltipla escolha'}</span></div>
        <div className="question-visual"><h2>{question.prompt}</h2><SolidDiagram solid={question.solid} /></div>
        <fieldset disabled={checked}>
          <legend className="sr-only">{numeric ? 'Informe o resultado do cálculo' : 'Escolha uma resposta'}</legend>
          {numeric ? <div className="calculation-answer"><label htmlFor="numeric-answer">Resultado do seu cálculo</label><div className="numeric-field"><input id="numeric-answer" type="text" inputMode="decimal" autoComplete="off" value={numericInput} onChange={e => setNumericInput(e.target.value)} placeholder="Digite o valor" aria-describedby="numeric-hint" /><span>{question.unit}</span></div><p id="numeric-hint">Informe apenas o número, sem separador de milhar. Use vírgula ou ponto para decimais.</p>{numericInput.trim() && !ready && <p className="input-error" role="status">Digite um número válido, como 36 ou 1,5.</p>}</div>
            : question.options.map((option, i) => <label key={option} className={`answer-option ${answer === i ? 'selected' : ''} ${checked && i === question.answer ? 'correct' : ''}`}><input type="radio" name="answer" checked={answer === i} onChange={() => setAnswer(i)} /><span className="option-letter">{'ABCD'[i]}</span>{option}</label>)}
        </fieldset>
        <details className="scratchpad"><summary><PencilLine size={16} />Rascunho de cálculo<span>Opcional</span></summary><label htmlFor="calculation-notes">Organize suas contas aqui. O rascunho não é avaliado.</label><textarea id="calculation-notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Fórmula, substituição dos valores e resultado…" rows={4} maxLength={4000} /></details>
        {checked && <div className={`notice ${answerIsCorrect ? 'success' : 'error'}`} role="status">{answerIsCorrect ? <CheckCircle size={20} /> : <CircleAlert size={20} />}<div><strong>{answerIsCorrect ? 'Resposta correta.' : 'Vamos aprender com essa tentativa.'}</strong><p>{question.explanation}</p></div></div>}
        <div className="challenge-footer"><Link className="text-link" to={`${base}/sector/${id}`}>Sair do desafio</Link><button type="submit" className="button primary" disabled={!checked && !ready}>{!checked ? 'Confirmar resposta' : step + 1 === mission.questions.length ? 'Ver resultado' : 'Próximo desafio'}<ArrowRight size={16} /></button></div>
      </form>
    </div>
  </>
}
