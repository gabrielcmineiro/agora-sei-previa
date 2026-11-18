// Sistema de design: "Tocar de novo" repete o movimento das amostras.
// No app isto não existe: a classe as-agora entra uma vez, na renderização que vem logo depois do gesto.
(() => {
  document.addEventListener('click', (e) => {
    const botao = e.target.closest('[data-tocar]');
    if (!botao) return;
    const palco = botao.closest('.ds-amostra')?.querySelector('[data-anima]');
    if (!palco) return;
    const copia = palco.cloneNode(true);
    palco.replaceWith(copia);
  });
})();
