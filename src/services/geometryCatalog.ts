import type { Mission, Question, Solid } from '../types/database'

function calculation(prompt: string, value: number, unit: string, explanation: string, shape: Solid['shape'], label: string, dimensions: string[], variant?: Solid['variant']): Question {
  return { prompt, numericAnswer: value, unit, options: [], answer: -1, explanation, solid: { shape, label, dimensions, variant } }
}

export const foundationExtras: Record<string, Question[]> = {
  energia: [
    calculation('Um módulo cúbico tem volume de 64 m³. Calcule a medida de sua aresta.', 4, 'm', 'Como V = a³, temos a³ = 64. A raiz cúbica de 64 é 4; portanto, a aresta mede 4 m.', 'cube', 'Aresta desconhecida', ['V = 64 m³']),
    calculation('Um paralelepípedo retângulo tem dimensões 4 m, 3 m e 2 m. Calcule a área total das seis faces.', 52, 'm²', 'A total = 2(cl + ch + lh) = 2(4 × 3 + 4 × 2 + 3 × 2) = 2(12 + 8 + 6) = 52 m².', 'prism', 'Paralelepípedo retângulo', ['c = 4 m', 'l = 3 m', 'h = 2 m']),
  ],
  navegacao: [
    calculation('Um prisma tem volume de 96 m³ e área da base de 12 m². Calcule a distância perpendicular entre as bases.', 8, 'm', 'V = A da base × h. Isolando h: h = 96 / 12 = 8 m.', 'prism', 'Altura desconhecida', ['V = 96 m³', 'A da base = 12 m²']),
    calculation('Uma pirâmide tem volume de 80 m³ e área da base de 48 m². Calcule sua altura perpendicular.', 5, 'm', 'V = A da base × h / 3. Portanto, h = 3V / A da base = 3 × 80 / 48 = 5 m.', 'pyramid', 'Altura da pirâmide', ['V = 80 m³', 'A da base = 48 m²']),
  ],
  comunicacao: [
    calculation('Um cilindro de raio 5 m tem volume de 450 m³. Adote π = 3 e calcule sua altura.', 6, 'm', 'V = πr²h. Assim, h = 450 / (3 × 5²) = 450 / 75 = 6 m.', 'cylinder', 'Altura do cilindro', ['r = 5 m', 'V = 450 m³', 'π = 3']),
    calculation('Um cone circular reto tem raio de 9 m e altura de 12 m. Calcule sua geratriz.', 15, 'm', 'No cone reto, g² = r² + h². Então g² = 9² + 12² = 81 + 144 = 225 e g = 15 m.', 'cone', 'Geratriz desconhecida', ['r = 9 m', 'h = 12 m']),
  ],
  suporte: [
    calculation('Uma esfera tem área de superfície igual a 64π m². Calcule seu raio.', 4, 'm', '4πr² = 64π. Dividindo por 4π, r² = 16. Como o raio é positivo, r = 4 m.', 'sphere', 'Raio desconhecido', ['A = 64π m²']),
    calculation('Um hemisfério de raio 2 m será revestido na superfície curva e na base circular. Adote π = 3 e calcule a área total.', 36, 'm²', 'A área curva do hemisfério é 2πr² e a base é πr². A total = 3πr² = 3 × 3 × 2² = 36 m².', 'sphere', 'Hemisfério', ['r = 2 m', 'Inclui a base', 'π = 3']),
  ],
}

