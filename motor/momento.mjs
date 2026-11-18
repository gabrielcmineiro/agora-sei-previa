// Confirmation is for this use, never inferred from diagnosis or an old quiz.
export function momentGate(m={}){
 if(!m||typeof m!=="object"||Array.isArray(m))m={};
 if(m.perigo===true)return {allowed:false,code:'rota_seguranca',text:'Não inicie a atividade. Procure ajuda imediata se houver perigo.'};
 if(m.dor_nova===true)return {allowed:false,code:'avaliacao',text:'Não atribua dor nova ao comportamento. Procure avaliação de saúde.'};
 if(m.perigo!==false||m.dor_nova!==false)return {allowed:false,code:'pedir_confirmacao',text:'Confirme a segurança e a ausência de dor nova antes de iniciar.'};
 if(m.intensidade==='intensa')return {allowed:false,code:'apoio_ao_adulto',text:'Não é hora de treinar uma habilidade. Interrompa a proposta, reduza exigências e procure apoio para cuidar da segurança.'};
 if(m.participacao==='recusa')return {allowed:false,code:'respeitar_recusa',text:'Respeite a recusa. Não insista em completar a atividade.'};
 if(!['tranquila','leve'].includes(m.intensidade)||m.participacao!=='aceita'||m.adulto_presente!==true)return {allowed:false,code:'pedir_confirmacao',text:'Confirme o momento, a participação voluntária e um adulto presente.'};
 if(m.recursos_destino!==true||!Array.isArray(m.requisitos)||!m.requisitos.length||!m.requisitos.every(v=>v===true))return {allowed:false,code:'requisito_nao_confirmado',text:'Confira cada requisito e os materiais no local. Não saber não confirma que a proposta cabe.'};
 return {allowed:true,code:'confirmado',text:'Contexto confirmado para esta tentativa. Pare se houver desconforto.'};
}
export function requirementsFor(card){if(!card?.contexto||!Array.isArray(card.contexto.requisitos_nao_inferiveis))return [];return [...new Set([card.contexto.materiais_detalhados,...card.contexto.requisitos_nao_inferiveis].filter(Boolean))];}
