# Estação Nexus

Plataforma educacional em React, TypeScript e Vite, com identidade de centro de comando espacial, navegação responsiva e ícones SVG.

## Executar

```sh
npm install
npm run dev
```

A rota `/` abre o login. Cada conta acessa apenas o portal autorizado pelo perfil: alunos em `/student`, professores e administradores em `/teacher`. URLs do outro portal redirecionam para o próprio portal. A demonstração em `/demo` é exclusiva para visitantes e contém somente a experiência de aluno; contas autenticadas são redirecionadas ao próprio portal. Não há alternância de perfis. As missões têm perguntas interativas, figuras SVG acessíveis, referências de fórmulas, explicações, resultados e desbloqueio sequencial com pelo menos 60% de acertos. O progresso é local, separado entre demonstração e cada conta autenticada.

## Autenticação

Configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` em `.env`. Use somente uma chave pública no frontend. O projeto existente consulta `profiles` com `id`, `full_name`, `email`, `phone`, `role`, `avatar_url` e `is_active`. Perfis ausentes, inativos ou com papel inválido não acessam as rotas protegidas.

Login, cadastro, recuperação e redefinição de senha usam Supabase Auth. Configure `/reset-password` como URL de redirecionamento permitida no Supabase. A criação do perfil e a atribuição de papéis precisam ser feitas pelo backend. As políticas RLS devem proteger os dados no servidor; a proteção de rotas é apenas uma camada da interface.

## Escopo dos dados

O catálogo contém 9 setores e 54 desafios exclusivamente de geometria espacial, com 3 setores por nível: fácil, intermediário e difícil. Inclui cubos, prismas, pirâmides, cilindros, cones, esferas, hemisférios, sólidos compostos, cavidades, diagonais e semelhança. São 16 questões de múltipla escolha e 38 exercícios de resposta numérica, com espaço de rascunho, unidade de medida e resolução comentada. O campo numérico aceita vírgula ou ponto decimal, sem separador de milhar. Os níveis podem ser filtrados nos catálogos de aluno e professor; o desbloqueio segue a ordem do mapa. Os novos setores preservam os registros das missões de geometria já realizadas. O armazenamento local usa uma nova versão de currículo para que tentativas antigas de outros conteúdos não desbloqueiem estas missões. O catálogo é demonstrativo; o portal real de professor aguarda a integração dos alunos. As áreas autenticadas informam que o catálogo e o progresso ainda são locais. A área real de professor mostra estados vazios até a integração das turmas e dos resultados. Nenhuma tabela, política RLS ou conta remota foi criada por esta implementação.

## Validação

```sh
npm run build
npm run lint
npm test
```

Para hospedagem, configure fallback de rotas para `index.html`.


