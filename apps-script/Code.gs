// Serviço de atendimento do site Quimia.
// Recebe o formulário, envia o e-mail para o suporte e registra a mensagem na planilha.
//
// Roda no Google Apps Script, dentro da planilha "Atendimento Quimia" da conta do suporte.
// Para publicar: Implantar > Nova implantação > App da Web
//   Executar como: Eu | Quem pode acessar: Qualquer pessoa
// O endereço gerado (termina em /exec) fica em SUPPORT_ENDPOINT, no arquivo js/support.js.
// Depois de mudar este código, é preciso criar uma nova versão da implantação.

const DESTINO = 'quimia.app@gmail.com';
const LIMITE_POR_HORA = 30;

function doPost(e) {
  try {
    const dados = JSON.parse(e.postData.contents);

    // Campo escondido preenchido = robô: finge sucesso e descarta.
    if (dados.honey) {
      return resposta(true);
    }

    const msg = validar(dados);

    if (!msg) {
      return resposta(false, 'dados_invalidos');
    }

    if (!dentroDoLimite()) {
      return resposta(false, 'limite');
    }

    enviarEmail(msg);
    registrar(msg);

    return resposta(true);
  } catch (erro) {
    return resposta(false, 'erro');
  }
}

function limpar(valor, max, umaLinha) {
  let texto = String(valor == null ? '' : valor).trim();

  if (umaLinha) {
    texto = texto.replace(/[\r\n]+/g, ' ');
  }

  return texto.slice(0, max);
}

function validar(dados) {
  const msg = {
    nome: limpar(dados.nome, 80, true) || 'Não informado',
    perfil: limpar(dados.perfil, 30, true),
    retorno: dados.retorno === 'Celular' ? 'Celular' : 'E-mail',
    contato: limpar(dados.contato, 120, true),
    motivo: limpar(dados.motivo, 60, true) || 'Não informado',
    assunto: limpar(dados.assunto, 80, true),
    mensagem: limpar(dados.mensagem, 1000, false)
  };

  const emailValido = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/.test(msg.contato);
  const celularValido = msg.contato.replace(/\D/g, '').length === 11;

  if (msg.mensagem.length < 10) {
    return null;
  }

  if (msg.retorno === 'E-mail' ? !emailValido : !celularValido) {
    return null;
  }

  return msg;
}

function dentroDoLimite() {
  const lock = LockService.getScriptLock();
  lock.waitLock(5000);

  try {
    const cache = CacheService.getScriptCache();
    const total = Number(cache.get('envios') || 0);

    if (total >= LIMITE_POR_HORA) {
      return false;
    }

    cache.put('envios', String(total + 1), 3600);
    return true;
  } finally {
    lock.releaseLock();
  }
}

function enviarEmail(msg) {
  const assunto = '[Atendimento Quimia] ' + (msg.assunto || (msg.motivo !== 'Não informado' ? msg.motivo : 'Contato pelo site'));
  const linhas = [
    'Nome: ' + msg.nome,
    'Perfil: ' + msg.perfil,
    'Retorno por ' + msg.retorno.toLowerCase() + ': ' + msg.contato,
    'Motivo: ' + msg.motivo
  ];

  if (msg.assunto) {
    linhas.push('Assunto: ' + msg.assunto);
  }

  linhas.push('', msg.mensagem);

  const opcoes = { to: DESTINO, subject: assunto, body: linhas.join('\n'), name: 'Site Quimia' };

  if (msg.retorno === 'E-mail') {
    opcoes.replyTo = msg.contato;
  }

  MailApp.sendEmail(opcoes);
}

function registrar(msg) {
  try {
    SpreadsheetApp.getActiveSpreadsheet().getSheets()[0].appendRow([
      new Date(), msg.nome, msg.perfil, msg.retorno, msg.contato, msg.motivo, msg.assunto, msg.mensagem
    ]);
  } catch (erro) {
    // Se a planilha falhar, o e-mail já foi enviado: não derruba o atendimento.
  }
}

function resposta(ok, erro) {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: ok, erro: erro || null }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Rode esta função uma vez no editor para autorizar o envio de e-mail e o acesso à planilha.
function testar() {
  const msg = validar({
    nome: 'Teste', perfil: 'Usuário', retorno: 'E-mail', contato: DESTINO,
    motivo: 'Teste', mensagem: 'Mensagem de teste do serviço de atendimento.'
  });

  enviarEmail(msg);
  registrar(msg);
}
