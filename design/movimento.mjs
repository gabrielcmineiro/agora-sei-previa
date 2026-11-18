// Agora Sei: marcação da biblioteca de movimento em guache, v1.0 (18/11/2026)
// Funções puras: recebem dados, devolvem HTML em texto com as classes de design/movimento.css.
// Não tocam em DOM, rede nem armazenamento. Mesmo jeito de design/marcacao.mjs.
//   import {carregaPincelada, gCheck, gFaixa, DEMOS} from '../../design/movimento.mjs';
// Todo texto que vem de dados passa por esc(). Campos com sufixo "Html" são HTML já pronto.
// agora: true só na renderização logo depois do gesto. É o que liga a animação; ao recarregar, fica parado.
// As figuras e máscaras vêm do próprio movimento.css: nenhuma função precisa saber o caminho das imagens.
import {esc, icone} from './marcacao.mjs';

const atr = (nome, valor) => (valor === undefined || valor === null || valor === false || valor === '' ? '' : ` ${nome}="${esc(valor === true ? '' : valor)}"`);
const leitor = t => `<span class="as-so-leitor">${esc(t)}</span>`;
const cls = (...partes) => partes.filter(Boolean).join(' ');
const ag = agora => (agora ? 'as-agora' : '');
const fam = familia => atr('data-familia', familia || undefined);
const estilo = pares => {
  const s = pares.filter(([, v]) => v !== undefined && v !== null && v !== '').map(([k, v]) => `${k}:${v}`).join(';');
  return s ? ` style="${esc(s)}"` : '';
};
const num = (v, min, max) => Math.min(max, Math.max(min, Number(v) || 0));

// ══ A. Carregamento ══════════════════════════════════════════════════════
// Todo carregamento tem role="status" e um nome curto, lido pelo leitor de tela.

// 1. Pincelada que se pinta e some. pequena: versão de 56 px, para uma linha de texto.
export const carregaPincelada = ({rotulo = 'Carregando', pequena = false, familia = ''} = {}) =>
  `<span class="${cls('as-carrega-pincelada', pequena && 'as-carrega-pincelada--p')}" role="status"${fam(familia)}><span class="as-carrega-pincelada-traco" aria-hidden="true"></span>${leitor(rotulo)}</span>`;

// 2. Três gotas. dentro: true quando vai dentro de um botão (o botão já diz que está esperando).
export const carregaGotas = ({rotulo = 'Carregando', dentro = false} = {}) =>
  dentro
    ? '<span class="as-carrega-gotas" aria-hidden="true"><i></i><i></i><i></i></span>'
    : `<span class="as-carrega-gotas" role="status"><i aria-hidden="true"></i><i aria-hidden="true"></i><i aria-hidden="true"></i>${leitor(rotulo)}</span>`;

// 3. Pincel no pote, para espera de tela inteira. O título visível é o nome do status.
export const carregaPincel = ({titulo = 'Montando o kit', texto = ''} = {}) =>
  `<div class="as-carrega-pincel" role="status"><span class="as-carrega-pincel-arte" aria-hidden="true"><span class="as-carrega-pincel-pote"></span><span class="as-carrega-pincel-traco"></span></span><p class="as-carrega-pincel-titulo">${esc(titulo)}</p>${texto ? `<p class="as-carrega-pincel-texto">${esc(texto)}</p>` : ''}</div>`;

// 4. Esqueleto pintado. tipo: 'card' | 'linha' | 'avatar'. linhas: quantas linhas no tipo 'linha'.
const forma = (mod, i, largura) => `<span class="${cls('as-esqueleto-aguada', mod && `as-esqueleto-aguada--${mod}`)}"${estilo([['--_i', i], ['--largura', largura]])}></span>`;
export function esqueleto({tipo = 'card', rotulo = 'Carregando', linhas = 3, familia = ''} = {}) {
  const larguras = ['100%', '92%', '64%', '80%', '48%'];
  let miolo = '';
  if (tipo === 'linha') miolo = Array.from({length: num(linhas, 1, 5)}, (_, i) => forma('', i, larguras[i])).join('');
  else if (tipo === 'avatar') miolo = `<span class="as-esqueleto-linha-avatar">${forma('avatar', 0)}<span>${forma('', 1, '70%')}${forma('', 2, '45%')}</span></span>`;
  else miolo = `<span class="as-esqueleto-ficha">${forma('arte', 0)}<span class="as-esqueleto-ficha-corpo">${forma('titulo', 1, '82%')}${forma('', 2)}${forma('', 3, '58%')}</span></span>`;
  return `<div class="as-esqueleto-grupo" role="status"${fam(familia)}>${miolo}${leitor(rotulo)}</div>`;
}

// 5. Progresso pintado. valor: de 0 a 1. texto: o que vai à direita, como "Pergunta 3 de 7" (nunca porcentagem).
export function progressoTinta({valor = 0, rotulo = 'Andamento', texto = '', agora = false, familia = ''} = {}) {
  const v = num(valor, 0, 1);
  return `<div class="${cls('as-progresso-tinta', ag(agora))}"${estilo([['--valor', v]])}${fam(familia)}><p class="as-progresso-tinta-rotulo" aria-hidden="true"><span>${esc(rotulo)}</span>${texto ? `<span>${esc(texto)}</span>` : ''}</p><span class="as-progresso-tinta-trilho" role="progressbar" aria-label="${esc(rotulo)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(v * 100)}"${atr('aria-valuetext', texto)}><span class="as-progresso-tinta-valor"></span></span></div>`;
}

