import {buildKit,profileAge,effectiveProfile,dateKey} from '../../motor/kit.mjs';
import {RISK_QUESTIONS} from '../../motor/risco.mjs';
import {publicCopy} from './public-copy.mjs';
import {loadRoutes,safeSource} from './support.mjs';
import {GATES,expandedPrecheck} from '../../motor/expansao.mjs';
import {questionsFor,validateRequirements,assessRequirements} from '../../motor/requisitos.mjs';
import {makeShareImage} from './share-image.mjs';
import {carregaPincel,gSalvar,gCheck,gCarimbo,gSublinhado} from '../../design/movimento.mjs';
import {availableToReview,kitListTransition,ageLabel,searchCards,caregiverDraft,shareIsCurrent,hasAgeCoverage,riskNotices} from './journey.mjs';
import {VOCAB,QUESTIONS,RULES_VERSION,validateCatalog,assess,assessUse,requirementsFor,adaptationsFor,lastFeedback} from '../../motor/index.mjs';
import {load,persist,addProfile,updateProfile,feedback,favorite,setActive,removeProfile,reset,STORAGE_KEY,DEMO_TERMS_VERSION} from './state.mjs';
import {preparo,moldura,cardResumo,pergunta,progresso,aviso,vazio,recado,abas,painel,passos,lista,fonte as fonteBase,adaptacao,escolha,botao,etiquetaEstado,etiquetaTipo,avatar,nota,esc,FRASE_ACOMPANHAMENTO,FORCAS,RETORNOS,contexto,contagens,registro,plano,icone} from '../../design/marcacao.mjs';
const fonte=f=>f.selo_publico===null?`<div class="as-fonte"><p><a href="${esc(safeSource(f).url||'#')}" target="_blank" rel="noopener noreferrer">${esc(f.titulo)}</a></p><p>${esc(f.finalidade)}</p><p>${esc(f.nota_publica)}</p></div>`:fonteBase(safeSource(f));
const root=document.querySelector('#app');
const pauseMotion=()=>{document.documentElement.toggleAttribute('data-movimento',document.hidden);if(document.hidden)document.documentElement.setAttribute('data-movimento','pausado');};
document.addEventListener('visibilitychange',pauseMotion);pauseMotion();
root.innerHTML=carregaPincel({titulo:'Abrindo o Agora Sei',texto:'Carregando as ideias e ilustrações.'});
let activeDay=dateKey();
function ensureDay(){if(activeDay===dateKey())return true;activeDay=dateKey();confirmedUse=null;lastUse=null;currentMoment=null;kitSafety=null;for(const dialog of root.querySelectorAll("dialog")){dialog.close();dialog.remove();}notice("O dia mudou. Confira novamente as condições e prepare novas páginas e texto.",true);render();return false;}
window.addEventListener("focus",()=>ensureDay());
document.addEventListener("visibilitychange",()=>{
 if(document.hidden){kitSafety=null;return;}
 if(ensureDay()&&route()[0]==='home'&&catalog)render();
});
setInterval(()=>{if(!document.hidden)ensureDay();},30000);
let gesture=null, confirmedUse=null,currentMoment=null,lastUse=null,routeContent=null,kitMap=null,kitSafety=null;

let storage;try{storage=window.localStorage;}catch{storage={getItem(){throw Error()},setItem(){throw Error()},removeItem(){throw Error()}};}
let initial=load(storage),state=initial.state,storageError=initial.error,raw=initial.raw,toast='',catalog,manifest,day=0,cardTab='como',search='',filter='',undoFavorite=null,confirmationIntent=null,pendingToast=null,toastContext=null,toastTimer=null,toastPersistent=false;
const p=()=>effectiveProfile(state.profiles.find(p=>p.id===state.activeId));
const image=m=>({src:esc(`../ilustracoes/${m.arquivo}`),alt:m.alt});
const art=key=>image(manifest.geral[key]||manifest.padrao);
const av=profile=>image(manifest.avatares.find(a=>a.id===profile?.avatar)||manifest.avatares[0]).src;
const title=(t,sub='')=>`<div class="as-cabecalho"><h1 class="as-titulo-1">${esc(t)}</h1>${sub?`<p class="as-apoio">${esc(sub)}</p>`:''}</div>`;
const action=(text,act,opts={})=>botao(text,{...opts,extra:` data-action="${esc(act)}"`});
const link=(text,route,opts={})=>botao(text,{href:'#/'+route,...opts});
const route=()=>location.hash.startsWith('#/')?location.hash.slice(2).split('/'):['home'];
function clearNotice(){clearTimeout(toastTimer);toastTimer=null;toast='';pendingToast=null;toastContext=null;undoFavorite=null;}
function notice(text,persistent=false){const navigating=!!pendingToast;clearTimeout(toastTimer);pendingToast=null;toast=text;toastPersistent=persistent;toastContext={profileId:state.activeId,raw};if(persistent){undoFavorite=null;if(navigating)pendingToast={text,context:toastContext,persistent:true};}}
function noticeValid(n){return n&&n.profileId===state.activeId&&n.raw===raw;}
function mountNotice(){
 const message=root.querySelector('.as-recado');if(!message)return;
 const bar=root.querySelector('.as-barra-acoes');
 if(bar){bar.prepend(message);bar.style.flexWrap='wrap';message.style.flexBasis='100%';const ficha=root.querySelector('.as-ficha');if(ficha)ficha.style.paddingBottom=(bar.offsetHeight+24)+'px';}
 else {message.style.scrollMarginTop=((root.querySelector('.as-topo')?.offsetHeight||0)+16)+'px';message.scrollIntoView({block:'nearest'});}
 const current=toastContext;
 const expire=()=>{if(current!==toastContext)return;if(message.contains(document.activeElement)){toastTimer=setTimeout(expire,500);return;}message.remove();toast='';toastContext=null;undoFavorite=null;};
 clearTimeout(toastTimer);if(!toastPersistent)toastTimer=setTimeout(expire,5000);
}
function go(r,replace=false){const h='#/'+r;if(location.hash===h){render();return;}if(replace){history.replaceState(null,'',h);render();}else {pendingToast=toast?{text:toast,context:toastContext,persistent:toastPersistent}:null;toast='';location.hash=h;}}
function save(next){const error=persist(storage,next);if(error){const latest=load(storage);state=latest.state;storageError=latest.error;raw=latest.raw;notice(error,true);render();return false;}state=next;raw=JSON.stringify(next);return true;}
function fresh(){if(!ensureDay())return false;let current;try{current=storage.getItem(STORAGE_KEY)??null;}catch{return true;}if(current===raw)return true;const latest=load(storage);state=latest.state;storageError=latest.error;raw=latest.raw;undoFavorite=null;confirmationIntent=null;notice('Os dados mudaram em outra aba. Confira o perfil antes de continuar.',true);if(['delete','restore','reset'].includes(route()[0]))go('profiles',true);else render();return false;}
function cardImage(c){return image(manifest.cards[c.editorial_id??c.id]||manifest.familias[c.familia]||manifest.padrao);}
function tile(c,item,prefix='kit-item',i=1){const check=assess(c,p(),catalog);return cardResumo({card:c,familia:catalog.familias.find(f=>f.id===c.familia),imagem:cardImage(c),porque:check.compatible?(prefix==='kit-item'?`Cabe nos ${p().answers.minutes} min de hoje.${c.contexto.materiais.length?' Usa '+c.contexto.materiais.map(m=>VOCAB.resources[m].toLowerCase()).join(' e ')+', que você marcou.':' Não exige material específico.'}`:`Cabe nos ${p().answers.minutes} min de hoje.`):check.reasons[0],href:'#/card/'+c.id,modo:prefix==='kit-item'?(i===0?'destaque':''):'compacto',selo:i===0?'Comece por aqui':'',consulta:!check.compatible,motivo:check.reasons[0],salvo:p()?.favorites.includes(c.id),materiais:c.contexto.materiais.map(m=>VOCAB.resources[m]),crianca:p()?.name,prefixo:prefix});}
function welcome(){
 const img=art('boas-vindas-acolhimento');
 return `<section class="welcome"><div class="welcome-art"><img src="${img.src}" alt="" width="400" height="400"></div>
 <div class="welcome-copy">${title('O que está difícil hoje?','Da birra à hora de dormir, encontre uma ficha para a idade da criança e a situação que vocês estão vivendo.')}
 ${link(p()?'Abrir meu kit':'Criar um perfil',p()?'home':'add',{tom:'primario',bloco:true,iconeFim:'seta-direita',testid:'add-child'})}
 <a class="quiet-link" href="#/situacoes">Explorar situações ${icone('divisa-direita')}</a></div></section>`;
}

