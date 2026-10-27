export type BasicOperation = 'addition'|'subtraction'|'multiplication'|'division'
export interface BasicQuestion {left:number;right:number;answer:number;prompt:string;hint:string;explanation:string}
export interface BasicMission {id:string;title:string;operation:BasicOperation;level:number;questions:BasicQuestion[]}
export const operationInfo = {
 addition:{name:'Soma',symbol:'+',description:'Junte quantidades e descubra o total.',color:'mint'},
 subtraction:{name:'Subtração',symbol:'−',description:'Retire uma parte e descubra o que sobra.',color:'blue'},
 multiplication:{name:'Multiplicação',symbol:'×',description:'Conte grupos com a mesma quantidade.',color:'purple'},
 division:{name:'Divisão',symbol:'÷',description:'Reparta quantidades em grupos iguais.',color:'amber'},
} as const
const pairs: Record<BasicOperation,number[][][]> = {
 addition:[[[1,1],[2,1],[2,2],[3,2],[4,1],[3,3],[5,2],[4,4]],[[8,5],[9,6],[12,7],[15,4],[18,5],[24,6],[17,8],[26,9]],[[28,17],[36,25],[47,18],[58,34],[76,49],[125,68],[240,135],[368,247]]],
 subtraction:[[[2,1],[3,1],[4,2],[5,3],[6,2],[7,4],[8,3],[5,5]],[[12,5],[15,7],[18,9],[20,6],[24,8],[30,12],[35,17],[42,19]],[[53,27],[72,38],[91,46],[120,57],[205,86],[340,175],[500,268],[724,389]]],
 multiplication:[[[2,1],[2,2],[3,2],[4,2],[2,5],[3,3],[4,3],[5,4]],[[6,2],[7,3],[8,4],[6,5],[7,6],[8,7],[9,8],[10,9]],[[12,3],[15,4],[11,6],[14,5],[16,7],[18,8],[20,12],[25,16]]],
 division:[[[2,2],[4,2],[6,2],[6,3],[8,2],[9,3],[10,2],[12,4]],[[15,3],[18,3],[20,4],[24,6],[28,4],[32,8],[36,6],[45,5]],[[48,6],[56,7],[72,8],[81,9],[96,8],[120,10],[144,12],[180,15]]],
}
export const basicMissions:BasicMission[] = (Object.keys(pairs) as BasicOperation[]).flatMap(operation=>pairs[operation].map((items,level)=>({
 id:`basic-${operation}-${level+1}`,operation,level:level+1,title:`${operationInfo[operation].name} · ${['Primeiros passos','Mais prática','Um passo adiante'][level]}`,
 questions:items.map(([left,right])=>{
  const symbol=operationInfo[operation].symbol,answer=operation==='addition'?left+right:operation==='subtraction'?left-right:operation==='multiplication'?left*right:left/right
  const hint=operation==='addition'?`Comece em ${left} e conte mais ${right}.`:operation==='subtraction'?`Comece com ${left} e retire ${right}.`:operation==='multiplication'?`São ${left} grupos com ${right} em cada um. Some ${right} repetidamente.`:`Reparta ${left} igualmente entre ${right} grupos.`
  const explanation=operation==='division'?`${right} × ${answer} = ${left}. Por isso, ${left} ÷ ${right} = ${answer}.`:operation==='multiplication'?`${left} grupos de ${right} formam ${answer}. ${left} × ${right} = ${answer}.`:`${left} ${symbol} ${right} = ${answer}. ${operation==='addition'?'Ao juntar as duas quantidades, encontramos o total.':'Depois de retirar a segunda quantidade, encontramos o que sobrou.'}`
  return {left,right,answer,prompt:operation==='division'?`Se repartirmos ${left} peças igualmente entre ${right} grupos, quantas peças ficam em cada grupo?`:operation==='multiplication'?`Há ${left} grupos com ${right} peças em cada um. Quantas peças há ao todo?`:`Quanto é ${left} ${symbol} ${right}?`,hint,explanation}
 })
})))