// Navegação editorial: nunca autoriza uso ou repasse.
export function ageInterval(year,month,date=new Date()){
 if(!Number.isInteger(year)||!Number.isInteger(month)||year<1||month<1||month>12||!Number.isFinite(date.getTime()))return null;
 const n=12*(date.getFullYear()-year)+date.getMonth()+1-month;if(n<0)return null;
 // Sem dia informado, considerar todos os dias possíveis do mês de nascimento.
 const lastBirthDay=new Date(year,month,0).getDate();return [date.getDate()>=lastBirthDay?n:Math.max(0,n-1),n];
}
export function ageStatus(interval,limits){if(!interval)return 'nascimento_invalido';const [lo,hi]=interval,[min,max]=limits;return hi<min||lo>max?'fora':lo>=min&&hi<=max?'compativel':'confirmar_aniversario';}
export function present(entry,input){
 if(input.perigo!=='nao'||input.sofrimento_intenso!=='nao')return 'apoio_ou_esclarecimento';
 if(input.retirada!=='nao'||input.risco_positivo!=='nao'||input.rascunho!=='nao')return 'consulta_sem_atividade';
 const age=ageStatus(input.intervalo_idade,entry.idade_inclusiva_meses);if(age!=='compativel')return age;
 return input.situacao===entry.situacao_id&&input.confirma_situacao==='sim'?'encaminhar_ao_motor_original':'sugestao_a_confirmar';
}
export function buildKit(map,focus,input,situations=[]){
 if(!map.focos_validos.includes(focus))return {estado:'pedir_foco',blocos:{}};
 const groups=Object.fromEntries(map.ordem_por_foco[focus].map(b=>[b,[]]));
 for(const r of map.cards){const selected=situations.includes(r.situacao_id);if(!selected&&!r.focos.includes(focus))continue;
 const state=present(r,{...input,situacao:selected?r.situacao_id:null,confirma_situacao:selected?'sim':null});
 if(!['sugestao_a_confirmar','encaminhar_ao_motor_original'].includes(state))continue;
 groups[r.bloco].push({id:r.id,estado:state,selecionado:selected,foco_coincide:r.focos.includes(focus),autoriza_uso:false});}
 for(const list of Object.values(groups))list.sort((a,b)=>Number(b.selecionado)-Number(a.selecionado)||Number(b.foco_coincide)-Number(a.foco_coincide)||a.id.localeCompare(b.id,'en'));
 return {estado:'sugestoes_para_confirmar',blocos:Object.fromEntries(Object.entries(groups).map(([b,v])=>[b,{visiveis:v.slice(0,3),mais:v.slice(3)}]))};
}

export const dateKey=(d=new Date())=>[d.getFullYear(),d.getMonth()+1,d.getDate()].join('-');
export function profileAge(p,date=new Date()){
 if(!p?.birth)return Number.isInteger(p?.ageMonths)?[p.ageMonths,p.ageMonths]:null;
 const a=ageInterval(p.birth.year,p.birth.month,date);if(!a)return null;
 const c=p.birth.confirmation;if(c?.date===dateKey(date)&&['sim','nao'].includes(c.answer))return c.answer==='sim'?[a[1],a[1]]:[a[0],a[0]];
 return a;
}
export function effectiveProfile(p,date=new Date()){if(!p)return p;const a=profileAge(p,date);return {...p,ageMonths:a?.[0]??NaN};}
export function birthBlock(p,limits){const a=profileAge(p);if(!a)return 'Confira o mês e ano de nascimento.';const status=ageStatus(a,limits);return status==='compativel'?null:status==='confirmar_aniversario'?'A idade está no limite desta ficha. Confirme no perfil se o aniversário deste mês já passou. Idade não confirma habilidade.':'Idade fora da faixa indicada. Esta ficha está disponível somente para consulta.';}
