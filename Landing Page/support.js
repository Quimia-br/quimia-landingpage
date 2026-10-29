const SUPPORT_EMAIL = 'quimia.app@gmail.com';
// Serviço de formulário que entrega as mensagens no e-mail do suporte.
// Depois de ativado, trocar o e-mail do endereço pelo código aleatório fornecido pelo serviço.
const SUPPORT_ENDPOINT = 'https://formsubmit.co/ajax/' + SUPPORT_EMAIL;
const SUPPORT_TIMEOUT_MS = 15000;

// Origem do acesso: define a landing de volta e o perfil já marcado
(() => {
  const isCompany = new URLSearchParams(window.location.search).get('origem') === 'empresa';
  const homeUrl = isCompany ? 'business.html' : 'index.html';

  document.getElementById('support-home').href = homeUrl;
  document.getElementById('support-back').href = homeUrl;
  document.getElementById('support-success-home').href = homeUrl;

  if (isCompany) {
    document.querySelector('input[name="audience"][value="Empresa"]').checked = true;
  }
})();

// Formulário de atendimento
(() => {
  const form = document.getElementById('support-form');
  const nameInput = document.getElementById('name');
  const contact = document.getElementById('contact');
  const contactLabel = document.getElementById('contact-label');
  const contactError = document.getElementById('contact-error');
  const reason = document.getElementById('reason');
  const topic = document.getElementById('topic');
  const topicField = document.getElementById('field-topic');
  const message = document.getElementById('message');
  const consent = document.getElementById('consent');
  const counter = document.getElementById('message-count');
  const status = document.getElementById('support-status');
  const minMessageLength = 10;
  const otherSubject = 'Outro assunto';

  const contactModes = {
    'E-mail': {
      label: 'Seu e-mail',
      type: 'email',
      inputmode: 'email',
      autocomplete: 'email',
      placeholder: 'nome@exemplo.com',
      error: 'Informe um e-mail válido, como nome@exemplo.com.'
    },
    Celular: {
      label: 'Seu celular com DDD',
      type: 'tel',
      inputmode: 'tel',
      autocomplete: 'tel-national',
      placeholder: '(11) 91234-5678',
      error: 'Informe um celular com DDD e 9 dígitos, como (11) 91234-5678.'
    }
  };

  const storedContacts = { 'E-mail': '', Celular: '' };

  const getContactMethod = () => form.elements.contactMethod.value;
  const needsTopic = () => reason.value === otherSubject || form.elements.audience.value === otherSubject;

  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);

    if (digits.length <= 2) {
      return digits;
    }
    if (digits.length <= 6) {
      return '(' + digits.slice(0, 2) + ') ' + digits.slice(2);
    }
    if (digits.length <= 10) {
      return '(' + digits.slice(0, 2) + ') ' + digits.slice(2, 6) + '-' + digits.slice(6);
    }
    return '(' + digits.slice(0, 2) + ') ' + digits.slice(2, 7) + '-' + digits.slice(7);
  };

  const isValidContact = () => {
    const value = contact.value.trim();

    if (getContactMethod() === 'E-mail') {
      return value.length <= 120
        && !value.includes('..')
        && /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/.test(value);
    }

    const digits = value.replace(/\D/g, '');
    return digits.length === 11 && Number(digits.slice(0, 2)) >= 11 && digits[2] === '9';
  };

  const rules = [
    { input: nameInput, field: 'field-name', error: 'name-error', isValid: () => nameInput.value.trim().length >= 2 },
    { input: contact, field: 'field-contact', error: 'contact-error', isValid: isValidContact },
    { input: reason, field: 'field-reason', error: 'reason-error', isValid: () => reason.value !== '' },
    { input: topic, field: 'field-topic', error: 'topic-error', isActive: needsTopic, isValid: () => topic.value.trim().length >= 3 },
    { input: message, field: 'field-message', error: 'message-error', isValid: () => message.value.trim().length >= minMessageLength },
    { input: consent, field: 'field-consent', error: 'consent-error', isValid: () => consent.checked }
  ];

  const isActive = (rule) => !rule.isActive || rule.isActive();

  const setError = (rule, hasError) => {
    document.getElementById(rule.field).classList.toggle('has-error', hasError);
    document.getElementById(rule.error).hidden = !hasError;
    rule.input.setAttribute('aria-invalid', String(hasError));
  };

  const clearStatus = () => {
    status.hidden = true;
  };

  rules.forEach((rule) => {
    const eventName = rule.input.tagName === 'INPUT' && rule.input.type !== 'checkbox' || rule.input.tagName === 'TEXTAREA' ? 'input' : 'change';

    rule.input.addEventListener(eventName, () => {
      if (document.getElementById(rule.field).classList.contains('has-error')) {
        setError(rule, !rule.isValid());
      }
      clearStatus();
    });
  });

  // Forma de retorno: troca o tipo do campo e guarda o que foi digitado em cada opção
  const applyContactMode = (method, previousMethod) => {
    const mode = contactModes[method];

    if (previousMethod) {
      storedContacts[previousMethod] = contact.value;
    }

    contact.type = mode.type;
    contact.setAttribute('inputmode', mode.inputmode);
    contact.setAttribute('autocomplete', mode.autocomplete);
    contact.placeholder = mode.placeholder;
    contact.value = storedContacts[method];
    contactLabel.textContent = mode.label;
    contactError.textContent = mode.error;
    setError(rules[1], false);
  };

  let currentMethod = getContactMethod();

  contactError.textContent = contactModes[currentMethod].error;

  form.querySelectorAll('input[name="contactMethod"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      applyContactMode(getContactMethod(), currentMethod);
      currentMethod = getContactMethod();
      clearStatus();
    });
  });

  contact.addEventListener('input', () => {
    if (getContactMethod() === 'Celular') {
      contact.value = formatPhone(contact.value);
    }
  });

  // Assunto livre: aparece quando o motivo ou o perfil é "Outro assunto"
  const updateTopic = () => {
    const show = needsTopic();

    topicField.hidden = !show;
    topic.required = show;

    if (!show) {
      setError(rules[3], false);
    }
  };

  reason.addEventListener('change', updateTopic);
  form.querySelectorAll('input[name="audience"]').forEach((radio) => {
    radio.addEventListener('change', updateTopic);
  });

  updateTopic();

  message.addEventListener('input', () => {
    counter.textContent = message.value.length;
  });

  const submitButton = document.getElementById('support-submit');
  const success = document.getElementById('support-success');
  const successText = document.getElementById('support-success-text');
  const honeypot = document.getElementById('website');

  const buildPayload = () => {
    const method = getContactMethod();
    const hasTopic = needsTopic() && topic.value.trim();
    const payload = {
      Nome: nameInput.value.trim(),
      Perfil: form.elements.audience.value,
      'Retorno por': method,
      [method]: contact.value.trim(),
      Motivo: reason.value,
      Mensagem: message.value.trim(),
      _subject: '[Atendimento Quimia] ' + (hasTopic ? topic.value.trim() : reason.value),
      _template: 'table',
      _captcha: 'false',
      _honey: honeypot.value
    };

    if (hasTopic) {
      payload.Assunto = topic.value.trim();
    }

    if (method === 'E-mail') {
      payload.email = contact.value.trim();
    }

    return payload;
  };

  const sendMessage = async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), SUPPORT_TIMEOUT_MS);

    try {
      const response = await fetch(SUPPORT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(buildPayload()),
        signal: controller.signal
      });
      const result = await response.json().catch(() => ({}));

      return response.ok && result.success !== false && result.success !== 'false';
    } catch (error) {
      return false;
    } finally {
      clearTimeout(timer);
    }
  };

  const setSending = (isSending) => {
    submitButton.disabled = isSending;
    submitButton.textContent = isSending ? 'Enviando...' : 'Enviar para o suporte';
    form.setAttribute('aria-busy', String(isSending));
  };

  const showSuccess = () => {
    const method = getContactMethod() === 'E-mail' ? 'o e-mail' : 'o celular';

    successText.textContent = 'Recebemos o seu contato e vamos responder em breve, usando ' + method + ' que você informou.';
    form.hidden = true;
    success.hidden = false;
    success.focus();
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (submitButton.disabled) {
      return;
    }

    const invalidRules = rules.filter((rule) => isActive(rule) && !rule.isValid());

    rules.forEach((rule) => setError(rule, invalidRules.includes(rule)));

    if (invalidRules.length) {
      clearStatus();
      invalidRules[0].input.focus();
      return;
    }

    clearStatus();
    setSending(true);

    const sent = await sendMessage();

    setSending(false);

    if (sent) {
      showSuccess();
    } else {
      status.hidden = false;
    }
  });

  // Enviar outra mensagem: limpa o formulário e volta ao início
  document.getElementById('support-again').addEventListener('click', () => {
    form.reset();
    storedContacts['E-mail'] = '';
    storedContacts.Celular = '';
    currentMethod = getContactMethod();
    applyContactMode(currentMethod);
    counter.textContent = '0';
    updateTopic();
    rules.forEach((rule) => setError(rule, false));
    success.hidden = true;
    form.hidden = false;
    nameInput.focus();
  });
})();
