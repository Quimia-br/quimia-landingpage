// Pop-up de download do app (usado pela landing do usuário e pela página de privacidade)
// Depende de store-links.js e da biblioteca qrcodejs, carregados antes deste arquivo.

const fallback = "https://quimia.tech";

const downloadModal = document.getElementById('downloadModal');
const downloadModalClose = document.getElementById('downloadModalClose');
const downloadQr = document.getElementById('downloadQr');

function downloadApp() {
  const storeUrl = getMobileStoreUrl();

  if (storeUrl) {
    window.location.href = storeUrl;
  } else if (downloadModal && typeof downloadModal.showModal === 'function') {
    downloadModal.showModal();
  } else {
    window.location.href = fallback;
  }
}

// Aplica a função acima de download em todos os botões de download

document.querySelectorAll('[data-link="appDownload"]').forEach(function (button) {
  button.addEventListener('click', function (event) {
    event.preventDefault();
    downloadApp();
  });
});

// Fechar o pop-up de instalação

downloadModalClose.addEventListener('click', function () {
  downloadModal.close();
});

downloadModal.addEventListener('click', function (event) {
  if (event.target === downloadModal) {
    downloadModal.close();
  }
});

// Links das stores e QR Code

document.getElementById('downloadAppStore').href = appStoreUrl;
document.getElementById('downloadPlayStore').href = playStoreUrl;

try {
  downloadQr.innerHTML = '';

  new QRCode(downloadQr, {
    text: downloadPageUrl,
    width: 206,
    height: 206,
    colorDark: '#212121',
    colorLight: '#ffffff'
  });
} catch (error) {
  // Se o QR code não puder ser gerado, mostra um link para a página de download
  downloadQr.innerHTML = '<a href="' + downloadPageUrl + '">Acesse a página de download</a>';
}
