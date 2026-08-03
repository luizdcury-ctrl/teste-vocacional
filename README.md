# Teste Vocacional Inteligente

Sistema completo de orientação vocacional para alunos do Ensino Médio. O aluno responde
um questionário de 65 perguntas (escala Likert 1-5) e, ao enviar, recebe **imediatamente**
um relatório completo e personalizado: perfil vocacional, gráficos, cursos e profissões
compatíveis, plano de desenvolvimento de 12 meses e mensagem motivacional — sem necessidade
de um especialista interpretar o resultado.

## O que o sistema entrega

- Formulário responsivo com barra de progresso, modo escuro e salvamento automático (retomar de onde parou).
- Motor de pontuação multidimensional (competências, áreas do conhecimento, valores e estilo de ambiente de trabalho).
- 20 perfis vocacionais, cada um com descrição, pontos fortes, desafios, como evoluir, ambiente ideal, forma de aprender e de trabalhar.
- Relatório de resultado com gráfico radar (competências), gráfico de barras (áreas), top 10 cursos e top profissões com faixa salarial/perspectiva/empregabilidade.
- Exportação do relatório em PDF, QR Code e link exclusivo para cada resultado.
- Envio automático do relatório por e-mail (requer configuração de SMTP).
- Painel administrativo para a escola, com estatísticas agregadas (sem expor dados individuais).

## Como rodar localmente

Pré-requisitos: [Node.js](https://nodejs.org) 18 ou superior.

```bash
cd teste-vocacional
npm install
copy .env.example .env
npm start
```

Acesse `http://localhost:3000` para o teste e `http://localhost:3000/admin/` para o painel
da escola (senha padrão: veja `ADMIN_PASSWORD` no `.env`).

## Configuração (arquivo `.env`)

Copie `.env.example` para `.env` e ajuste:

- `ADMIN_PASSWORD`: senha de acesso ao painel administrativo.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`: credenciais de
  e-mail para o envio automático do relatório. Sem isso configurado, o botão "Enviar por e-mail"
  informa ao aluno que o recurso ainda não está disponível — o restante do sistema funciona normalmente.
- `BASE_URL`: URL pública do site (usada para montar o link e o QR Code do resultado). Ajuste
  para o domínio real quando publicar em produção.

## Como os dados são armazenados

Os resultados ficam em `server/data/results.json` (sem banco de dados externo — nenhuma
instalação adicional é necessária). Para escalas maiores (milhares de alunos), essa camada
pode ser trocada por um banco de dados real sem alterar o restante do sistema — toda a
leitura/escrita passa pelas funções de `server/db.js`.

## Atualizando o banco de cursos e profissões

Os dados ficam em arquivos separados, fáceis de editar sem tocar no motor de pontuação:

- `server/data/questions.js` — banco de perguntas (66 perguntas em 6 blocos).
- `server/data/profiles.js` — os 20 perfis vocacionais.
- `server/data/courses.js` — cursos superiores e seus pesos por área/competência.
- `server/data/careers.js` — profissões, faixa salarial, perspectiva e empregabilidade.

Para adicionar um novo curso ou profissão, basta acrescentar um item ao array correspondente,
com pesos de 0 a 1 nas áreas/competências relevantes — o algoritmo de compatibilidade se
ajusta automaticamente.

## Sobre o algoritmo de pontuação

As respostas alimentam um vetor de dimensões (competências, áreas, valores e eixos de
ambiente). Esse vetor é comparado, por similaridade de cosseno, com o vetor "ideal" de cada
perfil/curso/profissão — o que produz percentuais de **afinidade e probabilidade**, não
determinações absolutas ("você nasceu para ser X"). Os detalhes estão em
`server/data/scoring.js`.

## Publicando em produção

Qualquer hospedagem que rode Node.js funciona (Render, Railway, VPS, etc). Pontos de atenção:

1. Defina `BASE_URL` com o domínio real, para o link/QR Code do resultado funcionarem corretamente.
2. Configure o e-mail (SMTP) e o `ADMIN_PASSWORD` antes de divulgar o teste aos alunos.
3. Garanta que a pasta `server/data/` seja persistente entre deploys (não fica em um disco efêmero).
