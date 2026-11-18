export const RISK_QUESTIONS=[{"id": "RISCO-autolesao", "campo": "autolesao", "pergunta": "A criança tem se machucado?", "esperado": "nao", "motivo": "Risco de lesão não se limita à segurança observada neste minuto."}, {"id": "RISCO-agressao_com_lesao", "campo": "agressao_com_lesao", "pergunta": "A criança tem machucado outras pessoas?", "esperado": "nao", "motivo": "Ausência de emergência agora não descarta episódios com lesão."}, {"id": "RISCO-fuga", "campo": "fuga", "pergunta": "A criança tem fugido para lugares perigosos?", "esperado": "nao", "motivo": "Local seguro agora não descarta fuga em outras situações."}, {"id": "RISCO-dor_frequente", "campo": "dor_frequente", "pergunta": "A criança tem apresentado dor frequente?", "esperado": "nao", "motivo": "Sem dor nova não significa ausência de dor recorrente."}, {"id": "RISCO-ronco_com_pausas", "campo": "ronco_com_pausas", "pergunta": "A criança ronca com pausas na respiração?", "esperado": "nao", "motivo": "As perguntas do momento não cobrem o sono."}];
export function riskReason(profile,input){
 const previous=[...(profile?.answers?.risks||[]),...(profile?.quizDraft?.answers?.risks||[])];
 for(const q of RISK_QUESTIONS){if(previous.includes(q.campo))return q.pergunta+' Há sinal informado no perfil; a confirmação atual não o supera.';}
 // Existing profiles have no reliable record of an explicit negative response.
 // Ask on each attempt; never persist or reuse these confirmations across contexts.
 for(const q of RISK_QUESTIONS)if(!input?.riscos||!Object.hasOwn(input.riscos,q.campo)||input.riscos[q.campo]!=='nao')return q.pergunta+' Confirme este sinal com quem acompanha a criança. Sim, não sei ou ausência mantém a atividade bloqueada.';
 return null;
}
