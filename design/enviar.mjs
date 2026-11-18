// Ficha para enviar: as imagens e o texto que a pessoa manda pelo WhatsApp para a babá, o outro responsável, os avós ou a escola.
// Pedido do Gabriel (18/11/2026): "já vai um modelo com imagem e texto bem bonitinho".
// Sem biblioteca de fora: cada imagem é pintada num <canvas> com a ilustração da ficha e as fontes do app.
// Regra herdada do repasse: nunca entram idade, diagnóstico nem respostas do quiz. O apelido só entra se a pessoa marcar.
//
// Nada da ficha fica de fora e a letra não encolhe abaixo de 90%: quando o conteúdo não cabe, ele segue em mais páginas
// de 1080 x 1920 (o WhatsApp manda várias imagens juntas, como um álbum). Página 1: o que fazer. Depois: os cuidados.
//
// Uso no app:
//   const {paginas, escala, resumo} = await pintarPaginas({card, crianca, incluirNome, cores, simboloUrl});
//   const texto = textoParaEnviar({card, crianca, destino, incluirNome, recado});
//   await enviarFicha({paginas, texto, nome: card.id});   // abre a folha de compartilhar do celular com todas as imagens e o texto
//
// card: {titulo, objetivo, familiaNome, imagem, por_que: {explicacao, limites} | principio, requisitos[], passos[], evite[],
//        interrompa_se[], procure_ajuda_se[], adaptacoes[] (texto ou {quando, mudanca}), limites (texto ou lista), fonte, versao}
// Campo ausente ou vazio é pulado.
//
// Quando o app já tem as seções prontas (título e linhas), passe-as em `secoes`: aí só `titulo`, `familiaNome` e `imagem` vêm do card,
// e TODA linha de TODA seção é pintada, na ordem dada. Nenhuma seção é descartada por ter um título que o módulo não conhece.
//   const {paginas, resumo} = await pintarPaginas({card: {titulo, familiaNome, imagem}, secoes: secoesDoApp(shareSections(card, adaptacoes)), ...});
//   secoes: [{titulo, linhas[], tipo, parte}]
//     tipo:  'lide' (parágrafo de abertura, sem rótulo) | 'caixa' (caixa creme com o rótulo dentro) | 'pontos' (padrão) | 'passos' (numerados)
//            | 'evite' | 'pare' | 'ajuda' (marcadores próprios) | 'texto' (parágrafos) | 'miudo' (letra pequena: fontes e avisos)
//     parte: 'fazer' (tenta caber na página 1) | 'cuidados' | 'fim'. Sem parte, a seção fica na parte da anterior.
// Limite: um item sozinho (um passo, um cuidado, uma fonte) precisa caber numa página, cerca de 30 linhas. Se não couber,
// `resumo.cabe` vem false e o app deve mandar só o texto. Palavra maior que a linha (endereço de site) é quebrada por letra.

export const FORMATO = {largura: 1080, altura: 1920}; // 9:16: abre em tela cheia no celular e dá para ler sem ampliar

export const DESTINOS = [
  {id: 'baba', rotulo: 'Babá ou cuidadora', icone: 'pessoa', abre: quem => `Oi! Segue uma ideia para fazer com ${quem} hoje.`},
  {id: 'responsavel', rotulo: 'Pai, mãe ou responsável', icone: 'familia', abre: quem => `Olha o que eu separei para a gente tentar com ${quem}. Se fizermos do mesmo jeito, ajuda.`},
  {id: 'avos', rotulo: 'Avós e família', icone: 'avo', abre: quem => `Oi! Uma ideia simples para quando ${quem} estiver com vocês.`},
  {id: 'escola', rotulo: 'Escola', icone: 'escola', abre: quem => `Olá! Em casa estamos tentando isto com ${quem}. Compartilho para o caso de ajudar aí também.`},
];

const AVISO = 'Ideia para o dia a dia. Não substitui a orientação de um profissional.';
const quemE = (crianca, incluirNome) => (incluirNome && crianca?.nome ? crianca.nome : 'a criança');