// 6. Botão esperando: o rótulo continua legível; as gotas ficam no lugar do ícone. tom: '' | 'primario' | 'sol'.
export const botaoEsperando = ({texto = 'Salvando', tom = 'primario', bloco = false} = {}) =>
  `<button class="${cls('as-botao', tom && `as-botao--${tom}`, bloco && 'as-botao--bloco', 'as-botao--esperando')}" type="button" aria-busy="true" aria-disabled="true">${carregaGotas({dentro: true})}${esc(texto)}</button>`;

// 7. Figura que chega. O app põe class="as-chegou" na <img> quando ela carrega (chegou: true já vem pronta).
// espera: só para amostra, quanto tempo a aguada fica sozinha antes de a figura chegar (com agora).
export const imagemChega = ({src, alt = '', largura = 320, altura = 200, familia = '', chegou = false, agora = false, espera = ''}) =>
  `<span class="${cls('as-imagem-chega', ag(agora))}"${fam(familia)}${estilo([['aspect-ratio', `${num(largura, 1, 9999)} / ${num(altura, 1, 9999)}`], ['--as-g-espera', espera]])}><img src="${esc(src)}" alt="${esc(alt)}" width="${num(largura, 1, 9999)}" height="${num(altura, 1, 9999)}"${chegou ? ' class="as-chegou"' : ''} decoding="async"></span>`;

// 8. Três fichas que se embaralham. familias: a cor de cada ficha. legenda: texto visível, que vira o nome do status.
export const carregaFichas = ({rotulo = 'Montando o kit', familias = ['brincar', 'noite', 'emocoes'], legenda = ''} = {}) =>
  `<div class="as-carrega-fichas" role="status"><span class="as-carrega-fichas-mesa" aria-hidden="true">${familias.slice(0, 3).map(f => `<i${fam(f)}></i>`).join('')}</span>${legenda ? `<p class="as-miudo">${esc(legenda)}</p>` : leitor(rotulo)}</div>`;

// ══ B. Microinterações ═══════════════════════════════════════════════════

// 9. Toque: não precisa de função. Ponha a classe as-g-toque no elemento que se toca.
export const CLASSE_TOQUE = 'as-g-toque';

// 10. Salvar com o marcador que se enche de tinta. agora: só no gesto que acabou de salvar.
export const gSalvar = ({salvo = false, agora = false, rotulo, testid} = {}) =>
  `<button class="${cls('as-botao', 'as-g-salvar', ag(agora && salvo))}" type="button" aria-pressed="${salvo}"${atr('data-testid', testid)}><span class="as-g-salvar-marca" aria-hidden="true">${icone('salvos')}<span class="as-g-salvar-tinta">${icone('salvos-cheio')}</span><i></i><i></i><i></i></span><span>${esc(rotulo ?? (salvo ? 'Salvo' : 'Salvar'))}</span></button>`;

// 11. Visto pintado. rotulo: só quando o visto sozinho carrega sentido (vira imagem com nome).
export const gCheck = ({agora = false, rotulo = '', tamanho = ''} = {}) =>
  `<span class="${cls('as-g-check', ag(agora))}"${rotulo ? ` role="img" aria-label="${esc(rotulo)}"` : ' aria-hidden="true"'}${estilo([['--as-g-tamanho', tamanho]])}></span>`;

// 12. Opção com aguada. Mesma marcação de opcao() em marcacao.mjs, com a classe as-g-opcao.
export function gOpcao({nome, valor, rotulo, dica = '', tipo = 'single', marcada = false, agora = false, testid} = {}) {
  const marca = `<span class="as-opcao-marca">${icone('certo')}</span>`;
  return `<label class="${cls('as-opcao', 'as-g-opcao', ag(agora && marcada))}"><input type="${tipo === 'multi' ? 'checkbox' : 'radio'}" name="${esc(nome)}" value="${esc(valor)}"${marcada ? ' checked' : ''}${atr('data-testid', testid)}><span class="as-opcao-caixa">${marca}<span class="as-opcao-texto"><span class="as-opcao-nome">${esc(rotulo)}</span>${dica ? `<span class="as-opcao-dica">${esc(dica)}</span>` : ''}</span></span></label>`;
}

// 13. Abas com o traço pintado. Mesma marcação de abas() em marcacao.mjs, com a classe as-g-aba.
// agora: o traço da aba ativa se desenha (use na renderização logo depois da troca de aba).
export function gAbas({itens, ativa, rotulo = 'Partes do card', agora = false} = {}) {
  return `<div class="as-abas" role="tablist" aria-label="${esc(rotulo)}">${itens.map(i => {
    const sel = i.id === ativa;
    return `<button class="${cls('as-aba', 'as-g-aba', ag(agora && sel))}" role="tab" type="button" id="aba-${esc(i.id)}" aria-controls="painel-${esc(i.id)}" aria-selected="${sel}" data-aba="${esc(i.id)}">${i.icone ? icone(i.icone) : ''}<span>${esc(i.rotulo)}</span></button>`;
  }).join('')}</div>`;
}