function riskHtml(){return riskNotices(p(),catalog).map(n=>aviso({tom:'avaliacao',titulo:'Antes de continuar',texto:n.text,testid:'quiz-notice-'+n.code})).join('');}
function coverage(){return `${title('Esta idade ainda não tem conteúdo.','Você não precisa responder ao quiz para descobrir isso.')}${riskHtml()}<p>O acervo não contém cards para ${esc(ageLabel(p().ageMonths))}. Não altere idade ou diagnóstico para obter uma sugestão.</p>${link('Quer ajuda de um profissional?','help',{tom:'primario'})}${link('Editar perfil','edit')}${link('Ver crianças','profiles')}`;}
function home(){
 if(!p())return welcome();
 const child=p(), risks=[...(child.answers.risks||[]),...(child.quizDraft?.answers.risks||[])].filter(x=>x!=='nao_sei');
 const safe=kitSafety?.day===dateKey()&&kitSafety?.profile===child.id&&kitSafety?.raw===raw?kitSafety:null;
 const intro=title('Hoje com '+child.name, 'Escolha uma ficha para o momento de vocês.')+riskHtml();
 const other=`<div class="home-links"><a class="quiet-link" href="#/situacoes">Explorar situações ${icone('divisa-direita')}</a><a class="quiet-link" href="#/help">Quer ajuda de um profissional? ${icone('divisa-direita')}</a></div>`;
 if(risks.length)return title('Orientação para este momento','Um sinal nas respostas pede atenção antes de tentar uma atividade.')+riskHtml()+link('Ver orientação de apoio','apoio',{tom:'primario'})+link('Rever respostas','quiz/0')+other;
 if(child.quizDraft||!child.answers.priority)return intro+link(child.quizDraft?'Continuar perguntas':'Escolher meu desafio','quiz/'+(child.quizDraft?.step||0),{tom:'primario'})+other;
 if(!safe)return intro+`<form id="kit-safety" class="safety-check" data-profile="${esc(child.id)}"><h2>Como está a criança agora?</h2>
 ${[['perigo','Há perigo imediato?'],['sofrimento_intenso','Há sofrimento intenso agora?']].map(([id,t])=>`<label class="as-campo">${t}<select name="${id}" required><option value="">Selecione</option><option value="sim">Sim</option><option value="nao">Não</option><option value="nao_sei">Não sei</option></select></label>`).join('')}
 ${botao('Ver sugestões',{tipo:'submit',tom:'primario',iconeFim:'seta-direita'})}</form>`+other;
 const result=buildKit(kitMap,child.answers.priority,{...safe,intervalo_idade:profileAge(child),retirada:'nao',risco_positivo:'nao',rascunho:'nao'});
 const cardById=new Map(catalog.cards.map(c=>[c.id,c]));
 const visible=items=>items.map(it=>cardById.get(it.id)).filter(c=>c&&availableToReview(c,child,catalog));
 const controls=`<div class="home-links">${link('Ajustar tempo ou materiais','context')}${action('A situação mudou','recheck-kit')}</div>`;
 return intro+Object.entries(result.blocos).map(([block,group])=>{
  const cards=visible([...group.visiveis,...group.mais]);
  return `<section class="situation-group"><h2>${({momentos_dificeis:'Momentos difíceis',estimular:'Para estimular',acalmar:'Para ajudar a acalmar'})[block]}</h2>
  ${cards.slice(0,3).map(c=>situationRow(c,true)).join('')||'<p>Nenhuma ficha deste grupo combina com as respostas de hoje.</p>'}
  ${cards.length>3?`<details data-kit-group="${esc(block)}"><summary>${extraSheets(cards.length-3)}</summary>${cards.slice(3).map(c=>situationRow(c,true)).join('')}</details>`:''}</section>`;
 }).join('')+controls+other;
}

function profiles(){
 const cards=state.profiles.map(child=>{
  const active=child.id===state.activeId, age=effectiveProfile(child).ageMonths;
  const detail=[Number.isFinite(age)?ageLabel(age):'',active?'Em uso':''].filter(Boolean).join(' · ');
  return `<article class="as-crianca ${active?'as-crianca--ativa':''}" data-testid="child-${esc(child.id)}">${avatar({src:av(child)})}
  <div class="as-crianca-dados"><h2 class="as-crianca-nome">${esc(child.name)}</h2><p>${esc(detail)}</p></div>
  <div class="as-crianca-acoes">${action('Abrir perfil','switch:'+child.id,{tom:'primario'})}${active?link('Editar perfil','edit'):''}</div></article>`;
 }).join('');
 return `${title('Perfis das crianças',cards?'Cada perfil guarda suas próprias fichas e respostas.':'Adicione uma criança para montar o primeiro kit.')}${cards?`<div class="as-criancas">${cards}</div>`:''}${link('Adicionar criança','add',{tom:'primario',testid:'add-child'})}`;
}

function demoTermsField(){
 return `<div class="consent"><label><input type="checkbox" name="terms" value="${DEMO_TERMS_VERSION}" required data-testid="terms-accept"><span>Li e aceito os termos de uso e privacidade.</span></label>
 <a href="./termos.html" target="_blank" rel="noopener noreferrer">Ler termos de uso e privacidade<span class="visually-hidden"> (abre em outra aba)</span></a></div>`;
}

function profileForm(edit=false){
 const child=edit?p():null, birth=child?.birth;
 const choice=manifest.avatares.find(a=>a.id===child?.avatar)||manifest.avatares[0];
 const savedDay=birth?.confirmation?.date===dateKey()?birth.confirmation.answer:'nao_sei';
 const months=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
 return `<section class="profile-page">${title(edit?'Editar perfil':'Perfil da criança',edit?'As alterações atualizam as sugestões.':'A idade ajuda a escolher as fichas para essa criança.')}
 <form id="profile-form" class="as-formulario profile-fields" data-profile="${esc(child?.id||'')}">
 <label class="as-campo">Apelido<input name="name" required maxlength="40" value="${esc(child?.name||'')}" autocomplete="off" placeholder="Ex. Lia"></label>
 <fieldset class="birth-fields"><legend>Nascimento</legend><div class="age-fields"><label class="as-campo">Mês<select name="birth_month" required><option value="">Mês</option>
 ${months.map((m,i)=>`<option value="${i+1}" ${birth?.month===i+1?'selected':''}>${m}</option>`).join('')}</select></label>
 <label class="as-campo">Ano<input type="text" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" name="birth_year" required placeholder="Ano" value="${esc(birth?.year||'')}"></label></div>
 <p data-testid="age-now" class="field-note" role="status"></p>
 <details class="age-detail" hidden><summary>Confirmar a idade em meses <small>(opcional)</small></summary>
 <label class="as-campo">Neste mês, o dia em que a criança nasceu já passou?<select name="birth_passed">${[['nao_sei','Prefiro não informar'],['sim','Sim'],['nao','Ainda não']].map(([v,t])=>`<option value="${v}" ${v===savedDay?'selected':''}>${t}</option>`).join('')}</select></label>
 <p class="field-note">Se ela nasceu no dia 12, por exemplo, marque “Sim” a partir do dia 12. Essa resposta vale só hoje.</p></details></fieldset>
 <details class="symbol-picker"><summary><img src="${image(choice).src}" alt=""><span>Símbolo do perfil<strong data-symbol-name>${esc(choice.id)}</strong></span><span class="symbol-edit">Alterar ${icone('divisa-baixo')}</span></summary>
 <fieldset class="symbols"><legend class="visually-hidden">Escolha o símbolo do perfil</legend>${manifest.avatares.map(a=>`<label><input type="radio" name="avatar" value="${esc(a.id)}" ${choice.id===a.id?'checked':''}><img src="${image(a).src}" alt=""><span>${esc(a.id)}</span></label>`).join('')}</fieldset></details>
 ${edit?'':demoTermsField()}<p class="field-error" role="alert" id="profile-error"></p>
 <div class="form-actions">${botao(edit?'Salvar alterações':'Criar perfil',{tipo:'submit',tom:'primario',bloco:true,iconeFim:'seta-direita'})}
 <a class="quiet-link" href="#/${edit||p()?'profiles':'welcome/0'}">Cancelar</a></div></form>
 ${edit?link('Excluir perfil','delete',{tom:'perigo'}):''}</section>`;
}

function updateProfileFields(form,changed=''){
 const picker=form.querySelector('.symbol-picker'), selected=picker.querySelector('input:checked');
 if(selected){picker.querySelector('summary img').src=selected.nextElementSibling.src;picker.querySelector('[data-symbol-name]').textContent=selected.value;}
 const {birth_year,birth_month,birth_passed}=form.elements;
 if(['birth_year','birth_month'].includes(changed))birth_passed.value='nao_sei';
 const year=Number(birth_year.value);
 const birth={year,month:Number(birth_month.value)};
 const hasDate=birth_year.value.length===4 && year>=new Date().getFullYear()-18 && !!birth.month;
 const interval=hasDate?profileAge({birth}):null;
 const extra=form.querySelector('.age-detail');
 extra.hidden=!interval||interval[0]===interval[1];
 if(extra.hidden){extra.open=false;birth_passed.value='nao_sei';}
 const exact=interval && profileAge({birth:{...birth,confirmation:{date:dateKey(),answer:birth_passed.value}}});
 const age=form.querySelector('[data-testid="age-now"]');
 age.textContent=exact?'Idade aproximada · '+(exact[0]===exact[1]?ageLabel(exact[0]):ageLabel(exact[0])+' a '+ageLabel(exact[1])):'';
 form.querySelector('#profile-error').textContent='';
}

const extraSheets=n=>n===1?'Ver mais uma ficha':'Ver mais '+n+' fichas';

function selectedSuffix(id){
 return catalog.cards.some(c=>c.id===id)?'/'+id:'';
}

const quizStickers = {
 "understanding": {
  "objeto": "caneca-e-colher",
  "figura": "cartao-com-figura",
  "frase": "balao-de-fala",
  "leitura": "livro-aberto"
 },
 "communication": {
  "gestos": "mao-apontando",
  "palavras": "balao-de-fala",
  "frases": "obj:baloes-de-conversa",
  "figuras_ou_app": "cartoes-de-figuras"
 },
 "steps": {
  "um": "mao-apontando",
  "dois": "cartoes-de-figuras"
 },
 "interests": {
  "brinquedos": "carrinho",
  "desenho": "giz-de-cera",
  "movimento": "bola",
  "livros": "livros",
  "musica": "chocalho",
  "agua": "balde-e-patinho",
  "animais": "cachorro-de-pelucia",
  "montar": "obj:blocos",
  "faz_de_conta": "bule-de-brinquedo",
  "personagens": "boneco-com-capa"
 },
 "resources": {
  "brinquedo": "carrinho",
  "objeto_cotidiano": "caneca-e-colher",
  "papel": "papel-e-lapis",
  "impressora": "impressora",
  "livro_ou_figuras": "livro-aberto",
  "espaco_calmo": "almofada-e-manta",
  "espaco_para_movimento": "tapete"
 },
 "sensitivities": {
  "barulho": "obj:abafador",
  "toque": "mao-aberta",
  "luz": "lampada",
  "lugares_cheios": "bonecos-juntos"
 },
 "caregivers": {
  "um": "um-adulto",
  "varios": "tres-adultos"
 }
};
function quizArt(key,value){
 if(['priority','queue'].includes(key)){
  const symbols={brincar:'blocos',emocoes:'coelho-de-pelucia',transicoes:'tenis',noite:'livro-e-abajur',autonomia:'camiseta',cuidadores:'baloes-de-conversa'};
  return `../ilustracoes/guache/objetos/objeto-${symbols[value]}.webp`;
 }
 const asset=quizStickers[key]?.[value];
 if(!asset)return '';
 return '../ilustracoes/guache/'+(asset.startsWith('obj:')?'objetos/objeto-'+asset.slice(4):'adesivos/'+asset)+'.webp';
}

