// Agora Sei — marcação dos componentes, v0.1 (Isaque, 18/11/2026)
// Funções puras: recebem dados, devolvem HTML em texto com as classes de design/componentes.css.
// Não tocam em DOM, rede nem armazenamento. As páginas de design/referencia/ são geradas com elas,
// então o que se vê lá é exatamente o que estas funções devolvem.
//   import {moldura, cardResumo, opcao, aviso, vazio} from '../../design/marcacao.mjs';
// Todo texto que vem de dados passa por esc(). Campos com sufixo "Html" são HTML já pronto.
import {icone} from './icones.mjs';
export {icone};

export const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const atr = (nome, valor) => (valor === undefined || valor === null || valor === false ? '' : ` ${nome}="${esc(valor === true ? '' : valor)}"`);

// ── Vocabulário de tela ───────────────────────────────────────────────
export const ESTADOS = {
  rascunho_nao_revisado: {rotulo: 'Rascunho, sem revisão', icone: 'estado-rascunho', tom: 'atencao'},
  fonte_conferida: {rotulo: 'Fonte conferida, sem revisão profissional', icone: 'estado-fonte', tom: 'info'},
  revisao_por_agente: {rotulo: 'Sem revisão profissional', icone: 'estado-agente', tom: 'info'},
  aprovado_humano: {rotulo: 'Aprovado por profissional', icone: 'estado-humano', tom: 'ok'},
  suspenso: {rotulo: 'Suspenso', icone: 'estado-suspenso', tom: 'cuidado'},
  sintetico: {rotulo: 'Exemplo sintético', icone: 'estado-exemplo', tom: 'tracejada'},
};
export const TIPOS = {
  antes: {rotulo: 'Para antes', icone: 'tipo-antes'},
  na_hora: {rotulo: 'Para a hora', icone: 'tipo-na-hora'},
  treino: {rotulo: 'Para treinar brincando', icone: 'tipo-treino'},
  depois: {rotulo: 'Para depois', icone: 'tipo-depois'},
};
export const RETORNOS = {
  usamos: {rotulo: 'Tentamos', dica: 'Fica no caminho de vocês. Não mede aprendizagem.', icone: 'certo'},
  nao_coube: {rotulo: 'Não coube hoje', dica: 'Continua no kit, mais para o fim.', icone: 'pausa'},
  adaptar: {rotulo: 'Precisamos adaptar', dica: 'Abre as variações já escritas.', icone: 'adaptar'},
  nao_quero: {rotulo: 'Não quero esta', dica: 'Sai do kit desta criança. Dá para desfazer.', icone: 'nao-quero'},
  desconforto: {rotulo: 'Houve desconforto', dica: 'Sai do kit e mostramos um cuidado.', icone: 'desconforto'},
  restaurar: {rotulo: 'Devolver ao kit', dica: 'Volta a poder ser sugerido.', icone: 'restaurar'},
};
export const TIPOS_DE_FONTE = {orientacao_institucional: 'Orientação institucional', diretriz: 'Diretriz', revisao_sistematica: 'Revisão sistemática', revisao: 'Revisão', estudo: 'Estudo', livro: 'Livro', material_educativo: 'Material educativo'};
export const FORCAS = {alta: 'Alta', moderada: 'Moderada', limitada: 'Limitada', consenso_de_especialistas: 'Consenso de especialistas', nao_classificada: 'Não classificada'};
export const ROTAS = {inicio: '#/home', home: '#/home', explore: '#/explore', saved: '#/saved', profiles: '#/profiles', help: '#/help', add: '#/add', edit: '#/edit', quiz: '#/quiz'};
const NAV = [['home', 'hoje', 'Hoje'], ['explore', 'explorar', 'Explorar'], ['saved', 'salvos', 'Salvos'], ['profiles', 'criancas', 'Crianças'], ['help', 'ajuda', 'Ajuda']];

