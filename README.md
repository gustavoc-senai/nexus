# Estação Nexus

Plataforma de aprendizagem exclusivamente de geometria espacial em React, TypeScript e Vite. Interface responsiva de centro de comando, imagens otimizadas e ícones SVG.

## Executar e validar

```sh
npm install
npm run dev
npm run build
npm run lint
npm test
```

Configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` em `.env`. Use apenas uma chave pública; nunca use `service_role` no frontend. Para hospedagem, configure fallback das rotas para `index.html` e permita `/reset-password` nos redirecionamentos do Supabase Auth.

## Instalação do banco

A aplicação está integrada às tabelas e funções em `supabase/schema.sql`. A instalação no projeto remoto ainda não foi executada: a conexão disponível nesta sessão não concedeu acesso ao projeto configurado no `.env` (`frytnmuznwondlbuwrvx`). Os testes de SQL foram executados em um Postgres local em memória, sem alterar dados reais.

Antes da instalação, confira os campos e tipos de `profiles`: `id`, `full_name`, `email`, `phone`, `role`, `avatar_url` e `is_active`. Os papéis devem ser `student`, `teacher` e `admin`. Revise os triggers existentes de criação de perfil: nenhum deve atribuir privilégios a partir de `user_metadata`. Verifique também as políticas existentes. O esquema mantém os papéis de perfis existentes e adiciona restrições de acesso e proteção dos campos de autorização.

```sh
npm run db:prepare
```

Esse comando gera `supabase/catalog.sql`, com os gabaritos dos 96 desafios, e `supabase/setup.sql`, que reúne esquema e catálogo em uma transação. No SQL Editor do **mesmo projeto indicado no `.env`**, execute `supabase/setup.sql` para a instalação inicial. O arquivo não deve ser reaplicado sobre uma instalação já realizada: mudanças futuras devem usar migrations próprias. Não exponha o schema `nexus_private` na Data API. Depois da instalação, execute os advisors de segurança do Supabase e valide os fluxos com contas reais de aluno e professor.

Novos cadastros recebem perfil de aluno. A atribuição de professor ou administrador deve ocorrer por uma operação administrativa confiável no banco, usando o UUID da conta correspondente. O usuário não pode trocar seu papel pelo frontend.

## Autorização e persistência

- Alunos acessam `/student`; professores e administradores, `/teacher`. Cada perfil é redirecionado ao próprio portal ao tentar abrir o outro. Não há alternância de perfis.
- `/demo` contém apenas a experiência de aluno para visitantes. Contas autenticadas são redirecionadas ao seu portal. A demonstração usa armazenamento local separado.
- Contas de aluno carregam tentativas e rascunhos do Supabase. Resultados são corrigidos pelo servidor, com pré-requisitos e identificador de requisição para evitar duplicação em novas tentativas de envio.
- Rascunhos têm cópia local por conta e sincronização com o servidor. Erros de conexão são informados; um resultado só é mostrado como salvo após confirmação do banco.
- Professores acessam somente suas próprias turmas, desafios e resultados dos alunos vinculados a essas turmas. Não acessam os rascunhos pessoais dos alunos.
- RLS protege todas as novas tabelas públicas. Gabaritos do catálogo ficam em schema privado. Desafios autorais entregam aos alunos apenas o enunciado e os dados públicos; a resolução é liberada depois da resposta.

Os registros antigos de contas autenticadas, que continham apenas contagens agregadas no navegador, não são importados automaticamente como notas verificadas. As antigas chaves locais são preservadas. A demonstração continua usando o histórico local compatível com o currículo de geometria espacial.

## Aprendizagem

15 setores e 96 desafios: 5 setores por nível (fácil, intermediário e difícil), 16 questões de múltipla escolha e 80 respostas numéricas. Conteúdos: cubos, prismas, pirâmides, cilindros, cones, esferas, hemisférios, cavidades, sólidos compostos, diagonais e semelhança. Campos numéricos aceitam vírgula ou ponto, sem separador de milhar.

Cada missão oferece fórmulas, diagramas, três dicas progressivas, rascunho salvo e resolução comentada. Missões interrompidas podem ser retomadas na etapa anterior. A recomendação prioriza revisões com baixa precisão na tentativa mais recente e respeita os setores desbloqueados. Para abrir o setor seguinte, é necessário pelo menos 60% de acertos.

O laboratório `/explorer`, disponível em ambos os portais e na demonstração, contém 18 sólidos organizados por família e permite girá-los por arraste ou teclado, destacar superfícies, observar altura e raio e consultar planificações. A esfera possui uma explicação sobre a impossibilidade de planificação exata. Inclui prismas triangulares, pentagonais, hexagonais e octagonais, paralelepípedo retângulo, pirâmides de diferentes bases e tetraedro, octaedro, dodecaedro e icosaedro regulares. Os poliedros mostram faces, arestas, vértices e a relação de Euler. Os novos prismas e pirâmides possuem planificações; octaedro, dodecaedro e icosaedro podem ser explorados em 3D. Os modelos são didáticos; as medidas dos exercícios permanecem no diagrama principal.

## Gestão do professor

`/teacher/classes`: criar, renomear, arquivar e reativar turmas; copiar código de ingresso; consultar e remover vínculos de alunos. Arquivar preserva o histórico e suspende o ingresso e o acesso aos desafios atribuídos.

Em `/teacher/classes`, o botão **Adicionar exercícios e desafios** abre o editor com a turma já selecionada. Preencha o exercício e use **Publicar para a turma**. O banco mostra os desafios dessa turma; sem turma selecionada, o professor pode usar **Salvar no meu banco**.

`/teacher/challenges`: criar e editar exercícios autorais de cálculo, com sólido, nível, enunciado, resposta, unidade e resolução. Um desafio pode ficar no banco pessoal ou ser disponibilizado para uma turma. O aluno busca pelo código em `/student/classroom`, confere o nome da turma e do professor e confirma sua entrada. A busca não cria vínculo automaticamente. As listas de turmas e alunos do professor atualizam a cada 15 segundos enquanto a página está visível, além de atualizar ao voltar à janela. O aluno recebe os exercícios atribuídos.

Para uma instalação Nexus já existente, execute somente `supabase/class-enrollment.sql` para adicionar a busca e atualizar as regras de ingresso. Para a instalação inicial, essas mudanças já estão incluídas em `supabase/setup.sql`.

As páginas de alunos, desempenho e estatísticas consultam dados reais, com estados de carregamento, vazio e erro. Indicadores das missões se organizam por conteúdo e consideram as tentativas registradas.

## Estrutura e acessibilidade

Shell dividido em `AppLayout`, `Sidebar`, `Topbar` e configuração de navegação. Páginas carregadas sob demanda com estado de carregamento e recuperação de erros. Estilos organizados em `src/styles`, incluindo `learning.css` para os novos recursos.

No celular, navegação inferior para os destinos principais e menu lateral para os demais. O menu gerencia foco, fecha por Escape e bloqueia a rolagem do fundo. A interface possui link para pular ao conteúdo, controles rotulados, feedback de estado, operação dos modelos 3D por teclado e respeito à preferência de movimento reduzido.

## Testes

`npm test` executa testes do currículo, cálculos, papéis, recomendações, validação de rascunhos, geometria 3D e regras de banco. Os testes de banco usam `@electric-sql/pglite` apenas como dependência de desenvolvimento, com identidades de autenticação simuladas. Eles verificam isolamento entre contas, RLS, ingresso em turmas, correção no servidor, duplicação de requisições, rascunhos e bloqueio de visitantes. Não substituem a validação do projeto Supabase real nem de seus triggers e políticas preexistentes.
As seis missões adicionais formam uma segunda expedição de revisão e aprofundamento, após os nove setores originais. A ordem original foi preservada. Em instalações existentes, atualize somente `supabase/catalog.sql` para sincronizar os novos gabaritos.

## Acompanhamento de missões

Em instalações existentes, execute `supabase/mission-analytics.sql` uma vez no projeto Nexus antes de publicar esta versão. O setup inicial gerado já inclui essa atualização. Dicas por desafio são salvas junto com a conclusão da tentativa; retomar um rascunho mantém a contagem. Tentativas antigas e rascunhos anteriores sem telemetria aparecem como “Não registrado”. O professor acessa somente alunos vinculados às suas turmas, pelas políticas existentes. A precisão é a razão entre todos os acertos e todas as respostas; o melhor resultado é mostrado separadamente.

## Chat e videoaulas

Em instalações existentes, execute `supabase/classroom-support.sql` no projeto Nexus. O setup inicial gerado já inclui essa atualização. Alunos conversam em canais privados com o professor da turma; apenas participantes ativos têm acesso. Conversas mostram as últimas 100 mensagens e atualizam a cada 5 segundos com a página visível. Videoaulas são links HTTPS por turma, publicados e removidos pelo professor, abertos em uma nova aba. Turmas arquivadas não permitem novas conversas ou publicações.

## Tarefas com prazo

Em instalações existentes, execute `supabase/classroom-tasks.sql`. O setup inicial inclui a atualização. O professor publica e edita atividades por turma com prazo no horário de Brasília. Os alunos registram a própria conclusão, inclusive após o prazo, com data definida pelo banco. O professor acompanha cada aluno; conclusões são declarações do aluno, não correções automáticas de exercícios.

## Perfil escolhido no cadastro

Execute `supabase/registration-roles.sql` em instalações existentes. Novas contas escolhem aluno ou professor. A opção `signup_role` é lida somente no evento de criação da conta; o papel efetivo é persistido em `profiles.role`. Alterações posteriores de metadados não promovem a conta, e a opção admin não é aceita. Contas existentes não são alteradas.

## Matemática básica

Nova área `/student/basic` e demonstração `/demo/basic`, com 12 missões e 96 exercícios das quatro operações, em três etapas por operação. Todas as etapas podem ser praticadas sem concluir a geometria. O professor consulta os exercícios em `/teacher/basic` e os resultados na página de desempenho de cada aluno. As tentativas, dicas e rascunhos usam as mesmas tabelas protegidas do projeto; o progresso dos setores de geometria é contado separadamente.

Para uma instalação Nexus existente, execute **somente `supabase/basic-math.sql`** para ativar a correção no servidor e inserir os novos gabaritos. Esse arquivo é gerado por `npm run db:prepare` e inclui a atualização de analytics necessária. Não execute o setup inicial novamente. A instalação inicial gerada já inclui as duas áreas. As ilustrações de contagem e agrupamento são SVG locais, sem emojis, e usam quantidades exatas para os desenhos de objetos; números maiores são mostrados em cartões numéricos.


### Trilhas, diagnóstico e organização da aprendizagem

Em uma instalação Nexus existente, execute apenas **supabase/learning-paths.sql** no editor SQL do projeto. O arquivo contém uma transação e pode ser reaplicado. Inclui o catálogo básico completo, as novas atividades, a telemetria necessária e a coluna de atividades vinculadas às tarefas. Não execute setup.sql novamente em uma instalação existente. Para uma instalação nova, setup.sql já inclui estes recursos.

- Trilhas em /student/learn, /demo/learn e /teacher/learn: 11 assuntos organizados em três etapas. São 45 atividades e 300 questões de prática ao todo, incluindo as 15 missões espaciais e as 12 atividades das quatro operações já existentes. As 18 atividades novas acrescentam 108 exercícios.
- Diagnóstico orientativo de oito perguntas em /student/practice/basic-diagnostic (também no demo). O resultado é uma tentativa corrigida pelo servidor para contas autenticadas. Não vale nota, não bloqueia conteúdos e fica fora dos indicadores docentes de prática. A sugestão usa faixas de acerto (menos de 3, de 3 a 5, de 6 a 8); não é um diagnóstico pedagógico validado. Pode ser refeito e a etapa pode ser escolhida manualmente.
- Início adaptado à etapa selecionada. Etapa manual, acessibilidade e leitura dos avisos ficam neste navegador, separados por conta e da demonstração. O diagnóstico salvo no banco permite recuperar a sugestão em outro dispositivo. Sem diagnóstico, contas com tentativas de geometria espacial recebem uma sugestão de continuidade nessa etapa.
- Revisão em /student/review: usa os erros da tentativa mais recente de cada atividade, com resoluções e links de prática no mesmo assunto. Refazer a atividade atualiza a lista. A revisão não gera notas fictícias.
- Planejamento em /teacher/tasks: selecionar até 30 atividades do catálogo, instruções e prazo de Brasília em um único formulário. Os alunos abrem os links diretamente em suas tarefas. Missões de geometria mantêm seus pré-requisitos. A conclusão da tarefa continua sendo uma declaração do aluno; o desempenho é medido nas tentativas das atividades, separadamente.
- Indicadores por assunto no progresso do aluno, no desempenho individual docente e nas estatísticas da turma: acerto ponderado por respostas, primeira e última tentativa, dicas e questões com apoio. Resultados agregados da turma não apresentam evolução individual fictícia.
- Avisos em /student/notifications e /teacher/notifications: atividades, desafios publicados, novas mensagens e videoaulas conforme as permissões existentes. Pendências com menos de 48 horas ou atrasadas ganham destaque. Até 100 registros recentes por categoria; atualização a cada 15 segundos enquanto a central estiver visível. Leitura é local e não marca tarefas como concluídas; não envia notificações externas.
- Acessibilidade nos portais: ampliar textos, reduzir animações, foco visível e controles de teclado. A preferência de movimento do sistema também é respeitada. A prática aceita vírgula ou ponto para decimais, salva rascunhos e permite retomar ou reenviar a mesma tentativa sem duplicação.

As novas atividades usam a correção numérica já protegida em nexus_submit_basic_attempt. O catálogo de gabaritos permanece privado. Não há mudança de perfil, matrícula ou acesso entre os portais. O SQL foi validado localmente; este processo não aplica mudanças ao projeto remoto automaticamente.
