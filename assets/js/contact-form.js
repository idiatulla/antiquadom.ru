(function () {
  var form = document.getElementById('contact-form');
  if (!form) return;
  var status = document.getElementById('contact-status');
  var btn = document.getElementById('contact-submit');

  function say(text, ok) {
    status.textContent = text;
    status.style.color = ok ? '#9fe6a8' : '#ffb4b4';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var data = {};
    new FormData(form).forEach(function (v, k) { data[k] = v; });

    if (!String(data.name || '').trim()) return say('Укажите, как вас зовут.', false);
    if (String(data.phone || '').replace(/\D/g, '').length < 5) return say('Укажите телефон для связи.', false);

    btn.disabled = true;
    say('Отправляем…', true);
    fetch(form.action, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, body: j }; });
    }).then(function (res) {
      if (res.ok) {
        form.reset();
        say('Спасибо! Заявка отправлена, мы свяжемся с вами в ближайшее время.', true);
      } else {
        say(res.body.error || 'Не удалось отправить заявку. Попробуйте позже или позвоните нам.', false);
      }
    }).catch(function () {
      say('Не удалось отправить заявку. Проверьте соединение и попробуйте ещё раз.', false);
    }).then(function () { btn.disabled = false; });
  });
})();
