const comparison = document.querySelector('.kit-preview');
const options = JSON.parse(comparison.querySelector('#kit-choices').content.textContent);
const gallery = comparison.querySelector('#kit-gallery').content;
const topic = comparison.querySelector('[name="example-focus"]');
const announcement = comparison.querySelector('#kit-announcement');

function showKits() {
  const labels = [];
  for (const column of comparison.querySelectorAll('[data-column]')) {
    const age = column.querySelector('select').value;
    const id = options[age + '/' + topic.value];
    let content;
    if (id) {
      content = gallery.querySelector('[data-card="' + CSS.escape(id) + '"]').cloneNode(true);
      labels.push(age + ' anos, ' + content.querySelector('strong').textContent);
    } else {
      content = document.createElement('p');
      content.className = 'kit-empty';
      content.textContent = 'Ainda não há ficha para esse desafio aos ' + age + ' anos. Você pode escolher outra idade ou outro desafio.';
      labels.push(age + ' anos, sem ficha para este desafio');
    }
    column.querySelector('.kit-result').replaceChildren(content);
  }
  announcement.textContent = topic.selectedOptions[0].text + '. ' + labels.join(' · ');
}

comparison.addEventListener('change', showKits);
for (const select of comparison.querySelectorAll('select')) select.disabled = false;
showKits();

const response = document.querySelector('.store-response');
for (const badge of document.querySelectorAll('[data-store]')) {
  badge.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    response.textContent = 'O download ' + (badge.dataset.store === 'App Store' ? 'na App Store' : 'no Google Play') + ' ainda não está disponível.';
  });
}
