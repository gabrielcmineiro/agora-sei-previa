// Sistema de design: biblioteca de movimento em guache.
// Monta uma ficha por peça de DEMOS (só se a página ainda não trouxer as fichas prontas) e liga dois botões:
// "Tocar de novo" tira e põe de volta a classe as-agora e recomeça as animações daquela amostra;
// "Pausar tudo" congela laços e chegadas. No app nada disso existe: lá, as-agora entra uma vez só.
import {DEMOS} from '../movimento.mjs';

const GRUPOS = [
  ['carregamento', 'Carregamento', 'Espera com tinta: a pessoa vê que algo está acontecendo, e o leitor de tela ouve o que é.'],
  ['microinteracoes', 'Microinterações', 'A resposta ao toque e ao estado que muda. Curta, para não atrasar ninguém.'],
  ['pequenas-vitorias', 'Pequenas vitórias', 'Uma vez só, no gesto que mereceu. Nunca em aviso de risco, desconforto ou tela sem sugestão.'],
  ['cantinhos-e-detalhes', 'Cantinhos e detalhes', 'O capricho que fica: quase sempre parado, sempre atrás do conteúdo.'],
];
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));

function cartao(d, n) {
  return `<article class="mb-peca" id="peca-${esc(d.id)}"><div class="as-app ds-amostra mb-palco" data-palco>${d.html}</div><div class="mb-texto"><h3><span class="mb-num">${n}</span>${esc(d.nome)}</h3><p>${esc(d.quando)}</p><p class="mb-ficha"><code>.${esc(d.classe)}</code><span>${esc(d.duracao)}</span><span>${esc(d.repete)}</span></p></div><button class="as-botao as-botao--pequeno mb-tocar" type="button" data-tocar>Tocar de novo<span class="ds-so-leitor">: ${esc(d.nome)}</span></button></article>`;
}

function montar(alvo) {
  let n = 0;
  alvo.innerHTML = GRUPOS.map(([id, nome, texto]) => {
    const pecas = DEMOS.filter(d => d.grupo === nome);
    return `<section class="ds-secao" id="${id}"><h2>${esc(nome)}</h2><p>${esc(texto)}</p><div class="mb-grade">${pecas.map(d => cartao(d, ++n)).join('')}</div></section>`;
  }).join('');
}

function tocar(palco) {
  const marcados = [palco, ...palco.querySelectorAll('.as-agora')].filter(el => el.classList.contains('as-agora'));
  marcados.forEach(el => el.classList.remove('as-agora'));
  void palco.offsetWidth;
  marcados.forEach(el => el.classList.add('as-agora'));
  palco.getAnimations?.({subtree: true}).forEach(a => { a.cancel(); a.play(); });
  if (document.body.hasAttribute('data-pausado')) palco.setAttribute('data-solto', '');
}

const alvo = document.querySelector('[data-demos]');
if (alvo && alvo.querySelectorAll('[data-palco]').length !== DEMOS.length) montar(alvo);

document.addEventListener('click', (e) => {
  const botao = e.target.closest('[data-tocar]');
  if (botao) { const palco = botao.closest('.mb-peca')?.querySelector('[data-palco]'); if (palco) tocar(palco); return; }
  const pausar = e.target.closest('[data-pausar]');
  if (!pausar) return;
  const pausado = document.body.toggleAttribute('data-pausado');
  document.querySelectorAll('[data-solto]').forEach(el => el.removeAttribute('data-solto'));
  pausar.setAttribute('aria-pressed', String(pausado));
});