function quizQuestions(){return QUESTIONS.filter(q=>!q.showIf||(p()?.quizDraft?.answers||p()?.answers||{}).diagnoses?.includes('autismo'));}
function quiz(n){if(!hasAgeCoverage(p(),catalog))return coverage();const child=p(),draft=child.quizDraft?.answers||child.answers,qs=quizQuestions();n=Number.isInteger(n)?Math.max(0,Math.min(n,qs.length-1)):0;const q=qs[n];let options=q.options;if(['priority','queue'].includes(q.key))options=Object.fromEntries(catalog.desafios.filter(d=>!['momentos_dificeis','estimular','acalmar'].includes(d.id)&&d.estado==='ativo'&&(q.key!=='queue'||d.id!==draft.priority)).map(d=>[d.id,themeNames[d.id]||d.nome]));const optional=['queue','interests','diagnoses'].includes(q.key),multiple=q.type==='multi';const v=draft[q.key];const neutras=multiple?[{valor:'__none',rotulo:optional?'Prefiro não informar':'Nenhum destes'},...(!optional?[{valor:'nao_sei',rotulo:'Não sei'}]:[])]:[];return `<div class="quiz-head">${progresso({atual:n+1,total:qs.length})}${link('Salvar e sair','home')}</div><form id="quiz-form" data-profile="${esc(child.id)}" data-step="${n}">${pergunta({principal:true,visual:!['risks','diagnoses','support'].includes(q.key),chave:q.key,titulo:q.key==='priority'?'Qual desafio vem primeiro?':q.label,dica:q.key==='diagnoses'?'Opcional. Você pode seguir sem informar. Não inferimos diagnóstico.':q.key==='support'?'Somente o que está informado em laudo. Não determina o kit.':q.key==='queue'?'Escolha até dois desafios.':q.key==='interests'?'Até três interesses. Eles apenas ordenam sugestões.':multiple?'Marque as opções que se aplicam.':'',tipo:q.type,opcoes:Object.entries(options).map(([valor,rotulo])=>({valor,rotulo,arte:quizArt(q.key,valor),icone:['priority','queue'].includes(q.key)?valor:'',familia:['priority','queue'].includes(q.key)?valor:''})),neutras,valor:Array.isArray(v)&&!v.length?['__none']:q.key==='minutes'?(v===null?'nao_sei':String(v??'')):v,obrigatoria:q.required})}<div id="quiz-risk-notices" role="alert" aria-atomic="true">${riskHtml()}</div><p id="form-error" role="alert"></p><div class="as-quiz-acoes">${n?link('Voltar','quiz/'+(n-1)+selectedSuffix(route()[2])):link('Voltar','home')}${botao(n===qs.length-1?'Ver meu kit':'Continuar',{tipo:'submit',tom:'primario',testid:'quiz-next'})}</div></form>`;}
function detail(id){const c=catalog.cards.find(c=>c.id===id);if(c?.regra_integracao)return expandedDetail(c);if(!c)return `${title('Conteúdo indisponível.','Este card saiu do catálogo. Seu registro permanece no histórico.')}${link('Ver salvos','saved')}`;const child=p(),check=assess(c,child,catalog),im=cardImage(c),f=lastFeedback(child,c.id),withdrawn=['desconforto','nao_quero'].includes(f?.kind);const why=c.por_que;const panels={
 como:`<details class="reader-prep"><summary>Antes de começar · materiais e cuidados</summary>${preparo({itens:[{icone:'materiais',texto:c.contexto.materiais_detalhados||'Confira os materiais dos passos.'},...(c.contexto.requisitos_nao_inferiveis||[]).map(texto=>({icone:'certo',texto})),{icone:'relogio',texto:c.contexto.nota_tempo||'Tempo aproximado, sem obrigação de completar.'}],limites:[c.editorial?.limite_do_quiz].filter(Boolean)})}</details><h2 class="as-titulo-2">Como começar</h2>${passos(c.passos)}`,
 porque:`<h2 class="as-titulo-2">${esc(why.principio)}</h2><p>${esc(why.explicacao||'')}</p><h3>Por que apareceu para ${esc(child.name)}?</h3>${lista(check.trace.filter(t=>t.passed&&['age','understanding','requirement','material','time'].includes(t.id)).map(t=>t.text))}<h3>Limites</h3><p>${etiquetaEstado(c.status)} ${etiquetaTipo(c.tipo)}</p><p>${esc(why.limites)}</p><p>Força da evidência: ${esc(FORCAS[why.forca_da_evidencia])}</p><p>${esc(why.justificativa_da_forca||'')}</p><div data-testid="card-sources">${why.fontes.map(fonte).join('')}</div><p class="as-miudo">Autoria: ${esc(c.revisao.autor)} · Revisão: ${esc(c.revisao.revisor||'sem revisão humana')} · Versão ${esc(c.versao)}</p>`,
 adaptar:`<h2 class="as-titulo-2">Variações para avaliar</h2>${adaptationsFor(c,child).map(adaptacao).join('')||'<p>Nenhuma adaptação corresponde às respostas atuais. Não force uma variação.</p>'}`,
 cuidados:`<h2 class="as-titulo-2">O que evitar</h2>${lista(c.evite,{tom:'evite'})}<h3>Se não der certo</h3>${lista(c.se_nao_der_certo)}<h3>Quando buscar ajuda</h3>${lista(c.procure_ajuda_se)}`};
 return `${cardBack(c,'home')}<article class="as-ficha" data-familia="${esc(c.familia)}"><header class="card-opening"><img src="${im.src}" alt="${esc(im.alt)}">${title(c.titulo,cardFacts(c))}</header>${!check.compatible?aviso({tom:'atencao',titulo:'Somente consulta',texto:check.reasons.join(' ')})+(check.trace.some(t=>t.id==='time'&&!t.passed)?link('Ajustar tempo disponível','context'):''):''}${f?.kind==='desconforto'?aviso({tom:'avaliacao',texto:catalog.orientacoes.desconforto,testid:'notice-desconforto'}):''}${abas({ativa:cardTab,itens:[['como','Como fazer','passos'],['porque','Por quê','porque'],['adaptar','Adaptar','adaptar'],['cuidados','Cuidados','cuidados']].map(([id,rotulo,icone])=>({id,rotulo,icone}))})}${painel(cardTab,panels[cardTab])}${check.compatible?action('Preparar para cuidador','share:'+id):''}${c.observacao?`<p><strong>O que observar:</strong> ${esc(c.observacao)}</p>`:''}${nota(FRASE_ACOMPANHAMENTO)}<div class="as-barra-acoes">${gSalvar({salvo:child.favorites.includes(id),agora:gesture?.kind==='favorite'&&gesture?.profile===child.id&&gesture?.card===id,testid:'card-save'}).replace('<button ',`<button data-action="favorite:${esc(id)}" `)}${check.compatible?action('Como coube hoje?','return:'+id,{tom:'primario'}):withdrawn?action('Rever retirada','restore:'+id):''}</div></article>`;}
function saved(){const child=p();return `${title('Fichas salvas de '+child.name)}<div class="as-grade">${child.favorites.map(id=>{const c=catalog.cards.find(c=>c.id===id);return c?tile(c,null,'saved-item'):`<p>Card ${esc(id)} indisponível no catálogo atual. Registro preservado.</p>`;}).join('')||vazio({arte:art('vazio').src,titulo:'Sua caixa ainda está vazia.',texto:'Salve uma ideia para encontrar aqui depois.',acoesHtml:link('Explorar sugestões','explore')})}</div>${link('Ver nosso caminho','path',{testid:'path-open'})}`;}
function explore(){
 const child=p(), result=searchCards(catalog.cards,search,filter,kitMap);
 const sorted=result.cards.map(card=>({card,check:{compatible:availableToReview(card,child,catalog)}}));
 if(!search.trim())sorted.sort((a,b)=>Number(b.check.compatible)-Number(a.check.compatible));
 const row=({card,check})=>`<a class="situation-row" href="#/card/${esc(card.id)}" data-testid="explore-item-${esc(card.id)}"><img src="${cardImage(card).src}" alt="" width="80" height="64" loading="lazy"><span><strong>${esc(card.titulo)}</strong><small>${esc(ageRange(card))}${check.compatible?'':' · Só para consulta'}</small></span>${icone('divisa-direita')}</a>`;
 return `${title('Explorar fichas','Busque uma situação ou escolha um desafio.')}${searchForm('search-form',search)}
 <div class="as-filtros as-filtros--trilho" aria-label="Filtrar por desafio">${action('Todos','filter:',{pressionado:!filter})}${catalog.desafios.map(d=>action(themeNames[d.id]||d.nome,'filter:'+d.id,{pressionado:filter===d.id,testid:'search-theme-'+d.id})).join('')}</div>
 ${result.related&&sorted.length?'<p>Ideias relacionadas ao tema</p>':''}
 ${result.notice?nota(result.notice):''}
 ${sorted.length?`<section class="situation-group"><h2 id="search-summary" tabindex="-1">${sorted.length===1?'1 ficha':sorted.length+' fichas'}</h2>${sorted.slice(0,8).map(row).join('')}
 ${sorted.length>8?`<details><summary>${extraSheets(sorted.length-8)}</summary>${sorted.slice(8).map(row).join('')}</details>`:''}</section>`:`<section id="search-summary" tabindex="-1">${vazio({arte:art('vazio').src,titulo:'Nenhuma ficha encontrada.',texto:'Tente outro termo ou selecione Todos para ampliar a busca.'})}</section>`}
 <details class="more"><summary>Cobertura do acervo</summary><p>As fichas têm faixas próprias entre 2 e 14 anos e 11 meses. Ao abrir uma ficha, confira para quem ela serve, os cuidados e as fontes.</p></details>`;
}

