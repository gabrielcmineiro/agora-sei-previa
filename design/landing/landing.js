// Agora Sei — landing page. Sem este arquivo a página continua inteira:
// as telas dos passos aparecem uma embaixo da outra e nada fica escondido.
(() => {
  const raiz = document.documentElement;
  if (!('IntersectionObserver' in window)) return;
  raiz.classList.add('lp-js');

  // Entrada suave do que está abaixo da primeira dobra.
  const revela = new IntersectionObserver((entradas) => {
    for (const e of entradas) if (e.isIntersecting) { e.target.classList.add('lp-visto'); revela.unobserve(e.target); }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  document.querySelectorAll('.lp-revela').forEach((el) => revela.observe(el));

  // Como funciona: o celular fixo troca de tela conforme o passo que está no meio da janela.
  const grade = document.querySelector('.lp-passos-grade');
  if (grade) {
    const passos = [...grade.querySelectorAll('.lp-passo')];
    const meio = new IntersectionObserver((entradas) => {
      for (const e of entradas) if (e.isIntersecting) grade.dataset.passo = String(passos.indexOf(e.target) + 1);
    }, { rootMargin: '-45% 0px -45% 0px' });
    passos.forEach((p) => meio.observe(p));
  }

  // Mude uma resposta: passa sozinho pelas quatro respostas enquanto está à vista.
  // Para de vez no primeiro toque ou tecla, e não começa com movimento reduzido.
  const troca = document.querySelector('.lp-troca .as-troca');
  if (troca && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const radios = [...troca.querySelectorAll('input[type="radio"]')];
    let relogio = 0, parou = false;
    const parar = () => { parou = true; clearInterval(relogio); };
    for (const ev of ['pointerdown', 'keydown']) troca.addEventListener(ev, parar, { once: true });
    new IntersectionObserver(([e]) => {
      clearInterval(relogio);
      if (e.isIntersecting && !parou) relogio = setInterval(() => { radios[(radios.findIndex((r) => r.checked) + 1) % radios.length].checked = true; }, 3400);
    }, { threshold: 0.6 }).observe(troca);
  }
})();