// Leitura dos campos, do mesmo jeito para a imagem e para o texto
const lista = v => (Array.isArray(v) ? v : v ? [v] : []).map(x => String(x ?? '').trim()).filter(Boolean);
const adaptacao = a => {
  if (typeof a === 'string') return a;
  if (!a?.mudanca) return '';
  return typeof a.quando === 'string' && a.quando.trim() ? `${a.quando.trim()}: ${a.mudanca}` : a.mudanca;
};
export function camposDaFicha(card) {
  const lim = card.limites ?? card.por_que?.limites;
  return {
    porQue: String(card.por_que?.explicacao || card.principio || '').trim(),
    requisitos: lista(card.requisitos),
    passos: lista(card.passos),
    evite: lista(card.evite),
    pareSe: lista(card.interrompa_se),
    ajudaSe: lista(card.procure_ajuda_se),
    adaptacoes: lista((card.adaptacoes ?? []).map(adaptacao)),
    limites: Array.isArray(lim) ? lista(lim) : String(lim ?? '').trim(), // texto corrido ou lista
    fonte: String(card.fonte ?? '').trim(),
    versao: String(card.versao ?? '').trim(),
  };
}

// Seções prontas. Cada uma vira {nome, rotulo, tipo, parte, linhas}; seção sem linha é pulada; a parte nunca volta para trás.
const TIPOS = ['lide', 'caixa', 'pontos', 'passos', 'evite', 'pare', 'ajuda', 'texto', 'miudo'], PARTES = ['fazer', 'cuidados', 'fim'];
const semAcento = t => String(t).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
export function normalizarSecoes(secoes) {
  let parte = 'fazer'; const usados = new Map();
  return (secoes ?? []).map(x => {
    const rotulo = String(x.titulo ?? x.title ?? '').trim(), tipo = TIPOS.includes(x.tipo) ? x.tipo : 'pontos';
    if (PARTES.indexOf(x.parte) > PARTES.indexOf(parte)) parte = x.parte;
    const base = x.id || semAcento(rotulo) || tipo, n = (usados.get(base) ?? 0) + 1; usados.set(base, n);
    return {nome: n > 1 ? `${base}_${n}` : base, rotulo, tipo, parte, linhas: lista(x.linhas ?? x.lines)};
  }).filter(x => x.linhas.length);
}
// As seções que o app monta em shareSections() ([{title, lines}]), com o desenho de cada uma. Título que não está aqui vira lista de pontos
// com o próprio título como rótulo: aparece do mesmo jeito, só sem marcador próprio.
const DO_APP = {
  'Objetivo': ['lide', 'fazer'], 'Por que esta ideia': ['caixa', 'fazer'], 'O que observar': ['pontos', 'fazer'], 'Antes de começar': ['pontos', 'fazer'],
  'Como fazer': ['passos', 'fazer'], 'Variações a conferir': ['pontos', 'cuidados'], 'Cuidados — evite': ['evite', 'cuidados'],
  'Quando parar / se não couber': ['pare', 'cuidados'], 'Buscar ajuda': ['ajuda', 'cuidados'], 'Limites': ['texto', 'cuidados'],
  'Fontes de encaminhamento': ['miudo', 'fim'], 'Fontes da atividade': ['miudo', 'fim'], 'Sobre esta cópia': ['miudo', 'fim'],
};
export const secoesDoApp = secoes => (secoes ?? []).map(x => {
  const titulo = x.title ?? x.titulo, linhas = x.lines ?? x.linhas ?? [], [tipo, parte] = DO_APP[titulo] ?? ['pontos'];
  return {titulo, tipo, parte, linhas: tipo === 'passos' ? linhas.map(l => String(l).replace(/^\d+\.\s+/, '')) : linhas}; // o número do passo é pintado no círculo
});
// As seções de uma ficha passada só pelos campos (uso antigo e telas de referência).
const secoesDaFicha = (card, f) => {
  const S = [], poe = (nome, rotulo, tipo, parte, linhas) => { if (linhas.length) S.push({nome, rotulo, tipo, parte, linhas}); };
  poe('objetivo', '', 'lide', 'fazer', lista(card.objetivo));
  poe('por_que', 'Por que ajuda', 'caixa', 'fazer', lista(f.porQue));
  poe('antes_de_comecar', 'Antes de começar', 'pontos', 'fazer', f.requisitos);
  poe('como_fazer', 'Como fazer', 'passos', 'fazer', f.passos);
  poe('evite', 'Evite', 'evite', 'cuidados', f.evite);
  poe('pare_se', 'Pare se', 'pare', 'cuidados', f.pareSe);
  poe('procure_ajuda_se', 'Procure ajuda se', 'ajuda', 'cuidados', f.ajudaSe);
  poe('adaptacoes', 'Adaptações', 'pontos', 'cuidados', f.adaptacoes);
  if (Array.isArray(f.limites)) poe('limites', 'Limites', 'pontos', 'cuidados', f.limites); else poe('limites', 'Limites', 'texto', 'cuidados', lista(f.limites));
  poe('fonte', '', 'assinatura', 'fim', lista([f.fonte ? `Fonte: ${f.fonte}.` : '', f.versao ? `Versão da ficha: ${f.versao}.` : ''].filter(Boolean).join(' ')));
  return S;
};

