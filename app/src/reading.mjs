// Exemplos editoriais para as situações e idades já delimitadas no catálogo.
export const editions = {
  'brincar-escolha-livre': {
    title: 'Seguir a brincadeira',
    lead: 'Entre no que a criança já está fazendo e deixe que ela escolha o próximo passo.',
    steps: [
      'Coloque dois brinquedos seguros e conhecidos ao alcance. Espere para ver qual desperta interesse.',
      'Acompanhe uma ação que ela iniciou. Você pode fazer o mesmo com outro brinquedo ou comentar o que viu.',
      'Faça uma pausa. Se ela inventar outra coisa, acompanhe. Se largar o brinquedo e sair, a brincadeira pode terminar ali.'
    ],
    examples: [
      ['Com os blocos', 'Ela empilha duas peças. Você pega as suas e começa uma torre ao lado. Espere para ver o que ela fará em seguida.'],
      ['Com um carrinho', 'Ele leva o carro para debaixo da cadeira. Você comenta “Foi para a garagem” e deixa que ele decida quando o carro sai.']
    ],
    technical: 'Brincadeira conduzida pela criança',
    source: 'O CDC orienta observar a iniciativa da criança, imitar ou descrever o que ela faz e reduzir perguntas e comandos durante a brincadeira.',
    url: 'https://www.cdc.gov/parenting-toddlers/communication/child-led-play.html'
  },
  'brincar-em-paralelo': {
    title: 'Brincar ao lado',
    lead: 'Ofereça companhia fazendo algo parecido com o seu próprio brinquedo.',
    steps: [
      'Pegue outro brinquedo e se acomode perto, deixando espaço para a criança se movimentar.',
      'Observe uma ação e experimente repeti-la com o seu brinquedo. Deixe o dela nas mãos dela.',
      'Espere. Se ela convidar você, participe. Se continuar sozinha, respeite a distância que ela escolheu.'
    ],
    examples: [
      ['Dois carrinhos', 'Ela faz o carro andar devagar. Você acompanha com o seu, em outra pista. Se ela afastar o carro, deixe o espaço livre.'],
      ['Duas torres', 'Ele monta uma torre. Você monta outra ao lado. Se ele aproximar uma peça da sua torre, espere para ver onde quer colocá-la.']
    ],
    technical: 'Imitação na brincadeira',
    source: 'O CDC descreve como imitar uma ação e comentar o que a criança faz pode demonstrar atenção durante a brincadeira.',
    url: 'https://www.cdc.gov/parenting-toddlers/communication/child-led-play.html'
  },
  'brincar-desenho-livre': {
    title: 'Desenhar lado a lado',
    lead: 'Deixe a criança decidir o que vai para o papel. Sua participação pode começar com um comentário sobre um traço.',
    steps: [
      'Ofereça papel e material de desenho seguro para a idade. Acompanhe a atividade de perto.',
      'Deixe a criança escolher a cor e o movimento. Se ela aceitar sua companhia, desenhe em outra folha.',
      'Comente algo que viu e espere. Ela pode responder, continuar desenhando ou parar.'
    ],
    examples: [
      ['Um risco comprido', 'Ela risca de ponta a ponta. Você diz “Esse traço chegou até a beirada” e espera, com o lápis na sua própria folha.'],
      ['Troca de cor', 'Ele larga o azul e pega o amarelo. Você aproxima o estojo para que ele alcance as outras cores quando quiser.']
    ],
    technical: 'Brincadeira conduzida pela criança',
    source: 'O CDC inclui papel e giz de cera entre os materiais para brincar seguindo a iniciativa da criança. As duas cenas são exemplos escritos para esta ficha.',
    url: 'https://www.cdc.gov/parenting-toddlers/communication/child-led-play.html'
  },
  'pes-d01': {
    title: 'Combinar onde parar',
    why:'Escolher um ponto em que o jogo permite sair ajuda a transformar um horário em um acordo concreto. Confiram juntos se o fim da rodada cabe no tempo disponível.',
    lead: 'Antes de um jogo de lazer, descubram juntos onde dá para sair a tempo do próximo compromisso.',
    examples: [
      ['Jogo com fases', '“O jantar é daqui a pouco. Me mostra onde dá para salvar?” Se der tempo, combinem a última fase antes de começar.'],
      ['Partida em grupo', 'Se a próxima rodada passa do horário de sair, combinem outro momento para jogar e deixem tempo para avisar os colegas.']
    ]
  },
  'pes-d14': {
    title: 'Combinar a vez',
    why:'Ouvir os dois ajuda a descobrir se eles querem continuar juntos. O acordo pode ser revezar, escolher outro brinquedo ou encerrar a brincadeira.',
    lead: 'Quando duas crianças querem o mesmo brinquedo, ajude cada uma a dizer o que quer e a escolher um acordo possível.',
    examples: [
      ['Um caminhão para dois', '“Vocês dois querem o caminhão. Como querem combinar?” Se os dois aceitarem, definam juntos quando acontece a troca.'],
      ['Quando um prefere sair', 'Uma criança quer continuar com as peças e a outra resolve desenhar. Ajude a abrir espaço para o desenho e respeite a escolha.']
    ]
  }
};