export const additionalMissions: Mission[] = [
  {
    id: 'hangar', title: 'Hangar de cargas', subject: 'Volumes e capacidade', difficulty: 'easy', icon: 'navigation',
    description: 'Calcule o espaço dos compartimentos e a capacidade dos reservatórios da estação.',
    objectives: ['Aplicar fórmulas de volume com medidas conhecidas.', 'Calcular o volume de um prisma de base triangular.', 'Converter metros cúbicos em litros.'],
    formulas: ['Prisma: V = A da base × h', 'Cubo: V = a³', 'Cilindro: V = πr²h', 'Esfera: V = 4πr³ / 3', '1 m³ = 1.000 L'],
    questions: [
      calculation('Uma caixa cúbica de carga tem aresta de 6 m. Calcule seu volume.', 216, 'm³', 'V = a³ = 6³ = 6 × 6 × 6 = 216 m³.', 'cube', 'Caixa cúbica', ['a = 6 m']),
      calculation('Um compartimento retangular mede 4 m de comprimento, 5 m de largura e 6 m de altura. Calcule seu volume.', 120, 'm³', 'V = 4 × 5 × 6 = 120 m³.', 'prism', 'Compartimento de carga', ['c = 4 m', 'l = 5 m', 'h = 6 m']),
      calculation('Um tanque retangular mede 2 m × 1,5 m × 1 m. Quantos litros cabem nele?', 3000, 'L', 'O volume é 2 × 1,5 × 1 = 3 m³. Como 1 m³ equivale a 1.000 L, cabem 3.000 L.', 'prism', 'Tanque retangular', ['c = 2 m', 'l = 1,5 m', 'h = 1 m']),
      calculation('Um tanque cilíndrico tem raio 2 m e altura 5 m. Adote π = 3 e calcule seu volume.', 60, 'm³', 'V = πr²h = 3 × 2² × 5 = 3 × 4 × 5 = 60 m³.', 'cylinder', 'Tanque cilíndrico', ['r = 2 m', 'h = 5 m', 'π = 3']),
      calculation('Um prisma triangular tem base triangular de base 4 m e altura 3 m. A distância entre as bases do prisma é 5 m. Calcule seu volume.', 30, 'm³', 'A base triangular tem área 4 × 3 / 2 = 6 m². O volume do prisma é 6 × 5 = 30 m³.', 'prism', 'Prisma triangular', ['b do triângulo = 4 m', 'altura do triângulo = 3 m', 'h do prisma = 5 m']),
      calculation('Um reservatório esférico tem raio 3 m. Adote π = 3 e calcule seu volume.', 108, 'm³', 'V = 4πr³ / 3 = 4 × 3 × 3³ / 3 = 4 × 27 = 108 m³.', 'sphere', 'Reservatório esférico', ['r = 3 m', 'π = 3']),
    ],
  },
  {
    id: 'oficina', title: 'Oficina de revestimento', subject: 'Áreas de superfícies', difficulty: 'easy', icon: 'energy',
    description: 'Determine quanto material é necessário para revestir os sólidos da estação.',
    objectives: ['Calcular a área total de cubos e paralelepípedos.', 'Distinguir área lateral, área total e superfície aberta.', 'Aplicar fórmulas de superfícies curvas.'],
    formulas: ['Cubo: A total = 6a²', 'Paralelepípedo: A total = 2(cl + ch + lh)', 'Cilindro: A lateral = 2πrh', 'Cone: A lateral = πrg', 'Esfera: A = 4πr²'],
    questions: [
      calculation('Um cubo de aresta 4 m será revestido em todas as faces. Calcule a área total.', 96, 'm²', 'Cada face tem 4² = 16 m². As 6 faces somam 6 × 16 = 96 m².', 'cube', 'Revestimento do cubo', ['a = 4 m']),
      calculation('Um paralelepípedo retângulo mede 2 m × 3 m × 5 m. Calcule a área total.', 62, 'm²', 'A total = 2(2 × 3 + 2 × 5 + 3 × 5) = 2(6 + 10 + 15) = 62 m².', 'prism', 'Seis faces do compartimento', ['c = 2 m', 'l = 3 m', 'h = 5 m']),
      calculation('Apenas a lateral de um cilindro de raio 2 m e altura 4 m será pintada. Adote π = 3. Calcule a área pintada.', 48, 'm²', 'A lateral = 2πrh = 2 × 3 × 2 × 4 = 48 m². As bases não são pintadas.', 'cylinder', 'Lateral do cilindro', ['r = 2 m', 'h = 4 m', 'π = 3']),
      calculation('Uma esfera tem raio 2 m. Adote π = 3 e calcule a área de sua superfície.', 48, 'm²', 'A = 4πr² = 4 × 3 × 2² = 48 m².', 'sphere', 'Superfície esférica', ['r = 2 m', 'π = 3']),
      calculation('Um cone circular reto tem raio 2 m e geratriz 5 m. Adote π = 3 e calcule apenas a área lateral.', 30, 'm²', 'A lateral = πrg = 3 × 2 × 5 = 30 m².', 'cone', 'Revestimento lateral', ['r = 2 m', 'g = 5 m', 'π = 3']),
      calculation('Uma caixa cúbica de aresta 3 m não tem tampa. Calcule a área de material das cinco faces restantes.', 45, 'm²', 'Sem tampa, são 5 faces quadradas. A área é 5 × 3² = 45 m².', 'cube', 'Caixa sem tampa', ['a = 3 m', '5 faces'], 'open-cube'),
    ],
  },
  {
    id: 'observatorio', title: 'Observatório orbital', subject: 'Diagonais e medidas desconhecidas', difficulty: 'hard', icon: 'communication',
    description: 'Use relações geométricas para descobrir dimensões que não aparecem diretamente nos projetos.',
    objectives: ['Calcular diagonais espaciais.', 'Relacionar apótema, altura e base de uma pirâmide.', 'Descobrir dimensões de cones e esferas a partir de outras medidas.'],
    formulas: ['Paralelepípedo: diagonal² = c² + l² + h²', 'Cone reto: g² = r² + h²', 'Pirâmide regular quadrada: apótema² = h² + (lado / 2)²', 'Esfera: V = 4πr³ / 3'],
    questions: [
      calculation('Um paralelepípedo retângulo tem arestas 3 m, 4 m e 12 m. Calcule a diagonal espacial que liga vértices opostos.', 13, 'm', 'd² = 3² + 4² + 12² = 9 + 16 + 144 = 169. Logo, d = √169 = 13 m.', 'prism', 'Diagonal espacial', ['c = 3 m', 'l = 4 m', 'h = 12 m'], 'space-diagonal'),
      calculation('Um cubo tem diagonal espacial 6√3 m. Calcule sua área total.', 216, 'm²', 'No cubo, d = a√3. Então a = 6 m. A total = 6a² = 6 × 36 = 216 m².', 'cube', 'Diagonal do cubo', ['d = 6√3 m'], 'space-diagonal'),
      calculation('Um cone circular reto tem geratriz 13 m e altura 12 m. Adote π = 3 e calcule seu volume.', 300, 'm³', 'r² = g² − h² = 169 − 144 = 25. Portanto, r = 5 m. V = πr²h / 3 = 3 × 25 × 12 / 3 = 300 m³.', 'cone', 'Cone com raio desconhecido', ['g = 13 m', 'h = 12 m', 'π = 3']),
      calculation('Uma pirâmide regular de base quadrada tem lado da base 10 m e apótema lateral 13 m. Calcule seu volume.', 400, 'm³', 'h² = 13² − (10 / 2)² = 169 − 25 = 144. A altura é 12 m. V = 10² × 12 / 3 = 400 m³.', 'pyramid', 'Altura a partir do apótema', ['lado da base = 10 m', 'apótema = 13 m']),
      calculation('Uma esfera tem volume 256 m³. Adote π = 3 e calcule seu diâmetro.', 8, 'm', 'Com π = 3, V = 4r³. Assim, r³ = 256 / 4 = 64, então r = 4 m. O diâmetro é 2r = 8 m.', 'sphere', 'Diâmetro desconhecido', ['V = 256 m³', 'π = 3']),
      calculation('Um cone circular reto tem raio 6 m e altura 8 m. Adote π = 3 e calcule a área total, incluindo a base.', 288, 'm²', 'g = √(6² + 8²) = 10 m. A total = πrg + πr² = 3 × 6 × 10 + 3 × 36 = 180 + 108 = 288 m².', 'cone', 'Área total do cone', ['r = 6 m', 'h = 8 m', 'π = 3']),
    ],
  },
  {
    id: 'laboratorio', title: 'Laboratório de estruturas', subject: 'Sólidos compostos e cavidades', difficulty: 'hard', icon: 'life',
    description: 'Combine volumes, desconte cavidades e calcule a superfície externa de estruturas compostas.',
    objectives: ['Somar volumes de sólidos sem sobreposição.', 'Subtrair volumes de cavidades.', 'Descontar superfícies de contato ao calcular áreas externas.'],
    formulas: ['Volume composto = soma dos volumes sem sobreposição', 'Volume de material = volume externo − volume da cavidade', 'Área externa = soma das áreas − 2 × área de contato'],
    questions: [
      calculation('Um reservatório é formado por um cilindro de raio 3 m e altura 4 m, com um hemisfério de mesmo raio sobre ele. Adote π = 3. Calcule o volume interno total.', 162, 'm³', 'O cilindro tem V = 3 × 9 × 4 = 108 m³. O hemisfério tem V = 2 × 3 × 27 / 3 = 54 m³. Total = 108 + 54 = 162 m³.', 'cylinder', 'Cilindro com cúpula hemisférica', ['r = 3 m', 'h do cilindro = 4 m', 'π = 3'], 'cylinder-hemisphere'),
      calculation('Um cubo maciço de aresta 6 m tem um furo cilíndrico de raio 1 m atravessando-o perpendicularmente entre duas faces opostas. Adote π = 3. Calcule o volume de material restante.', 198, 'm³', 'O cubo tem 6³ = 216 m³. O furo tem altura 6 m e volume 3 × 1² × 6 = 18 m³. Restam 216 − 18 = 198 m³.', 'cube', 'Cubo com furo cilíndrico', ['a = 6 m', 'r do furo = 1 m', 'π = 3'], 'drilled-cube'),
      calculation('Uma estrutura reúne um cilindro de raio 2 m e altura 6 m com um cone de mesma base e altura 3 m sobre ele. Adote π = 3. Calcule seu volume total.', 84, 'm³', 'V do cilindro = 3 × 4 × 6 = 72 m³. V do cone = 3 × 4 × 3 / 3 = 12 m³. Volume total = 84 m³.', 'cylinder', 'Cilindro com topo cônico', ['r = 2 m', 'h do cilindro = 6 m', 'h do cone = 3 m', 'π = 3'], 'cylinder-cone'),
      calculation('Dois cubos de aresta 2 m são unidos por uma face inteira, sem sobreposição. Calcule a área externa do sólido resultante.', 40, 'm²', 'As áreas dos dois cubos somam 2 × 6 × 2² = 48 m². As duas faces de contato deixam de ser externas: 48 − 2 × 4 = 40 m².', 'cube', 'Dois cubos unidos', ['a de cada cubo = 2 m', 'Contato por uma face inteira'], 'joined-cubes'),
      calculation('Um reservatório esférico oco tem raio externo 3 m e raio interno 2 m. Adote π = 3. Calcule o volume de material da parede.', 76, 'm³', 'V externo = 4 × 3³ = 108 m³. V interno = 4 × 2³ = 32 m³. A parede ocupa 108 − 32 = 76 m³.', 'sphere', 'Esfera oca', ['R externo = 3 m', 'r interno = 2 m', 'π = 3'], 'hollow-sphere'),
      calculation('Um bloco retangular de 8 m × 5 m × 4 m possui uma cavidade cúbica de aresta 2 m completamente interna. Calcule o volume de material restante.', 152, 'm³', 'O bloco tem volume 8 × 5 × 4 = 160 m³. A cavidade ocupa 2³ = 8 m³. Volume restante = 160 − 8 = 152 m³.', 'prism', 'Bloco com cavidade cúbica', ['8 m × 5 m × 4 m', 'a da cavidade = 2 m'], 'hollow-prism'),
    ],
  },
  {
    id: 'doca', title: 'Doca de engenharia', subject: 'Semelhança e projetos espaciais', difficulty: 'hard', icon: 'navigation',
    description: 'Planeje ampliações, calcule materiais e resolva projetos com várias etapas geométricas.',
    objectives: ['Relacionar escalas lineares, de área e de volume.', 'Encontrar medidas a partir de volumes.', 'Calcular volumes de revestimentos e reservatórios.'],
    formulas: ['Sólidos semelhantes: áreas variam com k²; volumes, com k³', 'Cilindro: h = V / (πr²)', 'Camada de material: volume externo − volume interno'],
    questions: [
      calculation('Um modelo de cubo tem volume 8 m³. Um segundo cubo tem todas as arestas três vezes maiores. Calcule o volume do segundo cubo.', 216, 'm³', 'A escala linear é k = 3. O volume é multiplicado por k³ = 27. Portanto, 8 × 27 = 216 m³.', 'cube', 'Ampliação de um cubo', ['V inicial = 8 m³', 'Escala linear = 3']),
      calculation('Uma maquete de uma estrutura tem área total 24 cm². O projeto final é semelhante, com todas as medidas lineares cinco vezes maiores. Calcule a área total do projeto final em cm².', 600, 'cm²', 'Áreas variam com k². Como k = 5, a área final é 24 × 5² = 24 × 25 = 600 cm².', 'prism', 'Estruturas semelhantes', ['A inicial = 24 cm²', 'Escala linear = 5']),
      calculation('Uma torre cilíndrica tem raio 2 m e volume 96 m³. Adote π = 3 e calcule a área lateral.', 96, 'm²', 'Primeiro, h = 96 / (3 × 2²) = 8 m. Depois, A lateral = 2 × 3 × 2 × 8 = 96 m².', 'cylinder', 'Altura e revestimento lateral', ['r = 2 m', 'V = 96 m³', 'π = 3']),
      calculation('Um módulo cúbico de aresta 4 m recebe uma camada uniforme de 0,5 m de espessura sobre cada face externa. Calcule o volume da camada adicionada.', 61, 'm³', 'Cada dimensão aumenta 0,5 m de cada lado, então a aresta externa é 5 m. A camada ocupa 5³ − 4³ = 125 − 64 = 61 m³.', 'cube', 'Camada ao redor do cubo', ['a interno = 4 m', 'espessura = 0,5 m']),
      calculation('Um tanque cilíndrico de diâmetro interno 4 m deve comportar 36.000 L. Adote π = 3 e calcule sua altura interna.', 3, 'm', '36.000 L = 36 m³. O raio é 4 / 2 = 2 m. h = 36 / (3 × 2²) = 36 / 12 = 3 m.', 'cylinder', 'Projeto do tanque', ['d interno = 4 m', 'capacidade = 36.000 L', 'π = 3']),
      calculation('Uma pirâmide de base quadrada tem volume 144 m³ e altura 12 m. Calcule o perímetro de sua base.', 24, 'm', 'A da base = 3V / h = 3 × 144 / 12 = 36 m². O lado da base é √36 = 6 m. O perímetro é 4 × 6 = 24 m.', 'pyramid', 'Base quadrada desconhecida', ['V = 144 m³', 'h = 12 m']),
    ],
  },
]