// O texto que vai junto, com o negrito do WhatsApp (*assim*). Mesma ordem das imagens.
export function textoParaEnviar({card, crianca, destino = 'baba', incluirNome = false, recado = ''}) {
  const d = DESTINOS.find(x => x.id === destino) ?? DESTINOS[0], f = camposDaFicha(card);
  const l = [recado.trim() || d.abre(quemE(crianca, incluirNome)), '', `*${card.titulo}*`, card.objetivo];
  const marcas = (rotulo, itens) => { if (itens.length) l.push('', `*${rotulo}*`, ...itens.map(e => `• ${e}`)); };
  if (f.porQue) l.push('', `*Por que ajuda:* ${f.porQue}`);
  marcas('Antes de começar', f.requisitos);
  if (f.passos.length) l.push('', '*Como fazer*', ...f.passos.map((p, i) => `${i + 1}. ${p}`));
  marcas('Evite', f.evite);
  marcas('Pare se', f.pareSe);
  marcas('Procure ajuda se', f.ajudaSe);
  marcas('Adaptações', f.adaptacoes);
  if (Array.isArray(f.limites)) marcas('Limites', f.limites); else if (f.limites) l.push('', `*Limites:* ${f.limites}`);
  l.push('', [f.fonte ? `Fonte: ${f.fonte}.` : '', AVISO].filter(Boolean).join(' '), 'Enviado pelo Agora Sei.');
  return l.join('\n');
}

const carregar = url => new Promise((ok, erro) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => erro(new Error(`imagem não abriu: ${url}`)); i.src = url; });
const quebrar = (ctx, texto, largura) => {
  const linhas = [];
  for (const par of String(texto).split('\n')) {
    let l = '';
    for (let p of par.split(/\s+/).filter(Boolean)) {
      while (ctx.measureText(p).width > largura) { // palavra maior que a linha (endereço de site): quebra por letra, sem perder nenhuma
        if (l) { linhas.push(l); l = ''; }
        let n = p.length; while (n > 1 && ctx.measureText(p.slice(0, n)).width > largura) n--;
        linhas.push(p.slice(0, n)); p = p.slice(n);
      }
      const t = l ? `${l} ${p}` : p;
      if (l && ctx.measureText(t).width > largura) { linhas.push(l); l = p; } else l = t;
    }
    if (l) linhas.push(l);
  }
  return linhas;
};
const caixa = (ctx, x, y, w, h, r) => { ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h); };

// Escalas tentadas, da maior para a menor. A letra nunca fica abaixo de 90%.
const ESCALAS = [1, 0.98, 0.96, 0.94, 0.92, 0.9];

