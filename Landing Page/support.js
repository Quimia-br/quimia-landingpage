const SUPPORT_EMAIL = 'quimia.app@gmail.com';

// Origem do acesso: define a landing de volta e o perfil já marcado
(() => {
  const isCompany = new URLSearchParams(window.location.search).get('origem') === 'empresa';
  const homeUrl = isCompany ? 'business.html' : 'index.html';

  document.getElementById('support-home').href = homeUrl;
  document.getElementById('support-back').href = homeUrl;

  if (isCompany) {
    document.querySelector('input[name="audience"][value="Empresa"]').checked = true;
  }
})();

// Formulário de atendimento
(() => {
  const form = document.getElementById('support-form');
  const reason = document.getElementById('reason');
  const message = document.getElementById('message');
  const consent = document.getElementById('consent');
  const counter = document.getElementById('message-count');
  const status = document.getElementById('support-status');
  const minMessageLength = 10;

  const rules = [
    { input: reason, field: 'field-reason', error: 'reason-error', isValid: () => reason.value !== '' },
    { input: message, field: 'field-message', error: 'message-error', isValid: () => message.value.trim().length >= minMessageLength },
    { input: consent, field: 'field-consent', error: 'consent-error', isValid: () => consent.checked }
  ];

  const setError = (rule, hasError) => {
    document.getElementById(rule.field).classList.toggle('has-error', hasError);
    document.getElementById(rule.error).hidden = !hasError;
    rule.input.setAttribute('aria-invalid', String(hasError));
  };

  rules.forEach((rule) => {
    const eventName = rule.input.tagName === 'INPUT' || rule.input.tagName === 'SELECT' ? 'change' : 'input';

    rule.input.addEventListener(eventName, () => {
      if (document.getElementById(rule.field).classList.contains('has-error')) {
        setError(rule, !rule.isValid());
      }
      status.hidden = true;
    });
  });

  message.addEventListener('input', () => {
    counter.textContent = message.value.length;
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const invalidRules = rules.filter((rule) => !rule.isValid());

    rules.forEach((rule) => setError(rule, invalidRules.includes(rule)));

    if (invalidRules.length) {
      status.hidden = true;
      invalidRules[0].input.focus();
      return;
    }

    const audience = form.elements.audience.value;
    const subject = '[Atendimento] ' + reason.value;
    const body = [
      'Perfil: ' + audience,
      'Motivo: ' + reason.value,
      '',
      message.value.trim()
    ].join('\n');

    const mailto = 'mailto:' + SUPPORT_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);

    status.hidden = false;
    window.location.href = mailto;
  });
})();