// ── Peças pequenas ────────────────────────────────────────────────────
export function etiqueta(texto, {icone: ic = '', tom = '', testid, extra = ''} = {}) {
  return `<span class="as-etiqueta${tom ? ` as-etiqueta--${tom}` : ''}"${atr('data-testid', testid)}${extra}>${ic ? icone(ic) : ''}${esc(texto)}</span>`;
}
export function etiquetaEstado(status, {testid = 'card-status'} = {}) {
  const e = ESTADOS[status] ?? {rotulo: 'Estado não informado', icone: 'info', tom: 'tracejada'};
  return etiqueta(e.rotulo, {icone: e.icone, tom: e.tom, testid, extra: atr('data-estado', status)});
}
export function etiquetaTipo(tipo) {
  const t = TIPOS[tipo];
  return t ? etiqueta(t.rotulo, {icone: t.icone, tom: 'contorno', extra: atr('data-tipo', tipo)}) : '';
}
export function etiquetaFamilia({id, nome}) {
  return `<span class="as-etiqueta as-etiqueta--familia" data-familia="${esc(id)}">${icone(id)}${esc(nome)}</span>`;
}
export function avatar({src, alt = '', tamanho = ''}) {
  return `<img class="as-avatar${tamanho ? ` as-avatar--${tamanho}` : ''}" src="${esc(src)}" alt="${esc(alt)}" width="64" height="64">`;
}
export function botao(texto, {href, tom = '', icone: ic = '', iconeFim = '', tamanho = '', bloco = false, testid, pressionado, desativado = false, tipo = 'button', extra = ''} = {}) {
  const cls = ['as-botao', tom && `as-botao--${tom}`, tamanho && `as-botao--${tamanho}`, bloco && 'as-botao--bloco'].filter(Boolean).join(' ');
  const miolo = `${ic ? icone(ic) : ''}${esc(texto)}${iconeFim ? icone(iconeFim) : ''}`;
  const comum = `class="${cls}"${atr('data-testid', testid)}${atr('aria-pressed', pressionado === undefined ? undefined : String(pressionado))}${extra}`;
  return href && !desativado ? `<a ${comum} href="${esc(href)}">${miolo}</a>` : `<button ${comum} type="${tipo}"${desativado ? ' disabled' : ''}>${miolo}</button>`;
}
// acao: {rotulo, href} vira link nas telas paradas; no app é um <button>. fixo: flutua acima da barra de baixo.
export function recado(texto, {icone: ic = 'certo', testid, acao, fixo = false} = {}) {
  const cls = ['as-recado', acao && 'as-recado--acao', fixo && 'as-recado--fixo'].filter(Boolean).join(' ');
  const botaoAcao = acao ? (acao.href ? `<a class="as-recado-acao" href="${esc(acao.href)}"${atr('data-testid', acao.testid)}>${esc(acao.rotulo)}</a>` : `<button class="as-recado-acao" type="button"${atr('data-testid', acao.testid)}>${esc(acao.rotulo)}</button>`) : '';
  return `<p class="${cls}" role="status"${atr('data-testid', testid)}>${icone(ic)}<span>${esc(texto)}</span>${botaoAcao}</p>`;
}
export function aviso({tom = 'info', icone: ic, titulo = '', texto = '', corpoHtml = '', acoesHtml = '', testid, papel = 'note'} = {}) {
  const padrao = {info: 'info', atencao: 'alerta', cuidado: 'alerta', ok: 'certo', avaliacao: 'conversa'}[tom] ?? 'info';
  return `<div class="as-aviso as-aviso--${tom}" role="${papel}"${atr('data-testid', testid)}>${icone(ic ?? padrao)}<div class="as-aviso-corpo">${titulo ? `<p class="as-aviso-titulo">${esc(titulo)}</p>` : ''}${texto ? `<p>${esc(texto)}</p>` : ''}${corpoHtml}${acoesHtml ? `<div class="as-aviso-acoes">${acoesHtml}</div>` : ''}</div></div>`;
}
export function vazio({arte, alt = '', titulo, texto = '', corpoHtml = '', acoesHtml = '', testid, motivo, classe = '', nivel = 2} = {}) {
  return `<section class="as-vazio${classe ? ` ${classe}` : ''}"${atr('data-testid', testid)}${atr('data-reason', motivo)}>${arte ? `<img class="as-vazio-arte" src="${esc(arte)}" alt="${esc(alt)}" width="240" height="180">` : ''}<h${nivel} class="as-titulo-2">${esc(titulo)}</h${nivel}>${texto ? `<p>${esc(texto)}</p>` : ''}${corpoHtml}${acoesHtml ? `<div class="as-vazio-acoes">${acoesHtml}</div>` : ''}</section>`;
}
export function progresso({atual, total, nome = ''}) {
  const pct = Math.round((atual / total) * 100);
  return `<div class="as-progresso"><p class="as-progresso-rotulo"><span>Pergunta ${atual} de ${total}</span>${nome ? `<span>${esc(nome)}</span>` : ''}</p><div class="as-progresso-trilho" role="progressbar" aria-label="Andamento do quiz" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${atual}"><span class="as-progresso-valor" style="--as-valor:${pct}%"></span></div></div>`;
}

