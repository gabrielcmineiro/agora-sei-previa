// Os resultados já vêm da mesma seleção por idade e foco usada no app.
const controls = document.querySelector('.kit-controls');
const options = JSON.parse(document.querySelector('#kit-choices').content.textContent);
const examples = document.querySelector('#kit-examples');
const gallery = document.querySelector('#kit-gallery').content;
const announcement = document.querySelector('#kit-announcement');
const age = controls.querySelector('[name="example-age"]');
const focus = controls.querySelector('[name="example-focus"]');

function showExample() {
  const ids = options[age.value + '/' + focus.value];
  const links = ids.map(id => gallery.querySelector('[data-card="' + CSS.escape(id) + '"]').cloneNode(true));
  const description = age.selectedOptions[0].text + ' · ' + focus.selectedOptions[0].text;
  if (!links.length) {
    const message = document.createElement('p');
    message.className = 'kit-empty';
    message.textContent = 'Ainda não há uma ficha para esse desafio nessa idade. Escolha outro desafio para ver um exemplo.';
    examples.replaceChildren(message);
    announcement.textContent = description + '. ' + message.textContent;
    return;
  }
  examples.replaceChildren(...links);
  const titles = links.map(link => link.querySelector('strong').textContent);
  announcement.textContent = description + '. ' + titles.join(' · ');
}
controls.addEventListener('change', showExample);
controls.disabled = false;
if (age.value !== '3' || focus.value !== 'transicoes') showExample();
