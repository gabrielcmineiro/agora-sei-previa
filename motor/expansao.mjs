import {birthBlock,effectiveProfile} from './kit.mjs';
import {riskReason} from './risco.mjs';
const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const text=v=>typeof v==='string'&&v.trim().length>0;
export const GATES=['sem_perigo','sem_dor_nova','sem_sofrimento_intenso','adulto_disponivel','condicoes_destino'];
const own=(v,k)=>object(v)&&Object.hasOwn(v,k)?v[k]:undefined;
const field=(input,path)=>path.split('.').reduce((v,k)=>own(v,k),input);
function inspectRule(r){
 if(!object(r))return ['regra_ausente'];const errors=[],need=(ok,k)=>{if(!ok)errors.push(k);};
 need(/^PES-[DEA]\d{2}$/.test(r.id),'id_editorial');need(['elegivel_demonstracao','elegivel_rota'].includes(r.status),'status');
 need(text(r.situacao?.id)&&text(r.situacao?.rotulo)&&r.situacao.selecao==='explicita_pelo_cuidador','situacao');
 need(Number.isInteger(r.idade?.min_meses)&&Number.isInteger(r.idade?.max_meses)&&r.idade.min_meses>=24&&r.idade.max_meses<=179&&r.idade.min_meses<=r.idade.max_meses&&r.idade.inclusiva===true,'idade');
 need(Array.isArray(r.momentos_permitidos)&&r.momentos_permitidos.length>0&&r.momentos_permitidos.every(v=>['antes','na_hora','depois','treino'].includes(v)),'momentos');
 const ids=new Set();for(const [key,expected]of [['requisitos','sim'],['exclusoes','nao']]){
 need(Array.isArray(r[key])&&r[key].length>0,key);
 for(const q of Array.isArray(r[key])?r[key]:[]){need(text(q.id)&&q.id.startsWith(r.id+'-')&&!ids.has(q.id)&&text(q.pergunta)&&q.esperado===expected,key);ids.add(q.id);
 if(key==='exclusoes')need(q.condicao?.campo==='respostas.'+q.id&&q.condicao.operador==='diferente'&&q.condicao.valor==='nao','condicao_exclusao');}
 }
 need(Array.isArray(r.populacao?.condicoes)&&r.populacao.condicoes.every(c=>c.operador==='igual'&&c.valor==='sim'&&r.requisitos?.some(q=>'respostas.'+q.id===c.campo)),'populacao');
 for(const key of ['passos','evite','interrompa_se','procure_ajuda_se'])need(Array.isArray(r[key])&&r[key].every(text)&&r[key].length>0,key);
 need(text(r.explica?.possivel_beneficio)&&text(r.explica?.limite)&&text(r.explica?.observacao),'explica');
 for(const key of ['fontes_atividade','fontes_encaminhamento'])need(Array.isArray(r[key])&&r[key].every(s=>text(s.titulo)&&/^https:\/\//.test(s.url)&&text(s.populacao)),key);
 if(r.status==='elegivel_demonstracao')need(r.destino==='catalogo'&&r.fontes_atividade?.length>0,'destino_catalogo');
 need(Array.isArray(r.adaptacoes_etarias)&&r.adaptacoes_etarias.length>0,'adaptacoes_etarias');
 return [...new Set(errors)];
}
export function ruleErrors(r){try{return inspectRule(r);}catch{return ['regra_malformada'];}}
export function evaluateRule(r,input){
 if(ruleErrors(r).length||!object(input)||input.id!==r.id)return {elegivel:false,destino:'entrada_invalida'};
 if(r.status==='elegivel_rota')return {elegivel:false,destino:r.destino};
 for(const [key,destino]of [['sem_perigo','rota_emergencia'],['sem_dor_nova','rota_saude'],['sem_sofrimento_intenso','rota_sofrimento_intenso']])if(own(input.gates,key)==='nao')return {elegivel:false,destino};
 const ok=GATES.every(k=>own(input.gates,k)==='sim')&&Number.isInteger(input.idade_meses)&&input.idade_meses>=r.idade.min_meses&&input.idade_meses<=r.idade.max_meses&&input.situacao_id===r.situacao.id&&r.momentos_permitidos.includes(input.momento)&&input.retirado==='nao'&&[...r.requisitos,...r.exclusoes].every(q=>own(input.respostas,q.id)===q.esperado)&&r.populacao.condicoes.every(c=>field(input,c.campo)===c.valor);
 return {elegivel:ok,destino:ok?'ficha':'bloqueado'};
}
export function expandedCardErrors(c){
 const r=c?.regra_integracao,errors=ruleErrors(r);if(errors.length)return errors;
 const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 if(r.status!=='elegivel_demonstracao'||c.status!=='revisao_por_agente'||c.editorial_id!==r.id||c.id!==r.id.toLowerCase())errors.push('vinculo_editorial');
 for(const k of ['passos','evite','procure_ajuda_se'])if(!same(c[k],r[k]))errors.push('conteudo_'+k);
 if(!same(c.elegibilidade?.idade_meses,[r.idade.min_meses,r.idade.max_meses]))errors.push('faixa_divergente');
 if(!same(c.contexto?.requisitos_nao_inferiveis,r.requisitos.map(q=>q.texto_original)))errors.push('requisitos_divergentes');
 if(!same(c.se_nao_der_certo,[...r.interrompa_se,r.se_nao_der_certo]))errors.push('interrupcao_divergente');
 if(!Array.isArray(c.por_que?.fontes)||!same(c.por_que.fontes.map(f=>f.url),r.fontes_atividade.map(f=>f.url))||!same(c.fontes_encaminhamento,r.fontes_encaminhamento))errors.push('fontes_divergentes');
 if(!text(c.titulo)||!text(c.objetivo)||!text(c.por_que?.limites)||!text(c.por_que?.explicacao)||!c.revisao)errors.push('apresentacao_incompleta');
 return errors;
}
export function expandedPrecheck(card,profile){
 const r=card?.regra_integracao;if(!profile)return 'Cadastre ou selecione a criança antes de usar esta ficha.';
 const ageError=birthBlock(profile,[r.idade.min_meses,r.idade.max_meses]);if(ageError)return ageError;profile=effectiveProfile(profile);
 if(!Number.isInteger(profile.ageMonths)||profile.ageMonths<r.idade.min_meses||profile.ageMonths>r.idade.max_meses)return 'Idade fora da faixa indicada. Esta ficha está disponível somente para consulta.';
 if(profile.quizDraft)return 'Há respostas do quiz em revisão. Conclua a revisão antes de usar esta ficha.';
 if(['nao_quero','desconforto'].includes((profile.feedback||[]).filter(f=>f.cardId===card.id).at(-1)?.kind))return 'Esta ficha foi retirada após recusa ou desconforto. Reveja a retirada antes de tentar novamente.';
 const risks={autolesao:'risco de autolesão',agressao_com_lesao:'agressão com lesão',fuga:'risco de fuga',dor_frequente:'dor frequente',ronco_com_pausas:'ronco com pausas'};
 const known=(profile.answers?.risks||[]).filter(x=>Object.hasOwn(risks,x));
 if(known.length)return 'Há '+known.map(x=>risks[x]).join(', ')+' informado no perfil. A atividade permanece bloqueada; procure a orientação de apoio ao adulto.';
 return null;
}
function pendingReason(r,input){
 if(input?.situacao_id!==r.situacao.id)return 'Confirme a situação indicada nesta ficha. Outra situação não libera esta atividade.';
 if(!r.momentos_permitidos.includes(input?.momento))return 'O momento escolhido não está entre os permitidos nesta ficha.';
 const labels={sem_perigo:'segurança imediata',sem_dor_nova:'ausência de dor nova ou mudança súbita',sem_sofrimento_intenso:'ausência de sofrimento intenso',adulto_disponivel:'adulto disponível',condicoes_destino:'condições no local de uso'};
 for(const k of GATES)if(own(input?.gates,k)!=='sim')return 'É necessário confirmar '+labels[k]+'. Ausência ou “não sei” não libera a atividade.';
 for(const q of [...r.requisitos,...r.exclusoes])if(own(input?.respostas,q.id)!==q.esperado)return q.pergunta+' — para continuar, a resposta precisa ser “'+(q.esperado==='sim'?'Sim':'Não')+'”.';
 return 'Há uma condição incompatível. Revise os requisitos desta ficha.';
}
export function assessExpanded(card,profile,input){
 profile=effectiveProfile(profile);
 if(expandedCardErrors(card).length)return {compatible:false,code:'schema',reasons:['Ficha inválida.'],trace:[{id:'schema',passed:false,text:'Ficha inválida.'}]};
 const r=card.regra_integracao;
 const precheck=expandedPrecheck(card,profile),blocked=!!precheck;
 const result=evaluateRule(r,{...input,id:r.id,idade_meses:profile?.ageMonths,retirado:blocked?'sim':'nao'});
 const risk=riskReason(profile,input);const compatible=!blocked&&!risk&&result.elegivel;
 return {compatible,code:result.destino,reasons:compatible?[]:[precheck||({rota_emergencia:'Há perigo informado. Abra o apoio imediato; não inicie a atividade.',rota_saude:'Há dor nova ou mudança súbita informada. Abra a orientação de saúde.',rota_sofrimento_intenso:'Há sofrimento intenso informado. Abra o apoio ao adulto; não inicie tarefas.'}[result.destino])||risk||pendingReason(r,input)],trace:[{id:'expansao',passed:compatible,unknown:!input,field:'situacao',text:compatible?'Situação e requisitos confirmados nesta tentativa.':'Confirmação específica pendente ou condição incompatível.'}]};
}