// ── Quiz ──────────────────────────────────────────────────────────────
// tipo: 'single' (rádio) ou 'multi' (caixa). neutra: "Não sei", "Nenhum", "Prefiro não dizer".
// arte: caminho de um adesivo pintado; numero: texto curto grande ("5", "2+"). Com um dos dois, ou com visual na pergunta, a opção vira um bloco.
export function opcao({nome, valor, rotulo, dica = '', tipo = 'single', marcada = false, neutra = false, familia = '', icone: ic = '', arte = '', numero = '', classe = '', obrigatoria = false, desativada = false, testid}) {
  const marca = `<span class="as-opcao-marca">${icone('certo')}</span>`;
  const figura = arte ? `<span class="as-opcao-arte"><img src="${esc(arte)}" alt="" width="96" height="96" loading="lazy"></span>` : numero ? `<span class="as-opcao-numero">${esc(numero)}</span>` : ic ? `<span class="as-opcao-icone"${atr('data-familia', familia || undefined)}>${icone(ic)}</span>` : '';
  return `<label class="as-opcao${neutra ? ' as-opcao--neutra' : ''}${classe ? ` ${esc(classe)}` : ''}"><input type="${tipo === 'multi' ? 'checkbox' : 'radio'}" name="${esc(nome)}" value="${esc(valor)}"${marcada ? ' checked' : ''}${desativada ? ' disabled' : ''}${obrigatoria && tipo !== 'multi' ? ' required' : ''}${atr('data-testid', testid)}><span class="as-opcao-caixa">${figura || marca}<span class="as-opcao-texto"><span class="as-opcao-nome">${esc(rotulo)}</span>${dica ? `<span class="as-opcao-dica">${esc(dica)}</span>` : ''}</span>${figura ? marca : ''}</span></label>`;
}
// visual: as opções viram blocos em duas colunas, com adesivo (arte), número ou ícone em cima e o nome embaixo. Não use em risco, diagnóstico e suporte.
export function pergunta({chave, titulo, principal = false, dica = '', tipo = 'single', opcoes = [], neutras = [], valor, duas = false, menor = false, obrigatoria = true, visual = false}) {
  const marcada = v => (Array.isArray(valor) ? valor.includes(v) : valor === v);
  const fazer = (o, neutra) => opcao({nome: chave, valor: o.valor, rotulo: o.rotulo, dica: o.dica, icone: o.icone, familia: o.familia, arte: neutra ? '' : o.arte, numero: neutra ? '' : o.numero, classe: visual && !neutra ? 'as-g-opcao' : '', desativada: o.desativada, tipo: neutra && tipo === 'multi' ? 'multi' : tipo, marcada: marcada(o.valor), neutra, obrigatoria});
  return `<fieldset class="as-pergunta" data-testid="quiz-${esc(chave)}"><legend class="as-pergunta-titulo${menor ? ' as-pergunta-titulo--menor' : ''}">${principal ? `<h1>${esc(titulo)}</h1>` : esc(titulo)}</legend>${dica ? `<p class="as-pergunta-dica">${esc(dica)}</p>` : ''}<div class="as-opcoes${duas ? ' as-opcoes--duas' : ''}${visual ? ' as-opcoes--visual' : ''}">${opcoes.map(o => fazer(o, false)).join('')}</div>${neutras.length ? `<div class="as-opcoes-neutras">${neutras.map(o => fazer(o, true)).join('')}</div>` : ''}</fieldset>`;
}