function path(){const c=p(),events=[...new Map(c.feedback.map(f=>[f.id,f])).values()];const tried=new Set(events.filter(f=>f.kind==='usamos').map(f=>f.cardId));return `${title('O caminho de '+c.name,'Um registro das suas tentativas, sem medir o desenvolvimento da criança.')}<div class="as-segmento">${link('Guardados','saved')}${link('Caminho','path',{pressionado:true})}</div><div data-testid="path-summary">${contagens([[tried.size,'ideias tentadas'],[c.favorites.length,'guardadas'],[new Set(events.filter(f=>['adaptar','nao_coube'].includes(f.kind)).map(f=>f.cardId)).size,'ideias para ajustar']])}</div>${events.length?registro({titulo:'O que vocês registraram',testid:'path-log',linhas:events.slice().reverse().map(f=>({rotulo:RETORNOS[f.kind]?.rotulo||'Registro',data:new Date(f.at).toLocaleDateString('pt-BR'),titulo:catalog.cards.find(x=>x.id===f.cardId)?.titulo||'Card fora do catálogo',nota:f.kind==='desconforto'?'Sugestão retirada. Avise quem recebeu uma cópia externa.':''}))}):vazio({arte:art('vazio').src,titulo:'Cada tentativa tem seu lugar.',texto:'Quando você registrar como uma ideia coube, ela aparece aqui.'})}<details class="more"><summary>Contexto que mudou</summary>${c.history.slice().reverse().map(h=>`<p>${h.kind==='criado'?'Perfil criado':h.changed.map(k=>({ageMonths:'Idade atualizada',name:'Apelido atualizado',avatar:'Símbolo atualizado',minutes:'Tempo disponível atualizado',resources:'Materiais atualizados',priority:'Foco atualizado'})[k]||QUESTIONS.find(q=>q.key===k)?.label||'Respostas atualizadas').join(' · ')}</p>`).join('')}</details>`;}
function contextForm(){const c=p();if(!hasAgeCoverage(c,catalog))return coverage();if(c.quizDraft)return `${title('Conclua a revisão em andamento.','Depois você pode mudar só o tempo ou os materiais.')} ${link('Retomar quiz','quiz/'+c.quizDraft.step,{tom:'primario'})}`;return `${title('Ajustar o kit','Atualize o tempo e os materiais disponíveis para '+c.name+'.')}<form id="context-form" data-profile="${esc(c.id)}"><label class="as-campo">Tempo disponível<select name="minutes">${[2,5,10,20].map(n=>`<option value="${n}" ${c.answers.minutes===n?'selected':''}>${n} minutos</option>`).join('')}<option value="unknown" ${c.answers.minutes==null?'selected':''}>Não sei</option></select></label><fieldset class="as-pergunta"><legend>Materiais que estão disponíveis</legend>${Object.entries(VOCAB.resources).filter(([k])=>k!=='nao_sei').map(([k,v])=>`<label class="resource-option"><input type="checkbox" name="resources" value="${k}" ${(c.answers.resources||[]).includes(k)?'checked':''}>${esc(v)}</label>`).join('')}<label class="resource-option"><input name="unknown" type="checkbox" ${c.answers.resources?.includes('nao_sei')?'checked':''}>Não sei quais materiais estão disponíveis</label></fieldset>${botao('Atualizar kit',{tipo:'submit',tom:'primario',testid:'context-save'})}</form>${link('Rever todas as respostas','quiz/0')}`;}
function ready(){
 if(riskNotices(p(),catalog).length)return title('Vamos começar pelo apoio','Uma das respostas indica que é importante conferir a orientação antes de escolher uma atividade.')+link('Ver orientação de apoio','apoio',{tom:'primario'})+link('Rever respostas','quiz/0');
 const chosen=selectedSuffix(route()[1]);return `${title('Seu kit está pronto.','Abra uma ficha para conferir se ela cabe no momento de vocês.')}${chosen?link('Abrir a ficha escolhida','card'+chosen,{tom:'primario',bloco:true}):''}${link('Abrir meu kit','home',{tom:chosen?'quieto':'primario',bloco:true,testid:'kit-open'})}`;}

function plans(){
 return `${title('Seu plano')}${plano({nome:'Gratuito',atual:true,resumo:'As fichas do seu kit estão incluídas.',itensHtml:lista(['Passos, adaptações e cuidados de cada ficha','Um perfil para cada criança','Fichas salvas para consultar depois']),acoesHtml:link('Abrir meu kit','home',{tom:'primario',testid:'plan-keep-free'})})}`;
}

function help(){
 return `${title('Quer ajuda de um profissional?','A orientação parental é uma conversa sobre os desafios da sua família.')}
 <p>Os pedidos de contato pelo app estão fechados no momento. Você pode preparar uma anotação para levar a um profissional.</p>
 <form id="professional-note" class="as-formulario"><label class="as-campo">O que você gostaria de conversar?<textarea name="need" required maxlength="500" placeholder="Por exemplo, o que acontece na hora de sair de casa?"></textarea></label>
 ${botao('Copiar minha anotação',{tipo:'submit',tom:'primario'})}<p role="status"></p></form>
 ${link('Preciso de apoio agora','apoio')}<a class="as-link" href="./termos.html">Termos de uso e privacidade</a>`;
}
function errorScreen(){return vazio({arte:art('vazio').src,titulo:'Vamos preservar seus dados.',texto:storageError,nivel:1,testid:'storage-error',acoesHtml:action('Baixar cópia dos dados','download')+link('Apagar dados do app','reset',{testid:'reset'})});}
function armConfirmation(kind,id){clearNotice();confirmationIntent={kind,id,profileId:p()?.id,raw};}
function canConfirm(kind,id){return confirmationIntent?.kind===kind&&confirmationIntent.id===id&&confirmationIntent.profileId===p()?.id&&confirmationIntent.raw===raw;}
function confirmation(kind,id){if(kind==='delete')id=p()?.id;if(!canConfirm(kind,id))return `${title('Confira o contexto antes de continuar.','Abra esta ação dentro do app. Nenhum dado foi alterado.')}${link('Voltar ao app','home')}`;if(kind==='restore'&&(!catalog.cards.some(c=>c.id===id)||!['nao_quero','desconforto'].includes(lastFeedback(p(),id)?.kind)))return title('Esta retirada não está disponível.');const texts={reset:['Apagar os dados do Agora Sei neste navegador?','Todos os perfis, respostas e fichas salvas neste navegador serão apagados. Essa ação é definitiva.'],delete:['Excluir '+(p()?.name||'esta criança')+'?','Remove somente este perfil e seus registros.'],restore:['Devolver '+(catalog.cards.find(c=>c.id===id)?.titulo||'esta sugestão')+'?','Reveja o contexto e os cuidados. A restauração não confirma que a atividade é adequada agora.']};const [t,d]=texts[kind];return `${title(t,d)}<div class="flow-actions">${action(kind==='reset'?'Apagar todos os dados':kind==='delete'?'Excluir criança':'Confirmar restauração','confirm-'+kind+(id?':'+id:''),{tom:'primario',testid:kind==='reset'?'reset-confirm':undefined})}${link('Cancelar','home')}</div>`;}
function render(){if(toast&&!noticeValid(toastContext))clearNotice();const [r,arg]=route();if(!catalog)return;let body,child=p();if(searchOwner!==state.activeId){searchOwner=state.activeId;search='';filter='';situationSearch='';}if(storageError&&!['reset','apoio'].includes(r))body=errorScreen();else if(['quiz','edit','delete','saved','card','explore','mount','restore','coverage','context','path'].includes(r)&&!child){go('profiles',true);return;}else {const pages={situacoes:()=>situacoes(arg),situacao:()=>situationPreview(arg),apoio:()=>supportPage(arg),home,profiles,add:()=>profileForm(false),edit:()=>profileForm(true),quiz:()=>quiz(Number(arg)||0),card:()=>detail(arg),saved,explore,help,coverage,plans,path,context:contextForm,welcome,reset:()=>confirmation('reset'),delete:()=>confirmation('delete'),restore:()=>confirmation('restore',arg),mount:ready};body=(Object.hasOwn(pages,r)?pages[r]:home)();}
 root.innerHTML=moldura({rota:r,appLinks:true,crianca:child?{nome:child.name,avatar:av(child)}:null,conteudoHtml:(toast?recado(toast,{icone:toastPersistent?'alerta':'certo',acao:undoFavorite?{rotulo:'Desfazer',testid:'save-undo'}:undefined}):'')+body,semRodape:!!storageError,semNav:!!storageError||['welcome','quiz','mount'].includes(r)||!child});
 const profileFormEl=root.querySelector('#profile-form');
 if(profileFormEl)updateProfileFields(profileFormEl);
 mountNotice();
 const message=root.querySelector('.as-recado');
 if(message&&gesture && child && gesture.profile===child.id&&!toastPersistent){const icon=message.querySelector('.as-icone');if(icon)icon.outerHTML=gesture.kind==='attempt'?gCarimbo({agora:true,tamanho:'1.5rem'}):gCheck({agora:true,tamanho:'1.5rem'});}
 if(r==='home'&&child){const heading=root.querySelector('h1');if(heading&&heading.textContent==='Hoje com '+child.name)heading.innerHTML='Hoje com '+gSublinhado({texto:child.name});}
 root.querySelectorAll('.as-botao').forEach(b=>b.classList.add('as-g-toque'));
 const undo=gesture?.kind==='favorite'&&gesture.keyboard?root.querySelector('[data-testid="save-undo"]'):null;
 (undo||document.querySelector('main'))?.focus({preventScroll:true});
 gesture=null;
}

function validExpandedUse(c){return lastUse?.day===dateKey()&&lastUse?.raw===raw&&lastUse.profile===p()?.id&&lastUse.card===c.id&&assessUse(c,p(),catalog,lastUse.input).compatible;}
const expandedLinks=()=>routeContent.orientacoes_especificas.map(r=>link(r.titulo,'apoio/'+r.id)).join('');
const themeNames = {
 "emocoes": "Birras e frustrações",
 "noite": "Sono e rotina da noite",
 "transicoes": "Mudanças de atividade",
 "brincar": "Brincar junto",
 "autonomia": "Autonomia",
 "cuidadores": "Combinados entre adultos"
};

function ageRange(c){
 const [low,high]=c.elegibilidade.idade_meses;
 if(low%12===0 && high===low+11)return ageLabel(low);
 return low%12===0&&high%12===11?`${Math.floor(low/12)} a ${Math.floor(high/12)} anos`:`${ageLabel(low)} a ${ageLabel(high)}`;
}

function cardFacts(c){
 const minutes=c.contexto.tempo_min;
 return Number.isFinite(minutes) ? ageRange(c)+' · '+minutes+' min' : ageRange(c);
}

