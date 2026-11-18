// Respostas pertencem à tentativa atual. IDs estáveis evitam trocar respostas por posição.
export function validateRequirements(items){
 const errors=[];
 if(!Array.isArray(items)||!items.length)return ['requisitos_ausentes'];
 const ids=new Set();
 for(const r of items){
  if(!r||typeof r!=='object'||!/^[-a-zA-Z0-9_]+$/.test(r.id||'')||ids.has(r.id))errors.push('id_invalido_ou_duplicado');
  if(r&&typeof r.id==='string')ids.add(r.id);
  if(!r||typeof r.pergunta!=='string'||!r.pergunta.trim()||typeof r.texto_original!=='string'||!r.texto_original.trim()||r.esperado!=='sim')errors.push('pergunta_invalida');
 }
 return [...new Set(errors)];
}
export function assessRequirements(items,responses){
 const errors=validateRequirements(items);
 if(errors.length)return {allowed:false,errors,pending:[]};
 const answers=responses&&typeof responses==='object'&&!Array.isArray(responses)?responses:{};
 const pending=items.filter(r=>!Object.hasOwn(answers,r.id)||answers[r.id]!==r.esperado).map(r=>r.id);
 return {allowed:pending.length===0,errors,pending};
}
export function questionsFor(card,legacyTexts){
 // Regras novas somente após conversão/validação do catálogo; dado incompleto nunca cai no legado.
 if(card&&Object.hasOwn(card,'regra_integracao'))return card.regra_integracao?.requisitos;
 return legacyTexts.map((text,i)=>({id:`legado_${i}`,pergunta:`Está confirmado: ${text}`,texto_original:text,esperado:'sim'}));
}