// Pinta todas as páginas. Devolve os canvas, a escala única do conjunto e um resumo do que entrou em cada página.
export async function pintarPaginas({card, crianca, incluirNome = false, cores = {}, simboloUrl = '', secoes: prontas}) {
  const {largura: W, altura: H} = FORMATO, M = 72, RODAPE = 178, LIMITE = H - RODAPE - 24, larg = W - 2 * M;
  const medida = document.createElement('canvas').getContext('2d');
  const css = getComputedStyle(document.documentElement);
  const FT = css.getPropertyValue('--as-fonte-titulo').trim() || 'Georgia, serif', FX = css.getPropertyValue('--as-fonte-texto').trim() || 'system-ui, sans-serif';
  const C = {papel: '#F6F4F9', tinta: '#2A2140', suave: '#5B5170', creme: '#FBF6EC', areia: '#EDE4D6', sol: '#FBEDCB', rosa: '#F7E3DC', rosaTinta: '#8A3B2E', aguada: cores.aguada || '#EEEAF3', famTinta: cores.tinta || '#2A2140'};
  await Promise.all([document.fonts.load(`400 62px ${FT}`), document.fonts.load(`400 30px ${FX}`), document.fonts.load(`700 30px ${FX}`)]);
  const [arte, simbolo] = await Promise.all([carregar(card.imagem), simboloUrl ? carregar(simboloUrl).catch(() => null) : null]);
  const fonte = (ctx, peso, px, familia = FX) => { ctx.font = `${peso} ${px}px ${familia}`; };
  const entrada = prontas ? normalizarSecoes(prontas) : secoesDaFicha(card, camposDaFicha(card));
  const etiqueta = [card.familiaNome, incluirNome && crianca?.nome ? `com ${crianca.nome}` : ''].map(x => String(x || '').trim()).filter(Boolean).join(' · ');

  // Seções na ordem da leitura. Cada item é um bloco que nunca se divide; o rótulo da lista vai sempre com o primeiro item da página.
  // parte: 'fazer' (precisa caber na página 1 para a escala ser aceita), 'cuidados' (abre página nova se ainda estiver na página 1) ou 'fim'.
  const secoes = s => {
    const S = [];
    const linhas = (texto, px, lh, peso, familia, cor, largura = larg) => { fonte(medida, peso, px, familia); const l = quebrar(medida, texto, largura); return {l, h: l.length * lh, px, lh, peso, familia, cor}; };
    const solo = (nome, item, depois) => S.push({nome, parte: 'fazer', depois, itens: [item]});
    const itemLista = (tipo, texto, n) => { fonte(medida, 400, 30 * s); const l = quebrar(medida, texto, larg - 76 * s); return {t: tipo, l, n, h: tipo === 'ponto' ? l.length * 42 * s + 6 * s : Math.max(54 * s, l.length * 42 * s)}; };
    const secLista = (nome, rotulo, parte, tipo, itens) => { if (itens.length) S.push({nome, rotulo: rotulo || undefined, parte, itens: itens.map((x, i) => itemLista(tipo, x, i + 1))}); };
    if (etiqueta) { fonte(medida, 700, 26 * s); solo('etiqueta', {t: 'etiqueta', texto: etiqueta, w: medida.measureText(etiqueta).width + 44 * s, h: 52 * s}, 24); }
    solo('titulo', {t: 'linhas', ...linhas(card.titulo, 62 * s, 70 * s, 400, FT, C.tinta)});
    for (const e of entrada) {
      if (e.tipo === 'lide') S.push({nome: e.nome, parte: e.parte, depois: 32, itens: [{t: 'linhas', ...linhas(e.linhas.join('\n'), 32 * s, 44 * s, 400, FX, C.suave)}]});
      else if (e.tipo === 'caixa') { fonte(medida, 400, 30 * s); const l = quebrar(medida, e.linhas.join('\n'), larg - 60 * s); S.push({nome: e.nome, parte: e.parte, depois: 36, itens: [{t: 'porque', rotulo: e.rotulo, l, h: 30 * s + 38 * s + l.length * 42 * s + 26 * s}]}); }
      else if (e.tipo === 'texto') S.push({nome: e.nome, rotulo: e.rotulo, parte: e.parte, itens: e.linhas.map(x => ({t: 'linhas', ...linhas(x, 28 * s, 40 * s, 400, FX, C.suave)}))});
      else if (e.tipo === 'miudo') S.push({nome: e.nome, rotulo: e.rotulo, parte: e.parte, itens: e.linhas.map(x => ({t: 'linhas', ...linhas(x, 24 * s, 34 * s, 400, FX, C.suave)}))});
      else if (e.tipo === 'assinatura') S.push({nome: e.nome, parte: e.parte, itens: [{t: 'fonte', ...linhas(e.linhas.join(' '), 24 * s, 34 * s, 400, FX, C.suave), h0: 26 * s}]});
      else secLista(e.nome, e.rotulo, e.parte, {passos: 'passo', evite: 'evite', pare: 'pare', ajuda: 'ajuda'}[e.tipo] ?? 'ponto', e.linhas);
    }
    S.forEach(x => x.itens.forEach(i => { if (i.h0) i.h += i.h0; }));
    return S;
  };

  // Faixa das páginas seguintes: aguada da cor do desafio com o título da ficha, pequeno.
  const faixa = s => { fonte(medida, 400, 40 * s, FT); const l = quebrar(medida, card.titulo, larg); return {l, h: 60 * s + l.length * 50 * s + 52 * s}; };

  // Distribui as seções em páginas numa escala e numa altura de ilustração.
  const paginar = (s, imgH) => {
    const S = secoes(s), fx = faixa(s), pags = [], ROT = 46 * s, GAP = 20 * s, ENTRE = 34 * s;
    let pag, y;
    const nova = () => { pag = {blocos: [], nomes: [], itens: {}, primeira: !pags.length, vazia: true}; pags.push(pag); y = pag.primeira ? imgH + 44 * s : fx.h + 44 * s; };
    nova();
    for (const sec of S) {
      if (sec.parte === 'cuidados' && !pag.vazia && pags.length === 1 && !pag.cuidados) nova(); // os cuidados não dividem a página 1 com "o que fazer"
      if (sec.parte === 'cuidados') pag.cuidados = true;
      let primeiroDaPagina = true;
      sec.itens.forEach((it, i) => {
        const rot = sec.rotulo && primeiroDaPagina ? ROT : 0;
        if (!pag.vazia && y + rot + it.h > LIMITE) { nova(); primeiroDaPagina = true; if (sec.parte === 'cuidados') pag.cuidados = true; }
        if (sec.rotulo && primeiroDaPagina) { pag.blocos.push({t: 'rotulo', y, texto: i ? `${sec.rotulo} (continuação)` : sec.rotulo}); y += ROT; }
        const nome = sec.rotulo && i && primeiroDaPagina ? `${sec.nome}_continuacao` : sec.nome;
        if (primeiroDaPagina) pag.nomes.push(nome);
        pag.blocos.push({...it, y}); pag.itens[sec.nome] = (pag.itens[sec.nome] ?? 0) + 1;
        y += it.h; pag.fim = y; y += sec.rotulo ? GAP : (sec.depois ?? 12) * s;
        pag.vazia = false; primeiroDaPagina = false;
      });
      if (sec.rotulo) y += ENTRE - GAP;
    }
    const fazerNaPrimeira = S.filter(x => x.parte === 'fazer').every(x => (pags[0].itens[x.nome] ?? 0) === x.itens.length);
    return {pags, s, imgH, fx, fazerNaPrimeira};
  };

  // Escolha: a maior letra em que "o que fazer" cabe inteiro na página 1; em cada escala, a ilustração encurta de 720 para 640 px
  // antes de a letra descer. Se nem a 90% couber, a letra volta a 100% e o que sobra segue na página seguinte: mais páginas, nunca letra menor.
  const tentativas = ESCALAS.flatMap(s => [[s, 720], [s, 640]]);
  let plano = null;
  for (const [s, h] of tentativas) { const p = paginar(s, h); if (p.fazerNaPrimeira) { plano = p; break; } }
  if (!plano) plano = paginar(1, 640);
  const {s, imgH, fx} = plano, N = plano.pags.length;

  const paginas = plano.pags.map((pag, k) => {
    const canvas = document.createElement('canvas'); canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = C.papel; ctx.fillRect(0, 0, W, H);
    ctx.textBaseline = 'top';
    if (pag.primeira) { // ilustração: cobre a largura; corta pouco em cima (cabeças) e mais embaixo (tapete)
      ctx.fillStyle = C.aguada; ctx.fillRect(0, 0, W, imgH);
      const esc = Math.max(W / arte.width, imgH / arte.height), aw = W / esc, ah = imgH / esc;
      ctx.drawImage(arte, (arte.width - aw) / 2, (arte.height - ah) * 0.2, aw, ah, 0, 0, W, imgH);
    } else { // faixa de aguada com a borda de baixo levemente ondulada, como pincelada
      const b = fx.h - 14 * s; ctx.fillStyle = C.aguada; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(W, 0); ctx.lineTo(W, b - 6 * s);
      for (let x = W, i = 0; x > 0; x -= W / 4, i++) ctx.quadraticCurveTo(x - W / 8, b + (i % 2 ? -12 : 14) * s, x - W / 4, b + (i % 2 ? 6 : -4) * s);
      ctx.closePath(); ctx.fill();
      fonte(ctx, 400, 40 * s, FT); ctx.fillStyle = C.famTinta; fx.l.forEach((l, i) => ctx.fillText(l, M, 60 * s + i * 50 * s));
    }
    for (const b of pag.blocos) {
      if (b.t === 'etiqueta') { fonte(ctx, 700, 26 * s); ctx.fillStyle = C.aguada; caixa(ctx, M, b.y, b.w, 52 * s, 26 * s); ctx.fill(); ctx.fillStyle = C.famTinta; ctx.fillText(b.texto, M + 22 * s, b.y + 13 * s); }
      if (b.t === 'linhas') { fonte(ctx, b.peso, b.px, b.familia); ctx.fillStyle = b.cor; b.l.forEach((l, i) => ctx.fillText(l, M, b.y + i * b.lh)); }
      if (b.t === 'fonte') { ctx.fillStyle = C.areia; ctx.fillRect(M, b.y, larg, 2); fonte(ctx, b.peso, b.px); ctx.fillStyle = b.cor; b.l.forEach((l, i) => ctx.fillText(l, M, b.y + b.h0 + i * b.lh)); }
      if (b.t === 'rotulo') { fonte(ctx, 700, 28 * s); ctx.fillStyle = C.tinta; ctx.fillText(b.texto, M, b.y); }
      if (b.t === 'porque') { ctx.fillStyle = C.creme; caixa(ctx, M, b.y, larg, b.h, 28 * s); ctx.fill(); ctx.strokeStyle = C.areia; ctx.lineWidth = 2; caixa(ctx, M, b.y, larg, b.h, 28 * s); ctx.stroke(); fonte(ctx, 700, 26 * s); ctx.fillStyle = C.tinta; ctx.fillText(b.rotulo || 'Por que ajuda', M + 30 * s, b.y + 28 * s); fonte(ctx, 400, 30 * s); b.l.forEach((l, i) => ctx.fillText(l, M + 30 * s, b.y + 68 * s + i * 42 * s)); }
      if (b.t === 'ponto') { ctx.fillStyle = C.famTinta; ctx.beginPath(); ctx.arc(M + 27 * s, b.y + 6 * s + 17 * s, 7 * s, 0, Math.PI * 2); ctx.fill(); }
      if (['passo', 'evite', 'pare', 'ajuda'].includes(b.t)) {
        const r = 27 * s, cx = M + r, cy = b.y + r;
        ctx.fillStyle = {passo: C.sol, evite: C.rosa, pare: C.rosa, ajuda: C.aguada}[b.t]; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
        ctx.lineCap = 'round';
        if (b.t === 'passo') { fonte(ctx, 700, 28 * s); ctx.fillStyle = C.tinta; ctx.textAlign = 'center'; ctx.fillText(String(b.n), cx, cy - 15 * s); ctx.textAlign = 'left'; }
        if (b.t === 'evite') { ctx.strokeStyle = C.rosaTinta; ctx.lineWidth = 4 * s; const d = 9 * s; ctx.beginPath(); ctx.moveTo(cx - d, cy - d); ctx.lineTo(cx + d, cy + d); ctx.moveTo(cx + d, cy - d); ctx.lineTo(cx - d, cy + d); ctx.stroke(); }
        if (b.t === 'pare') { ctx.strokeStyle = C.rosaTinta; ctx.lineWidth = 5 * s; const d = 9 * s, g = 5 * s; ctx.beginPath(); ctx.moveTo(cx - g, cy - d); ctx.lineTo(cx - g, cy + d); ctx.moveTo(cx + g, cy - d); ctx.lineTo(cx + g, cy + d); ctx.stroke(); }
        if (b.t === 'ajuda') { ctx.strokeStyle = C.famTinta; ctx.fillStyle = C.famTinta; ctx.lineWidth = 5 * s; ctx.beginPath(); ctx.moveTo(cx, cy - 12 * s); ctx.lineTo(cx, cy + 3 * s); ctx.stroke(); ctx.beginPath(); ctx.arc(cx, cy + 11 * s, 3 * s, 0, Math.PI * 2); ctx.fill(); }
      }
      if (['passo', 'evite', 'pare', 'ajuda', 'ponto'].includes(b.t)) { fonte(ctx, 400, 30 * s); ctx.fillStyle = C.tinta; b.l.forEach((l, i) => ctx.fillText(l, M + 76 * s, b.y + 6 * s + i * 42 * s)); }
    }
    // Rodapé: marca, aviso e a contagem de páginas (tamanho fixo, igual em todas)
    const ry = H - RODAPE; ctx.fillStyle = C.papel; ctx.fillRect(0, ry, W, RODAPE); ctx.fillStyle = C.areia; ctx.fillRect(M, ry, larg, 2);
    if (simbolo) ctx.drawImage(simbolo, M, ry + 30, 60, 60);
    fonte(ctx, 400, 38, FT); ctx.fillStyle = C.tinta; ctx.fillText('Agora Sei', M + (simbolo ? 78 : 0), ry + 38);
    fonte(ctx, 700, 26); ctx.fillStyle = C.suave; ctx.textAlign = 'right'; ctx.fillText(`${k + 1} de ${N}`, W - M, ry + 46); ctx.textAlign = 'left';
    fonte(ctx, 400, 23); quebrar(ctx, AVISO, larg).slice(0, 2).forEach((l, i) => ctx.fillText(l, M, ry + 108 + i * 31));
    return canvas;
  });

  const resumo = {
    paginas: N, escala: Math.round(s * 100) / 100, alturaDaArte: imgH,
    porPagina: plano.pags.map(p => (p.primeira ? ['ilustracao'] : ['titulo_pequeno']).concat(p.nomes)),
    itensPorPagina: plano.pags.map(p => p.itens),
    fimPorPagina: plano.pags.map(p => Math.round(p.fim)), limite: LIMITE,
    cabe: plano.pags.every(p => p.fim <= LIMITE), // false: um item sozinho é mais alto que a página; mande só o texto
  };
  return {paginas, escala: resumo.escala, resumo};
}

