import {pintarPaginas,secoesDoApp,arquivosDaFicha} from '../../design/enviar.mjs';
import {publicCopy,sourceText} from './public-copy.mjs';
// Explicit public projection; source populations and permitted adaptations can allow inference.
export function shareSections(c,adaptations=[]){c=publicCopy(c);return [
 ['Objetivo', [c.objetivo]], ['Por que esta ideia', [c.por_que.explicacao,c.por_que.principio]],
 ['O que observar',[c.observacao]],
 ['Antes de começar',[c.editorial?.limite_do_quiz,c.contexto.materiais_detalhados,...c.contexto.requisitos_nao_inferiveis,c.contexto.nota_tempo]],
 ['Como fazer',c.passos.map((s,i)=>`${i+1}. ${s}`)],['Variações a conferir',adaptations.map(a=>a.mudanca)],['Cuidados — evite',c.evite],['Quando parar / se não couber',c.se_nao_der_certo],['Buscar ajuda',c.procure_ajuda_se],
 ['Limites',[c.por_que.limites]],['Fontes de encaminhamento',(c.fontes_encaminhamento||[]).map(f=>sourceText(f))],['Fontes da atividade',c.por_que.fontes.map(f=>sourceText(f))],
 ['Sobre esta cópia',[`Ficha ${c.id} · versão ${c.versao}. Demonstração em revisão. Ilustração gerada por IA.`,`A cópia não acompanha atualizações ou retiradas. Confira a orientação completa e o contexto com quem está presente. Interrompa se houver desconforto.`]]
 ].map(([title,lines])=>({title,lines:lines.filter(Boolean)}));}
export function wrapText(ctx,text,width){const lines=[];for(const paragraph of String(text).split('\n')){let line='';for(const word of paragraph.split(/\s+/)){if(ctx.measureText(word).width>width){if(line){lines.push(line);line='';}let piece='';for(const char of word){if(ctx.measureText(piece+char).width>width){lines.push(piece);piece='';}piece+=char;}line=piece;continue;}const next=line?line+' '+word:word;if(ctx.measureText(next).width>width&&line){lines.push(line);line=word;}else line=next;}if(line)lines.push(line);}return lines;}
export async function makeShareImage(card,src,adaptations=[]){
 const result=await pintarPaginas({card:{titulo:card.titulo,familiaNome:'Agora Sei',imagem:src},secoes:secoesDoApp(shareSections(card,adaptations))});
 if(!result.resumo.cabe)throw Error('Conteúdo não cabe nas páginas; use o texto completo.');
 const files=await arquivosDaFicha(result.paginas,card.id);return {files,previews:result.paginas.map(c=>c.toDataURL('image/png')),width:1080,height:1920};
}