// ── Card resumido ─────────────────────────────────────────────────────
// card: objeto do banco. familia: {id, nome}. imagem: {src, alt}. porque: frase do motor (explanation[0]).
// modo: '' | 'destaque' | 'compacto'. consulta: card fora do perfil (só leitura), com motivo.
// nivel: nível do título do card (2 logo abaixo do título da tela; 3 dentro de uma seção com título próprio).
// marca: etiqueta curta no pé do card, como "Usado ontem".
// prefixo: início do data-testid. 'kit-item' só para os itens do kit; fora dele passe outro (ex.: 'alt-item').
// No resumo a imagem é decorativa (alt vazio): o título já diz o que é. A descrição vai no card aberto.
// porque: uma frase curta. No kit cabe em até três linhas; no modo compacto o rótulo vira "Para <criança>:" e o texto fica em até duas.
export function cardResumo({card, familia, imagem, porque = '', href, modo = '', selo = '', consulta = false, motivo = '', salvo = false, materiais = [], crianca = '', prefixo = 'kit-item', nivel = 2, marca = ''}) {
  const cls = ['as-card', modo && `as-card--${modo}`, consulta && 'as-card--consulta'].filter(Boolean).join(' ');
  const fatos = [Number.isFinite(card.contexto?.tempo_min) ? `<li>${icone('relogio')}${esc(card.contexto.tempo_min)} min</li>` : '' , materiais.length ? `<li>${icone('materiais')}${esc(materiais.join(', '))}</li>` : ''].join('');
  const linha = consulta
    ? `<p class="as-card-porque as-card-porque--atencao">${icone('info')}<span><b>Só para consulta.</b> ${esc(motivo)}</span></p>`
    : porque ? `<p class="as-card-porque" data-testid="kit-why-${esc(card.id)}">${icone('porque')}<span><b>${modo === 'compacto' && crianca ? `Para ${esc(crianca)}` : `Por que apareceu${crianca ? ` para ${esc(crianca)}` : ''}`}:</b> ${esc(porque)}</span></p>` : '';
  return `<article class="${cls}" data-familia="${esc(familia.id)}" data-testid="${esc(prefixo)}-${esc(card.id)}">${modo === 'compacto' ? '' : `<p class="as-card-aba">${icone(familia.id)}<span>${esc(familia.nome)}</span></p>`}<div class="as-card-arte"><img src="${esc(imagem.src)}" alt="" width="320" height="200" loading="lazy">${selo ? `<span class="as-card-selo">${etiqueta(selo, {icone: 'faisca', tom: 'destaque'})}</span>` : ''}</div><div class="as-card-corpo">${modo === 'compacto' ? `<p>${etiquetaFamilia(familia)}</p>` : ''}<h${nivel} class="as-card-titulo"><a href="${esc(href)}">${esc(card.titulo)}</a></h${nivel}>${modo === 'compacto' ? '' : `<p class="as-card-objetivo">${esc(card.objetivo)}</p>`}<ul class="as-fatos">${fatos}</ul>${linha}<p class="as-card-pe"><span class="as-card-chamada">${consulta ? 'Ver conteúdo e limites' : 'Ver como começar'}${icone('seta-direita')}</span>${marca ? etiqueta(marca, {tom: 'contorno'}) : ''}${salvo ? etiqueta('Salvo', {icone: 'salvos-cheio'}) : ''}</p></div></article>`;
}