// Compatível com o uso antigo: pinta só a página 1 no canvas dado. Nada é cortado; o resto está nas páginas seguintes.
export async function pintarFicha(canvas, opcoes) {
  const r = await pintarPaginas(opcoes);
  canvas.width = FORMATO.largura; canvas.height = FORMATO.altura;
  canvas.getContext('2d').drawImage(r.paginas[0], 0, 0);
  return {escala: r.escala, alturaDaArte: r.resumo.alturaDaArte, paginas: r.resumo.paginas, deFora: [], resumo: r.resumo};
}

export const arquivoDaFicha = (canvas, nome = 'ficha', pagina = 1, total = 1) => new Promise((ok, erro) => canvas.toBlob(b => (b ? ok(new File([b], total > 1 ? `agora-sei-${nome}-${pagina}-de-${total}.png` : `agora-sei-${nome}.png`, {type: 'image/png'})) : erro(new Error('não foi possível gerar a imagem'))), 'image/png'));
export const arquivosDaFicha = (paginas, nome = 'ficha') => Promise.all(paginas.map((c, i) => arquivoDaFicha(c, nome, i + 1, paginas.length)));

// Abre a folha de compartilhar do aparelho com todas as imagens e o texto. Onde isso não existe, devolve o caminho de reserva:
// baixar as imagens e abrir o WhatsApp só com o texto. Quem decide o que fazer com a reserva é o app.
// Aceita {paginas} (novo) ou {canvas} (antigo, uma imagem só).
export async function enviarFicha({paginas, canvas, texto, nome = 'ficha'}) {
  const arquivos = await arquivosDaFicha(paginas?.length ? paginas : [canvas], nome);
  if (navigator.canShare?.({files: arquivos})) {
    try { await navigator.share({files: arquivos, text: texto}); return {modo: 'compartilhado'}; }
    catch (e) { if (e.name === 'AbortError') return {modo: 'cancelado'}; }
  }
  return {modo: 'reserva', arquivos, arquivo: arquivos[0], link: `https://wa.me/?text=${encodeURIComponent(texto)}`};
}