// 14. Campo com o traço pintado no foco. multilinha: <textarea>.
export function gCampo({id, rotulo, dica = '', tipo = 'text', valor = '', exemplo = '', multilinha = false} = {}) {
  const dicaId = dica ? `${id}-dica` : '';
  const comum = `class="as-campo-entrada" id="${esc(id)}" name="${esc(id)}"${atr('placeholder', exemplo)}${atr('aria-describedby', dicaId)}`;
  const entrada = multilinha ? `<textarea ${comum}>${esc(valor)}</textarea>` : `<input ${comum} type="${esc(tipo)}"${atr('value', valor)}>`;
  return `<div class="as-campo"><label class="as-campo-rotulo" for="${esc(id)}">${esc(rotulo)}</label>${dica ? `<p class="as-campo-dica" id="${esc(dicaId)}">${esc(dica)}</p>` : ''}<span class="as-g-campo">${entrada}</span></div>`;
}

// 15. Pincelada atrás de uma palavra. Use dentro do título: `Hoje é dia de ${gDestaque({texto: 'brincar'})}`.
export const gDestaque = ({texto, agora = false} = {}) => `<span class="${cls('as-g-destaque', ag(agora))}">${esc(texto)}</span>`;

// 16. Anel pintado em volta de um número ou palavra curta.
export const gCirculo = ({texto, agora = false} = {}) => `<span class="${cls('as-g-circulo', ag(agora))}">${esc(texto)}</span>`;

// 17. Seta pintada, para o fim de um link. Decorativa: o texto do link diz para onde vai.
export const gSeta = () => '<span class="as-g-seta" aria-hidden="true"></span>';

// 18. Número que conta uma vez. numero: inteiro. O número de verdade fica no HTML.
export const gContagem = ({numero, agora = false} = {}) => {
  const n = Math.round(num(numero, 0, 1e9));
  return `<span class="${cls('as-g-contagem', ag(agora))}"${estilo([['--numero', n]])}><span>${esc(n)}</span></span>`;
};

// 19. Lista que chega em cascata, um item depois do outro. itensHtml: o miolo de cada <li>, já pronto. classe: a classe da lista.
export const gLista = ({itensHtml = [], classe = '', agora = false, ordenada = false} = {}) => {
  const tag = ordenada ? 'ol' : 'ul';
  return `<${tag} class="${cls('as-g-lista', classe, ag(agora))}">${itensHtml.map((h, i) => `<li style="--i:${i}">${h}</li>`).join('')}</${tag}>`;
};

// 20. Trecho que abre e fecha com um botão. O app troca aria-expanded; o CSS faz o resto.
export const gAbre = ({id, rotulo, corpoHtml = '', paragrafos = [], aberto = false, agora = false} = {}) => {
  const corpo = corpoHtml || paragrafos.filter(Boolean).map(t => `<p>${esc(t)}</p>`).join('');
  return `<div class="${cls('as-g-abre', ag(agora && aberto))}"><button class="as-g-abre-botao" type="button" aria-expanded="${aberto}" aria-controls="${esc(id)}"><span>${esc(rotulo)}</span>${icone('divisa-baixo')}</button><div class="as-g-abre-corpo" id="${esc(id)}"><div class="as-g-abre-miolo">${corpo}</div></div></div>`;
};

// 21. Mensagem de erro com um balanço calmo. agora: só na tentativa que deu errado.
export const gErro = ({texto, id = '', agora = false} = {}) =>
  `<p class="${cls('as-campo-erro', 'as-g-erro', ag(agora))}"${atr('id', id)} role="alert">${icone('alerta')}<span>${esc(texto)}</span></p>`;

// 22. Botão de copiar que vira visto pintado.
export const gCopiado = ({copiado = false, agora = false, rotulo} = {}) =>
  `<button class="${cls('as-botao', 'as-g-copiado', ag(agora && copiado))}" type="button" data-copiado="${copiado}"><span class="as-g-copiado-icones" aria-hidden="true">${icone('copiar')}<span class="as-g-copiado-check"></span></span><span>${esc(rotulo ?? (copiado ? 'Copiado' : 'Copiar texto'))}</span></button>`;

// 23. Avatar que acena. tamanho: '' | 'p' | 'g' | 'gg', como avatar() em marcacao.mjs.
export const gAceno = ({src, alt = '', tamanho = 'g', agora = false} = {}) =>
  `<span class="${cls('as-g-aceno', ag(agora))}"><img class="${cls('as-avatar', tamanho && `as-avatar--${tamanho}`)}" src="${esc(src)}" alt="${esc(alt)}" width="64" height="64"></span>`;

// 24. Conteúdo que muda no lugar. html: o bloco novo, já pronto.
export const gTroca = ({html = '', agora = false, papel = ''} = {}) => `<div class="${cls('as-g-troca', ag(agora))}"${atr('role', papel)}>${html}</div>`;

// ══ C. Pequenas vitórias ═════════════════════════════════════════════════
// Uma vez só, no gesto que mereceu. Nunca em aviso de risco, desconforto ou tela sem sugestão.

// 25. Carimbo de "feito". rotulo: dá nome à imagem quando ela carrega sentido sozinha.
export const gCarimbo = ({rotulo = '', agora = false, familia = '', tamanho = ''} = {}) =>
  `<span class="${cls('as-g-carimbo', ag(agora))}"${fam(familia)}${rotulo ? ` role="img" aria-label="${esc(rotulo)}"` : ' aria-hidden="true"'}${estilo([['--as-g-tamanho', tamanho]])}><span class="as-g-carimbo-tinta"></span></span>`;