// ── Card aberto: abas ─────────────────────────────────────────────────
// itens: [{id, rotulo, icone, href}]. Com href vira link (rota ou página); sem href vira botão com data-aba.
export function abas({itens, ativa, rotulo = 'Partes do card'}) {
  return `<div class="as-abas" role="tablist" aria-label="${esc(rotulo)}">${itens.map(i => {
    const comum = `class="as-aba" role="tab" id="aba-${esc(i.id)}" aria-controls="painel-${esc(i.id)}" aria-selected="${i.id === ativa}"${atr('data-testid', i.testid)}`;
    const miolo = `${icone(i.icone)}<span>${esc(i.rotulo)}</span>`;
    return i.href ? `<a ${comum} href="${esc(i.href)}">${miolo}</a>` : `<button ${comum} type="button" data-aba="${esc(i.id)}">${miolo}</button>`;
  }).join('')}</div>`;
}
export const nota = (texto, {icone: ic = 'info', testid} = {}) => `<p class="as-nota"${atr('data-testid', testid)}>${icone(ic)}<span>${esc(texto)}</span></p>`;
export const FRASE_ACOMPANHAMENTO = 'Se a criança tem acompanhamento, a orientação do profissional vem antes desta sugestão.';
export const painel = (id, html) => `<section class="as-painel" role="tabpanel" id="painel-${esc(id)}" aria-labelledby="aba-${esc(id)}" tabindex="0">${html}</section>`;
export const passos = lista => `<ol class="as-passos">${lista.map(p => `<li><span>${esc(p)}</span></li>`).join('')}</ol>`;
export function lista(itens, {tom = '', icone: ic = 'certo'} = {}) {
  return `<ul class="as-lista${tom ? ` as-lista--${tom}` : ''}">${itens.map(t => `<li><span class="as-lista-marca">${icone(ic)}</span><span>${esc(t)}</span></li>`).join('')}</ul>`;
}
// ── Texto que abre e "Antes de começar" (v1.3) ────────────────────────
// detalhe(): trecho fechado que abre com um toque. É um <details>: funciona sem JavaScript e com teclado.
// paragrafos: textos simples (passam por esc). corpoHtml: HTML pronto, no lugar deles. solto: com linha acima e abaixo.
export function detalhe({rotulo, paragrafos = [], corpoHtml = '', aberto = false, solto = false, testid} = {}) {
  const corpo = corpoHtml || paragrafos.filter(Boolean).map(t => `<p>${esc(t)}</p>`).join('');
  return `<details class="as-detalhe${solto ? ' as-detalhe--solto' : ''}"${atr('open', aberto)}${atr('data-testid', testid)}><summary><span>${esc(rotulo)}</span>${icone('divisa-baixo')}</summary><div class="as-detalhe-corpo">${corpo}</div></details>`;
}
// preparo(): o que conferir antes do passo 1, em até três linhas curtas.
// itens: [{icone, texto}], uma frase por linha. limites: os textos completos, que ficam fechados logo abaixo.
// Regra de uso: nada do texto de limites se perde; ele só sai da frente dos passos.
export function preparo({titulo = 'Antes de começar', itens = [], limites = [], rotuloLimites = 'Limites desta sugestão', nivel = 2, testid = 'card-prep'} = {}) {
  const linhas = itens.filter(i => i && i.texto).map(i => `<li>${icone(i.icone || 'certo')}<span>${esc(i.texto)}</span></li>`).join('');
  const textos = limites.filter(Boolean);
  const fechado = textos.length ? detalhe({rotulo: rotuloLimites, paragrafos: textos, testid: `${testid}-limits`}) : '';
  return `<section class="as-preparo"${atr('data-testid', testid)}><h${nivel} class="as-preparo-titulo">${esc(titulo)}</h${nivel}><ul class="as-preparo-itens">${linhas}</ul>${fechado}</section>`;
}
export function fonte(f) {
  const conf = f.conferencia === 'conferida' ? etiqueta('Link conferido', {icone: 'certo', tom: 'ok'}) : etiqueta('Link a conferir', {icone: 'relogio', tom: 'atencao'});
  const titulo = f.url ? `<a href="${esc(f.url)}" rel="noopener noreferrer" target="_blank">${esc(f.titulo)} ${icone('link-externo', {rotulo: 'abre em outra aba'})}</a>` : esc(f.titulo);
  return `<div class="as-fonte"><p class="as-fonte-titulo">${titulo}</p><p class="as-fonte-meta">${conf}${f.ano ? `<span>${esc(f.ano)}</span>` : ''}${f.tipo ? `<span>${esc(TIPOS_DE_FONTE[f.tipo] ?? String(f.tipo).replace(/_/g, ' '))}</span>` : ''}</p>${f.populacao ? `<p class="as-miudo"><b>Para quem a fonte fala:</b> ${esc(f.populacao)}</p>` : ''}${f.sustenta ? `<p class="as-miudo"><b>O que ela sustenta:</b> ${esc(f.sustenta)}</p>` : ''}</div>`;
}
export function adaptacao({mudanca, mode, because = ''}) {
  const aplicada = mode === 'aplicada';
  return `<div class="as-adaptacao${aplicada ? ' as-adaptacao--aplicada' : ''}"><p>${aplicada ? etiqueta('Já vale para este perfil', {icone: 'certo', tom: 'ok'}) : etiqueta('Você escolhe se usa', {icone: 'adaptar', tom: 'contorno'})}</p><p>${esc(mudanca)}</p>${because ? `<p class="as-miudo">${esc(because)}</p>` : ''}</div>`;
}
// href: só para telas paradas, onde a escolha leva a outra página.
export function escolha({tipo, pressionada = false, href}) {
  const r = RETORNOS[tipo];
  const html = `<button class="as-escolha" type="button" data-testid="card-feedback-${esc(tipo)}" aria-pressed="${pressionada}"><span class="as-escolha-icone">${icone(r.icone)}</span><span class="as-escolha-texto"><span class="as-escolha-nome">${esc(r.rotulo)}</span><span class="as-escolha-dica">${esc(r.dica)}</span></span>${icone('certo', {classe: 'as-escolha-marca'})}</button>`;
  return href ? html.replace('<button class="as-escolha" type="button"', `<a class="as-escolha" role="button" href="${esc(href)}"`).replace(/<\/button>$/, '</a>') : html;
}
export function filtro({rotulo, icone: ic = '', pressionado = false, href, familia = '', testid}) {
  const comum = `class="as-filtro" aria-pressed="${pressionado}"${atr('data-familia', familia || undefined)}${atr('data-testid', testid)}`;
  const miolo = `${icone('certo', {classe: 'as-filtro-marca'})}${ic ? icone(ic) : ''}${esc(rotulo)}`;
  return href ? `<a ${comum} role="button" href="${esc(href)}">${miolo}</a>` : `<button ${comum} type="button">${miolo}</button>`;
}

