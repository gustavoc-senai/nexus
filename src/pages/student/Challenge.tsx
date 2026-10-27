import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useParams, useOutletContext, useNavigate } from 'react-router-dom'
import { ArrowRight, CheckCircle, CircleAlert, PencilLine, Lightbulb, RotateCcw } from 'lucide-react'
import { missions } from '../../services/missions'
import { useDemo } from '../../context/LearningContext'
import { useMissionProgress } from '../../hooks/useMissionProgress'
import { isNumericAnswerCorrect, parseNumericAnswer } from '../../lib/geometryAnswers'
import { validDraft } from '../../lib/learning'
import type { MissionDraft } from '../../types/database'
import { Progress, PageHeading, EmptyState } from '../../components/ui/Primitives'
import { SolidDiagram } from '../../components/ui/SolidDiagram'
import { DifficultyBadge } from '../../components/ui/DifficultyBadge'
import { SolidExplorer } from '../../components/ui/SolidExplorer'

function freshDraft(): MissionDraft { return { step: 0, answer: null, numericInput: '', notes: '', checked: false, correct: 0, mistakes: [], responses: [], hints: 0, hintsByQuestion: [], updatedAt: new Date().toISOString() } }
export default function Challenge() {
  const { id } = useParams()
  const { loading } = useDemo()
  if (loading) return <p className="notice" role="status">Carregando sua missão…</p>
  return <ChallengeSession key={id} />
}
function ChallengeSession() {
  const { id } = useParams()
  const { base } = useOutletContext<{ base: string }>()
  const navigate = useNavigate()
  const { record, drafts, updateDraft } = useDemo()
  const { isUnlocked } = useMissionProgress()
  const index = missions.findIndex(m => m.id === id)
  const mission = missions[index]
  const unlocked = isUnlocked(index)
  const saved = mission && validDraft(drafts[mission.id], mission.questions.length) ? drafts[mission.id] : undefined
  const [draft, setDraft] = useState<MissionDraft>(() => saved ?? freshDraft())
  const [resumed, setResumed] = useState(Boolean(saved))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [explore, setExplore] = useState(false)
  const finished = useRef(false)
  const requestId = useRef(saved?.requestId ?? crypto.randomUUID())
  useEffect(() => { if (mission && unlocked && !finished.current) updateDraft(mission.id, { ...draft, requestId: requestId.current }) }, [draft, mission, unlocked, updateDraft])
  if (!mission || !isUnlocked(index)) return <EmptyState title="Desafio indisponível"><Link to={`${base}/map`}>Voltar ao mapa da estação</Link></EmptyState>
  const { step, answer, numericInput, notes, checked, correct, mistakes, responses, hints } = draft
  const question = mission.questions[step]
  const numeric = question.numericAnswer !== undefined
  const ready = numeric ? parseNumericAnswer(numericInput) !== null : answer !== null
  const answerIsCorrect = numeric ? isNumericAnswerCorrect(numericInput, question.numericAnswer!) : answer === question.answer
  function change(patch: Partial<MissionDraft>) { setDraft(previous => ({ ...previous, ...patch, updatedAt: new Date().toISOString() })) }
  async function next(event: FormEvent) {
    event.preventDefault()
    if (busy) return
    if (!checked) {
      if (!ready) return
      const nextResponses = [...responses]; nextResponses[step] = numeric ? parseNumericAnswer(numericInput) : answer
      change({ checked: true, correct: correct + Number(answerIsCorrect), mistakes: answerIsCorrect ? mistakes : [...mistakes, step], responses: nextResponses })
      return
    }
    if (step + 1 === mission.questions.length) {
      setBusy(true); setError('')
      try {
        await record({ missionId: mission.id, correct, total: mission.questions.length, date: new Date().toISOString(), mistakes, hintsByQuestion: draft.hintsByQuestion ? Array.from({length:mission.questions.length},(_,i)=>draft.hintsByQuestion?.[i]??0) : null, hintsUsed: draft.hintsByQuestion ? draft.hintsByQuestion.reduce((sum,n)=>sum+n,0) : null }, responses, requestId.current)
        finished.current = true
        navigate(`${base}/result/${mission.id}`)
      } catch { setError('Não foi possível salvar o resultado. Sua missão foi preservada. Tente novamente sem refazer as respostas.'); setBusy(false) }
    } else { change({ step: step + 1, answer: null, numericInput: '', notes: '', checked: false, hints: 0 }); setExplore(false) }
  }
  function restart() { requestId.current = crypto.randomUUID(); change(freshDraft()); setResumed(false) }
  return <>
    <PageHeading kicker={mission.title.toUpperCase()} title="Conhecimento em ação." description={`Desafio ${step + 1} de ${mission.questions.length} · ${mission.subject}`} action={<DifficultyBadge level={mission.difficulty} />} />
    <div className="challenge-container">
      {resumed && <div className="notice success" role="status"><div><strong>Missão retomada.</strong><p>Suas respostas e seu rascunho foram recuperados.</p></div><button className="button secondary" type="button" onClick={restart}><RotateCcw size={16} />Recomeçar</button></div>}
      <Progress value={(step + Number(checked)) / mission.questions.length * 100} />
      <form className="panel challenge" onSubmit={event => void next(event)}>
        <div className="challenge-kicker"><span className="eyebrow">DESAFIO {String(step + 1).padStart(2, '0')}</span><DifficultyBadge level={mission.difficulty} /><span className="response-type">{numeric ? 'Resposta numérica' : 'Múltipla escolha'}</span></div>
        <div className="question-visual"><h2>{question.prompt}</h2><SolidDiagram solid={question.solid} /></div>
        {!question.solid.variant && !["Hemisfério", "Prisma triangular"].includes(question.solid.label) && <><button type="button" className="button secondary" aria-expanded={explore} onClick={() => setExplore(value => !value)}>{explore ? 'Fechar modelo 3D' : 'Explorar este sólido em 3D'}</button>{explore && <SolidExplorer shape={question.solid.shape} />}</>}
        <fieldset disabled={checked || busy}>
          <legend className="sr-only">{numeric ? 'Informe o resultado do cálculo' : 'Escolha uma resposta'}</legend>
          {numeric ? <div className="calculation-answer"><label htmlFor="numeric-answer">Resultado do seu cálculo</label><div className="numeric-field"><input id="numeric-answer" type="text" inputMode="decimal" autoComplete="off" value={numericInput} onChange={e => change({ numericInput: e.target.value })} placeholder="Digite o valor" aria-describedby="numeric-hint" /><span>{question.unit}</span></div><p id="numeric-hint">Informe apenas o número, sem separador de milhar. Use vírgula ou ponto para decimais.</p>{numericInput.trim() && !ready && <p className="input-error" role="status">Digite um número válido, como 36 ou 1,5.</p>}</div>
            : question.options.map((option, i) => <label key={option} className={`answer-option ${answer === i ? 'selected' : ''} ${checked && i === question.answer ? 'correct' : ''}`}><input type="radio" name="answer" checked={answer === i} onChange={() => change({ answer: i })} /><span className="option-letter">{'ABCD'[i]}</span>{option}</label>)}
        </fieldset>
        {!checked && <div className="hint-panel"><button type="button" className="button secondary" disabled={hints === 3} onClick={() => { const counts = draft.hintsByQuestion ? Array.from({length:step+1},(_,i)=>draft.hintsByQuestion?.[i]??0) : undefined; if (counts) counts[step] = hints + 1; change({ hints: hints + 1, hintsByQuestion: counts }) }}><Lightbulb size={16} />{hints ? `Mais uma dica (${hints}/3)` : 'Preciso de uma dica'}</button><div aria-live="polite">{hints >= 1 && <p>1. Identifique o sólido e anote as medidas fornecidas. Observe se a pergunta pede comprimento, área ou volume.</p>}{hints >= 2 && <p>2. Selecione a fórmula adequada: {mission.formulas.join(' · ')}.</p>}{hints >= 3 && <p>3. Substitua cada medida na fórmula antes de calcular. Em sólidos compostos, some as partes adicionadas e subtraia as partes retiradas. Confira as unidades{question.unit ? `: o resultado deve estar em ${question.unit}` : ''}.</p>}</div></div>}
        <details className="scratchpad" open={notes ? true : undefined}><summary><PencilLine size={16} />Rascunho de cálculo<span>Salvo automaticamente</span></summary><label htmlFor="calculation-notes">Organize suas contas aqui. O rascunho não é avaliado.</label><textarea id="calculation-notes" value={notes} onChange={e => change({ notes: e.target.value })} placeholder="Fórmula, substituição dos valores e resultado…" rows={4} maxLength={4000} /></details>
        {checked && <div className={`notice ${answerIsCorrect ? 'success' : 'error'}`} role="status">{answerIsCorrect ? <CheckCircle size={20} /> : <CircleAlert size={20} />}<div><strong>{answerIsCorrect ? 'Resposta correta.' : 'Vamos aprender com essa tentativa.'}</strong><p>{question.explanation}</p></div></div>}
        {error && <p className="notice error" role="alert">{error}</p>}
        <div className="challenge-footer"><Link className="text-link" to={`${base}/sector/${id}`}>Sair e continuar depois</Link><button type="submit" className="button primary" disabled={busy || !checked && !ready}>{busy ? 'Salvando resultado…' : !checked ? 'Confirmar resposta' : step + 1 === mission.questions.length ? 'Ver resultado' : 'Próximo desafio'}<ArrowRight size={16} /></button></div>
      </form>
    </div>
  </>
}