// 26. Pingos de tinta. mioloHtml: o que fica no meio (um carimbo, um selo); o pingo central sai.
export const gConfete = ({agora = false, mioloHtml = '', tamanho = ''} = {}) =>
  `<span class="${cls('as-g-confete', ag(agora))}"${estilo([['--as-g-tamanho', tamanho]])}><span class="as-g-confete-pingos" aria-hidden="true">${'<i></i>'.repeat(9)}</span>${mioloHtml ? `<span class="as-g-confete-miolo">${mioloHtml}</span>` : ''}</span>`;

// 27. Três brilhos.
export const gBrilhos = ({agora = false, tamanho = ''} = {}) =>
  `<span class="${cls('as-g-brilhos', ag(agora))}" aria-hidden="true"${estilo([['--as-g-tamanho', tamanho]])}><i></i><i></i><i></i><i></i></span>`;

// 28. Coração que bate uma vez. Comemora a tentativa guardada, nunca um resultado.
export const gCoracao = ({agora = false, rotulo = '', tamanho = ''} = {}) =>
  `<span class="${cls('as-g-coracao', ag(agora))}"${rotulo ? ` role="img" aria-label="${esc(rotulo)}"` : ' aria-hidden="true"'}${estilo([['--as-g-tamanho', tamanho]])}></span>`;

// 29. Faixa com texto curto (até umas 18 letras). O texto é lido normalmente.
// Nomeia uma tentativa ("Três ideias"), nunca dias, sequência ou frequência.
export const gFaixa = ({texto, agora = false, largura = ''} = {}) =>
  `<p class="${cls('as-g-faixa', ag(agora))}"${estilo([['--as-g-largura', largura]])}><span class="as-g-faixa-arte" aria-hidden="true"></span><span class="as-g-faixa-texto"><span>${esc(texto)}</span></span></p>`;

// 30. Sol que nasce, para primeiras telas.
export const gSol = ({agora = false, tamanho = ''} = {}) =>
  `<span class="${cls('as-g-sol', ag(agora))}" aria-hidden="true"${estilo([['--as-g-tamanho', tamanho]])}><span class="as-g-sol-ceu"><span class="as-g-sol-astro"></span></span><span class="as-g-sol-chao"></span></span>`;

// ══ D. Cantinhos e detalhes ══════════════════════════════════════════════

// 31. Enfeite de canto. canto: 'se' (ramo, em cima à esquerda) ou 'id' (flores, embaixo à direita).
// O dono precisa de class="as-g-com-cantinho as-g-com-cantinho--se" (ou --id). fundo: atrás e fraco, sem pedir espaço.
export const gCantinho = ({canto = 'se', agora = false, fundo = false} = {}) =>
  `<span class="${cls('as-g-cantinho', `as-g-cantinho--${canto === 'id' ? 'id' : 'se'}`, fundo && 'as-g-cantinho--fundo', ag(agora))}" aria-hidden="true"></span>`;
export const classeDonoCantinho = (canto = 'se') => `as-g-com-cantinho as-g-com-cantinho--${canto === 'id' ? 'id' : 'se'}`;

// 32. Mancha atrás de um ícone, avatar ou figura pequena. html: o que fica em cima, já pronto.
// respira: só em tela vazia ou de espera. larga: mancha comprida. forte: aguada mais cheia (fundo da família).
export const gMancha = ({html = '', respira = false, larga = false, forte = false, familia = ''} = {}) =>
  `<span class="${cls('as-g-mancha', respira && 'as-g-mancha--respira', larga && 'as-g-mancha--larga', forte && 'as-g-mancha--forte')}"${fam(familia)}>${html}</span>`;

// 33. Divisor pintado.
export const gDivisor = ({agora = false} = {}) => `<hr class="${cls('as-g-divisor', ag(agora))}">`;

// 34. Etiqueta com fundo pintado. icone: nome de um ícone de icones.mjs.
export const gEtiqueta = ({texto, familia = '', icone: ic = '', agora = false} = {}) =>
  `<span class="${cls('as-g-etiqueta', ag(agora))}"${fam(familia)}>${ic ? icone(ic) : ''}${esc(texto)}</span>`;

// 35. Sublinhado pintado. Com href vira link; sem href é uma palavra de título.
export const gSublinhado = ({texto, href = '', agora = false} = {}) =>
  href ? `<a class="${cls('as-g-sublinhado', ag(agora))}" href="${esc(href)}">${esc(texto)}</a>` : `<span class="${cls('as-g-sublinhado', ag(agora))}">${esc(texto)}</span>`;

// ══ Amostras ═════════════════════════════════════════════════════════════
// Uma por peça. html funciona dentro de um elemento com class="as-app" de uns 360 px.
// Os caminhos de figura de verdade (avatar, card) são os de design/sistema/.
const CARDS = '../../ilustracoes/cards';
const AVATARES = '../../ilustracoes/avatares';
const linha = (...partes) => `<div style="display:flex;flex-wrap:wrap;align-items:center;gap:var(--as-e-3)">${partes.join('')}</div>`;
const pilha = (...partes) => `<div style="display:grid;gap:var(--as-e-4)">${partes.join('')}</div>`;
const centro = (...partes) => `<div style="display:grid;justify-items:center;gap:var(--as-e-3);text-align:center">${partes.join('')}</div>`;
const miudo = t => `<p class="as-miudo">${esc(t)}</p>`;
const painel = (html, extra = '') => `<div class="as-painel-liso${extra ? ` ${extra}` : ''}">${html}</div>`;

