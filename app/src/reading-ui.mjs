import {esc, icone} from '../../design/marcacao.mjs';
import {gSalvar} from '../../design/movimento.mjs';
import {editions} from './reading.mjs';

export function readerHead(card, back, facts, art, favorite, animation) {
  const save = gSalvar({salvo:favorite, agora:animation, rotulo:favorite?'Salva':'Salvar',testid:'card-save'})
    .replace('<button ', `<button data-action="favorite:${esc(card.id)}" aria-label="${favorite?'Remover dos salvos':'Salvar ficha'}" `);
  return `<div class="reader-tools">${back}${save}</div>
    <header class="reading-intro"><div class="reading-intro-text">
    <p class="reading-facts">${esc(facts)}</p><h1>${esc(card.titulo)}</h1>
    <p class="reading-purpose">${esc(card.objetivo)}</p></div>
    <img src="${art.src}" alt="" width="240" height="180"></header>`;
}

export function examples(card) {
  const edit=editions[card.id];
  if(!edit) return '';
  return `<section class="reading-examples"><h2>Na prática</h2>${edit.examples.map(([scene,text]) =>
    `<div><h3>${esc(scene)}</h3><p>${esc(text)}</p></div>`).join('')}</section>`;
}

export function originNote(card) {
  const edit=editions[card.id];
  if(!edit?.source) return '';
  return `<section class="reading-origin"><h3>${esc(edit.technical)}</h3><p>${esc(edit.source)}</p>
    <a href="${esc(edit.url)}" rel="noopener noreferrer" target="_blank">Ler a orientação do CDC ${icone('link-externo',{rotulo:'abre em outra aba'})}</a></section>`;
}

const parents = {situacoes:'explore', situacao:'explore', path:'saved', edit:'profiles', add:'profiles',
  delete:'profiles', reset:'profiles', context:'home', coverage:'home', apoio:'help', plans:'help'};
export function readingSection(route, origin) {
  if(route==='card') return readingSection(origin?.path?.split('/')[0] || 'explore');
  return parents[route] || route;
}
