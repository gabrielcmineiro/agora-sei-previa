import {assess} from '../../motor/index.mjs';
import {expandedPrecheck} from '../../motor/expansao.mjs';
export function availableToReview(card,profile,catalog) {
  return card.regra_integracao ? !expandedPrecheck(card,profile) : assess(card,profile,catalog).compatible;
}
// Só a navegação de leitura preserva o estado da lista. A autorização de repasse é separada.
export function kitListTransition(from,to,origin) {
  if(from==='#/home'&&/^#\/card\/[^/]+$/.test(to))return 'open';
  if(to==='#/home'&&from===origin?.to&&origin.path==='home')return 'return';
  return null;
}
import {dateKey} from '../../motor/kit.mjs';
import {publicCopy,sourceText} from './public-copy.mjs';
export const normalize=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export function ageLabel(n){const y=Math.floor(n/12),m=n%12;return [y?`${y} ${y===1?'ano':'anos'}`:'',m?`${m} ${m===1?'mês':'meses'}`:''].filter(Boolean).join(' e ')||'Menos de 1 mês';}
const aliases={birra:['emocoes'],frustracao:['emocoes'],banho:['transicoes'],tablet:['transicoes'],celular:['transicoes'],tela:['transicoes'],baba:['cuidadores'],avo:['cuidadores'],sono:['noite'],brincadeira:['brincar']};
const vocabulary = new Map(Object.entries({
  parquinho: 'parque', parquinhos: 'parque', parques: 'parque',
  irmaos: 'irmao', dormir: 'sono', gritar: 'grito', grita: 'grito', gritos: 'grito',
}));
const connectingWords = new Set('a o as os de da do das dos e em no na nos nas um uma para por com'.split(' '));
function searchWords(text) {
  return (normalize(text || '').match(/[a-z0-9]+/g) || [])
    .filter(word => !connectingWords.has(word))
    .map(word => vocabulary.get(word) || word);
}
export function searchCards(cards, query, filter = '', kitMap = null) {
  const focuses=new Map((kitMap?.cards||[]).map(entry=>[entry.id,entry.focos]));
  const hasTopic=(card,topic)=>card.desafio===topic || focuses.get(card.id)?.includes(topic);
  const scope = cards.filter(card => !filter || hasTopic(card,filter));
  const input = String(query ?? '').trim();
  if (!input) return {cards: scope, limited: false};
  const terms = searchWords(input);
  if (!terms.length) return {cards: [], limited: false};
  const matches = [];
  for (const card of scope) {
    const titleWords = [...searchWords(card.titulo), ...searchWords(card.titulo_anterior)];
    if(card.id==='pes-d01')titleWords.push('celular','tablet','tela');
    const words = new Set([...titleWords, ...searchWords(card.objetivo),
      ...searchWords(card.regra_integracao?.situacao?.rotulo)]);
    if (terms.every(term => words.has(term))) {
      matches.push({card, titleHits: terms.filter(term => titleWords.includes(term)).length});
    }
  }
  matches.sort((a, b) => b.titleHits - a.titleHits);
  const topic = terms.join(' ');
  const family = Object.hasOwn(aliases, topic) ? aliases[topic] : [];
  const ranked=matches.map(match=>match.card);
  const seen=new Set(ranked.map(card=>card.id));
  const extra=scope.filter(card=>!seen.has(card.id)&&family.some(id=>hasTopic(card,id)));
  return {
    cards: [...ranked,...extra],
    notice: topic==='sono'?'As fichas ajudam a organizar a rotina da noite. Confira a idade indicada em cada uma.':topic==='birra'?'Confira a situação e a idade de cada ficha. Se houver sofrimento intenso agora, abra Apoio.':'',
    limited: topic === 'sono' || topic === 'birra',
    related: extra.length > 0,
  };
}
export function caregiverDraft(c,adaptations=[],now=new Date()){c=publicCopy(c);
const lines=['AGORA SEI',c.titulo,'Objetivo: '+c.objetivo,'Por que esta ideia:',c.por_que.explicacao,c.por_que.principio,c.observacao?'O que observar: '+c.observacao:'','Antes de começar:',c.editorial?.limite_do_quiz,c.contexto.materiais_detalhados,...c.contexto.requisitos_nao_inferiveis,c.contexto.nota_tempo,'Passos:',...c.passos.map((s,i)=>`${i+1}. ${s}`),'Variações a conferir:',...adaptations.map(a=>a.mudanca),'Cuidados — evite:',...c.evite,'Se não couber:',...c.se_nao_der_certo,'Buscar ajuda:',...c.procure_ajuda_se,'Limites:',c.por_que.limites,'Fontes de encaminhamento:',...(c.fontes_encaminhamento||[]).map(f=>sourceText(f)),'Fontes da atividade:',...c.por_que.fontes.map(f=>sourceText(f)),`Card ${c.id} · versão ${c.versao} · preparado em ${now.toISOString().slice(0,10)}`,'Confira conforto, materiais e contexto com quem está presente. Interrompa se houver desconforto. Uma cópia compartilhada não acompanha atualizações ou retiradas do app.'];return lines.filter(Boolean).join('\n\n');}
export function shareIsCurrent(snapshot,profile,card,check,now=new Date()){return snapshot?.day===dateKey(now)&&!!profile&&!!card&&snapshot.profileId===profile.id&&snapshot.revision===profile.revision&&snapshot.cardId===card.id&&check.compatible;}

export const hasAgeCoverage=(profile,catalog)=>!!profile&&catalog.cards.some(c=>profile.ageMonths>=c.elegibilidade.idade_meses[0]&&profile.ageMonths<=c.elegibilidade.idade_meses[1]);
export function riskNotices(profile,catalog){const risks=[...new Set([...(profile?.answers?.risks||[]),...(profile?.quizDraft?.answers?.risks||[])])];const keys=[...new Set(risks.map(x=>['autolesao','agressao_com_lesao','fuga'].includes(x)?'sinal_de_risco':x))];return keys.filter(k=>typeof catalog.orientacoes[k]==='string').map(code=>({code,text:catalog.orientacoes[code]}));}