let readingOrigin=null;
let situationSearch='';
let searchOwner;
function searchForm(id, value) {
 const field=id+'-input';
 return `<form class="as-busca" id="${id}" role="search"><label class="as-so-leitor" for="${field}">Buscar por situação</label><input id="${field}" name="search" type="search" maxlength="120" autocomplete="off" placeholder="Ex.: parque, irmãos, sono" value="${esc(value)}">${botao('Buscar',{tipo:'submit'})}</form>`;
}
function searchSummary(count) {
 return `<p id="search-summary" tabindex="-1">${count===0?'Nenhuma ficha encontrada':count===1?'1 ficha encontrada':count+' fichas encontradas'}</p>`;
}
const listLabels={situacoes:'Situações',explore:'Explorar fichas',saved:'Fichas salvas',home:'Meu kit'};
function cardBack(c,fallback){
 const source=readingOrigin?.card===c.id && readingOrigin.profile===state.activeId ? readingOrigin.path : fallback;
 return `<a class="quiet-link" href="#/${esc(source)}">${icone('seta-esquerda')} ${esc(listLabels[source.split('/')[0]])}</a>`;
}
function restoreRow(previous){
 const origin=readingOrigin;
 if(!origin || origin.profile!==state.activeId || location.hash!=='#/'+origin.path || previous!==origin.to)return false;
 const row=[...root.querySelectorAll('main a[href]')].find(a=>a.hash===origin.to);
 if(!row)return false;
 for(const details of root.querySelectorAll('details[data-kit-group]')){
  if(origin.openGroups?.includes(details.dataset.kitGroup))details.open=true;
 }
 const group=row.closest('details');
 if(group)group.open=true;
 row.focus({preventScroll:true});
 window.scrollTo(0,origin.y);
 return true;
}

function situationRow(c,kit=false){
 const dest=p()?'card/':'situacao/';
 return `<a class="situation-row" href="#/${dest}${esc(c.id)}"><img src="${cardImage(c).src}" alt="" width="80" height="64" loading="lazy"><span><strong>${esc(c.titulo)}</strong><small>${esc(ageRange(c))}${kit===true?(c.regra_integracao?' · Conferir a situação':' · '+c.contexto.tempo_min+' min'):''}</small></span>${icone('divisa-direita')}</a>`;
}

function situacoes(focus=''){
 const selected=Object.hasOwn(themeNames,focus)?focus:'';
 const blocks={momentos_dificeis:'Momentos difíceis',estimular:'Para estimular',acalmar:'Para ajudar a acalmar'};
 const entries=kitMap.cards.filter(it=>!selected||it.focos.includes(selected));
 const cards=new Map(catalog.cards.map(c=>[c.id,c]));
 const filtered=entries.map(entry=>cards.get(entry.id)).filter(Boolean);
 const found=searchCards(filtered,situationSearch,'',kitMap);
 const results=found.cards;
 const sections=Object.entries(blocks).map(([key,label])=>{
  const list=entries.filter(it=>it.bloco===key).map(it=>cards.get(it.id)).filter(Boolean);
  if(!list.length)return '';
  return `<section class="situation-group"><h2>${label} <small>${list.length}</small></h2>
  ${list.slice(0,3).map(situationRow).join('')}${list.length>3?`<details><summary>${extraSheets(list.length-3)} <span class="visually-hidden">em ${label}</span></summary>${list.slice(3).map(situationRow).join('')}</details>`:''}</section>`;
 }).join('');
 return `${title('Situações do dia a dia','Escolha o desafio que sua família está vivendo.')}
 ${searchForm('situation-search',situationSearch)}
 <label class="as-campo topic-filter">Ver situações de<select id="situation-filter"><option value="">Todos os desafios</option>${Object.entries(themeNames).map(([v,t])=>`<option value="${v}" ${v===selected?'selected':''}>${t}</option>`).join('')}</select></label>
 ${situationSearch?`<section class="situation-group">${searchSummary(results.length)}${found.related&&results.length?'<p>Ideias relacionadas ao tema</p>':''}${results.map(situationRow).join('')}${!results.length?'<p>Tente outra palavra ou limpe a busca para ver a lista.</p>':''}${action('Limpar busca','clear-situation-search')}</section>`:sections}<section class="situation-group"><h2>Orientações de apoio</h2><p>Se a preocupação é com segurança, dor ou uma mudança súbita, comece por aqui.</p>${expandedLinks()}</section>`;
}

function situationPreview(id){
 const c=catalog.cards.find(card=>card.id===id);
 if(c && p())return detail(c.id);
 if(!c)return `${title('Ficha não encontrada')}${link('Ver situações','situacoes')}`;
 return `<section class="preview-card">${cardBack(c,'situacoes')}
 <img class="ficha-illustration" src="${cardImage(c).src}" alt="">
 ${title(c.titulo)}<p class="card-facts">${esc(cardFacts(c))}</p>
 <p class="preview-purpose">${esc(c.regra_integracao?.pratica.nome || c.objetivo)}</p>
 <p>O perfil ajuda a conferir se esta ficha combina com a idade e o momento da criança.</p>
 ${link('Criar perfil','add/'+c.id,{tom:'primario',iconeFim:'seta-direita'})}</section>`;
}

