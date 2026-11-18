import {profileAge} from '../../motor/kit.mjs';
export const DEMO_TERMS_VERSION='2026-11-18.2';
export const STORAGE_KEY='agora-sei-demo-v1';
const stamps=new WeakMap(),locked=new WeakSet();
const object=x=>x&&typeof x==='object'&&!Array.isArray(x);
const now=()=>new Date().toISOString();
export function uid(){if(globalThis.crypto?.randomUUID)return crypto.randomUUID();const b=new Uint8Array(16);globalThis.crypto.getRandomValues(b);return [...b].map(n=>n.toString(16).padStart(2,'0')).join('');}
export const emptyState=()=>({version:1,activeId:null,profiles:[]});
const carry=(s,next)=>{if(stamps.has(s))stamps.set(next,stamps.get(s));if(locked.has(s))locked.add(next);return next;};
function mapProfile(s,id,fn){if(locked.has(s))throw Error('Reinicie explicitamente para liberar a escrita.');if(!s.profiles.some(p=>p.id===id))throw Error('Perfil inexistente');return carry(s,{...s,profiles:s.profiles.map(p=>p.id===id?fn(p):p)});}
export function setActive(s,id){if(id&&!s.profiles.some(p=>p.id===id))throw Error('Perfil inexistente');return carry(s,{...s,activeId:id});}
export function addProfile(s,{name,ageMonths,avatar='sol',termsVersion,birth},id=uid()){
 if(locked.has(s))throw Error('Dados protegidos até reinício explícito.');if(!name?.trim()||name.length>40||!Number.isInteger(ageMonths)||ageMonths<0||ageMonths>216||s.profiles.some(p=>p.id===id))throw Error('Apelido e idade válidos são necessários.');
 if(birth&&!validBirth(birth))throw Error("Nascimento inválido");
 const creation={at:now(),kind:'criado',revision:1,changed:['name','ageMonths']};
 if(termsVersion===DEMO_TERMS_VERSION)creation.termsVersion=termsVersion;
 return carry(s,{...s,activeId:id,profiles:[...s.profiles,{id,name:name.trim(),ageMonths,...(birth?{birth}:{}),avatar,revision:1,answers:{},favorites:[],feedback:[],history:[creation]}]});
}
export function updateProfile(s,id,patch){return mapProfile(s,id,p=>{const allowed=['name','ageMonths','birth','answers','avatar','quizDraft'];const changes=allowed.filter(k=>k in patch&&JSON.stringify(patch[k])!==JSON.stringify(p[k]));if(!changes.length)return p;
 const picked=Object.fromEntries(changes.map(k=>[k,structuredClone(patch[k])]));
 if('name'in picked&&(!picked.name?.trim()||picked.name.length>40))throw Error('Apelido inválido');if('ageMonths'in picked&&(!Number.isInteger(picked.ageMonths)||picked.ageMonths<0||picked.ageMonths>216))throw Error('Idade inválida');if('answers'in picked&&!object(picked.answers))throw Error('Respostas inválidas');
 if('birth' in picked&&!validBirth(picked.birth))throw Error('Nascimento inválido');
 const relevant=changes.filter(k=>k!=='quizDraft'),revision=p.revision+(relevant.length?1:0),history=[...(p.history||[])];
 for(const k of relevant)history.push({at:now(),kind:k==='ageMonths'?'idade':'respostas',revision,changed:k==='answers'?Object.keys(picked.answers).filter(a=>JSON.stringify(picked.answers[a])!==JSON.stringify(p.answers[a])):[k]});
 return {...p,...picked,revision,history};});}