export function matchesProfile(card, profile) {
  const publicRule = card.regra_integracao?.populacao;
  const required = publicRule?.condicoes?.length && /autista/i.test(publicRule.aplicavel)
    ? ['autismo'] : card.elegibilidade?.diagnosticos || [];
  const reported = profile?.answers?.diagnoses || [];
  return !required.length || required.includes('qualquer') || required.some(value => reported.includes(value));
}

export function applyEdition(card) {
  const edit = editions[card.id];
  if (!edit) return card;
  // Os requisitos, limites, faixas e fontes de origem acompanham a nova edição.
  const fields = { titulo: edit.title, objetivo: edit.lead, ...(edit.steps && { passos: edit.steps }) };
  return {...card, ...fields, titulo_anterior:card.titulo, ...(edit.why&&{por_que:{...card.por_que,explicacao:edit.why}}), ...(card.repasse_publico && {
    repasse_publico: {...card.repasse_publico, ...fields, ...(edit.why&&{explicacao:edit.why})}
  })};
}

// As referências de estudos específicos só acompanham a ficha da família que informou essa condição.
const autismReferences = new Set([
  'https://link.springer.com/article/10.1007/s10803-015-2407-8',
  'https://ncaep.fpg.unc.edu/wp-content/uploads/EBP-Report-2020.pdf',
  'https://www.nice.org.uk/guidance/cg170/resources/autism-spectrum-disorder-in-under-19s-support-and-management-pdf-35109745515205',
  'https://www.autism.org.uk/advice-and-guidance/behaviour/meltdowns/all-audiences',
  'https://www.leicspart.nhs.uk/autism-space/health-and-lifestyle/using-visuals-to-support-autistic-people/',
  'https://www.leicspart.nhs.uk/autism-space/health-and-lifestyle/parents-and-carers-supporting-an-autistic-child-when-behaviour-is-challenging/'
]);
const generalLimits = {
  'brincar-escolha-livre':'Os passos e as cenas são adaptações editoriais. A orientação trata da brincadeira com crianças pequenas. A ficha aguarda revisão profissional.',
  'brincar-em-paralelo':'O guia descreve ações do adulto durante a brincadeira. Os exemplos desta ficha são editoriais e aguardam revisão profissional.',
  'transicoes-duas-figuras':'O guia descreve rotinas previsíveis. A escolha de duas figuras é uma adaptação editorial e aguarda revisão profissional.',
  'cuidadores-anotar-sequencia':'O formato da nota foi criado para esta ficha. Sua utilidade para cada família depende do contexto e aguarda revisão profissional.',
  'pes-d20':'As cenas e instruções são adaptações editoriais. Um sinal isolado pode ter várias causas. A ficha aguarda revisão profissional.'
};
export function referencesForProfile(card, profile) {
  if(profile?.answers?.diagnoses?.includes('autismo'))return card;
  const general = list => list?.filter(f=>!autismReferences.has(f.url)).map(f =>
    f.url.endsWith('/communication/child-led-play.html') ? {...f,populacao:'Cuidadores de crianças de 2 a 4 anos.'} : f);
  const limit=generalLimits[card.id];
  const copy=card.repasse_publico;
  const rule=card.regra_integracao;
  return {...card,por_que:{...card.por_que,fontes:general(card.por_que.fontes),...(limit&&{limites:limit})},
    ...(copy && {repasse_publico:{...copy,fontes_atividade:general(copy.fontes_atividade),fontes_encaminhamento:general(copy.fontes_encaminhamento),...(limit&&{limites:limit})}}),
    ...(rule && {regra_integracao:{...rule,fontes_encaminhamento:general(rule.fontes_encaminhamento)}})};
}
