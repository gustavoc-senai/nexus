import { basicMissions, operationInfo } from './basicMath.ts'
import { missions } from './missions.ts'
import type { Attempt } from '../types/database'

export interface PracticeQuestion { prompt: string; answer: number; hint: string; explanation: string; unit?: string }
export interface PracticeMission { id: string; title: string; topic: string; level: number; questions: PracticeQuestion[] }
export const topics = [
  { id: 'operations', name: 'Operações básicas', stage: 'foundations', description: 'Juntar, retirar, multiplicar e repartir.' },
  { id: 'fractions', name: 'Frações', stage: 'developing', description: 'Partes do inteiro e frações de quantidades.' },
  { id: 'decimals', name: 'Números decimais', stage: 'developing', description: 'Cálculos com vírgula e situações com dinheiro.' },
  { id: 'percent', name: 'Porcentagem', stage: 'developing', description: 'Descontos, acréscimos e proporções.' },
  { id: 'measures', name: 'Grandezas e medidas', stage: 'developing', description: 'Comprimento, massa, capacidade e tempo.' },
  { id: 'plane', name: 'Geometria plana', stage: 'developing', description: 'Áreas, perímetros e ângulos.' },
  { id: 'powers', name: 'Potências e raízes', stage: 'advancing', description: 'Quadrados, raízes exatas e propriedades.' },
  { id: 'algebra', name: 'Álgebra', stage: 'advancing', description: 'Equações de primeiro e segundo grau.' },
  { id: 'statistics', name: 'Estatística', stage: 'advancing', description: 'Média, mediana, moda e leitura de dados.' },
  { id: 'probability', name: 'Probabilidade', stage: 'advancing', description: 'Resultados possíveis e chances em porcentagem.' },
  { id: 'spatial', name: 'Geometria espacial', stage: 'advancing', description: 'Sólidos, áreas, volumes e exploração em 3D.' },
] as const
export const stages = { foundations: 'Primeiros passos', developing: 'Construindo fundamentos', advancing: 'Ampliando conhecimentos' }
export type Stage = keyof typeof stages
const q = (prompt: string, answer: number, hint: string, explanation: string, unit?: string): PracticeQuestion => ({ prompt, answer, hint, explanation, unit })
const datasets: Record<string, (n: number) => PracticeQuestion[]> = {
  fractions: n => [
    q(`Quanto é 1/2 de ${20*n}?`,10*n,'Divida o inteiro em duas partes iguais.',`${20*n} ÷ 2 = ${10*n}.`),
    q(`Quanto é 3/4 de ${40*n}?`,30*n,'Divida por 4 e multiplique por 3.',`${40*n} ÷ 4 × 3 = ${30*n}.`),
    q(`Some 2/7 + ${n}/7. Qual é o numerador do resultado, antes de simplificar?`,2+n,'Com denominadores iguais, some os numeradores.',`2 + ${n} = ${2+n}. O denominador continua 7.`),
    q(`Quanto é 2/5 de ${50*n}?`,20*n,'Calcule uma quinta parte e depois dobre.',`${50*n} ÷ 5 × 2 = ${20*n}.`),
    q(`Uma caixa tem ${24*n} lápis. Foram usados 1/3 deles. Quantos sobraram?`,16*n,'Encontre um terço e subtraia do total.',`${24*n} − ${8*n} = ${16*n} lápis.`),
    q(`Quanto vale a fração ${3*n}/4 em número decimal?`,.75*n,'Divida o numerador pelo denominador.',`${3*n} ÷ 4 = ${.75*n}.`),
  ],
  decimals: n => [
    q(`Calcule ${1.5*n} + 2,25.`,1.5*n+2.25,'Alinhe as casas decimais. Some décimos com décimos.',`${1.5*n} + 2,25 = ${1.5*n+2.25}.`),
    q(`Calcule ${10*n} − 3,75.`,10*n-3.75,'Escreva o inteiro com duas casas decimais.',`${10*n},00 − 3,75 = ${10*n-3.75}.`),
    q(`Cada caderno custa R$ 2,50. Quanto custam ${4*n} cadernos?`,10*n,'Multiplique o preço pela quantidade.',`2,50 × ${4*n} = ${10*n} reais.`,'R$'),
    q(`Divida ${7.5*n} por 3.`,2.5*n,'Você pode dividir 75 por 3 e ajustar a vírgula.',`${7.5*n} ÷ 3 = ${2.5*n}.`),
    q(`Quanto falta para ${.25*n} chegar a 2?`,2-.25*n,'Subtraia o valor conhecido de 2.',`2 − ${.25*n} = ${2-.25*n}.`),
    q(`Calcule 0,6 × ${5*n}.`,3*n,'Multiplique 6 pela quantidade e divida por 10.',`0,6 × ${5*n} = ${3*n}.`),
  ],
  percent: n => [
    q(`Quanto é 10% de ${200*n}?`,20*n,'10% é a décima parte.',`${200*n} ÷ 10 = ${20*n}.`),
    q(`Quanto é 25% de ${80*n}?`,20*n,'25% equivale a um quarto.',`${80*n} ÷ 4 = ${20*n}.`),
    q(`Um produto de R$ ${100*n} tem desconto de 20%. Qual é o preço final?`,80*n,'Calcule o desconto e subtraia do preço.',`${100*n} − ${20*n} = ${80*n} reais.`,'R$'),
    q(`Um valor de ${50*n} aumenta 10%. Qual é o novo valor?`,55*n,'Some o acréscimo de 10% ao valor inicial.',`${50*n} + ${5*n} = ${55*n}.`),
    q(`Em ${40*n} perguntas, ${30*n} foram respondidas corretamente. Qual a porcentagem de acerto?`,75,'Divida os acertos pelo total e multiplique por 100.',`${30*n} ÷ ${40*n} × 100 = 75%.`,'%'),
    q(`Quanto é 5% de ${300*n}?`,15*n,'5% é a metade de 10%.',`${300*n} × 0,05 = ${15*n}.`),
  ],
  measures: n => [
    q(`Converta ${3*n} metros em centímetros.`,300*n,'Cada metro tem 100 centímetros.',`${3*n} × 100 = ${300*n} cm.`,'cm'),
    q(`Quantos minutos há em ${2*n} horas?`,120*n,'Cada hora tem 60 minutos.',`${2*n} × 60 = ${120*n} minutos.`,'min'),
    q(`Converta ${1.5*n} litros em mililitros.`,1500*n,'Cada litro tem 1000 mililitros.',`${1.5*n} × 1000 = ${1500*n} mL.`,'mL'),
    q(`Converta ${2500*n} gramas em quilogramas.`,2.5*n,'Divida por 1000.',`${2500*n} ÷ 1000 = ${2.5*n} kg.`,'kg'),
    q(`Uma caminhada tem ${2*n} km mais 500 m. Qual a distância total em metros?`,2000*n+500,'Converta os quilômetros antes de somar.',`${2000*n} + 500 = ${2000*n+500} m.`,'m'),
    q(`Uma aula começou às 8h e durou ${45*n} minutos. Qual foi a duração em horas?`,.75*n,'Divida a quantidade de minutos por 60.',`${45*n} ÷ 60 = ${.75*n} hora(s).`,'h'),
  ],
  plane: n => [
    q(`Um quadrado tem lado ${4*n} cm. Qual seu perímetro?`,16*n,'Some os quatro lados iguais.',`4 × ${4*n} = ${16*n} cm.`,'cm'),
    q(`Um retângulo mede ${6*n} cm por 4 cm. Qual sua área?`,24*n,'Multiplique base por altura.',`${6*n} × 4 = ${24*n} cm².`,'cm²'),
    q(`Um triângulo tem base ${8*n} cm e altura 5 cm. Qual sua área?`,20*n,'A área é base vezes altura dividido por 2.',`${8*n} × 5 ÷ 2 = ${20*n} cm².`,'cm²'),
    q(`Dois ângulos de um triângulo medem ${30*n}° e 40°. Quanto mede o terceiro?`,140-30*n,'Os três ângulos somam 180°.',`180 − ${30*n} − 40 = ${140-30*n}°.`,'graus'),
    q(`Um retângulo tem lados ${5*n} m e 3 m. Qual seu perímetro?`,10*n+6,'Some duas vezes cada medida.',`2 × (${5*n} + 3) = ${10*n+6} m.`,'m'),
    q(`Um círculo tem raio ${2*n} cm. Use π = 3. Qual sua área?`,12*n*n,'Use A = π × r².',`3 × ${2*n}² = ${12*n*n} cm².`,'cm²'),
  ],
  powers: n => [
    q(`Calcule ${3+n}².`,(3+n)**2,'Elevar ao quadrado é multiplicar o número por ele mesmo.',`${3+n} × ${3+n} = ${(3+n)**2}.`),
    q(`Qual a raiz quadrada de ${(5+n)**2}?`,5+n,'Procure o número positivo que, ao quadrado, produz esse valor.',`${5+n}² = ${(5+n)**2}.`),
    q(`Calcule 2 elevado a ${3+n}.`,2**(3+n),'Multiplique 2 por ele mesmo a quantidade indicada pelo expoente.',`2^${3+n} = ${2**(3+n)}.`),
    q(`Calcule ${2+n}² + 5.`,(2+n)**2+5,'Resolva a potência antes da soma.',`${(2+n)**2} + 5 = ${(2+n)**2+5}.`),
    q(`Qual a raiz quadrada de ${100*n*n}?`,10*n,'A raiz quadrada desfaz uma potência de expoente 2.',`${10*n} × ${10*n} = ${100*n*n}.`),
    q(`Calcule 10 elevado a ${n+1}.`,10**(n+1),'Uma potência de 10 tem a quantidade de zeros indicada no expoente.',`10^${n+1} = ${10**(n+1)}.`),
  ],
  algebra: n => [
    q(`Resolva x + ${3*n} = ${10*n}.`,7*n,'Subtraia o mesmo valor dos dois lados.',`x = ${10*n} − ${3*n} = ${7*n}.`),
    q(`Resolva 4x = ${20*n}.`,5*n,'Divida os dois lados por 4.',`x = ${20*n} ÷ 4 = ${5*n}.`),
    q(`Resolva 2x + 6 = ${20*n+6}.`,10*n,'Primeiro subtraia 6, depois divida por 2.',`2x = ${20*n}; x = ${10*n}.`),
    q(`Qual a solução positiva de x² = ${9*n*n}?`,3*n,'Calcule a raiz quadrada positiva.',`x = √${9*n*n} = ${3*n}. A outra solução é −${3*n}.`),
    q(`Qual a maior raiz de x² − ${5*n}x + ${6*n*n} = 0?`,3*n,'Procure dois números cuja soma seja o coeficiente oposto de x e cujo produto seja o termo final.',`(x − ${2*n})(x − ${3*n}) = 0. Raízes: ${2*n} e ${3*n}.`),
    q(`Se y = 3x + 2 e x = ${4*n}, quanto vale y?`,12*n+2,'Substitua x pelo valor informado.',`y = 3 × ${4*n} + 2 = ${12*n+2}.`),
  ],
  statistics: n => [
    q(`Qual a média de ${2*n}, ${4*n} e ${6*n}?`,4*n,'Some os valores e divida pela quantidade de valores.',`${12*n} ÷ 3 = ${4*n}.`),
    q(`Qual a mediana de ${n}, ${3*n} e ${8*n}?`,3*n,'Em uma lista ordenada com três valores, escolha o valor central.',`O número central é ${3*n}.`),
    q(`Qual a moda de ${2*n}, ${5*n}, ${2*n}, ${7*n}?`,2*n,'A moda é o valor que aparece mais vezes.',`${2*n} aparece duas vezes.`),
    q(`Uma biblioteca emprestou ${12*n}, ${18*n} e ${15*n} livros em três dias. Quantos no total?`,45*n,'Some os três registros.',`${12*n} + ${18*n} + ${15*n} = ${45*n}.`),
    q(`Qual a amplitude dos valores ${3*n}, ${8*n}, ${12*n}?`,9*n,'Amplitude é o maior valor menos o menor.',`${12*n} − ${3*n} = ${9*n}.`),
    q(`Qual a mediana de ${2*n}, ${4*n}, ${6*n} e ${10*n}?`,5*n,'Com quantidade par de dados, calcule a média dos dois centrais.',`(${4*n} + ${6*n}) ÷ 2 = ${5*n}.`),
  ],
  probability: n => [
    q(`Há ${3*n} bolas azuis e ${2*n} vermelhas. Qual a chance de retirar uma azul, em porcentagem?`,60,'Divida os casos favoráveis pelo total e multiplique por 100.',`${3*n} ÷ ${5*n} × 100 = 60%.`,'%'),
    q('Ao lançar uma moeda equilibrada, qual a chance de sair cara, em porcentagem?',50,'São dois resultados igualmente prováveis.',`1 ÷ 2 × 100 = 50%.`,'%'),
    q('Qual a chance de sair um número par em um dado comum equilibrado, em porcentagem?',50,'Os números pares são 2, 4 e 6, entre seis resultados.',`3 ÷ 6 × 100 = 50%.`,'%'),
    q(`Uma caixa tem ${10*n} cartões numerados, e ${2*n} são premiados. Qual a chance de prêmio em porcentagem?`,20,'Divida a quantidade de prêmios pela quantidade de cartões.',`${2*n} ÷ ${10*n} × 100 = 20%.`,'%'),
    q(`Uma loja oferece ${3*n} camisetas e 4 calças. Quantos conjuntos diferentes de uma camiseta e uma calça podem ser formados?`,12*n,'Multiplique as opções de cada peça.',`${3*n} × 4 = ${12*n} conjuntos.`),
    q('Em um dado comum, qual a chance de sair um número menor que 7, em porcentagem?',100,'Todos os seis resultados são menores que 7.',`6 ÷ 6 × 100 = 100%.`,'%'),
  ],
}
export const practiceMissions: PracticeMission[] = Object.entries(datasets).flatMap(([topic,make]) => [1,2].map(level=>({id:`basic-${topic}-${level}`,topic,level,title:`${topics.find(t=>t.id===topic)!.name} · ${level===1?'Fundamentos':'Aplicação e revisão'}`,questions:make(level)})))
export const diagnostic: PracticeMission = {id:'basic-diagnostic',title:'Descubra seu ponto de partida',topic:'diagnostic',level:1,questions:[
  q('Quanto é 7 + 5?',12,'Junte as duas quantidades.','7 + 5 = 12.'),
  q('Quanto é 6 × 4?',24,'Some quatro grupos de seis.','6 + 6 + 6 + 6 = 24.'),
  ...['fractions','decimals','percent','measures','algebra','statistics'].map(topic=>datasets[topic](1)[0]),
]}
export const numericMissions = [...practiceMissions,diagnostic]
export const catalog = [
  ...basicMissions.map(m=>({id:m.id,title:m.title,topic:'operations',level:m.level,questions:m.questions.map(q=>({prompt:q.prompt,answer:q.answer,hint:q.hint,explanation:q.explanation})),kind:'basic' as const})),
  ...practiceMissions.map(m=>({...m,kind:'practice' as const})),
  ...missions.map(m=>({id:m.id,title:m.title,topic:'spatial',level:m.difficulty==='easy'?1:m.difficulty==='intermediate'?2:3,questions:m.questions.map(q=>({prompt:q.prompt,answer:q.numericAnswer??q.answer,hint:m.formulas.join(' · '),explanation:q.explanation,options:q.options,unit:q.unit})),kind:'spatial' as const})),
]
export function missionPath(base:string,id:string) { if(id===diagnostic.id)return `${base}/practice/${id}`;const m=catalog.find(m=>m.id===id);if(base==='/teacher'&&m?.kind==='spatial')return `${base}/missions`;return `${base}/${m?.kind==='spatial'?'sector':m?.kind==='basic'?'basic':'practice'}/${id}` }
export function topicMetrics(attempts:Attempt[]) {
  return topics.map(topic=>{
    const ids=new Set(catalog.filter(m=>m.topic===topic.id).map(m=>m.id)),results=attempts.filter(a=>ids.has(a.missionId)).toSorted((a,b)=>a.date.localeCompare(b.date));
    const total=results.reduce((s,a)=>s+a.total,0),correct=results.reduce((s,a)=>s+a.correct,0),tracked=results.filter(a=>a.hintsUsed!=null),answered=tracked.reduce((s,a)=>s+a.total,0);
    return {...topic,attempts:results.length,accuracy:total?Math.round(correct/total*100):null,first:results.length?Math.round(results[0].correct/results[0].total*100):null,last:results.length?Math.round(results.at(-1)!.correct/results.at(-1)!.total*100):null,hints:tracked.reduce((s,a)=>s+(a.hintsUsed??0),0),hintQuestions:tracked.filter(a=>a.hintsByQuestion).reduce((s,a)=>s+a.hintsByQuestion!.filter(n=>n>0).length,0),tracked:tracked.length,answered};
  })
}
export { operationInfo }