export function favorite(s,id,cardId){return mapProfile(s,id,p=>({...p,favorites:p.favorites.includes(cardId)?p.favorites.filter(x=>x!==cardId):[...p.favorites,cardId]}));}
export function feedback(s,id,cardId,kind,at=now()){
 if(!['usamos','nao_coube','adaptar','nao_quero','desconforto','restaurar'].includes(kind))throw Error('Retorno inválido');
 return mapProfile(s,id,p=>{if(p.quizDraft)throw Error('Conclua a revisão das respostas antes de registrar retorno.');const last=p.feedback.filter(f=>f.cardId===cardId).at(-1);if(['nao_quero','desconforto'].includes(last?.kind)&&kind!=='restaurar')throw Error('Sugestão retirada. Restaure explicitamente antes de registrar uso.');return {...p,feedback:[...p.feedback,{id:uid(),cardId,kind,at,profileRevision:p.revision}]};});
}
export function removeProfile(s,id){return carry(s,{...s,profiles:s.profiles.filter(p=>p.id!==id),activeId:s.activeId===id?s.profiles.find(p=>p.id!==id)?.id||null:s.activeId});}
function validAnswers(a){if(!object(a))return false;const multi=['queue','interests','resources','sensitivities','risks','diagnoses'];const single=['priority','understanding','communication','steps','caregivers','support'];return multi.every(k=>!(k in a)||(Array.isArray(a[k])&&a[k].every(x=>typeof x==='string')))&&single.every(k=>!(k in a)||a[k]===null||typeof a[k]==='string')&&(!('minutes'in a)||a.minutes===null||Number.isFinite(a.minutes));}
function validDraft(d){return d===undefined||d===null||(object(d)&&Number.isInteger(d.step)&&d.step>=0&&d.step<100&&validAnswers(d.answers));}
function validBirth(b){return object(b)&&Number.isInteger(b.year)&&Number.isInteger(b.month)&&b.year>0&&b.month>=1&&b.month<=12&&(!b.confirmation||(object(b.confirmation)&&typeof b.confirmation.date==='string'&&['sim','nao','nao_sei'].includes(b.confirmation.answer)));}
function valid(s){return object(s)&&s.version===1&&Array.isArray(s.profiles)&&new Set(s.profiles.map(p=>p.id)).size===s.profiles.length&&(s.activeId===null||s.profiles.some(p=>p.id===s.activeId))&&s.profiles.every(p=>object(p)&&typeof p.id==='string'&&p.id&&(!('birth'in p)||validBirth(p.birth))&&typeof p.name==='string'&&p.name.length<=40&&Number.isInteger(p.ageMonths)&&p.ageMonths>=0&&p.ageMonths<=216&&Number.isInteger(p.revision)&&p.revision>=1&&validAnswers(p.answers)&&validDraft(p.quizDraft)&&Array.isArray(p.favorites)&&p.favorites.every(x=>typeof x==='string')&&Array.isArray(p.feedback)&&p.feedback.every(f=>object(f)&&typeof f.cardId==='string'&&typeof f.id==='string'&&typeof f.at==='string'&&Number.isInteger(f.profileRevision)&&['usamos','nao_coube','adaptar','nao_quero','desconforto','restaurar'].includes(f.kind))&&Array.isArray(p.history)&&p.history.every(h=>object(h)&&typeof h.at==='string'&&['criado','idade','respostas'].includes(h.kind)&&Number.isInteger(h.revision)&&Array.isArray(h.changed)&&h.changed.every(x=>typeof x==='string')));}
export function load(storage){let raw=null;try{raw=storage.getItem(STORAGE_KEY)??null;let s=raw===null?emptyState():JSON.parse(raw);
 if(s.version===0){s={...s,version:1,profiles:s.profiles.map(p=>({...p,revision:p.revision??1,history:p.history??[]}))};if(!valid(s))throw Error();storage.setItem(STORAGE_KEY,JSON.stringify(s));raw=JSON.stringify(s);}
 if(!valid(s))throw Error();stamps.set(s,raw);return {state:s,raw,error:null};
 }catch{const state=emptyState();locked.add(state);stamps.set(state,raw);return {state,raw,error:'Não foi possível ler os dados locais. Eles permanecem protegidos até um reinício confirmado.'};}}
export function persist(storage,state){try{
 if(locked.has(state))return 'Escrita bloqueada: preserve ou reinicie os dados locais.';
 const raw=storage.getItem(STORAGE_KEY)??null;
 if(raw!==null){let current;try{current=JSON.parse(raw);}catch{return 'Escrita bloqueada: dados ilegíveis.';}if(!valid(current))return 'Escrita bloqueada: formato ou versão inválida.';}
 if(stamps.has(state)&&stamps.get(state)!==raw)return 'Os dados mudaram em outra aba. Recarregue antes de continuar.';
 if(!valid(state))return 'Estado inválido; nada foi gravado.';
 const next=JSON.stringify(state);storage.setItem(STORAGE_KEY,next);stamps.set(state,next);return null;
 }catch{return 'O navegador não permitiu salvar. Nada foi confirmado; tente novamente.';}}
export function reset(storage){storage.removeItem(STORAGE_KEY);return load(storage).state;}
