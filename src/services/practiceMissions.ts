import type { Mission, Question, Solid } from '../types/database'
type Exercise = [string, number, string, string, Solid['shape'], string[]]
const questions = (items: Exercise[]): Question[] => items.map(([prompt,numericAnswer,unit,explanation,shape,dimensions]) => ({prompt,numericAnswer,unit,explanation,options:[],answer:-1,solid:{shape,label:dimensions.join(' · '),dimensions}}))
export const practiceMissions: Mission[] = [
  {
    id:'modulos', title:'Depósito de módulos', subject:'Medidas, áreas e volumes', difficulty:'easy', icon:'energy',
    description:'Organize os módulos da estação calculando dimensões e superfícies de cubos e caixas.',
    objectives:['Calcular áreas de bases e volumes.', 'Encontrar dimensões desconhecidas.', 'Distinguir área lateral e total.'],
    formulas:['Cubo: V = a³; Aₜ = 6a²','Paralelepípedo: V = c × l × h','Prisma reto: Aₗ = perímetro da base × h; Aₜ = 2Aᵦ + Aₗ'],
    questions:questions([
      ['Uma caixa cúbica tem aresta de 5 cm. Calcule a área de uma face.',25,'cm²','Cada face é um quadrado: A = 5² = 25 cm².','cube',['a = 5 cm']],
      ['Um módulo cúbico tem aresta de 7 cm. Qual é seu volume?',343,'cm³','V = a³ = 7³ = 343 cm³.','cube',['a = 7 cm']],
      ['Uma caixa retangular mede 9 cm de comprimento, 4 cm de largura e 3 cm de altura. Calcule o volume.',108,'cm³','V = 9 × 4 × 3 = 108 cm³.','prism',['c = 9 cm','l = 4 cm','h = 3 cm']],
      ['Um prisma reto de base quadrada tem lado da base de 5 cm e altura de 7 cm. Qual é sua área lateral?',140,'cm²','P = 4 × 5 = 20 cm. Aₗ = P × h = 20 × 7 = 140 cm².','prism',['lado da base = 5 cm','h = 7 cm']],
      ['Um cubo possui área total de 150 cm². Calcule a medida da aresta.',5,'cm','6a² = 150, então a² = 25 e a = 5 cm.','cube',['Aₜ = 150 cm²']],
      ['Uma caixa retangular tem volume de 180 cm³, comprimento de 6 cm e largura de 5 cm. Calcule a altura.',6,'cm','h = V / (c × l) = 180 / (6 × 5) = 6 cm.','prism',['V = 180 cm³','c = 6 cm','l = 5 cm']],
    ]),
  },
  {
    id:'reservatorios', title:'Reserva de água', subject:'Cilindros, cones e capacidade', difficulty:'easy', icon:'life',
    description:'Dimensione reservatórios e pratique cálculos com raio, diâmetro e capacidade.',
    objectives:['Converter diâmetro em raio.', 'Calcular volumes de corpos redondos.', 'Converter metros cúbicos em litros.'],
    formulas:['r = diâmetro / 2','Cilindro: Aᵦ = πr²; V = πr²h','Cone: V = πr²h / 3','1 m³ = 1.000 L'],
    questions:questions([
      ['Um reservatório cilíndrico tem diâmetro de 10 cm. Qual é seu raio?',5,'cm','O raio é metade do diâmetro: r = 10 / 2 = 5 cm.','cylinder',['d = 10 cm']],
      ['Uma base circular tem raio de 4 cm. Adote π = 3 e calcule sua área.',48,'cm²','Aᵦ = πr² = 3 × 4² = 48 cm².','cylinder',['r = 4 cm','π = 3']],
      ['Um cilindro tem raio de 2 cm e altura de 9 cm. Adote π = 3 e calcule seu volume.',108,'cm³','V = 3 × 2² × 9 = 108 cm³.','cylinder',['r = 2 cm','h = 9 cm','π = 3']],
      ['Um cone tem raio de 4 cm e altura perpendicular de 6 cm. Adote π = 3 e calcule seu volume.',96,'cm³','V = πr²h / 3 = 3 × 16 × 6 / 3 = 96 cm³.','cone',['r = 4 cm','h = 6 cm','π = 3']],
      ['Um reservatório cilíndrico comporta 2,5 m³ de água. Qual é essa capacidade em litros?',2500,'L','Cada metro cúbico equivale a 1.000 L. Portanto, 2,5 × 1.000 = 2.500 L.','cylinder',['V = 2,5 m³']],
      ['Um cilindro tem volume de 192 cm³ e raio de 4 cm. Adote π = 3 e calcule sua altura.',4,'cm','h = V / (πr²) = 192 / (3 × 16) = 4 cm.','cylinder',['V = 192 cm³','r = 4 cm','π = 3']],
    ]),
  },
  {
    id:'bases', title:'Oficina de bases', subject:'Apótemas e superfícies', difficulty:'intermediate', icon:'navigation',
    description:'Investigue como o perímetro e os apótemas determinam as áreas dos poliedros.',
    objectives:['Determinar apótemas de bases quadradas.', 'Aplicar Aᵦ = P × aᵦ / 2.', 'Calcular áreas laterais e totais.'],
    formulas:['Quadrado: aᵦ = lado / 2','Base regular: Aᵦ = P × aᵦ / 2','Prisma reto: Aₗ = P × h','Pirâmide regular: Aₗ = P × aₗ / 2'],
    questions:questions([
      ['A base quadrada de um prisma tem lado de 14 cm. Calcule o apótema da base.',7,'cm','O apótema do quadrado liga o centro ao ponto médio do lado: aᵦ = 14 / 2 = 7 cm.','prism',['lado da base = 14 cm']],
      ['A base quadrada de uma pirâmide tem perímetro de 32 cm. Determine a área da base.',64,'cm²','O lado mede 32 / 4 = 8 cm. Aᵦ = 8² = 64 cm².','pyramid',['P da base = 32 cm']],
      ['Um prisma reto de base quadrada tem apótema da base de 3 cm e altura de 9 cm. Calcule a área lateral.',216,'cm²','O lado da base mede 2 × 3 = 6 cm; P = 24 cm. Aₗ = 24 × 9 = 216 cm².','prism',['aᵦ = 3 cm','h = 9 cm']],
      ['Uma pirâmide regular de base quadrada tem lado de 8 cm e apótema lateral de 10 cm. Calcule a área lateral.',160,'cm²','P = 4 × 8 = 32 cm. Aₗ = P × aₗ / 2 = 32 × 10 / 2 = 160 cm².','pyramid',['lado da base = 8 cm','aₗ = 10 cm']],
      ['Um prisma reto de base quadrada tem lado de 4 cm e altura de 6 cm. Calcule sua área total.',128,'cm²','Aᵦ = 16 cm²; Aₗ = 16 × 6 = 96 cm². Aₜ = 2 × 16 + 96 = 128 cm².','prism',['lado da base = 4 cm','h = 6 cm']],
      ['Uma pirâmide regular tem base quadrada de apótema 4 cm e apótema lateral 9 cm. Calcule sua área total.',208,'cm²','O lado da base é 8 cm. Aᵦ = 64 cm² e P = 32 cm. Aₗ = 32 × 9 / 2 = 144 cm². Aₜ = 64 + 144 = 208 cm².','pyramid',['aᵦ = 4 cm','aₗ = 9 cm']],
    ]),
  },
  {
    id:'antenas', title:'Rede de antenas', subject:'Alturas, geratrizes e revestimentos', difficulty:'intermediate', icon:'communication',
    description:'Relacione medidas perpendiculares e inclinadas para projetar antenas e torres.',
    objectives:['Encontrar alturas usando Pitágoras.', 'Calcular áreas laterais e totais.', 'Usar o raio correto nos cálculos.'],
    formulas:['Cone reto: g² = h² + r²','Cone: Aₗ = πrg; Aₜ = πr² + πrg','Cilindro fechado: Aₜ = 2πr² + 2πrh','Pirâmide regular: aₗ² = h² + aᵦ²'],
    questions:questions([
      ['Um cone reto tem raio de 5 cm e altura de 12 cm. Determine sua geratriz.',13,'cm','g² = 5² + 12² = 169. Logo g = 13 cm.','cone',['r = 5 cm','h = 12 cm']],
      ['Um cone reto tem raio de 8 cm e geratriz de 17 cm. Calcule sua altura perpendicular.',15,'cm','h² = g² − r² = 17² − 8² = 225. Portanto h = 15 cm.','cone',['r = 8 cm','g = 17 cm']],
      ['Um cone tem raio de 5 cm e geratriz de 13 cm. Adote π = 3 e calcule a área lateral.',195,'cm²','Aₗ = πrg = 3 × 5 × 13 = 195 cm².','cone',['r = 5 cm','g = 13 cm','π = 3']],
      ['Um cone tem raio de 5 cm e geratriz de 13 cm. Adote π = 3 e calcule sua área total, incluindo a base.',270,'cm²','Aᵦ = 3 × 25 = 75 cm². Aₗ = 3 × 5 × 13 = 195 cm². Aₜ = 75 + 195 = 270 cm².','cone',['r = 5 cm','g = 13 cm','π = 3']],
      ['Um cilindro fechado tem raio de 3 cm e altura de 7 cm. Adote π = 3 e calcule a área total.',180,'cm²','As bases somam 2 × 3 × 9 = 54 cm². A lateral é 2 × 3 × 3 × 7 = 126 cm². Aₜ = 180 cm².','cylinder',['r = 3 cm','h = 7 cm','π = 3']],
      ['Uma pirâmide regular de base quadrada tem lado da base de 16 cm e apótema lateral de 17 cm. Calcule sua altura.',15,'cm','aᵦ = 16 / 2 = 8 cm. h² = 17² − 8² = 225. Logo h = 15 cm.','pyramid',['lado da base = 16 cm','aₗ = 17 cm']],
    ]),
  },
  {
    id:'calibracao', title:'Calibração de estruturas', subject:'Problemas inversos e semelhança', difficulty:'hard', icon:'navigation',
    description:'Recupere medidas desconhecidas combinando fórmulas de áreas, volumes e semelhança.',
    objectives:['Resolver cálculos em várias etapas.', 'Recuperar medidas a partir de áreas.', 'Aplicar fatores de escala a áreas e volumes.'],
    formulas:['Pirâmide: h = 3V / Aᵦ','Semelhança: áreas × k²; volumes × k³','Cone: r² = 3V / (πh)','Cubo: diagonal espacial = a√3'],
    questions:questions([
      ['Uma pirâmide regular tem base quadrada de lado 12 cm e volume de 384 cm³. Calcule o apótema lateral.',10,'cm','Aᵦ = 144 cm²; h = 3 × 384 / 144 = 8 cm; aᵦ = 6 cm. aₗ = √(8² + 6²) = 10 cm.','pyramid',['lado = 12 cm','V = 384 cm³']],
      ['Uma pirâmide regular tem base quadrada de lado 12 cm e volume de 384 cm³. Calcule a área total.',384,'cm²','h = 8 cm e aᵦ = 6 cm, então aₗ = 10 cm. Aₗ = 48 × 10 / 2 = 240 cm². Aₜ = 144 + 240 = 384 cm².','pyramid',['lado = 12 cm','V = 384 cm³']],
      ['Um cone reto tem volume de 300 cm³ e altura de 12 cm. Adote π = 3 e determine o raio.',5,'cm','r² = 3V / (πh) = 900 / 36 = 25; r = 5 cm.','cone',['V = 300 cm³','h = 12 cm','π = 3']],
      ['Um cubo tem diagonal espacial de 6√3 cm. Determine sua área total.',216,'cm²','d = a√3 implica a = 6 cm. Aₜ = 6a² = 6 × 36 = 216 cm².','cube',['d = 6√3 cm']],
      ['Duas pirâmides são semelhantes. Cada medida linear da maior é 3 vezes a correspondente da menor, cujo volume é 40 cm³. Calcule o volume da maior.',1080,'cm³','O volume escala com k³. V maior = 40 × 3³ = 40 × 27 = 1.080 cm³.','pyramid',['k = 3','V menor = 40 cm³']],
      ['Dois cubos são semelhantes. O volume do maior é 8 vezes o do menor. Se a área total do menor é 54 cm², calcule a área total do maior.',216,'cm²','k³ = 8, então k = 2. As áreas escalam com k² = 4. A maior = 54 × 4 = 216 cm².','cube',['razão de volumes = 8','A menor = 54 cm²']],
    ]),
  },
  {
    id:'expedicao', title:'Expedição de engenharia', subject:'Aplicações de geometria espacial', difficulty:'hard', icon:'energy',
    description:'Planeje revestimentos, capacidades e encaixes em situações de engenharia da estação.',
    objectives:['Calcular espessuras e dimensões úteis.', 'Converter capacidade e determinar alturas.', 'Comparar sólidos pela superfície e pelo volume.'],
    formulas:['Paralelepípedo: V = c × l × h','Cilindro: V = πr²h','Esfera: A = 4πr²; V = 4πr³ / 3','Cone: g = √(r² + h²); Aₜ = πr(r + g)'],
    questions:questions([
      ['Uma caixa cúbica fechada tem aresta externa de 10 cm e paredes de espessura uniforme de 1 cm em todas as faces. Calcule o volume interno.',512,'cm³','A aresta interna é 10 − 2 × 1 = 8 cm. O espaço interno tem volume 8³ = 512 cm³.','cube',['aresta externa = 10 cm','espessura = 1 cm']],
      ['Uma esfera tem área de superfície de 300 cm². Adote π = 3 e calcule seu volume.',500,'cm³','300 = 4 × 3 × r², então r² = 25 e r = 5 cm. V = 4 × 3 × 125 / 3 = 500 cm³.','sphere',['A = 300 cm²','π = 3']],
      ['Um reservatório cilíndrico tem raio interno de 2 m e precisa comportar 60.000 L. Adote π = 3 e calcule a altura interna.',5,'m','60.000 L = 60 m³. h = V / (πr²) = 60 / (3 × 4) = 5 m.','cylinder',['r interno = 2 m','capacidade = 60.000 L','π = 3']],
      ['Uma esfera de raio 6 cm será fundida em esferas de raio 2 cm, sem perda de material. Quantas esferas menores serão obtidas?',27,'unidades','O volume é proporcional a r³. Quantidade = (6 / 2)³ = 27 esferas.','sphere',['R = 6 cm','r = 2 cm']],
      ['Uma caixa retangular fechada tem volume de 240 cm³, comprimento de 8 cm e largura de 5 cm. Calcule a área total.',236,'cm²','h = 240 / (8 × 5) = 6 cm. Aₜ = 2(8 × 5 + 8 × 6 + 5 × 6) = 2(40 + 48 + 30) = 236 cm².','prism',['V = 240 cm³','c = 8 cm','l = 5 cm']],
      ['Um cone reto tem raio de 9 cm e altura de 12 cm. Adote π = 3 e calcule a área total.',648,'cm²','g = √(9² + 12²) = 15 cm. Aₜ = πr(r + g) = 3 × 9 × (9 + 15) = 648 cm².','cone',['r = 9 cm','h = 12 cm','π = 3']],
    ]),
  },
]