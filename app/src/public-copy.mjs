const internalLimit = 'A fonte trata de população autista; aplicação a outras populações exige exame explícito do time técnico.';
const familyLimit = 'A fonte trata de pessoas autistas. Aplicar esta orientação a outros públicos exige avaliação técnica específica.';

export function publicCopy(card) {
  const copy = card.repasse_publico;
  if (!copy) return card;
  const before = copy.antes_de_comecar;
  return {
    ...card,
    titulo: copy.titulo,
    objetivo: copy.objetivo,
    contexto: {
      ...card.contexto,
      materiais_detalhados: before.materiais,
      requisitos_nao_inferiveis: Array.isArray(before.requisitos) ? [...new Set(before.requisitos)] : before.requisitos,
      nota_tempo: before.tempo
    },
    editorial: {},
    por_que: {
      ...card.por_que,
      explicacao: copy.explicacao,
      principio: undefined,
      limites: typeof copy.limites === 'string' ? copy.limites.replace(internalLimit, familyLimit) : copy.limites,
      fontes: copy.fontes_atividade
    },
    passos: copy.passos,
    evite: copy.evite,
    se_nao_der_certo: copy.interrompa_ou_reveja,
    procure_ajuda_se: copy.busque_ajuda,
    observacao: copy.observacao,
    fontes_encaminhamento: copy.fontes_encaminhamento
  };
}

export function sourceText(f){return `${f.titulo} — ${f.url}${f.populacao?' · População da fonte, não da criança: '+f.populacao:''}${f.conferencia==='conferida'&&f.conferido_em?' · leitura registrada em '+f.conferido_em:''}`;}
