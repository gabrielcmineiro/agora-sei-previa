import {birthBlock,effectiveProfile} from './kit.mjs';
import {ruleErrors,assessExpanded,expandedCardErrors} from './expansao.mjs';
import {momentGate,requirementsFor} from './momento.mjs';
export {momentGate,requirementsFor};
import {VOCAB,QUESTIONS} from './vocab.mjs';
export {VOCAB,QUESTIONS};
export const RULES_VERSION='demo-2.5.0';
const arr=Array.isArray, str=x=>typeof x==='string'&&x.trim().length>0;
const values=k=>Object.keys(VOCAB[k]);
const subset=(xs,allowed)=>arr(xs)&&xs.every(x=>allowed.includes(x));
const knownList=(xs,allowed)=>subset(xs,allowed);
const riskKeys=['autolesao','agressao_com_lesao','fuga'];
const statusKeys=['rascunho_nao_revisado','fonte_conferida','revisao_por_agente','aprovado_humano','suspenso','sintetico'];
const adaptMap={compreensao:'understanding',comunicacao:'communication',segue_pedido:'steps',sensibilidades:'sensitivities',cuidadores:'caregivers',diagnosticos:'diagnoses',nivel_de_suporte:'support'};
function cardErrors(c,ds,fs){
 const errors=[],need=(ok,code)=>{if(!ok)errors.push(code);};
 if(!c||typeof c!=='object')return ['schema'];
 if(Object.hasOwn(c,'regra_integracao'))return expandedCardErrors(c);
 need(/^[a-z0-9-]+$/.test(c.id||''),'id');
 for(const k of ['versao','titulo','objetivo'])need(str(c[k]),k);
 need(statusKeys.includes(c.status)&&c.status!=='suspenso','status');
 need(ds.some(d=>d.id===c.desafio&&d.familia===c.familia)&&fs.some(f=>f.id===c.familia),'desafio');
 need(['antes','na_hora','treino','depois'].includes(c.tipo),'tipo');
 need(arr(c.passos)&&c.passos.length>0&&c.passos.length<=3&&c.passos.every(str),'passos');
 for(const k of ['evite','se_nao_der_certo'])need(arr(c[k])&&c[k].length>0&&c[k].every(str),k);
 need(arr(c.procure_ajuda_se)&&c.procure_ajuda_se.every(str),'procure_ajuda_se');
 const q=c.por_que;
 need(q&&str(q.principio)&&str(q.limites)&&arr(q.fontes),'por_que');
 need(q&&['alta','moderada','limitada','consenso_de_especialistas','nao_classificada'].includes(q.forca_da_evidencia),'evidencia');
 const sources=q?.fontes;
 need(arr(sources)&&(c.status==='sintetico'||sources.length>0),'fonte');
 if(arr(sources))for(const f of sources)need(str(f.titulo)&&/^https?:\/\//.test(f.url||'')&&str(f.tipo)&&str(f.populacao)&&Number.isInteger(f.ano)&&['conferida','a_conferir'].includes(f.conferencia),'fonte');
 const e=c.elegibilidade, range=e?.idade_meses;
 need(arr(range)&&range.length===2&&range.every(n=>Number.isFinite(n)&&n>=0)&&range[0]<=range[1],'idade');
 need(e&&subset(e.compreensao,values('understanding'))&&e.compreensao.length>0,'compreensao');
 need(e&&subset(e.requisitos,['segue_um_passo','segue_dois_passos','outro_adulto']),'requisitos');
 need(e&&(e.diagnosticos===undefined||subset(e.diagnosticos,['qualquer',...values('diagnoses')])),'diagnosticos');
 need(subset(c.exclusoes,[...values('sensitivities'),...values('risks')]),'exclusoes');
 need(Number.isFinite(c.contexto?.tempo_min)&&c.contexto.tempo_min>0&&subset(c.contexto?.materiais,values('resources')),'contexto');
 need(c.contexto?.interesses===undefined||subset(c.contexto.interesses,values('interests')),'interesses');
 need(arr(c.adaptacoes),'adaptacoes');
 for(const ad of (arr(c.adaptacoes)?c.adaptacoes:[])){if(!ad||typeof ad!=='object'){errors.push('adaptacao');continue;}need(str(ad.id)&&str(ad.mudanca)&&ad.quando&&Object.keys(ad.quando).length>0,'adaptacao');for(const [k,v]of Object.entries(ad.quando||{}))need(Object.hasOwn(adaptMap,k)&&subset(v,values(adaptMap[k]))&&v.length>0,'adaptacao_condicao');}
 need(!!c.revisao,'revisao');
 if(c.status==='aprovado_humano')need(c.revisao?.tipo==='humano'&&str(c.revisao.revisor)&&str(c.revisao.data),'revisao');
 if(c.status==='revisao_por_agente')need(c.revisao?.tipo==='agente','revisao');
 return [...new Set(errors)];
}
export function validateCatalog(rawCards,rawDesafios){
 const problems=[],ds=rawDesafios?.desafios,fs=rawDesafios?.familias;
 const coverage=rawDesafios?.cobertura_idade_meses;
 const validMeta=str(rawCards?.versao)&&str(rawDesafios?.versao)&&arr(ds)&&arr(fs)&&new Set(ds.map(d=>d?.id)).size===ds.length&&new Set(fs.map(f=>f?.id)).size===fs.length&&fs.every(f=>f&&str(f.id)&&str(f.nome))&&ds.every(d=>d&&str(d.id)&&str(d.nome)&&fs.some(f=>f.id===d.familia)&&['ativo','em_preparacao','fora_do_escopo'].includes(d.estado)&&subset(d.bloqueado_por,values('risks')))&&arr(coverage)&&coverage.length===2&&coverage.every(Number.isFinite)&&coverage[0]<=coverage[1];
 if(!validMeta||!arr(rawCards?.cards))return {catalog:{version:rawCards?.versao||'invalid',cards:[],desafios:[],familias:[],coverage:[],orientacoes:{}},problems:[{cardId:null,code:'schema',text:'Formato do catálogo ou desafios inválido.'}]};
 const counts=new Map();for(const c of rawCards.cards)counts.set(c?.id,(counts.get(c?.id)||0)+1);
 const cards=[];
 for(const c of rawCards.cards){const errors=cardErrors(c,ds,fs);if(counts.get(c?.id)>1)errors.push('id_duplicado');if(errors.length){for(const code of errors)problems.push({cardId:c?.id,code,text:`Card excluído: ${code}.`});continue;}
 const copy=structuredClone(c);if(copy.por_que.forca_da_evidencia!=='nao_classificada'&&(!str(copy.por_que.justificativa_da_forca)||!copy.por_que.fontes.some(f=>f.conferencia==='conferida')))copy.por_que.forca_da_evidencia='nao_classificada';cards.push(copy);}
 const orientacoes={...rawDesafios.orientacoes};for(const key of ['sinal_de_risco','dor_frequente','ronco_com_pausas','desconforto'])if(!str(orientacoes[key])){orientacoes[key]='Esta situação pede uma avaliação individual.';problems.push({cardId:null,code:'orientacao',text:`Orientação ausente: ${key}.`});}
 return {catalog:{version:rawCards.versao,cards,desafios:ds.map(d=>({...d,estado:d.estado==='ativo'&&!cards.some(c=>c.desafio===d.id)?'em_preparacao':d.estado})),familias:structuredClone(fs),coverage:[...coverage],orientacoes,expansion:structuredClone(rawDesafios.mapa_de_expansao||[]),limits:rawDesafios.limites||''},problems};
}
export const lastFeedback=(profile,id)=>(profile?.feedback||[]).filter(f=>f.cardId===id).at(-1);
export function assess(card,profile,catalog){
 const ageError=card?.elegibilidade&&birthBlock(profile,card.elegibilidade.idade_meses);if(ageError)return {compatible:false,reasons:[ageError],trace:[{id:"age",passed:false,text:ageError}]};profile=effectiveProfile(profile);
 if(card?.regra_integracao)return assessExpanded(card,profile,null);
 const a=profile?.answers||{},trace=[];
 if(profile?.quizDraft)return {compatible:false,reasons:['Conclua a revisão das respostas antes de usar ou repassar uma sugestão.'],trace:[{id:'draft',passed:false,unknown:false,field:'quizDraft',text:'Revisão pendente: uso e repasse suspensos.'}]};
 const check=(id,passed,text,field=null,unknown=false)=>trace.push({id,passed:!!passed,unknown:!!unknown,field,text});
 const ds=catalog?.desafios||[{id:card?.desafio,familia:card?.familia}],fs=catalog?.familias||[{id:card?.familia}];
 const errs=cardErrors(card,ds,fs);
 if(errs.length){check('schema',false,'Conteúdo indisponível: estrutura, fonte ou revisão inválida.');return {compatible:false,reasons:trace.map(t=>t.text),trace};}
 check('schema',true,'Estrutura do card conferida.');check('status',true,'Estado editorial da ficha conferido.');check('fonte',true,card.status==='sintetico'?'Exemplo sintético.':'Referências disponíveis para consulta; sem comprovação do card.');
 const e=card.elegibilidade;
 check('age',Number.isFinite(profile?.ageMonths)&&profile.ageMonths>=e.idade_meses[0]&&profile.ageMonths<=e.idade_meses[1],`Idade informada: ${profile?.ageMonths??'não informada'} meses; faixa do card: ${e.idade_meses.join(' a ')}.`, 'ageMonths',!Number.isFinite(profile?.ageMonths));
 const riskKnown=knownList(a.risks,values('risks'));
 check('risk',riskKnown&&!a.risks.some(x=>riskKeys.includes(x)),riskKnown?'Situação de risco conferida nas respostas.':'Informe se há sinais de risco ou saúde.','risks',!riskKnown);
 const blocked=catalog?.desafios.find(d=>d.id===card.desafio)?.bloqueado_por||[];
 if(riskKnown&&blocked.some(x=>a.risks.includes(x)))check('risk',false,'Este desafio está suspenso para o sinal de saúde informado.','risks');
 const u=values('understanding').includes(a.understanding)?a.understanding:'nao_sei';
 check('understanding',e.compreensao.includes(u),`Forma de compreensão: ${VOCAB.understanding[u]}.`,'understanding',u==='nao_sei'&&!e.compreensao.includes(u));
 for(const req of e.requisitos){const field=req==='outro_adulto'?'caregivers':'steps',v=a[field],unknown=!v||['nao_sei','nao_informado'].includes(v);const pass=req==='outro_adulto'?v==='varios':req==='segue_um_passo'?['um','dois'].includes(v):v==='dois';check('requirement',pass,`Requisito ${req==='outro_adulto'?'outro cuidador':req==='segue_um_passo'?'pedido de um passo':'pedido de dois passos'}: ${pass?'informado':'não confirmado'}.`,field,unknown);}
 for(const m of card.contexto.materiais){const k=knownList(a.resources,values('resources'));check('material',k&&a.resources.includes(m),`Material: ${VOCAB.resources[m]} ${k&&a.resources.includes(m)?'informado':'não confirmado'}.`,'resources',!k);}
 check('time',Number.isFinite(a.minutes)&&a.minutes>=card.contexto.tempo_min,`Esta ficha pede ${card.contexto.tempo_min} minutos. ${Number.isFinite(a.minutes)?'Você marcou '+a.minutes+' minutos.':'O tempo disponível ainda precisa ser confirmado.'}`,'minutes',!Number.isFinite(a.minutes));
 for(const ex of card.exclusoes){const field=ex in VOCAB.sensitivities?'sensitivities':'risks',k=knownList(a[field],values(field));check('exclusion',k&&!a[field].includes(ex),`Cuidado ${VOCAB[field][ex]}: ${k&&!a[field].includes(ex)?'não informado como presente':'não descartado'}.`,field,!k);}
 if(e.diagnosticos?.length&&!e.diagnosticos.includes('qualquer'))check('diagnosis',arr(a.diagnoses)&&a.diagnoses.some(x=>e.diagnosticos.includes(x)),'Condição de público específica deste conteúdo.');
 const f=lastFeedback(profile,card.id);check('feedback',!['nao_quero','desconforto'].includes(f?.kind),['nao_quero','desconforto'].includes(f?.kind)?'Sugestão retirada deste perfil; disponível apenas para consulta.':'Sugestão não retirada neste perfil.');
 return {compatible:trace.every(t=>t.passed),reasons:trace.filter(t=>!t.passed).map(t=>t.text),trace};
}
export function adaptationsFor(card,profile){if(card.regra_integracao)return card.regra_integracao.adaptacoes_etarias.filter(a=>profile?.ageMonths>=a.min_meses&&profile.ageMonths<=a.max_meses).map((a,i)=>({id:'idade-'+i,mudanca:a.ajuste+' '+a.aplicacao_especifica,mode:'oferecida',because:a.natureza}));const a=profile?.answers||{};return (card.adaptacoes||[]).filter(ad=>Object.entries(ad.quando).every(([k,opts])=>{const v=a[adaptMap[k]];return arr(v)?knownList(v,values(adaptMap[k]))&&v.some(x=>opts.includes(x)):v!==undefined&& !['nao_sei','nao_informado'].includes(v)&&opts.includes(String(v));})).map(ad=>({...ad,mode:Object.keys(ad.quando).some(k=>!['diagnosticos','nivel_de_suporte'].includes(k))?'aplicada':'oferecida',because:`Condições informadas que coincidem: ${Object.keys(ad.quando).map(k=>({compreensao:'compreensão',comunicacao:'comunicação',segue_pedido:'pedidos simples',sensibilidades:'sensibilidades',cuidadores:'cuidadores',diagnosticos:'contexto opcional',nivel_de_suporte:'suporte informado'})[k]).join(', ')}.`}));}
export function recommend(profile,catalog,{day=0,limit=3,moment=null}={}){
 const a=profile?.answers||{},result={rulesVersion:RULES_VERSION,catalogVersion:catalog?.version,status:'sem_recomendacao',reasonCode:null,reason:'',clarify:[],notices:[],items:[],alternatives:[],rejected:[]};
 const end=(code,reason,clarify=[])=>({...result,reasonCode:code,reason,clarify});
 if(moment!==null){const gate=momentGate(moment);if(!gate.allowed)return end(gate.code,gate.text);}
 if(profile?.quizDraft){
 const risks=[...new Set([...(a.risks||[]),...(profile.quizDraft.answers?.risks||[])])];
 for(const x of risks){const key=riskKeys.includes(x)?'sinal_de_risco':x;if(catalog.orientacoes[key]&&!result.notices.some(n=>n.code===key))result.notices.push({code:key,text:catalog.orientacoes[key]});}
 return end(risks.some(x=>riskKeys.includes(x))?'sinal_de_risco':'revisao_pendente',risks.some(x=>riskKeys.includes(x))?catalog.orientacoes.sinal_de_risco:'Você começou a revisar o contexto. Conclua as respostas para conferir um novo kit. Até lá, uso e repasse ficam suspensos.');
 }
 if(!knownList(a.risks,values('risks')))return end('falta_informacao','Informe se há sinais de risco ou saúde antes de receber sugestões.',['risks']);
 if(a.risks.some(x=>riskKeys.includes(x))){result.notices.push({code:'sinal_de_risco',text:catalog.orientacoes.sinal_de_risco});return end('sinal_de_risco',catalog.orientacoes.sinal_de_risco);}
 for(const x of a.risks)result.notices.push({code:x,text:catalog.orientacoes[x]});
 if(!a.priority)return end('falta_prioridade','Escolha o desafio deste momento.');
 if(!Number.isFinite(profile.ageMonths)||profile.ageMonths<catalog.coverage[0]||profile.ageMonths>catalog.coverage[1])return end('idade_fora_da_cobertura',`Este catálogo cobre recortes entre ${catalog.coverage.join(' e ')} meses. Não há sugestão para a idade informada.`);
 const d=catalog.desafios.find(x=>x.id===a.priority);
 if(!d||d.estado!=='ativo')return end('desafio_sem_cobertura','Este desafio ainda não tem conteúdo disponível.');
 if((d.bloqueado_por||[]).some(x=>a.risks.includes(x)))return end('desafio_bloqueado','O sinal de saúde informado pede avaliação antes de usar sugestões deste desafio.');
 const candidates=[],unknowns=new Set();
 for(const c of catalog.cards.filter(c=>c.desafio===a.priority)){
 const check=assess(c,profile,catalog),f=lastFeedback(profile,c.id);
 if(f?.kind==='desconforto'&&!result.notices.some(n=>n.code==='desconforto'))result.notices.push({code:'desconforto',text:catalog.orientacoes.desconforto});
 if(!check.compatible){const failures=check.trace.filter(t=>!t.passed);result.rejected.push({cardId:c.id,codes:[...new Set(failures.map(t=>t.id))],reasons:check.reasons});if(failures.every(t=>t.unknown))failures.forEach(t=>unknowns.add(t.field));continue;}
 const interests=(a.interests||[]).filter(i=>(c.contexto.interesses||[]).includes(i));const score=100+10*interests.length-(f?.kind==='nao_coube'?25:0);
 const trace=[{id:'coverage',passed:true,unknown:false,field:'priority',text:`Foco escolhido: ${d.nome}.`},...check.trace];
 for(const i of interests)trace.push({id:'order',passed:true,unknown:false,field:'interests',text:`Interesse informado: ${VOCAB.interests[i]}.`});
 if(f?.kind==='nao_coube')trace.push({id:'order',passed:true,unknown:false,field:'feedback',text:'Mais ao fim porque não coube anteriormente.'});
 candidates.push({card:c,score,explanation:trace.filter(t=>t.passed).map(t=>t.text),trace,adaptations:adaptationsFor(c,profile)});
 }
 candidates.sort((x,y)=>y.score-x.score||(x.card.id<y.card.id?-1:1));const off=candidates.length?((Math.trunc(day)%candidates.length)+candidates.length)%candidates.length:0;const ordered=[...candidates.slice(off),...candidates.slice(0,off)];
 if(!ordered.length)return end(unknowns.size?'falta_informacao':'sem_card_compativel',unknowns.size?'Faltam informações para conferir uma sugestão deste desafio.':'Não há sugestão compatível com as respostas atuais. Nenhuma condição foi relaxada.',[...unknowns]);
 return {...result,status:'kit',clarify:[...unknowns],items:ordered.slice(0,limit),alternatives:ordered.slice(limit)};
}

export function assessUse(card,profile,catalog,moment){
 if(!card)return {compatible:false,code:'conteudo_indisponivel',reasons:['Ficha indisponível.']};
 if(card.regra_integracao)return assessExpanded(card,profile,moment);
 const check=assess(card,profile,catalog),gate=momentGate(moment);
 const exact=Array.isArray(moment?.requisitos)&&moment.requisitos.length===requirementsFor(card).length;
 return {compatible:check.compatible&&gate.allowed&&exact,code:!check.compatible?'perfil_incompativel':!exact?'requisitos_incompletos':gate.code,reasons:[...check.reasons,...(!gate.allowed?[gate.text]:[]),...(!exact?['Confira todos os requisitos desta ficha.']:[])]};
}