// ── Moldura da página ─────────────────────────────────────────────────
// rota: 'home' | 'explore' | 'saved' | 'profiles' | 'help' | '' (nenhuma marcada).
// semNav: sem a barra de baixo (boas-vindas, quiz, erro). semRodape: sem o rodapé (boas-vindas, montando o kit).
// crianca: {nome, avatar} ou null. base: {design, ilustracoes}. links: troca os destinos (padrão: rotas #/…).
export function moldura({rota = '', appLinks = false, crianca = null, conteudoHtml, base = {design: '../design', ilustracoes: '../ilustracoes'}, links = ROTAS, semNav = false, semRodape = false, estreito = false, largo = false}) {
  const L = {...ROTAS, ...links};
  const nav = semNav ? '' : `<nav class="as-nav" aria-label="Principal">${NAV.map(([r, ic, t]) => `<a class="as-nav-item" href="${esc(L[r])}"${r === rota ? ' aria-current="page"' : ''}>${icone(ic)}<span>${t}</span></a>`).join('')}</nav>`;
  const seletor = crianca
    ? `<a class="as-crianca-ativa" href="${esc(L.profiles)}" data-testid="active-child" aria-label="Criança ativa: ${esc(crianca.nome)}. Trocar de criança">${avatar({src: crianca.avatar, tamanho: 'p'})}<span class="as-crianca-ativa-texto"><span class="as-crianca-ativa-rotulo">Criança ativa</span><span class="as-crianca-ativa-nome">${esc(crianca.nome)}</span></span>${icone('trocar')}</a>`
    : '';
  return `<a class="as-pular" href="#conteudo">Pular para o conteúdo</a>
<header class="as-topo"><a class="as-marca" href="${esc(L.inicio)}"><img src="${esc(base.design)}/marca/simbolo.svg" alt="" width="40" height="40">Agora Sei</a><div class="header-tools">${appLinks && rota!=='apoio' ? `<a class="support-link" href="#/apoio">${icone('ajuda')} Apoio agora</a>` : ''}${seletor}</div></header>
<div class="as-moldura${semNav ? ' as-moldura--sem-nav' : ''}">${nav}<main class="as-conteudo${estreito ? ' as-conteudo--estreito' : ''}" id="conteudo" tabindex="-1">${conteudoHtml}</main></div>
${semRodape ? '' : `<footer class="as-rodape${semNav ? ' as-rodape--sem-nav' : ''}">${appLinks ? `${rota==='welcome'||rota==='situacoes'||(rota==='home'&&!crianca)?'':'<a href="#/situacoes">Situações</a>'}<a href="#/help">Quero ajuda profissional</a><a href="../index.html">Sobre o Agora Sei</a>` : ''}${(!appLinks||crianca||rota==='reset')?`<a class="as-link" href="${esc(L.reset ?? '#/reset')}" data-testid="reset">Apagar dados do app</a>`:''}</footer>`}`;
}

