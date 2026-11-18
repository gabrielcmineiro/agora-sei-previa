// Sistema de design: os laços de vídeo só tocam à vista e nunca com movimento reduzido.
(() => {
  const videos = [...document.querySelectorAll('video[data-laco]')];
  if (!videos.length) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) { videos.forEach((v) => { v.controls = true; }); return; }
  const olho = new IntersectionObserver((entradas) => {
    for (const e of entradas) { if (e.isIntersecting) e.target.play().catch(() => { e.target.controls = true; }); else e.target.pause(); }
  }, { threshold: 0.35 });
  videos.forEach((v) => olho.observe(v));
})();