export const DEMOS = [
  // A. Carregamento
  {id: 'carrega-pincelada', grupo: 'Carregamento', nome: 'Pincelada que se pinta', classe: 'as-carrega-pincelada', duracao: '2000 ms', repete: 'em laço',
    quando: 'Quando uma seção ou um trecho ainda está chegando. Não use em botão (lá vão as gotas) nem quando a espera é a tela inteira.',
    html: pilha(linha(carregaPincelada({rotulo: 'Carregando as ideias de hoje'})), linha(`<span class="as-miudo">Procurando ideias para Lia</span>`, carregaPincelada({rotulo: 'Procurando ideias', pequena: true, familia: 'brincar'})))},
  {id: 'carrega-gotas', grupo: 'Carregamento', nome: 'Três gotas', classe: 'as-carrega-gotas', duracao: '1600 ms', repete: 'em laço',
    quando: 'Espera curta num lugar pequeno: ao lado de um rótulo ou dentro de um botão. Não use para a tela inteira.',
    html: linha(carregaGotas({rotulo: 'Conferindo o perfil'}), `<span class="as-miudo" aria-hidden="true">Conferindo o perfil</span>`)},
  {id: 'carrega-pincel', grupo: 'Carregamento', nome: 'Pincel no pote', classe: 'as-carrega-pincel', duracao: '2200 ms', repete: 'em laço',
    quando: 'Espera de tela inteira com nome próprio, como montar o kit. Não use se a resposta chega em menos de um segundo: aí vale a tela pronta.',
    html: carregaPincel({titulo: 'Montando o kit', texto: 'Separando três ideias que cabem no dia de vocês.'})},
  {id: 'esqueleto-aguada', grupo: 'Carregamento', nome: 'Esqueleto com aguada', classe: 'as-esqueleto-aguada', duracao: '2000 ms', repete: 'em laço',
    quando: 'No lugar de cards, linhas e avatares que ainda não chegaram, com a forma do que vem. Não use para conteúdo que já está na tela.',
    html: pilha(esqueleto({tipo: 'card', rotulo: 'Carregando a ideia'}), esqueleto({tipo: 'avatar', rotulo: 'Carregando o perfil'}), esqueleto({tipo: 'linha', linhas: 2, rotulo: 'Carregando o texto'}))},
  {id: 'progresso-tinta', grupo: 'Carregamento', nome: 'Progresso pintado', classe: 'as-progresso-tinta', duracao: '420 ms', repete: 'uma vez',
    quando: 'Quando se sabe quanto falta, como as perguntas do quiz. Não use para espera sem fim conhecido nem para medir a criança.',
    html: pilha(progressoTinta({valor: 3 / 7, rotulo: 'Quiz de Lia', texto: 'Pergunta 3 de 7', agora: true}), progressoTinta({valor: 0.8, rotulo: 'Montando o kit', texto: '4 de 5 passos', agora: true, familia: 'cuidadores'}))},
  {id: 'botao-esperando', grupo: 'Carregamento', nome: 'Botão esperando', classe: 'as-botao--esperando', duracao: '1600 ms', repete: 'em laço',
    quando: 'Depois do toque, enquanto o pedido vai e volta. O rótulo diz o que está acontecendo. Não use por mais de uns segundos sem um recado.',
    html: pilha(botaoEsperando({texto: 'Salvando', bloco: true}), linha(botaoEsperando({texto: 'Enviando', tom: ''}), botaoEsperando({texto: 'Refazendo o kit', tom: 'sol'})))},
  {id: 'imagem-chega', grupo: 'Carregamento', nome: 'Figura que chega', classe: 'as-imagem-chega', duracao: '320 ms', repete: 'uma vez',
    quando: 'No lugar da figura de um card enquanto ela carrega. A aguada respira só durante a espera. Não use em ícone nem em avatar.',
    html: pilha(imagemChega({src: `${CARDS}/brincar-desenho-livre.webp`, alt: 'Criança desenhando com um adulto ao lado', familia: 'brincar', chegou: true, agora: true, espera: '1400ms'}), miudo('A aguada espera, e a figura chega por cima quando carrega.'))},
  {id: 'carrega-fichas', grupo: 'Carregamento', nome: 'Fichas que se embaralham', classe: 'as-carrega-fichas', duracao: '2400 ms', repete: 'em laço',
    quando: 'Espera curta enquanto o kit é montado ou refeito. Não use quando o kit já está pronto: aí as fichas chegam uma vez.',
    html: carregaFichas({rotulo: 'Refazendo o kit', legenda: 'Refazendo o kit com a resposta nova'})},

  // B. Microinterações
  {id: 'g-toque', grupo: 'Microinterações', nome: 'Toque com mancha', classe: 'as-g-toque', duracao: '160 ms', repete: 'uma vez',
    quando: 'Em botões e escolhas grandes, para o dedo sentir que tocou. Aperte e segure para ver. Não use em link de texto nem em ícone pequeno.',
    html: pilha(`<button class="as-botao as-botao--primario as-botao--bloco as-g-toque" type="button">Ver como começar</button>`, `<button class="as-botao as-botao--bloco as-g-toque" type="button">${icone('trocar')}Trocar de criança</button>`)},
  {id: 'g-salvar', grupo: 'Microinterações', nome: 'Salvar com tinta', classe: 'as-g-salvar', duracao: '520 ms', repete: 'uma vez',
    quando: 'No gesto de guardar uma ideia, junto do recado com desfazer. Não use ao abrir a tela de salvos: lá o marcador já aparece cheio, parado.',
    html: linha(gSalvar({salvo: true, agora: true}), gSalvar({salvo: false}))},
  {id: 'g-check', grupo: 'Microinterações', nome: 'Visto pintado', classe: 'as-g-check', duracao: '320 ms', repete: 'uma vez',
    quando: 'Para confirmar uma coisa que deu certo agora, ao lado do texto que diz o quê. Não use como único sinal, nem em lista longa de itens.',
    html: pilha(linha(gCheck({agora: true, tamanho: '1.75rem'}), '<span><b>Combinado guardado.</b> Ele aparece no repasse.</span>'), linha(gCheck({agora: true}), `<span class="as-miudo">Link conferido</span>`))},
  {id: 'g-opcao', grupo: 'Microinterações', nome: 'Opção com aguada', classe: 'as-g-opcao', duracao: '320 ms', repete: 'uma vez',
    quando: 'Nas opções do quiz e do contexto de hoje. Toque para trocar. Não use em lista de filtros, que já muda de cor cheia.',
    html: `<fieldset class="as-pergunta"><legend class="as-pergunta-titulo as-pergunta-titulo--menor">Quanto tempo vocês têm hoje?</legend><div class="as-opcoes">${gOpcao({nome: 'demo-tempo', valor: '2', rotulo: 'Uns 2 minutos'})}${gOpcao({nome: 'demo-tempo', valor: '5', rotulo: 'Uns 5 minutos', dica: 'O mais comum numa tarde', marcada: true, agora: true})}${gOpcao({nome: 'demo-tempo', valor: '15', rotulo: '15 minutos ou mais'})}</div></fieldset>`},
  {id: 'g-aba', grupo: 'Microinterações', nome: 'Aba com traço pintado', classe: 'as-g-aba', duracao: '260 ms', repete: 'uma vez',
    quando: 'Nas abas do card aberto, quando uma aba fica ativa. Não use na barra de navegação de baixo.',
    html: gAbas({itens: [{id: 'demo-passos', rotulo: 'Passos', icone: 'passos'}, {id: 'demo-porque', rotulo: 'Por quê', icone: 'porque'}, {id: 'demo-cuidados', rotulo: 'Cuidados', icone: 'cuidados'}], ativa: 'demo-passos', agora: true, rotulo: 'Partes da ideia'})},
  {id: 'g-campo', grupo: 'Microinterações', nome: 'Campo com traço no foco', classe: 'as-g-campo', duracao: '200 ms', repete: 'uma vez',
    quando: 'Em campos de texto, como o nome da criança. Toque no campo para ver. O anel de foco continua; o traço é só um acréscimo.',
    html: gCampo({id: 'demo-nome', rotulo: 'Como vocês chamam a criança?', dica: 'Pode ser um apelido.', exemplo: 'Lia'})},
  {id: 'g-destaque', grupo: 'Microinterações', nome: 'Palavra destacada', classe: 'as-g-destaque', duracao: '420 ms', repete: 'uma vez',
    quando: 'Uma palavra por título, nas telas de entrada e de marco. Não use em texto corrido nem em mais de uma palavra por tela.',
    html: pilha(`<h2 class="as-titulo-1">Hoje é dia de ${gDestaque({texto: 'brincar', agora: true})}</h2>`, `<p class="as-titulo-2" data-familia="noite">Uma noite mais ${gDestaque({texto: 'calma', agora: true})}</p>`)},
  {id: 'g-circulo', grupo: 'Microinterações', nome: 'Anel pintado', classe: 'as-g-circulo', duracao: '420 ms', repete: 'uma vez',
    quando: 'Em volta de um número ou palavra curta que a pessoa precisa ver primeiro. Não use em botão nem em mais de um lugar por tela.',
    html: `<p class="as-titulo-2">Cabem ${gCirculo({texto: '3', agora: true})} ideias em 5 minutos</p>`},
  {id: 'g-seta', grupo: 'Microinterações', nome: 'Seta pintada', classe: 'as-g-seta', duracao: '200 ms', repete: 'uma vez',
    quando: 'No fim de um link que leva adiante. Passe o mouse ou chegue com o teclado. Não use em link que volta nem em botão de enviar.',
    html: pilha(`<a class="as-link" href="#demo-seta">Ver como começar ${gSeta()}</a>`, `<a class="as-link" href="#demo-seta" data-familia="emocoes" style="color:var(--as-tinta)">Ver as ideias de emoções ${gSeta()}</a>`)},
  {id: 'g-contagem', grupo: 'Microinterações', nome: 'Número que conta', classe: 'as-g-contagem', duracao: '420 ms', repete: 'uma vez',
    quando: 'Num número que acabou de mudar por um gesto, como as ideias guardadas. Não use em data, horário nem em nada que pareça placar.',
    html: `<ul class="as-contagens"><li class="as-contagem"><span class="as-contagem-numero">${gContagem({numero: 12, agora: true})}</span><span class="as-contagem-rotulo">ideias tentadas</span></li><li class="as-contagem"><span class="as-contagem-numero">${gContagem({numero: 5, agora: true})}</span><span class="as-contagem-rotulo">guardadas</span></li><li class="as-contagem"><span class="as-contagem-numero">${gContagem({numero: 3, agora: true})}</span><span class="as-contagem-rotulo">repassadas</span></li></ul>`},
  {id: 'g-lista', grupo: 'Microinterações', nome: 'Lista em cascata', classe: 'as-g-lista', duracao: '300 ms', repete: 'uma vez',
    quando: 'Quando uma lista curta chega por causa de um gesto, como os passos depois de abrir a ideia. Não use em lista longa nem ao rolar.',
    html: gLista({classe: 'as-lista', agora: true, itensHtml: ['Separe um papel e dois lápis.', 'Sente ao lado, sem conduzir.', 'Comente o que vê, não o que falta.', 'Pare quando a criança parar.'].map(t => `<span class="as-lista-marca">${icone('certo')}</span><span>${esc(t)}</span>`)})},
  {id: 'g-abre', grupo: 'Microinterações', nome: 'Trecho que abre', classe: 'as-g-abre', duracao: '280 ms', repete: 'uma vez',
    quando: 'Quando um <details> precisa virar botão (para guardar o estado, por exemplo). Quem troca aria-expanded é o app; aqui a amostra só mostra a abertura.',
    html: gAbre({id: 'demo-limites', rotulo: 'Limites desta sugestão', aberto: true, agora: true, paragrafos: ['Não substitui a orientação de quem acompanha a criança.', 'Se houver choro forte ou medo, pare e acolha primeiro.']})},
  {id: 'g-erro', grupo: 'Microinterações', nome: 'Erro com balanço calmo', classe: 'as-g-erro', duracao: '320 ms', repete: 'uma vez',
    quando: 'Na mensagem de erro de um campo, só na tentativa que acabou de falhar. Nunca em aviso de risco nem de desconforto.',
    html: `<div class="as-campo as-campo--erro"><label class="as-campo-rotulo" for="demo-idade">Idade da criança</label><input class="as-campo-entrada" id="demo-idade" value="12" aria-describedby="demo-idade-erro" aria-invalid="true">${gErro({id: 'demo-idade-erro', texto: 'Por enquanto as ideias são para crianças de 1 a 6 anos.', agora: true})}</div>`},
  {id: 'g-copiado', grupo: 'Microinterações', nome: 'Copiado', classe: 'as-g-copiado', duracao: '280 ms', repete: 'uma vez',
    quando: 'No botão de copiar o texto do repasse. O rótulo também muda. Não use como única confirmação de algo importante.',
    html: linha(gCopiado({copiado: true, agora: true}), gCopiado({copiado: false}))},
  {id: 'g-aceno', grupo: 'Microinterações', nome: 'Avatar que acena', classe: 'as-g-aceno', duracao: '420 ms', repete: 'uma vez',
    quando: 'Na primeira vez que o perfil da criança aparece depois de criado. Não use a cada troca de criança nem em lista de perfis.',
    html: linha(gAceno({src: `${AVATARES}/sol.svg`, alt: 'Avatar de Lia', agora: true, tamanho: 'gg'}), '<p><b>Lia está pronta.</b><br><span class="as-miudo">4 anos, brincar e participar</span></p>')},
  {id: 'g-troca', grupo: 'Microinterações', nome: 'Troca no lugar', classe: 'as-g-troca', duracao: '260 ms', repete: 'uma vez',
    quando: 'Quando o conteúdo muda sem trocar de tela, como o kit depois de mudar uma resposta. Não use na primeira carga da tela.',
    html: gTroca({agora: true, html: `<p class="as-troca-efeito">${icone('trocar')}<span><b>O kit muda.</b> Entra a ideia que usa papel.</span></p><div class="as-mini-ficha" data-familia="brincar" style="margin-top:var(--as-e-2)"><img src="${CARDS}/brincar-desenho-livre.webp" alt="" width="60" height="60"><div><p class="as-mini-ficha-titulo">Um desenho que a criança conduz</p><p class="as-mini-ficha-nota">Entrou porque usa papel.</p></div></div>`})},

  // C. Pequenas vitórias
  {id: 'g-carimbo', grupo: 'Pequenas vitórias', nome: 'Carimbo de feito', classe: 'as-g-carimbo', duracao: '480 ms', repete: 'uma vez',
    quando: 'Quando o adulto marca que tentou uma ideia. Não use para nota, acerto da criança ou sequência de dias.',
    html: linha(gCarimbo({agora: true, familia: 'brincar', rotulo: 'Tentamos'}), '<p><b>Tentamos hoje</b><br><span class="as-miudo">Fica no caminho de vocês.</span></p>')},
  {id: 'g-confete', grupo: 'Pequenas vitórias', nome: 'Pingos de tinta', classe: 'as-g-confete', duracao: '640 ms', repete: 'uma vez',
    quando: 'Num marco raro, em volta de um carimbo ou selo, uma vez. Não use em tela inteira, em aviso nem em gesto de todo dia.',
    html: centro(gConfete({agora: true, mioloHtml: gCarimbo({agora: true, tamanho: '3.5rem'})}), '<p><b>Primeira ideia tentada</b></p>')},
  {id: 'g-brilhos', grupo: 'Pequenas vitórias', nome: 'Brilhos', classe: 'as-g-brilhos', duracao: '640 ms', repete: 'uma vez',
    quando: 'Ao lado de algo novo que acabou de chegar, como o kit pronto. Não use perto de aviso nem em mais de um lugar por tela.',
    html: linha(gBrilhos({agora: true}), '<p class="as-titulo-2">O kit de hoje está pronto</p>')},
  {id: 'g-coracao', grupo: 'Pequenas vitórias', nome: 'Coração que bate', classe: 'as-g-coracao', duracao: '560 ms', repete: 'uma vez',
    quando: 'Quando a pessoa guarda uma ideia ou registra que tentou. Não use para pedir avaliação, para dizer que deu certo, nem em mensagem difícil.',
    html: linha(gCoracao({agora: true, rotulo: 'Guardado'}), '<p><b>Tentativa guardada.</b><br><span class="as-miudo">Você pode voltar a ela quando quiser.</span></p>')},
  {id: 'g-faixa', grupo: 'Pequenas vitórias', nome: 'Faixa', classe: 'as-g-faixa', duracao: '560 ms', repete: 'uma vez',
    quando: 'Para dar nome a um marco, com texto curto (até umas 18 letras). Não use como título comum nem com frase longa.',
    html: pilha(gFaixa({texto: 'Três ideias', agora: true}), `<p class="as-miudo" style="text-align:center">Com esta, vocês já tentaram três ideias com Lia.</p>`)},
  {id: 'g-sol', grupo: 'Pequenas vitórias', nome: 'Sol que nasce', classe: 'as-g-sol', duracao: '640 ms', repete: 'uma vez',
    quando: 'Na primeira tela, nas boas-vindas e na volta depois de um tempo. Não use em tela de trabalho nem toda vez que a tela abre.',
    html: centro(gSol({agora: true}), '<p class="as-titulo-2">Hoje com Lia</p>', miudo('Três ideias esperam por vocês hoje.'))},

  // D. Cantinhos e detalhes
  {id: 'g-cantinho', grupo: 'Cantinhos e detalhes', nome: 'Cantinho', classe: 'as-g-cantinho', duracao: '420 ms', repete: 'uma vez',
    quando: 'Num painel especial por tela (boas-vindas, marco, convite). O dono abre espaço no canto, e o enfeite nunca fica sobre texto.',
    html: pilha(painel(`${gCantinho({canto: 'se', agora: true})}<p class="as-titulo-3">Uma ideia para a noite</p><p class="as-suave" style="margin-top:var(--as-e-2)">Escolham juntos o livro antes do banho.</p>`, classeDonoCantinho('se')), painel(`${gCantinho({canto: 'id', agora: true})}<p class="as-titulo-3">Vocês tentaram 5 ideias</p><p class="as-suave" style="margin-top:var(--as-e-2)">Cada tentativa conta, mesmo as curtas.</p>`, classeDonoCantinho('id')))},
  {id: 'g-mancha', grupo: 'Cantinhos e detalhes', nome: 'Mancha de aguada', classe: 'as-g-mancha', duracao: '2400 ms', repete: 'em laço',
    quando: 'Atrás de ícone, avatar ou figura pequena. Parada no dia a dia; respirando só em tela vazia ou de espera.',
    html: `<div style="display:flex;flex-wrap:wrap;align-items:center;gap:var(--as-e-7);padding:var(--as-e-4) var(--as-e-4) var(--as-e-3)">${[gMancha({familia: 'brincar', html: `<span style="display:grid;place-items:center;width:2.5rem;height:2.5rem;color:var(--as-fam-tinta)">${icone('brincar', {classe: 'as-icone--g'})}</span>`}), gMancha({familia: 'noite', forte: true, html: `<span style="display:grid;place-items:center;width:2.5rem;height:2.5rem;color:var(--as-fam-tinta)">${icone('noite', {classe: 'as-icone--g'})}</span>`}), gMancha({familia: 'cuidadores', respira: true, html: `<img class="as-avatar as-avatar--g" src="${AVATARES}/folha.svg" alt="" width="64" height="64">`}), ].join('')}</div><p class="as-miudo" style="margin-top:var(--as-e-3)">A terceira respira devagar: é a mancha de uma tela vazia ou de espera.</p>`},
  {id: 'g-divisor', grupo: 'Cantinhos e detalhes', nome: 'Divisor pintado', classe: 'as-g-divisor', duracao: '420 ms', repete: 'uma vez',
    quando: 'Entre dois blocos que mudam de assunto, num painel ou numa tela de leitura. Não use entre itens de uma lista.',
    html: `<div><p>Os passos acabam aqui.</p>${gDivisor({agora: true})}<p class="as-suave">Se não coube hoje, ela continua no kit.</p></div>`},
  {id: 'g-etiqueta', grupo: 'Cantinhos e detalhes', nome: 'Etiqueta pintada', classe: 'as-g-etiqueta', duracao: '260 ms', repete: 'uma vez',
    quando: 'Para o nome da família de desafio ou uma marca curta numa capa. Não use para estado do conteúdo (lá ficam as etiquetas lisas).',
    html: linha(gEtiqueta({texto: 'Brincar', familia: 'brincar', icone: 'brincar', agora: true}), gEtiqueta({texto: 'Noite', familia: 'noite', icone: 'noite', agora: true}), gEtiqueta({texto: 'Emoções', familia: 'emocoes', icone: 'emocoes', agora: true}), gEtiqueta({texto: 'Comece por aqui', icone: 'faisca', agora: true}))},
  {id: 'g-sublinhado', grupo: 'Cantinhos e detalhes', nome: 'Sublinhado pintado', classe: 'as-g-sublinhado', duracao: '320 ms', repete: 'uma vez',
    quando: 'Parado, num link solto de destaque ou numa palavra de título. Com as-agora, ele se pinta uma vez. Não use em link dentro de texto corrido.',
    html: pilha(`<p class="as-titulo-2">O que vocês já ${gSublinhado({texto: 'tentaram', agora: true})}</p>`, `<p>${gSublinhado({texto: 'Ver o caminho de vocês', href: '#demo-sublinhado', agora: true})}</p>`)},
];