// ══ v1.1 · Satisfação ══════════════════════════════════════════════════
// agora: true só na renderização logo depois do gesto. É o que liga a animação; ao recarregar, fica parado.
const ONDAS = (() => { const n = 14, r = 30.5, R = 37.5, c = 36; const P = (a, rad) => `${(c + rad * Math.cos(a)).toFixed(2)} ${(c + rad * Math.sin(a)).toFixed(2)}`; let d = `M${P(0, r)}`; for (let i = 0; i < n; i++) d += `Q${P(((i + 0.5) / n) * 2 * Math.PI, R)} ${P(((i + 1) / n) * 2 * Math.PI, r)}`; return d + 'Z'; })();
// Carimbo: uma tentativa registrada. rotulo: "Tentamos"; data: "17 nov".
export const carimbo = ({rotulo, data = '', familia = '', agora = false}) => `<span class="as-carimbo${agora ? ' as-agora' : ''}"${atr('data-familia', familia || undefined)}><span>${esc(rotulo)}</span>${data ? `<small>${esc(data)}</small>` : ''}</span>`;
// Selo: um marco. feito=false desenha só o contorno, sem cadeado e sem "falta tanto".
export const selo = ({icone: ic = 'certo', feito = true, agora = false}) => `<span class="as-selo${feito ? '' : ' as-selo--porvir'}${agora ? ' as-agora' : ''}"><svg viewBox="0 0 72 72" aria-hidden="true" focusable="false"><path class="as-selo-papel" d="${ONDAS}"/><circle class="as-selo-anel" cx="36" cy="36" r="24"/></svg>${icone(ic)}</span>`;
const PAPEIS = [['3%', '9%', '-18deg', 'var(--as-emocoes-cor)'], ['4.5%', '80%', '24deg', 'var(--as-noite-cor)'], ['93%', '7%', '14deg', 'var(--as-transicoes-cor)'], ['91%', '80%', '-22deg', 'var(--as-autonomia-cor)'], ['96.5%', '42%', '32deg', 'var(--as-noite-cor)']];
// Marco: aparece uma vez, no gesto que cruzou o marco. Não ocupa a tela nem trava nada.
// arteHtml (v2.0): uma peça pintada de design/movimento.mjs, como gCarimbo() dentro de gConfete(). Entra no lugar do selo e dos papéis.
export function marco({icone: ic = 'certo', titulo, texto = '', acaoHtml = '', agora = false, testid, arteHtml = ''}) {
  return `<div class="as-marco${arteHtml ? ' as-marco--pintado' : ''}${agora ? ' as-agora' : ''}" role="status"${atr('data-testid', testid)}>${arteHtml || `<span class="as-marco-papeis" aria-hidden="true">${PAPEIS.map(([x, y, r, c], i) => `<i style="left:${x};top:${y};--_r:${r};--_c:${c};--_i:${i}"></i>`).join('')}</span>${selo({icone: ic})}`}<div class="as-marco-texto"><p class="as-marco-titulo">${esc(titulo)}</p>${texto ? `<p>${esc(texto)}</p>` : ''}${acaoHtml}</div></div>`;
}
export const contagens = itens => `<ul class="as-contagens">${itens.map(([n, r]) => `<li class="as-contagem"><span class="as-contagem-numero">${esc(n)}</span><span class="as-contagem-rotulo">${esc(r)}</span></li>`).join('')}</ul>`;
// linhas: [{rotulo, data, familia, titulo, nota, agora}]
export function registro({titulo, lado = '', linhas, testid}) {
  return `<div class="as-registro"${atr('data-testid', testid)}><p class="as-registro-cabeca"><span>${esc(titulo)}</span>${lado ? `<span>${esc(lado)}</span>` : ''}</p><ol class="as-registro-linhas">${linhas.map(l => `<li${l.agora ? ' class="as-agora"' : ''}>${carimbo({rotulo: l.rotulo, data: l.data, familia: l.familia})}<div><p><b>${esc(l.titulo)}</b></p>${l.nota ? `<p class="as-miudo">${esc(l.nota)}</p>` : ''}</div></li>`).join('')}</ol></div>`;
}
// marcos: [{icone, nome, quando, feito}]. quando: a data, ou a frase do que é o marco.
export const marcos = lista => `<ul class="as-marcos">${lista.map(m => `<li>${selo({icone: m.icone, feito: m.feito})}<span><b>${esc(m.nome)}</b>${esc(m.quando)}</span></li>`).join('')}</ul>`;
// Contexto de hoje, em uma linha: o que o app está usando para escolher. itens: [{icone, texto}]
export const contexto = ({itens, href, rotulo = 'Mudar', testid = 'context-open'}) => `<p class="as-contexto"><span class="as-so-leitor">Vale para hoje: </span>${itens.map(i => etiqueta(i.texto, {icone: i.icone, tom: 'contorno'})).join('')}<a class="as-link" href="${esc(href)}"${atr('data-testid', testid)}>${esc(rotulo)}${icone('seta-direita')}</a></p>`;
// Bilhete: a prévia do texto que será repassado. O texto entra escapado, sempre.
export const bilhete = ({rotulo = 'Prévia do texto', lado = '', texto, testid = 'share-preview'}) => `<div><p class="as-bilhete-rotulo"><span>${esc(rotulo)}</span>${lado ? `<span>${esc(lado)}</span>` : ''}</p><pre class="as-bilhete" tabindex="0"${atr('data-testid', testid)}>${esc(texto)}</pre></div>`;
export function plano({nome, selo: s = '', resumo = '', itensHtml = '', acoesHtml = '', atual = false, testid}) {
  return `<section class="as-plano${atual ? ' as-plano--atual' : ''}"${atr('data-testid', testid)}><div class="as-plano-cabeca"><h2 class="as-plano-nome">${esc(nome)}</h2>${s}</div>${resumo ? `<p class="as-suave">${esc(resumo)}</p>` : ''}${itensHtml}${acoesHtml}</section>`;
}
export const convite = ({titulo, texto = '', acoesHtml = '', testid = 'plan-invite'}) => `<aside class="as-convite"${atr('data-testid', testid)}><p class="as-convite-titulo">${esc(titulo)}</p>${texto ? `<p class="as-suave">${esc(texto)}</p>` : ''}<div class="as-vazio-acoes" style="justify-content:flex-start">${acoesHtml}</div></aside>`;
export const miniFicha = ({imagem, titulo, nota = '', familia = ''}) => `<div class="as-mini-ficha"${atr('data-familia', familia || undefined)}><img src="${esc(imagem)}" alt="" width="60" height="60" loading="lazy"><div><p class="as-mini-ficha-titulo">${esc(titulo)}</p>${nota ? `<p class="as-mini-ficha-nota">${esc(nota)}</p>` : ''}</div></div>`;
// Mude uma resposta: rádios nativos, sem script. estados: [{rotulo, icone, efeitoHtml, fichas: [...], vazio: {titulo, nota}}], até 4.
export function troca({nome, titulo, estados}) {
  const entradas = estados.map((e, i) => `<input type="radio" name="${esc(nome)}" id="${esc(nome)}-${i + 1}"${i === 0 ? ' checked' : ''}><label for="${esc(nome)}-${i + 1}">${e.icone ? icone(e.icone) : ''}${esc(e.rotulo)}</label>`).join('');
  const saida = estados.map(e => `<div class="as-troca-estado"><p class="as-troca-efeito">${icone(e.efeitoIcone ?? 'trocar')}<span>${e.efeitoHtml}</span></p>${(e.fichas ?? []).map(miniFicha).join('')}${e.vazio ? `<div class="as-mini-ficha as-mini-ficha--vazia"><div><p class="as-mini-ficha-titulo">${esc(e.vazio.titulo)}</p><p class="as-mini-ficha-nota">${esc(e.vazio.nota)}</p></div></div>` : ''}</div>`).join('');
  return `<div class="as-troca" role="radiogroup" aria-labelledby="${esc(nome)}-t"><p class="as-troca-titulo" id="${esc(nome)}-t">${esc(titulo)}</p>${entradas}<div class="as-troca-saida">${saida}</div></div>`;
}
