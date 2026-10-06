import type { Mission } from '../types/database'
import { additionalMissions, foundationExtras } from './geometryCatalog.ts'

const foundationMissions: Mission[] = [
  {
    id: 'energia', difficulty: 'easy', title: 'Núcleo de energia', subject: 'Cubos e paralelepípedos',
    description: 'Reconstrua os módulos de energia explorando faces, áreas e volumes de sólidos.', icon: 'energy',
    objectives: ['Reconhecer faces, arestas e vértices de um cubo.', 'Calcular o volume de cubos e paralelepípedos.', 'Determinar a área total de um cubo.'],
    formulas: ['Cubo: V = a³', 'Cubo: A total = 6a²', 'Paralelepípedo: V = comprimento × largura × altura'],
    questions: [
      { prompt: 'Um módulo da estação tem formato de cubo. Quantas faces, arestas e vértices esse sólido possui?', options: ['6 faces, 12 arestas e 8 vértices', '8 faces, 12 arestas e 6 vértices', '6 faces, 8 arestas e 12 vértices', '4 faces, 6 arestas e 4 vértices'], answer: 0, explanation: 'O cubo possui 6 faces quadradas, 12 arestas e 8 vértices. Também satisfaz a relação de Euler: 8 − 12 + 6 = 2.', solid: { shape: 'cube', label: 'Módulo cúbico' } },
      { prompt: 'Um módulo cúbico tem arestas de 4 m. Qual é o volume desse módulo?', options: ['16 m³', '48 m³', '64 m³', '96 m³'], answer: 2, explanation: 'O volume do cubo é V = a³. Com a = 4 m, V = 4³ = 64 m³. A unidade de volume é cúbica.', solid: { shape: 'cube', label: 'Cubo de aresta 4 m', dimensions: ['a = 4 m'] } },
      { prompt: 'O compartimento de energia é um paralelepípedo retângulo de 6 m de comprimento, 3 m de largura e 2 m de altura. Qual é seu volume?', options: ['11 m³', '18 m³', '36 m³', '72 m³'], answer: 2, explanation: 'V = comprimento × largura × altura = 6 × 3 × 2 = 36 m³.', solid: { shape: 'prism', label: 'Paralelepípedo retângulo', dimensions: ['c = 6 m', 'l = 3 m', 'h = 2 m'] } },
      { prompt: 'Um módulo cúbico de aresta 3 m será revestido em todas as seis faces. Qual é a área total a revestir?', options: ['9 m²', '27 m²', '36 m²', '54 m²'], answer: 3, explanation: 'Cada face tem área a² = 3² = 9 m². Como são 6 faces, A total = 6 × 9 = 54 m². Área é expressa em unidades quadradas.', solid: { shape: 'cube', label: 'Seis faces do cubo', dimensions: ['a = 3 m'] } },
    ],
  },
  {
    id: 'navegacao', difficulty: 'intermediate', title: 'Centro de navegação', subject: 'Prismas e pirâmides',
    description: 'Modele os compartimentos de navegação com prismas e pirâmides.', icon: 'navigation',
    objectives: ['Comparar prismas e pirâmides.', 'Aplicar a relação de Euler em poliedros convexos.', 'Calcular volumes e a área total de uma pirâmide.'],
    formulas: ['Prisma: V = A da base × h', 'Pirâmide: V = (A da base × h) / 3', 'Poliedros convexos: vértices − arestas + faces = 2'],
    questions: [
      { prompt: 'Um compartimento tem formato de prisma triangular. Sua base tem área de 12 m² e a distância entre as bases é 5 m. Qual é seu volume?', options: ['20 m³', '30 m³', '60 m³', '120 m³'], answer: 2, explanation: 'O volume de um prisma é V = A da base × h. Assim, V = 12 × 5 = 60 m³. A altura é a distância perpendicular entre as bases.', solid: { shape: 'prism', label: 'Prisma triangular', dimensions: ['A da base = 12 m²', 'h = 5 m'] } },
      { prompt: 'Uma pirâmide tem base quadrada de lado 6 m e altura perpendicular de 4 m. Qual é seu volume?', options: ['24 m³', '48 m³', '72 m³', '144 m³'], answer: 1, explanation: 'A da base = 6² = 36 m². O volume da pirâmide é V = (36 × 4) / 3 = 48 m³. A altura perpendicular não é a altura inclinada de uma face.', solid: { shape: 'pyramid', label: 'Pirâmide de base quadrada', dimensions: ['lado da base = 6 m', 'h = 4 m'] } },
      { prompt: 'Uma estrutura em formato de pirâmide de base quadrada possui 5 vértices e 5 faces. Quantas arestas possui?', options: ['5', '8', '10', '12'], answer: 1, explanation: 'Pela relação de Euler, V − A + F = 2. Então 5 − A + 5 = 2 e A = 8. São 4 arestas na base e 4 ligando a base ao ápice.', solid: { shape: 'pyramid', label: 'Pirâmide: 5 vértices e 5 faces' } },
      { prompt: 'Uma pirâmide regular de base quadrada tem lado da base de 6 m e apótema lateral de 5 m. Qual é sua área total, incluindo a base?', options: ['60 m²', '66 m²', '96 m²', '120 m²'], answer: 2, explanation: 'A base tem 6² = 36 m². Cada uma das 4 faces triangulares tem área (6 × 5) / 2 = 15 m². A total = 36 + 4 × 15 = 96 m². O apótema lateral é a altura de uma face triangular.', solid: { shape: 'pyramid', label: 'Pirâmide regular', dimensions: ['lado da base = 6 m', 'apótema lateral = 5 m'] } },
    ],
  },
  {
    id: 'comunicacao', difficulty: 'intermediate', title: 'Torre de comunicação', subject: 'Cilindros e cones',
    description: 'Dimensione antenas e torres estudando os corpos redondos da estação.', icon: 'communication',
    objectives: ['Calcular o volume de cilindros e cones.', 'Distinguir área lateral de área total.', 'Relacionar raio, altura e geratriz de um cone reto.'],
    formulas: ['Cilindro: V = πr²h', 'Cilindro: A lateral = 2πrh', 'Cilindro fechado: A total = 2πr² + 2πrh', 'Cone: V = πr²h / 3 · A lateral = πrg'],
    questions: [
      { prompt: 'Uma torre cilíndrica tem raio de 3 m e altura de 8 m. Qual é seu volume? Mantenha π na resposta.', options: ['24π m³', '48π m³', '72π m³', '144π m³'], answer: 2, explanation: 'V = πr²h = π × 3² × 8 = 72π m³. O raio é a distância do centro da base até sua borda, metade do diâmetro.', solid: { shape: 'cylinder', label: 'Torre cilíndrica', dimensions: ['r = 3 m', 'h = 8 m'] } },
      { prompt: 'Um cilindro fechado tem raio de 2 m e altura de 5 m. Qual é sua área total, incluindo as duas bases?', options: ['20π m²', '24π m²', '28π m²', '40π m²'], answer: 2, explanation: 'A lateral = 2πrh = 2π × 2 × 5 = 20π m². As duas bases somam 2πr² = 8π m². A total = 20π + 8π = 28π m².', solid: { shape: 'cylinder', label: 'Cilindro fechado', dimensions: ['r = 2 m', 'h = 5 m'] } },
      { prompt: 'A antena tem formato de cone reto com raio de 3 m e altura perpendicular de 4 m. Qual é seu volume?', options: ['9π m³', '12π m³', '15π m³', '36π m³'], answer: 1, explanation: 'V = πr²h / 3 = (π × 3² × 4) / 3 = 12π m³. Um cone tem um terço do volume de um cilindro com a mesma base e altura.', solid: { shape: 'cone', label: 'Cone circular reto', dimensions: ['r = 3 m', 'h = 4 m'] } },
      { prompt: 'Um cone circular reto tem raio de 3 m e geratriz de 5 m. Qual é a área lateral, sem incluir a base?', options: ['9π m²', '12π m²', '15π m²', '24π m²'], answer: 2, explanation: 'A lateral = πrg = π × 3 × 5 = 15π m². A geratriz é a medida inclinada do ápice à borda da base. A base não entra no cálculo da área lateral.', solid: { shape: 'cone', label: 'Superfície lateral do cone', dimensions: ['r = 3 m', 'g = 5 m'] } },
    ],
  },
  {
    id: 'suporte', difficulty: 'intermediate', title: 'Suporte à vida', subject: 'Esferas e hemisférios',
    description: 'Planeje reservatórios esféricos e cúpulas para proteger a tripulação.', icon: 'life',
    objectives: ['Distinguir superfície esférica de volume da esfera.', 'Calcular áreas e volumes de esferas.', 'Determinar o volume de um hemisfério.'],
    formulas: ['Esfera: A = 4πr²', 'Esfera: V = 4πr³ / 3', 'Hemisfério: V = 2πr³ / 3'],
    questions: [
      { prompt: 'Um reservatório esférico tem raio de 3 m. Qual é seu volume? Mantenha π na resposta.', options: ['12π m³', '27π m³', '36π m³', '108π m³'], answer: 2, explanation: 'V = 4πr³ / 3 = (4π × 3³) / 3 = 36π m³. O volume descreve o espaço ocupado pelo sólido.', solid: { shape: 'sphere', label: 'Reservatório esférico', dimensions: ['r = 3 m'] } },
      { prompt: 'Uma esfera de raio 5 m precisa de revestimento em toda a superfície. Qual é a área a revestir?', options: ['25π m²', '50π m²', '100π m²', '125π m²'], answer: 2, explanation: 'A superfície da esfera tem área A = 4πr² = 4π × 5² = 100π m². Não confunda essa área com πr², que é a área de um círculo.', solid: { shape: 'sphere', label: 'Superfície esférica', dimensions: ['r = 5 m'] } },
      { prompt: 'Uma cúpula tem formato de hemisfério de raio 3 m. Qual é o volume interno dessa meia esfera?', options: ['9π m³', '18π m³', '27π m³', '36π m³'], answer: 1, explanation: 'Um hemisfério é metade de uma esfera. V = 2πr³ / 3 = (2π × 27) / 3 = 18π m³.', solid: { shape: 'sphere', label: 'Hemisfério', dimensions: ['r = 3 m'] } },
      { prompt: 'Um reservatório esférico tem diâmetro de 6 m. Qual é sua área de superfície?', options: ['12π m²', '24π m²', '36π m²', '144π m²'], answer: 2, explanation: 'O raio é metade do diâmetro: r = 6 / 2 = 3 m. A = 4πr² = 4π × 9 = 36π m². Usar o diâmetro no lugar do raio daria um resultado incorreto.', solid: { shape: 'sphere', label: 'Esfera de diâmetro 6 m', dimensions: ['d = 6 m', 'r = 3 m'] } },
    ],
  },
]

export const missions: Mission[] = [...foundationMissions.map(mission => ({ ...mission, questions: [...mission.questions, ...foundationExtras[mission.id]] })), ...additionalMissions].sort((a, b) => ({ easy: 0, intermediate: 1, hard: 2 }[a.difficulty] - { easy: 0, intermediate: 1, hard: 2 }[b.difficulty]))


