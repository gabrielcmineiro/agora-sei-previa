// These forms are visual examples. Only the destination page is part of navigation.
document.addEventListener('submit', event => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;
  event.preventDefault();
  if (form.getAttribute('aria-disabled') === 'true') return;
  const page = form.getAttribute('action') || '';
  if (/^[a-z0-9][a-z0-9-]*\.html$/.test(page)) {
    window.location.assign(new URL(page, window.location.href).href);
  }
});