function supportMarkdown(text){return text.split('## Para integrar ao app')[0].split('\n\n').map(t=>{const safe=esc(t).replace(/\[([^\]]+)\]\((https:\/\/[^\s)]+)\)/g,'<a href="$2" rel="noopener noreferrer" target="_blank">$1</a>');return /^##? /.test(t)?`<h2>${safe.replace(/^##? /,'')}</h2>`:`<p>${safe}</p>`;}).join('')+'<p>Orientação inicial ao adulto, sem promessa de interromper a crise. Síntese editorial das fontes, não protocolo clínico validado; revisão profissional pendente.</p>';}
function supportPage(id){const r=routeContent.orientacoes_especificas.find(r=>r.id===id)||routeContent.sofrimento_intenso;return `<section class="as-fluxo">${title(r.titulo||'Apoio imediato','')}${r.emergencia?`<p role="note"><strong>${esc(r.emergencia)}</strong></p>`:''}${r.passos?`${passos(r.passos)}${r.evite?.length?'<h2>Evite</h2>'+lista(r.evite):''}${r.interrompa_se?.length?'<h2>Interrompa e busque apoio</h2>'+lista(r.interrompa_se):''}${r.procure_ajuda_se?.length?'<h2>Quando buscar ajuda</h2>'+lista(r.procure_ajuda_se):''}<p>${esc(r.explica.limite)}</p><details><summary>Fontes e limites da orientação</summary><h2>Fontes da orientação</h2>${r.fontes_atividade.map(fonte).join('')}<h2>Fontes de encaminhamento</h2>${r.fontes_encaminhamento.map(fonte).join('')}</details>`:supportMarkdown(r.texto_markdown)}${expandedLinks()}${link('Voltar às situações','situacoes')}</section>`;}
function expandedDetail(original){
 const c=publicCopy(original), child=p(), r=c.regra_integracao;
 const withdrawn=['nao_quero','desconforto'].includes(lastFeedback(child,c.id)?.kind);
 const precheck=expandedPrecheck(original,child), variations=adaptationsFor(c,child).map(a=>a.mudanca);
 return `<article class="reader">${cardBack(c,'situacoes')}
 <div class="reader-heading"><img class="ficha-illustration" src="${cardImage(c).src}" alt="${esc(cardImage(c).alt)}">
 ${title(c.titulo)}<p>${esc(cardFacts(c))}</p></div>
 ${precheck?aviso({texto:precheck}):'<p class="field-note">Confira as condições antes de usar ou repassar a ficha.</p>'}
 <details class="reader-prep"><summary>Antes de começar · condições da ficha</summary>${lista(c.contexto.requisitos_nao_inferiveis)}</details>
 <section><h2>Como fazer</h2>${passos(c.passos)}</section>
 <section><h2>O que observar</h2><p>${esc(c.observacao)}</p></section>
 <details><summary>Por que esta ideia?</summary><p>${esc(c.por_que.explicacao)}</p>
 <p>${esc(r.pratica.categoria==='principio_ndbi_adaptado'?'A ficha adapta um princípio naturalista.':'Orientação geral com referências.')}</p></details>
 <details><summary>Adaptações para a criança</summary>${variations.length?lista(variations):'<p>Confira se alguma das situações abaixo corresponde ao momento.</p>'}
 ${lista(r.adaptacoes_contextuais.map(a=>a.quando+' '+a.mudanca+' '+a.aplicacao))}</details>
 <section class="reader-care"><h2>O que evitar</h2>${lista(c.evite)}<h3>Quando interromper</h3>${lista(c.se_nao_der_certo)}<h3>Quando buscar ajuda</h3>${lista(c.procure_ajuda_se)}</section>
 <details><summary>Fontes e limites</summary><p>${esc(c.por_que.limites)}</p>${c.por_que.fontes.map(fonte).join('')}
 <h3>Fontes de encaminhamento</h3>${r.fontes_encaminhamento.map(fonte).join('')}</details>
 <div class="flow-actions">${withdrawn?action('Rever retirada','restore:'+c.id):''}${!precheck?action('Preparar para cuidador','share:'+c.id,{tom:'primario'})+action('Como coube hoje?','return:'+c.id):''}${action(child.favorites.includes(c.id)?'Remover dos salvos':'Salvar ficha','favorite:'+c.id)}</div></article>`;
}

function attemptField(name,label,options,required=true){
 const short=options.length<=3 && options.every(([,text])=>text.length<=20);
 if(short)return `<fieldset class="attempt-question"><legend>${esc(label)}</legend><div>${options.map(([value,text])=>
  `<label><input type="radio" name="${esc(name)}" value="${esc(value)}"${required?' required':''}><span>${esc(text)}</span></label>`).join('')}</div></fieldset>`;
 return `<label class="as-campo">${esc(label)}<select name="${esc(name)}"${required?' required':''}><option value="">Escolha uma opção</option>${options.map(([value,text])=>
  `<option value="${esc(value)}">${esc(text)}</option>`).join('')}</select></label>`;
}

function confirmExpanded(act,id){const c=catalog.cards.find(c=>c.id===id),child=p(),before=raw,r=c.regra_integracao;if(!child)return;lastUse=null;const blocked=expandedPrecheck(c,child);if(blocked){notice(blocked,true);render();return;}
const d=document.createElement('dialog');d.className='as-folha';d.setAttribute('aria-label','Conferir situação e requisitos');
const answers=[['sim','Sim'],['nao','Não'],['nao_sei','Não sei']],labels=['Há segurança imediata para todos, sem emergência de saúde?','Está sem dor nova ou mudança súbita inexplicada?','O sofrimento está ausente ou leve, sem crise intensa?','Há adulto responsável disponível para acompanhar?','Os recursos, espaço e apoio existem no local do uso?'];
d.innerHTML=`<form class="as-fluxo"><div class="attempt-heading"><h2>Confira esta tentativa</h2><button class="dismiss-attempt" type="button" data-action="close-dialog" aria-label="Fechar conferência">${icone('fechar')}</button></div><p>Para ${esc(child.name)}. As respostas valem só para esta ficha e este contexto.</p>${attemptField('situacao','É esta a situação?',[[r.situacao.id,r.situacao.rotulo],['outra','Outra situação']])}${attemptField('momento','Qual é o momento?',[['antes','Preparação'],['na_hora','Dificuldade leve agora'],['depois','Recuperação'],['treino','Prática tranquila']].filter(([id])=>r.momentos_permitidos.includes(id)))}${GATES.map((k,i)=>attemptField(k,labels[i],answers)).join('')}<h3>Sinais que precisam ser esclarecidos</h3><p>Confirme com quem acompanha a criança. Estas respostas valem apenas para esta tentativa.</p>${RISK_QUESTIONS.map(q=>attemptField(q.id,q.pergunta,answers)).join('')}<h3>Requisitos</h3>${r.requisitos.map(q=>attemptField(q.id,q.pergunta,answers)).join('')}<h3>Quando interromper</h3>${r.exclusoes.map(q=>attemptField(q.id,q.pergunta,answers)).join('')}<div class="expanded-status" role="alert"></div><button type="submit" class="as-botao as-botao--primario">Conferir e continuar</button><button type="button" class="as-botao" data-action="close-dialog">Cancelar</button></form>`;
const capture=()=>{const f=new FormData(d.querySelector('form'));return {id:r.id,idade_meses:child.ageMonths,situacao_id:f.get('situacao'),momento:f.get('momento'),riscos:Object.fromEntries(RISK_QUESTIONS.map(q=>[q.campo,f.get(q.id)])),gates:Object.fromEntries(GATES.map(k=>[k,f.get(k)])),respostas:Object.fromEntries([...r.requisitos,...r.exclusoes].map(q=>[q.id,f.get(q.id)]))};};
const form=d.querySelector('form'),status=d.querySelector('.expanded-status');
let triedSubmit=false;
const show=()=>{
 const input=capture(),check=assessUse(c,p(),catalog,input);
 const missing=form.querySelector('select:invalid,input:invalid');
 const risk=RISK_QUESTIONS.find(q=>['sim','nao_sei'].includes(input.riscos[q.campo]));
 const urgent=check.code?.startsWith('rota_');
 if(!urgent && missing && !risk){
  const label=missing.closest('fieldset')?.querySelector('legend')?.textContent??missing.labels[0]?.firstChild?.textContent;
  status.textContent=triedSubmit?'Falta responder: '+label:'';
  return check;
 }
 const reason=!urgent&&missing&&risk?risk.pergunta+' '+risk.motivo:check.reasons.join(' ');
 status.innerHTML=check.compatible?'<p>Condições conferidas para esta tentativa.</p>':`<p>${esc(reason)}</p>${link(check.code==='rota_emergencia'?'Há perigo: abrir orientação imediata':check.code==='rota_saude'?'Dor ou mudança súbita: abrir orientação':'Abrir apoio ao adulto','apoio/'+(check.code==='rota_saude'?'PES-D13':''))}`;
 return check;
};
form.addEventListener('invalid',e=>{if(e.target===form.querySelector('select:invalid,input:invalid')){triedSubmit=true;show();}},true);
form.addEventListener('change',show);
d.querySelector('form').onsubmit=e=>{e.preventDefault();e.stopPropagation();if(!fresh()||raw!==before||p()?.id!==child.id){d.close();return;}if(!show().compatible)return;const input=capture();lastUse={day:dateKey(),raw,profile:child.id,card:id,input};confirmedUse={day:dateKey(),act,id,raw,profile:child.id,moment:input};d.close();root.querySelector(`[data-action="${act}:${id}"]`)?.click();};
d.addEventListener('close',()=>d.remove());root.append(d);d.showModal();}

function captureQuiz(){const form=document.querySelector('#quiz-form');if(!form||form.dataset.profile!==p()?.id)return null;const qs=quizQuestions(),n=Number(form.dataset.step),q=qs[n],f=new FormData(form);let value=q.type==='multi'?f.getAll(q.key):f.get(q.key);if(q.type==='multi'){if(value.includes('__none'))value=[];else if(value.includes('nao_sei'))value=['nao_sei'];}if(q.key==='minutes')value=value==='nao_sei'?null:Number(value);const answers={...(p().quizDraft?.answers||p().answers),[q.key]:value};if(q.key==='diagnoses'&&!value.includes('autismo'))delete answers.support;return {answers,n,q,qs};}
root.addEventListener('change',e=>{if(!e.target.closest('#quiz-form'))return;if(!fresh())return;const input=e.target;if(input.type==='checkbox'){const group=[...document.querySelectorAll(`input[name="${input.name}"]`)];if(['__none','nao_sei'].includes(input.value)&&input.checked)group.filter(x=>x!==input).forEach(x=>x.checked=false);else if(input.checked)group.filter(x=>['__none','nao_sei'].includes(x.value)).forEach(x=>x.checked=false);if(input.name==='diagnoses'){if(input.value==='nenhum'&&input.checked)group.filter(x=>x!==input).forEach(x=>x.checked=false);else if(input.checked)group.filter(x=>x.value==='nenhum').forEach(x=>x.checked=false);}}
 const draft=captureQuiz();if(draft&&save(updateProfile(state,p().id,{quizDraft:{answers:draft.answers,step:draft.n}}))){const region=document.querySelector('#quiz-risk-notices');if(region)region.innerHTML=riskHtml();}});
root.addEventListener('submit',e=>{e.preventDefault();if(!fresh())return;try{
 if(e.target.id==='context-form'){
  if(e.target.dataset.profile!==p()?.id||p().quizDraft)return;
  const f=new FormData(e.target);
  const answers={...p().answers,minutes:f.get('minutes')==='unknown'?null:Number(f.get('minutes')),resources:f.has('unknown')?['nao_sei']:f.getAll('resources')};
  if(save(updateProfile(state,p().id,{answers}))){
   notice('Tempo e materiais salvos. Confira como está a criança para ver o kit atualizado.');
   go('home');
  }
 }
if(e.target.id==='professional-note'){
  const field=e.target.elements.need, status=e.target.querySelector('[role="status"]');
  const text=field.value.trim();
  if(!text){field.focus();status.textContent='Escreva o que você quer conversar.';return;}
  const manual=()=>{field.focus();field.select();status.textContent='Selecione Copiar no menu do aparelho.';};
  if(!navigator.clipboard?.writeText){manual();return;}
  navigator.clipboard.writeText(text).then(()=>{status.textContent='Anotação copiada. Você pode colar o texto na conversa com o profissional.';},manual);
  return;
}
if(e.target.id==='kit-safety'){const f=new FormData(e.target);if(e.target.dataset.profile!==p()?.id)return;const perigo=f.get('perigo'),sofrimento_intenso=f.get('sofrimento_intenso');if(perigo!=='nao'||sofrimento_intenso!=='nao'){kitSafety=null;go('apoio');return;}kitSafety={day:dateKey(),profile:p().id,raw,perigo,sofrimento_intenso};render();return;}
if(e.target.id==='profile-form'){const f=new FormData(e.target),data={name:String(f.get('name')).trim(),birth:{year:Number(f.get('birth_year')),month:Number(f.get('birth_month')),confirmation:{date:dateKey(),answer:f.get('birth_passed')}},avatar:f.get('avatar')};const age=profileAge(data);if(!data.name || !age || age[1]>216 || data.birth.year<new Date().getFullYear()-18){const field=e.target.elements[!data.name?'name':'birth_year'];e.target.querySelector('#profile-error').textContent=!data.name?'Digite um apelido para continuar.':'Confira o mês e o ano. Use uma data passada dentro da faixa do cadastro.';field.focus();return;}data.ageMonths=age[0];const edit=route()[0]==='edit';
 if(!edit){
  if(f.get('terms')!==DEMO_TERMS_VERSION){notice('Leia e aceite os termos de uso e privacidade para criar o perfil.',true);return;}
  data.termsVersion=DEMO_TERMS_VERSION;
 }
 if(edit&&e.target.dataset.profile!==p()?.id)return;if(save(edit?updateProfile(state,p().id,data):addProfile(state,data))){notice(edit?'Perfil atualizado. Sugestões recalculadas.':'');go(!hasAgeCoverage(p(),catalog)?'coverage':edit?'home':'quiz/0'+selectedSuffix(route()[1]));}}
 if(e.target.id==='quiz-form'){const draft=captureQuiz();if(!draft)return;const {answers,n,q,qs}=draft;const inputs=[...e.target.querySelectorAll(`input[name="${q.key}"]:checked`)];const max=q.key==='queue'?2:q.key==='interests'?3:Infinity;if(q.required&&!inputs.length||Array.isArray(answers[q.key])&&answers[q.key].length>max){document.querySelector('#form-error').textContent='Selecione uma resposta válida'+(max<Infinity?` (até ${max}).`:'.');return;}if(n===qs.length-1){if(save(updateProfile(state,p().id,{answers,quizDraft:null}))){day=0;notice('Respostas salvas para este perfil.');go('mount'+selectedSuffix(route()[2]));}}else if(save(updateProfile(state,p().id,{quizDraft:{answers,step:n+1}})))go('quiz/'+(n+1)+selectedSuffix(route()[2]));}
 if(e.target.id==='search-form'||e.target.id==='situation-search'){
  const id=e.target.id;
  const value=String(new FormData(e.target).get('search')||'').trim().slice(0,120);
  if(id==='situation-search')situationSearch=value;
  else search=value;
  render();
  (root.querySelector('#search-summary')||root.querySelector('#'+id+'-input'))?.focus();
 }
 }catch(err){notice(err.message,true);render();}});
function confirmUse(act,id){
 if(catalog.cards.find(c=>c.id===id)?.regra_integracao){confirmExpanded(act,id);return;}
 const c=catalog.cards.find(c=>c.id===id),child=p(),rawBefore=raw;
 if(!c||!assess(c,child,catalog).compatible)return;
 const questions=questionsFor(c,requirementsFor(c));
 if(validateRequirements(questions).length){notice('Requisitos indisponíveis. Esta ficha não pode ser usada agora.',true);render();return;}
 const d=document.createElement('dialog');d.className='as-folha';d.setAttribute('aria-label','Conferir o momento');
 const field=(name,label,options)=>attemptField(name,label,options,true);
 d.innerHTML=`<form class="as-fluxo"><div class="attempt-heading"><h2>Esta ideia cabe agora?</h2><button class="dismiss-attempt" type="button" data-action="close-dialog" aria-label="Fechar conferência">${icone('fechar')}</button></div><p>Confira com quem está presente. Estas respostas valem só para esta tentativa.</p>${field('perigo','Há perigo imediato?',[['false','Não'],['true','Sim']])}${field('dor_nova','Há dor ou sinal de saúde novo?',[['false','Não'],['true','Sim']])}${field('intensidade','Como está o momento?',[['tranquila','Tranquilo'],['leve','Frustração leve'],['intensa','Sofrimento intenso']])}${field('participacao','A criança quer participar?',[['aceita','Sim, voluntariamente'],['recusa','Não']])}${field('adulto_presente','Um adulto está presente?',[['true','Sim'],['false','Não']])}${field('recursos_destino','Os materiais estão disponíveis onde será usada?',[['true','Sim'],['false','Não']])}<fieldset><legend>Confirme os requisitos desta ficha</legend>${questions.map(q=>field("req-"+q.id,q.pergunta,[["sim","Sim"],["nao","Não"],["nao_sei","Não sei"]])).join('')}</fieldset><p role="status" class="moment-status"></p><button type="submit" class="as-botao as-botao--primario">Conferir e continuar</button><button type="button" class="as-botao" data-action="close-dialog">Cancelar</button></form>`;
 d.querySelector('form').addEventListener('change',()=>{const f=new FormData(d.querySelector('form')),el=d.querySelector('.moment-status');if(f.get('perigo')==='true')el.textContent='Não inicie a atividade. Procure ajuda imediata se houver perigo.';else if(f.get('dor_nova')==='true')el.textContent='Não atribua dor nova ao comportamento. Procure avaliação de saúde.';else if(f.get('intensidade')==='intensa')el.textContent='Não é hora de treinar uma habilidade. Interrompa a proposta e reduza exigências.';else if(f.get('participacao')==='recusa')el.textContent='Respeite a recusa. Não insista em completar a atividade.';else el.textContent='';});
 d.querySelector('form').onsubmit=e=>{e.preventDefault();e.stopPropagation();if(!fresh()||raw!==rawBefore||p()?.id!==child.id){d.close();return;}const f=new FormData(e.target),bool=k=>f.get(k)==='true'?true:f.get(k)==='false'?false:null;
 const moment={perigo:bool('perigo'),dor_nova:bool('dor_nova'),intensidade:f.get('intensidade'),participacao:f.get('participacao'),adulto_presente:bool('adulto_presente'),recursos_destino:bool('recursos_destino'),respostas_requisitos:Object.fromEntries(questions.map(q=>[q.id,f.get('req-'+q.id)])),requisitos:questions.map(q=>f.get('req-'+q.id)==='sim')};
 if(!assessRequirements(questions,moment.respostas_requisitos).allowed){d.querySelector('.moment-status').textContent='Confirme todos os requisitos. Não ou não sei impedem continuar.';return;}
 currentMoment={day:dateKey(),profile:child.id,raw,moment};const check=assessUse(c,p(),catalog,moment);if(!check.compatible){d.querySelector('.moment-status').textContent=check.reasons.join(' ');return;}
 confirmedUse={day:dateKey(),act,id,raw,profile:child.id,moment};d.close();root.querySelector(`[data-action="${act}:${id}"]`)?.click();};
 d.addEventListener('close',()=>d.remove());root.append(d);d.showModal();
}
root.addEventListener('click',e=>{if(!fresh()){e.preventDefault();return;}
 const anchor=e.target.closest('main a[href]'),source=route()[0];
 if(anchor && Object.hasOwn(listLabels,source) && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button===0){
  const match=anchor.hash.match(/^#\/(?:card|situacao)\/([^/]+)$/);
  if(match)readingOrigin={path:location.hash.slice(2)||'home',card:match[1],to:anchor.hash,profile:state.activeId,y:window.scrollY};
 }
 if(e.target.closest('.as-pular')){e.preventDefault();root.querySelector('main')?.focus();return;}const danger=e.target.closest('a[href="#/reset"],a[href="#/delete"]');if(danger){e.preventDefault();const kind=danger.getAttribute('href').slice(2);armConfirmation(kind,kind==='delete'?p()?.id:undefined);go(kind,true);return;}if(e.target.closest('.as-pular')){e.preventDefault();document.querySelector('main')?.focus();return;}if(e.target.closest('a[href^="#/"]'))clearNotice();const tab=e.target.closest('[data-aba]');if(tab){cardTab=tab.dataset.aba;render();document.querySelector('#aba-'+cardTab)?.focus();return;}const choice=e.target.closest('[data-testid^="card-feedback-"]');if(choice){undoFavorite=null;const kind=choice.dataset.testid.replace('card-feedback-',''),id=route()[1],c=catalog.cards.find(c=>c.id===id);if(!(c?.regra_integracao?validExpandedUse(c):assess(c,p(),catalog).compatible))return;try{if(save(feedback(state,p().id,id,kind))){gesture=kind==='usamos'?{kind:'attempt',profile:p().id}:null;notice(kind==='desconforto'?catalog.orientacoes.desconforto+' Se você repassou esta ficha, avise o outro cuidador: a cópia externa não é retirada pelo app.':'Retorno registrado para '+p().name+'.',kind==='desconforto');if(kind==='adaptar')cardTab='adaptar';render();}}catch(err){notice(err.message,true);render();}return;}
 if(e.target.closest('[data-testid="save-undo"]')){if(undoFavorite&&p()?.id===undoFavorite.profileId&&storage.getItem(STORAGE_KEY)===undoFavorite.raw){if(save(favorite(state,p().id,undoFavorite.cardId)))notice('Alteração desfeita.');}else notice('O contexto mudou. Confira os salvos antes de alterar.',true);undoFavorite=null;render();return;}
 const b=e.target.closest('[data-action]');if(!b)return;const [act,id]=b.dataset.action.split(':');try{
 let use=null;if(['share','return'].includes(act)){if(confirmedUse?.day===dateKey()&&confirmedUse?.act===act&&confirmedUse.id===id&&confirmedUse.raw===raw&&confirmedUse.profile===p()?.id){use=confirmedUse.moment;confirmedUse=null;}else{confirmedUse=null;confirmUse(act,id);return;}}


 if(act==='share'){
 const child=p(),c=catalog.cards.find(c=>c.id===id);if(!c||!assessUse(c,child,catalog,use).compatible)return;
 const snapshot={day:dateKey(),profileId:child.id,revision:child.revision,cardId:id};
 const d=document.createElement('dialog');d.className='as-folha';d.setAttribute('aria-label','Revisar orientação para cuidador');
 d.innerHTML=`<div class="as-folha-cabeca"><h2>Revisar antes de repassar</h2><button class="as-botao" data-action="close-dialog" aria-label="Fechar prévia">×</button></div><p>Contexto de ${esc(child.name)}. As respostas do quiz e o histórico não são copiados. A ficha, suas fontes e adaptações podem citar públicos ou condições de saúde e permitir inferências sobre a criança. Revise toda a imagem e o texto antes de compartilhar.</p><label class="as-campo">Para quem<select id="share-recipient"><option value="baba">Babá ou cuidador</option><option value="familia">Pai, mãe ou família</option><option value="escola">Escola</option></select></label><label class="as-campo">Recado opcional<textarea id="share-note" maxlength="200" data-testid="share-note" placeholder="Até 200 caracteres. Evite dados pessoais."></textarea></label><label class="resource-option"><input type="checkbox" id="share-name" data-testid="share-name">Incluir apelido ${esc(child.name)}</label><label class="as-campo">Prévia completa — cuidados preservados<textarea class="share-draft" readonly data-testid="share-preview"></textarea></label><details><summary>Ver imagem completa antes de enviar</summary><figure style="margin:16px 0"><figcaption>A imagem inclui o conteúdo da ficha e as adaptações mostradas. Pode citar públicos ou condições de saúde. Confira também o apelido e o recado opcionais.</figcaption></figure></details><p role="status" class="share-status">Preparando imagem…</p><p class="as-miudo" id="aviso-whatsapp">Ao abrir o WhatsApp, o serviço recebe o texto desta prévia. Você escolhe o destinatário e confirma o envio lá.</p><div class="flow-actions"><button class="as-botao as-botao--primario" type="button" id="whatsapp-draft" aria-describedby="aviso-whatsapp" data-testid="share-whatsapp">Abrir texto no WhatsApp</button><button class="as-botao" type="button" id="image-share" disabled>Compartilhar páginas e texto</button><details class="share-options"><summary>Mais opções</summary><button class="as-botao" type="button" id="image-download" disabled>Baixar páginas</button><button class="as-botao" type="button" id="copy-draft" data-testid="share-copy">Copiar orientação</button>${navigator.share?'<button class="as-botao" id="native-draft" data-testid="share-native">Compartilhar só o texto</button>':''}</details><button class="as-botao" data-action="close-dialog">Cancelar</button></div>`;
 const body=caregiverDraft(c,adaptationsFor(c,child));const update=()=>{d.querySelector('.share-draft').value=[({baba:'Olá! Compartilho uma ideia para conferir com quem está cuidando.',familia:'Olá! Vamos conferir juntos se esta ideia cabe?',escola:'Olá! Compartilho esta ideia para vocês avaliarem se cabe no contexto da escola.'})[d.querySelector('#share-recipient').value],d.querySelector('#share-name').checked?'Para '+child.name:'',d.querySelector('#share-note').value.trim().slice(0,200),body].filter(Boolean).join('\n\n');};
 d.querySelector('#share-recipient').addEventListener('change',update);d.querySelector('#share-note').addEventListener('input',update);d.querySelector('#share-name').addEventListener('change',update);update();root.append(d);d.showModal();
 const valid=()=>{if(!ensureDay()||!d.isConnected||!d.open)return false;const latest=load(storage),active=latest.state.profiles.find(x=>x.id===latest.state.activeId),current=catalog.cards.find(x=>x.id===id);if(latest.error||!shareIsCurrent(snapshot,active,current,current&&active?assessUse(current,active,catalog,use):{})){d.querySelector('.share-status').textContent='O perfil ou a compatibilidade mudou. Feche e prepare uma nova orientação.';return false;}return true;};
 let prepared=null;
 const current=()=>d.isConnected&&d.open&&valid();
 makeShareImage(c,cardImage(c).src,adaptationsFor(c,child),themeNames[c.desafio]||catalog.desafios.find(d=>d.id===c.desafio)?.nome||'Orientação para a família').then(result=>{
  if(!current())return;prepared=result;for(const [i,url] of result.previews.entries()){const img=document.createElement('img');img.src=url;img.alt='Página '+(i+1)+' de '+result.previews.length+' da orientação';img.style.width='100%';d.querySelector('figure').insertBefore(img,d.querySelector('figcaption'));}
  d.querySelector('#image-download').disabled=false;
  const supported=!!navigator.canShare?.({files:prepared.files,text:d.querySelector('.share-draft').value});
  d.querySelector('#image-share').disabled=!supported;
  d.querySelector('.share-status').textContent=supported?'Páginas prontas. Escolha WhatsApp na janela do aparelho.':'Páginas prontas. Baixe a imagem e anexe no WhatsApp; o botão de texto abre a mensagem separadamente.';
 }).catch(()=>{if(current())d.querySelector('.share-status').textContent='Não foi possível preparar a imagem. A orientação completa em texto continua disponível.';});
 d.querySelector('#image-download').onclick=()=>{if(!current()||!prepared)return;for(const file of prepared.files){const url=URL.createObjectURL(file),a=document.createElement('a');a.href=url;a.download=file.name;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}};
 d.querySelector('#image-share').onclick=async()=>{if(!current()||!prepared)return;update();try{await navigator.share({files:prepared.files,text:d.querySelector('.share-draft').value});if(d.isConnected)d.querySelector('.share-status').textContent='Janela concluída. O app não confirma entrega.';}catch(error){if(d.isConnected)d.querySelector('.share-status').textContent=error.name==='AbortError'?'Compartilhamento cancelado.':'Não foi possível compartilhar. Baixe a imagem e copie o texto.';}};
 d.querySelector('#copy-draft').onclick=async()=>{if(!valid())return;try{await navigator.clipboard.writeText(d.querySelector('.share-draft').value);d.querySelector('.share-status').textContent='Copiado. Revise o destinatário antes de enviar.';}catch{d.querySelector('.share-status').textContent='Não foi possível copiar. Selecione a prévia para copiar manualmente. Nada foi enviado.';d.querySelector('.share-draft').select();}};
 d.querySelector('#whatsapp-draft').onclick=()=>{if(!valid())return;window.open('https://wa.me/?text='+encodeURIComponent(d.querySelector('.share-draft').value),'_blank','noopener,noreferrer');d.querySelector('.share-status').textContent='Solicitada abertura do WhatsApp. Confira o destinatário e envie por lá; nada foi confirmado como enviado.';};
 if(navigator.share)d.querySelector('#native-draft').onclick=async()=>{if(!valid())return;try{await navigator.share({text:d.querySelector('.share-draft').value});d.querySelector('.share-status').textContent='Janela de compartilhamento concluída. O app não confirma entrega.';}catch(e){d.querySelector('.share-status').textContent=e.name==='AbortError'?'Compartilhamento cancelado.':'Não foi possível compartilhar. A prévia continua disponível.';}}
;d.addEventListener('close',()=>d.remove());
 }
 if(act==='clear-situation-search'){
  situationSearch='';render();root.querySelector('#situation-search-input')?.focus();return;
 }
 if(act==='recheck-kit'){kitSafety=null;render();root.querySelector('#kit-safety select')?.focus();return;}
 if(act==='filter'){undoFavorite=null;filter=id||'';render();}
 if(act==='switch'){if(save(setActive(state,id))){day=0;clearNotice();go('home');}}
 if(act==='today'||act==='tomorrow'){day=act==='tomorrow'?1:0;render();}
 if(act==='priority'){if(save(updateProfile(state,p().id,{answers:{...p().answers,priority:id,queue:(p().answers.queue||[]).filter(x=>x!==id)}}))){notice('Foco atualizado por você.');render();}}
 if(act==='favorite'){if(save(favorite(state,p().id,id))){undoFavorite={profileId:p().id,cardId:id,raw:storage.getItem(STORAGE_KEY)};gesture={kind:'favorite',profile:p().id,card:id,keyboard:e.detail===0};notice(p().favorites.includes(id)?'Ficha guardada para '+p().name+'.':'Ficha removida dos salvos.');render();}}
 if(act==='return'){const c=catalog.cards.find(c=>c.id===id);if(!assessUse(c,p(),catalog,use).compatible)return;const d=document.createElement('dialog');d.className='as-folha';d.setAttribute('aria-label','Como coube hoje?');d.innerHTML=`<div class="as-folha-cabeca"><h2 class="as-titulo-2">Como coube hoje?</h2><button class="as-botao" data-action="close-dialog" aria-label="Fechar retorno">×</button></div><p>Registro de ${esc(p().name)}. Sem medir desempenho.</p>${['usamos','nao_coube','adaptar','nao_quero','desconforto'].map(tipo=>escolha({tipo})).join('')}<button class="as-botao" data-action="close-dialog">Fechar</button>`;root.append(d);d.addEventListener('close',()=>{d.remove();document.querySelector('[data-action^="return:"]')?.focus();});d.showModal();}
 if(act==='close-dialog')document.querySelector('dialog')?.close();
 if(act==='restore'){armConfirmation('restore',id);go('restore/'+id);}
 if(act==='confirm-restore'){if(!canConfirm('restore',id))return;if(!catalog.cards.some(c=>c.id===id)||!['nao_quero','desconforto'].includes(lastFeedback(p(),id)?.kind))return;if(save(feedback(state,p().id,id,'restaurar'))){confirmationIntent=null;notice('Retirada revista. A compatibilidade foi recalculada.');go('card/'+id);}}
 if(act==='confirm-delete'){if(route()[0]!=='delete'||!id||id!==p()?.id||!canConfirm('delete',id))return;if(save(removeProfile(state,id))){confirmationIntent=null;notice('Perfil excluído.');go('profiles',true);}}
 if(act==='confirm-reset'){if(!canConfirm('reset'))return;confirmationIntent=null;state=reset(storage);gesture=null;confirmedUse=null;currentMoment=null;undoFavorite=null;storageError=null;raw=null;notice('Os dados do Agora Sei foram apagados deste navegador.');day=0;go('home',true);}
 if(act==='download'){const u=URL.createObjectURL(new Blob([raw??''],{type:'text/plain'})),a=document.createElement('a');a.href=u;a.download='agora-sei-dados-locais.txt';a.click();URL.revokeObjectURL(u);}
 }catch(err){notice(err.message,true);render();}});
root.addEventListener('keydown',e=>{if(!e.target.matches('[data-aba]'))return;const ids=['como','porque','adaptar','cuidados'],i=ids.indexOf(cardTab);let next;if(e.key==='ArrowRight')next=(i+1)%4;if(e.key==='ArrowLeft')next=(i+3)%4;if(e.key==='Home')next=0;if(e.key==='End')next=3;if(next!==undefined){e.preventDefault();cardTab=ids[next];render();document.querySelector('#aba-'+cardTab)?.focus();}});
window.addEventListener('hashchange',event=>{cardTab='como';
 const oldHash=new URL(event.oldURL).hash||'#/home';
 const nextHash=new URL(event.newURL).hash||'#/home';
 const transition=kitListTransition(oldHash,nextHash,readingOrigin);
 if(transition==='open'){
  const openGroups=Array.from(root.querySelectorAll('details[data-kit-group][open]'),d=>d.dataset.kitGroup);
  readingOrigin={path:'home',to:nextHash,card:nextHash.slice(7),profile:state.activeId,y:window.scrollY,openGroups};
 }
 if(!transition)kitSafety=null;
 lastUse=null;confirmedUse=null;undoFavorite=null;if(confirmationIntent&&route()[0]!==confirmationIntent.kind)confirmationIntent=null;const queued=pendingToast;pendingToast=null;if(queued&&noticeValid(queued.context)){toast=queued.text;toastContext=queued.context;toastPersistent=queued.persistent;}else {clearNotice();}render();if(!restoreRow(new URL(event.oldURL).hash))window.scrollTo(0,0);});
window.addEventListener('storage',e=>{kitSafety=null;lastUse=null;confirmedUse=null;if(e.key!==STORAGE_KEY&&e.key!==null)return;const latest=load(storage);state=latest.state;storageError=latest.error;raw=latest.raw;day=0;undoFavorite=null;confirmationIntent=null;notice('Dados atualizados por outra aba.',true);if(['delete','restore','reset'].includes(route()[0]))go('profiles',true);else render();});
try{const read=async u=>{const r=await fetch(u);if(!r.ok)throw Error('Arquivo indisponível');return r.json();};const [cards,ds,man,rc,km]=await Promise.all([read('../banco/cards.json'),read('../banco/desafios.json'),read('../ilustracoes/manifesto.json'),read('../banco/rotas.json').catch(()=>null),read('../banco/mapa-kit.json')]);kitMap=km;routeContent=loadRoutes(rc);const v=validateCatalog(cards,ds);if(v.problems.length||!v.catalog.cards.length)throw Error('O catálogo precisa de correção antes de abrir.');catalog=v.catalog;manifest=man;if(!location.hash.startsWith('#/'))history.replaceState(null,'','#/home');render();}catch{root.innerHTML='<main class="as-conteudo"><h1>Não foi possível abrir o Agora Sei.</h1><p>Tente abrir o app novamente. Seus perfis continuam neste navegador.</p><p><a href="./">Tentar novamente</a></p></main>';}

root.addEventListener('input',e=>{const form=e.target.closest('#profile-form');if(form)updateProfileFields(form,e.target.name);});
root.addEventListener('change',e=>{if(e.target.id==='situation-filter')go('situacoes'+(e.target.value?'/'+e.target.value:''));});
